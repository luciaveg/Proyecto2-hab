import auth from "./middlewares/authentication.js";
import "dotenv/config.js";
import express from "express";
import jwt from "jsonwebtoken";
import db from "./db/create-pool.js";
import { registerUser, editUser, loginUser } from "./controlers/users.js";
import { errorMessage, errorNotFound } from "./utils/errors.js";
import {
  allNews,
  insertNewNews,
  newsDelete,
  newsEdit,
  newsToday,
  oneNew,
} from "./controlers/news.js";
import { themes } from "./controlers/themes.js";
import fileUpload from "express-fileupload";
import { insertPhoto } from "./controlers/photos.js";

//import bodyParser from "body-parser";

const app = express();

const PORT = Number(process.env.MYSQL_PORT);

app.use(express.json());

app.post("/register", registerUser);

app.put("/user/:id", auth, editUser);

app.post("/login", loginUser);

app.post("/newnews", auth, insertNewNews);

const fileParser = fileUpload();
app.post("/newnews/:newsId/photo", fileParser, insertPhoto);

app.get("/news/today", newsToday);

app.put("/news/:id", auth, newsEdit);

app.delete("/news/:id/delete", auth, newsDelete);

app.get("/news", allNews);

app.get("/news/:id", oneNew);

app.get("/themes/:id", themes);

app.get("/ne", async (req, res) => {
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

app.put("/user/:id/photo", (req, res) => {
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

app.get("/", (req, res) => {
  console.log("test");
  res.send({ test: "ok" });
});

app.use(errorNotFound);

app.use(errorMessage);

app.listen(PORT || 3000, () => {
  console.log(`Escuchando http://localhost:${PORT}`);
});
