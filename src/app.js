import "dotenv/config.js";
import express from "express";
import connectionDB from "../db";
import bcrypt from "bcrypt";

const app = express();

const PORT = Number(process.env.MYSQL_PORT);

app.listen(PORT || 3000, () => {
  console.log(`Escuchando http://localhost:${PORT}`);
});
