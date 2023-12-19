import mysql from "mysql2/promise";

function createConnectionPool(db) {
  const connectionPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: db,
    timezone: "Z",
  });
  return connectionPool;
}

export default createConnectionPool;
