import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "SkilledityDB",
    // password: "admin",
    password: process.env.PGPASSWORD,
    port: 5432
});

export default pool;