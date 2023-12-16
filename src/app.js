import "dotenv/config.js";
import express from "express";
import connectionDB from "../db";
import bcrypt from "bcrypt";

const app = express();

const PORT = Number(process.env.MYSQL_PORT);

app.listen(PORT || 3000, () => {
  console.log(`Escuchando http://localhost:${PORT}`);
});

const jsonParser = express.json();

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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [result] = await db.execute(
    `SELECT * FROM users WHERE email = ? LIMIT = 1`,
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

app.put("/news/:idNews", verifyToken, (req, res) => {
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
