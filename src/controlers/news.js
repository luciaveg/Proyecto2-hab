import db from "../db/create-pool.js";
import { insertPhoto } from "./photos.js";
import path from "path";
import fs from "fs/promises";

const pool = db(process.env.MYSQL_DB);
const PUBLIC_DIR = path.join(process.cwd(), "public");
const PHOTOS_DIR = path.join(PUBLIC_DIR, "photos");

export const insertNews = async (req, res, next) => {
  try {
    const { title, description, text, theme } = req.body;
    console.log(req.files);
    if (!title || !description || !text || !theme) {
      throw new Error("Faltan datos");
    }
    let photo = null;
    const user = req.userData;
    if (req.files?.photo) {
      photo = await insertPhoto(req.files.photo);
      console.log(photo);
    }
    try {
      let sql = `INSERT INTO news (title, description, text, themeId, ownerId, pictureURL)
      VALUES (?,?,?,?,?,?)`;
      const [{ insertId }] = await pool.execute(sql, [
        title,
        description,
        text,
        theme,
        user.id,
        photo,
      ]);
    } catch (e) {
      throw new Error("Error al guardar en la BBDD");
    }

    res.send({
      status: "ok",
      message: "Noticia Guardada con Éxito",
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const newsToday = async (req, res) => {
  try {
    let newsToday = `SELECT * FROM news WHERE publishedAt DATETIME = DATETIME`;
    if (!newsToday) {
      res.status(500).json({ error: "No existen noticias de hoy" });
    }
    if (newsToday) {
      newsToday += " ORDER BY createdAt DESC";

      const [rows] = await pool.execute(newsToday);

      res.json(rows);
    }
  } catch (e) {
    res.status(500).json({ error: "Error al obtener noticias" });
  }
  return;
};

export const newsEdit = async (req, res, next) => {
  try {
    console.log("editando");
    const newsId = req.params.id;

    const { title, description, text, theme } = req.body;
    console.log(req.files);
    if (!title || !description || !text || !theme) {
      throw new Error("Faltan datos");
    }

    if (isNaN(newsId)) {
      throw new Error("El Id debe ser un número");
    }
    const [result] = await pool.execute(`SELECT * FROM news WHERE id = ?`, [
      newsId,
    ]);
    if (!result.length) {
      throw new Error("Esta Noticia no Existe");
    }

    const user = req.userData;
    let { ownerId } = result[0];
    console.log("user:", user, "owner:", ownerId);
    if (user.id !== ownerId) {
      throw new Error("No eres el dueño de la noticia");
    }

    let photo = result[0].pictureURL;
    if (req.files?.photo) {
      let oldPhoto = photo;
      photo = await insertPhoto(req.files.photo);
      console.log(photo);
      fs.unlink(path.join(PUBLIC_DIR, oldPhoto));
    }

    let sql = `UPDATE news   SET title = ?, description = ?, text = ?, themeId=?, pictureURL=?
     WHERE id = ?`;
    await pool.execute(sql, [title, description, text, theme, photo, newsId]);

    res.json({
      message: "Noticia editada con éxito",
    });
  } catch (e) {
    next(e);
  }
};

export const newsDelete = async (req, res, next) => {
  try {
    const noticeId = req.params.id;
    const ownerId = req.userData.id;
    console.log(ownerId);
    const [[notice]] = await pool.execute(
      `SELECT * FROM news WHERE id = ? LIMIT 1`,
      [noticeId]
    );
    const photo = notice.pictureURL;
    if (!notice) {
      res.status(404).json({
        error: "Noticia no encontrada",
      });
      return;
    }

    if (notice.ownerId != ownerId) {
      res.status(401).json({
        error: "No está autorizado para borrar ésta Noticia",
      });
      return;
    }
    if (photo) {
      await fs.unlink(path.join(PUBLIC_DIR, photo));
    }
    const deleted = await pool.execute(`DELETE FROM news WHERE id= ?`, [
      noticeId,
    ]);
    res.send({
      message: "Noticia Borrada correctamente",
    });
  } catch (e) {
    next(e);
  }
};

export const allNews = async (req, res, next) => {
  try {
    let sqlQuery = `SELECT n.*, nickName, profilePictureURL FROM news n LEFT JOIN users u ON u.id = n.ownerId`;

    const { theme } = req.query;
    if (theme) {
      const [dbTheme] = await pool.execute(
        `SELECT * FROM themes WHERE id = ?`,
        [theme]
      );
      if (!dbTheme.length) {
        throw new Error("No existe ese Tema");
      }

      sqlQuery += ` WHERE themeId = ?`;
    }

    sqlQuery += " ORDER BY createdAt DESC";

    const [rows] = await pool.execute(sqlQuery, theme ? [theme] : null);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    res.status(500).json({ error: "Error al obtener noticias" });
  }
};

export const oneNew = async (req, res) => {
  try {
    const newsId = req.params.id;

    if (isNaN(newsId)) {
      res.status(400).json({ error: "ID de noticia no válido" });
      return;
    }

    const [result] = await pool.execute(`SELECT * FROM news WHERE id = ?`, [
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
};
