import createConnectionPool from "./create-pool.js";
const db = createConnectionPool(process.env.MYSQL_DB);
export default db;
