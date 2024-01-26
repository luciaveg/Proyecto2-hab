import path from "path";
import crypto from "crypto";
import { url } from "inspector";
import db from "../db/create-pool.js";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PHOTOS_DIR = path.join(PUBLIC_DIR, "photos");

/*export const insertPhoto = async (req, res) => {
  const { photo } = req.files.photo;
//--------------------------------------
  const noticeId = req.params.newsId;
  const ownerId = req.userData.Id;
  const [[notice]] = await db.execute(
    `SELECT * FROM news WHERE id = ? LIMIT 1`,
    [noticeId]
  );

  if (!notice) {
    res.status(404).json({
      error: "Noticia no encontrada",
    });
    return;
  }

  if (notice.ownerId != ownerId) {
    res.status(401).json({
      error: "No está autorizado para subir ésta Noticia",
    });
    return;
  }
  //----------------------------------------------
  const fileExtension = path.extname(photo.name);
  const randomFileName = crypto.randomUUID();
  const newFilePath = `${randomFileName}${fileExtension}`;
  await photo.mv(path.join(PHOTOS_DIR, newFilePath));
  const URL = `/photos/${newFilePath}`;

  const [{ insertId }] = await db.execute(
    `INSERT INTO photos(newsId, url) VALUES(?,?)`,
    [noticeId, URL]
  );

  res.status(201).json({
    id: noticeId,
  });
};*/

export const insertPhoto = async (photo) => {
  const fileExtension = path.extname(photo.name);
  const randomFileName = crypto.randomUUID();
  const newFilePath = `${randomFileName}${fileExtension}`;
  await photo.mv(path.join(PHOTOS_DIR, newFilePath));
  const URL = `/photos/${newFilePath}`;

  return URL;
};
