import path from "path";


export const PORT = Number(process.env.PORT) || 3000;
export const SERVER_HOST =
    process.env.SERVER_HOST || `http://localhost:${PORT}`;