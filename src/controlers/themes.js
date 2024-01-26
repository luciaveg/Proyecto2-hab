import db from "../db/create-pool.js";

export const themes = async (req, res, next) => {
  try {
    let sql = `SELECT * FROM themes`;
    const pool = db(process.env.MYSQL_DB);
    const [allThemes] = await pool.execute(sql);
    if (!allThemes) {
      res.status(404).json({ error: "No se encontraron temas" });
      return;
    }
    if (allThemes) {
      const themesList = allThemes;
      res.json(themesList);
    }
  } catch (e) {
    console.log(e);
    next(e);
  }
};
