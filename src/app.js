import "dotenv/config.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./db/create-pool.js";

//import bodyParser from "body-parser";

const app = express();

const PORT = Number(process.env.MYSQL_PORT);

app.use(express.json());

app.post("/register", async (req, res) => {
  const { nickName, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const pool = db(process.env.MYSQL_DB);

  await pool.execute(
    `INSERT INTO users(nickName, email, password) 
        VALUES (?, ?, ?)`,
    [nickName, email, hashedPassword]
  );

  res.status(200).send("Fué Registrado Exitosamente !");
});

app.put("/register/:id", (req, res) => {
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

  const pool = db(process.env.MYSQL_DB);

  const [result] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
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
      profilePictureURL: maybeUser.profilePictureURL,
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

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  console.log(bearerHeader);
  if (typeof bearerHeader !== "undefined") {
    // const bearerToken = bearerHeader.split(" ")[1];
    try {
      const payload = jwt.verify(bearerHeader, process.env.JWT_SECRET);
      console.log(payload);
      req.userData = payload;
    } catch (error) {
      res.sendStatus(401);
    }

    next();
  } else {
    res.sendStatus(401);
  }
}

app.post("/news", verifyToken, async (req, res) => {
  try {
    const pool = db(process.env.MYSQL_DB);
    const { title, description, text, theme } = req.body;
    const user = req.userData.id;
    const sql =
      "INSERT INTO news (title, description, text, themeId, ownerId) VALUES (?,?,?,?,?)";
    await pool.execute(sql, [title, description, text, theme, user]);
    res.send({
      Status: "ok",
      message: "Noticia Guardada con Éxito",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Error al guardar noticias" });
  }
});

app.get("/news/today", async (req, res) => {
  try {
    let newsToday = `SELECT * FROM news WHERE publishedAt DATETIME = CURRENT_TIMESTAMP`;
    if (!newsToday) {
      res.status(500).json({ error: "No existen noticias de hoy" });
    }
    if (newsToday) {
      newsToday += " ORDER BY createdAt DESC";

      const [rows] = await db.execute(newsToday);

      res.json(rows);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener noticias" });
  }
  return;
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

app.get("/news", async (req, res) => {
  try {
    let sqlQuery = "SELECT * FROM news";
    const pool = db(process.env.MYSQL_DB);

    if (req.themeFilter) {
      sqlQuery += ` WHERE themeId = ${req.themeFilter}`;
    }

    //sqlQuery += " ORDER BY createdAt DESC";
    console.log(sqlQuery);
    const [rows] = await pool.execute(sqlQuery, [theme]);

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

app.put("/user/:id/photo", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const photoUser = req.body;
      res.json({
        message: "Foto editada con éxito",
      });
    }
  });
});

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

app.listen(PORT || 3000, () => {
  console.log(`Escuchando http://localhost:${PORT}`);
});
