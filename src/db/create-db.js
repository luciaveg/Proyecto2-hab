import "dotenv/config.js";

import db from "./connection-db.js";

const DB_NAME = process.env.MYSQL_DB;

console.log(`Limpiando base de datos vieja...`);
await db.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
console.log("Creando base de datos...");
await db.query(`CREATE DATABASE ${DB_NAME}`);

await db.query(`USE ${DB_NAME}`);

console.log(`Creando tabla users...`);
await db.query(`
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nickName VARCHAR(64) UNIQUE,
    email VARCHAR(60) UNIQUE,
    password VARCHAR(64) NOT NULL,
    profilePictureURL VARCHAR(64) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isEnabled BOOLEAN NOT NULL DEFAULT TRUE
    );
`);

console.log(`Creando tabla themes...`);
await db.query(`
CREATE TABLE themes (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64)
);`);

console.log(`Añadiendo themes`);
await db.query(
  `INSERT INTO themes(name) VALUES ("Politica"), ("Deporte"), ("Musica"), ("Cocina");`
);

console.log(`Creando tabla news...`);
await db.query(`
CREATE TABLE news (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    pictureURL VARCHAR(255),
    themeId INT UNSIGNED NOT NULL,
    text TEXT NOT NULL,
    ownerId INT UNSIGNED NOT NULL,
    publishedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,    
    FOREIGN KEY (themeId) REFERENCES themes(id),
    FOREIGN KEY (ownerId) REFERENCES users(id)
);
`);

console.log(`Creando tabla likes...`);

await db.query(`
CREATE TABLE likes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    newsId INT UNSIGNED NOT NULL,
    userId INT UNSIGNED NOT NULL,
    vote BINARY NOT NULL,
    UNIQUE(userId, newsId),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (newsId) REFERENCES news(id)
);
`);

console.log(`Creando tabla photos`);
await db.query(`
CREATE TABLE photos (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    photo VARCHAR (200) NOT NULL,
    userNewId INT UNSIGNED NOT NULL,
    FOREIGN KEY (userNewId) REFERENCES users(id)
);`);
await db.end();
