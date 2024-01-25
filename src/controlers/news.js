import db from "../db/create-pool.js";
const pool = db(process.env.MYSQL_DB);
export const insertNewNews = async (req, res, next) => {
  try {
    const { title, description, text, theme } = req.body;
    if (!title || !description || !text || !theme) {
      throw new Error("Faltan datos");
    }
    const user = req.userData;
    console.log(user);

    let sql = `INSERT INTO news (title, description, text, themeId, ownerId)
      VALUES (?,?,?,?,?)`;
    await pool.execute(sql, [title, description, text, theme, user.id]);
  } catch (e) {
    console.log(e);
    throw new Error("Error al guardar en la BBDD");
  }

  res.send({
    status: "ok",
    message: "Noticia Guardada con Éxito",
  });
};

export const newsToday = async (req, res) => {
  try {
    let newsToday = `SELECT * FROM news WHERE publishedAt DATETIME = DATETIME`;
    if (!newsToday) {
      res.status(500).json({ error: "No existen noticias de hoy" });
    }
    if (newsToday) {
      newsToday += " ORDER BY createdAt DESC";

      const [rows] = await db.execute(newsToday);

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
    const newsId = req.params.idNews;

    if (isNaN(newsId)) {
      throw new Error("El Id debe ser un número");
    }
    const [result] = await db.execute(`SELECT * FROM news WHERE id = ?`, [
      newsId,
    ]);

    res.json({
      message: "Noticia editada con éxito",
    });
  } catch (e) {
    next(e);
  }
};

export const newsDelete = (req, res, next) => {
  try {
    let newsToDelete = `SELECT * FROM news WHERE id = ?`;
    if (newsToDelete) {
      `DELETE FROM news WHERE id = ?`;
    }
  } catch (e) {
    next(e);
  }
};

export const allNews = async (req, res) => {
  try {
    let sqlQuery = `SELECT * FROM themes`;
    const pool = db(process.env.MYSQL_DB);
    //console.log(theme);
    const theme = req.themeFilter;
    if (theme) {
      sqlQuery += ` WHERE themeId = ${theme}`;
    }
    if (!theme) {
      throw new Error("No existe ese Tema");
    }
    //sqlQuery += " ORDER BY createdAt DESC";
    //console.log(sqlQuery);
    const [rows] = await pool.execute(sqlQuery, [theme]);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    res.status(500).json({ error: "Error al obtener noticias" });
  }
};

export const oneNew = async (req, res) => {
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
};
