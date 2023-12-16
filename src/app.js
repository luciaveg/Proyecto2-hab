import "dotenv/config.js";
import express from "express";
import connectionDB from "../db";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

const app = express();

const PORT = Number(process.env.MYSQL_PORT);

app.listen(PORT || 3000, () => {
  console.log(`Escuchando http://localhost:${PORT}`);
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

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
