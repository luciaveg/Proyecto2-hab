import "dotenv/config.js";
import connectDB from "./connection-db.js";

const db = connectDB();

const DB_NAME = process.env.MYSQL_DB;

await db.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
await db.query(`USE ${DB_NAME}`);

await db.query(`
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nickName VARCHAR(64) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(64) NOT NULL,
    profilePictureURL VARCHAR(255),
    isEmailValidated BOOLEAN NOT NULL DEFAULT FALSE,
    validationCode INT UNSIGNED,
    isEmailPublic BOOLEAN NOT NULL DEFAULT TRUE,
    isEnabled BOOLEAN NOT NULL DEFAULT TRUE
);
`);

await db.query(`
CREATE TABLE news (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title description TEXT NOT NULL,
    theme TEXT NOT NULL,
    description TEXT NOT NULL,
    ownerId INT UNSIGNED NOT NULL,
    publishedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ownerId) REFERENCES users(id)
);
`);

await db.end();
