import mysql from "mysql2/promise";

function createConnectionPool(MYSQL_DB) {
  const connectionPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: MYSQL_DB,
    timezone: "Z",
  });
  return connectionPool;
}

export default createConnectionPool;
