<<<<<<< HEAD
import createConnectionPool from "./db.js";
const db = createConnectionPool(process.env.MYSQL_DB);
export default db;
=======
import mysql from "mysql2/promise";
import "dotenv/config.js";

dotenv.config();

const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB } = process.env;

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      password: MYSQL_PASS,
      database: MYSQL_DB,
    });

    console.log('Conexión a la base de datos exitosa.');

    return connection;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
};

export default connectDB;
>>>>>>> 36c3b7921d322bb7f8fa1f8343265abb062658d7
