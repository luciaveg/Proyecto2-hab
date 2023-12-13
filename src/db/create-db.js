import "dotenv/config.js";
import connectDB from "./connection-db.js";
import mysql from "mysql2/promise";

dotenv.config();

const DB_NAME = process.env.MYSQL_DB;
const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

const db = connectDB();

console.log("Limpiando base de datos vieja...");
await db.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
console.log("Creando base de datos...");
await db.query(`CREATE DATABASE ${DB_NAME}`);

await db.query(`USE ${DB_NAME}`);

console.log("Creando tabla users...");
await db.query(`
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nickName VARCHAR(64) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(64) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`);

console.log("Creando tabla themes...");
await db.query(`
CREATE TABLE theme (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64)
`);

console.log("Creando tabla news...");
await db.query(`
CREATE TABLE news (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title description TEXT NOT NULL,
    pictureURL VARCHAR(255),
    themesId TEXT NOT NULL,
    description TEXT NOT NULL,
    ownerId INT UNSIGNED NOT NULL,
    publishedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (themesId) REFERENCES theme(id),
    FOREIGN KEY (ownerId) REFERENCES users(id)
);
`);

console.log("Creando tabla likes...");

await db.query(`
CREATE TABLE likes (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    newsId INT UNSIGNED NOT NULL,
    userId INT UNSIGNED NOT NULL,
    vote BINARY NOT NULL,
    UNIQUE(ownerId, newsId)

    FOREIGN KEY (ownerId) REFERENCES users(id)
    FOREIGN KEY (newsId) REFERENCES news(id)
`);

await db.end();
