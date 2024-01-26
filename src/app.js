import auth from "./middlewares/authentication.js";
import "dotenv/config.js";
import express from "express";
import jwt from "jsonwebtoken";
import db from "./db/create-pool.js";
import { registerUser, editUser, loginUser } from "./controlers/users.js";
import { errorMessage, errorNotFound } from "./utils/errors.js";
import {
  allNews,
  insertNews,
  newsDelete,
  newsEdit,
  newsToday,
  oneNew,
} from "./controlers/news.js";
import { themes } from "./controlers/themes.js";
import fileUpload from "express-fileupload";
import { insertPhoto } from "./controlers/photos.js";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

const app = express();
const staticFileHandler = express.static(PUBLIC_DIR);
app.use(staticFileHandler);
const PORT = Number(process.env.MYSQL_PORT);

app.use(fileUpload());
app.use(express.json());

app.post("/register", registerUser);

app.post("/login", loginUser);

app.get("/news", allNews);

app.post("/news", auth, insertNews);

app.put("/user/:id", auth, editUser);

const fileParser = fileUpload();
app.post("/newnews/:newsId/photo", fileParser, insertPhoto);

app.get("/news/today", newsToday);

app.put("/news/:id", auth, newsEdit);

app.delete("/news/:id", auth, newsDelete);

app.get("/news/:id", oneNew);

app.get("/themes", themes);

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
