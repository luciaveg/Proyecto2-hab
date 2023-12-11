import createConnectionPool from "./PoolConnection";

export const db = createConnectionPool(process.env.MYSQL_DB);