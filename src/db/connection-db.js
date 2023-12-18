import createConnectionPool from "./db.js";
const db = createConnectionPool(process.env.MYSQL_DB);
export default db;
