import "dotenv/config.js";
import bodyParser from "body-parser";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();

const PORT = Number(process.env.MYSQL_PORT);

app.listen(PORT || 3000, () => {
  console.log(`Escuchando http://localhost:${PORT}`);
});

const jsonParser = express.json();

//Manejadores de errores
app.use((req, res) => {
  res.status(404).send({
    status: "error",
    mesage: "Not found",
  });
});
app.use((error, req, res, next) => {
  console.log(error);
  res.status(404).send({
    status: "error",
    mesasage: "Not found",
  });
});

app.post("/register", jsonParser, async (req, res) => {
  const { nickName, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.execute(
    `INSERT INTO users(nickName, email, password) 
        VALUES (?, ?, ?)`,
    [nickName, email, hashedPassword]
  );

  res.status(200).send("Fué Registrado Exitosamente !");
});

app.put("/register/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const editUser = req.params.userId;
      const updatedUser = req.body;

      res.json({
        message: "Noticia editada con éxito",
      });
    }
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [result] = await db.execute(
    `SELECT * FROM users WHERE email = ? AND isEnabled = TRUE AND LIMIT 1`,
    [email]
  );
  const maybeUser = result[0];
  if (!maybeUser) {
    res.status(400).json({
      error: "Credenciales NO validas",
    });
    return;
  }

  const doesPasswordMatch = await bcrypt.compare(password, maybeUser.password);
  if (!doesPasswordMatch) {
    res.status(400).json({
      error: "Credenciales NO validas",
    });
    return;
  }

  const token = jwt.sign(
    {
      id: maybeUser.id,
      nickName: maybeUser.nickName,
      email: maybeUser.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5d",
    }
  );
  res.status(200).json({
    token,
  });
});

app.use(bodyParser.json());

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(401);
  }
}

app.post("/news", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const newNews = req.body;

      res.json({ message: "Noticia creada con éxito", data: newNews });
    }
  });
});

function referencToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(401);
  }
}
const verifyToken = referencToken();

app.get("/news?today", async (req, res) => {
  try {
    let newsToday = `SELECT * FROM news WHERE publishedAt DATETIME = CURRENT_TIMESTAMP`;
    if (!newsToday) {
      res.status(500).json({ error: "No existen noticias de hoy" });
    }
    if (newsToday) {
      newsToday += " ORDER BY createdAt DESC";

      const [rows] = await db.execute(sqlQuery);

      res.json(rows);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener noticias" });
  }
  return;
});

app.get("/news?theme?", async (req, res) => {
  try {
    let newsTheme = `SELECT * FROM news WHERE publishedAt DATETIME = CURRENT_TIMESTAMP`;
    if (!newsTheme) {
      res.status(500).json({ error: "No existen noticias con este Tema" });
    }
    if (newsTheme) {
      newsTheme += " ORDER BY createdAt DESC";

      const [rows] = await db.execute(sqlQuery);

      res.json(rows);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener noticias con este Tema" });
    return;
  }
});

app.put("/news/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const newsId = req.params.idNews;
      const updatedNewsData = req.body;

      res.json({
        message: "Noticia editada con éxito",
      });
    }
  });
});

app.delete("/delete/news/:id", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      `DELETE * FROM news WHERE id = ?`,
        res.json({ message: "Noticia eliminada con éxito" });
    }
  });
});

app.use(async (req, res, next) => {
  try {
    const db = getConnection();

    const [rows] = await db.query(`SELECT * FROM news ORDER BY createdAt DESC`);

    req.sortedNews = rows;

    next();
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    res.status(500).json({ error: "Error al obtener noticias" });
  }
});

app.get("/news", (req, res) => {
  res.json(req.sortedNews);
});

app.use("/news", (req, res, next) => {
  const themeId = req.query.theme;

  // Si se proporciona un parámetro de tema en la URL
  if (themeId) {
    req.themeFilter = themeId;
  }

  next();
});

app.get("/news", async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM news";

    if (req.themeFilter) {
      sqlQuery += ` WHERE themeId = ${req.themeFilter}`;
    }

    sqlQuery += " ORDER BY createdAt DESC";

    const [rows] = await db.execute(sqlQuery);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    res.status(500).json({ error: "Error al obtener noticias" });
  }
});

app.get("/news/:idNews", async (req, res) => {
  try {
    const newsId = req.params.idNews;

    if (isNaN(newsId)) {
      res.status(400).json({ error: "ID de noticia no válido" });
      return;
    }

    const [result] = await db.execute(`SELECT * FROM news WHERE id = ?`, [
      newsId,
    ]);

    if (result.length === 0) {
      res.status(404).json({ error: "Noticia no encontrada" });
      return;
    }

    const newsDetails = result[0];
    res.json(newsDetails);
  } catch (error) {
    console.error("Error al obtener detalles de la noticia:", error);
    res.status(500).json({ error: "Error al obtener detalles de la noticia" });
  }
});

app.get("/themes/id", async (req, res) => {
  try {
    const [result] = await db.execute(`SELECT * FROM theme`);

    if (result.length === 0) {
      res.status(404).json({ error: "No se encontraron temas" });
      return;
    }

    const themesList = result;
    res.json(themesList);
  } catch (error) {
    console.error("Error al obtener la lista de temas:", error);
    res.status(500).json({ error: "Error al obtener la lista de temas" });
  }
});
<<<<<<< HEAD
=======

app.get("/news", async (req, res) => {
  try {
    let sqlQuery = `
      SELECT 
        news.*, 
        COUNT(CASE WHEN likes.vote = 1 THEN 1 END) AS positiveVotes,
        COUNT(CASE WHEN likes.vote = 0 THEN 1 END) AS negativeVotes
      FROM news
      LEFT JOIN likes ON news.id = likes.newsId
    `;

    const { theme, today, order, direction } = req.query;

    if (theme) {
      sqlQuery += ` WHERE themesId = ${theme}`;
    }

    if (today) {
      sqlQuery += ` AND DATE(news.createdAt) = CURDATE()`;
    }

    if (order && direction) {
      sqlQuery += ` ORDER BY ${order} ${direction.toUpperCase()}`;
    }

    sqlQuery += " GROUP BY news.id";

    const [result] = await db.execute(sqlQuery);

    if (result.length === 0) {
      res.status(404).json({ error: "No se encontraron noticias" });
      return;
    }

    const newsList = result;
    res.json(newsList);
  } catch (error) {
    console.error("Error al obtener el listado de noticias:", error);
    res.status(500).json({ error: "Error al obtener el listado de noticias" });
  }
});
>>>>>>> 76a38edbb73abcf3120bf71c917c346376ee04f6
