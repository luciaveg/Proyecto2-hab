import "dotenv/config.js";
import connectDB from "./create-pool.js";

const db = connectDB();

const DB_NAME = process.env.MYSQL_DB;

console.log("Limpiando base de datos vieja...");
await db.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);

console.log("Creando base de datos...");
await db.query(`CREATE DATABASE ${DB_NAME}`);

await db.query(`USE ${DB_NAME}`);
