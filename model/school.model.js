import pkg from "pg";
import dotenv from "dotenv";
import { sql } from "@vercel/postgres";

dotenv.config();

const { Pool } = pkg;


const pool = new Pool({
    // user: "postgres",
    // host: "localhost",
    // // database: "SkilledityDB",
    // database: "skilledity",
    // password: "admin",
    // // password: process.env.PGPASSWORD,
    // port: 5432

    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.PGPASSWORD,
    port: 5432
});

export default pool;
