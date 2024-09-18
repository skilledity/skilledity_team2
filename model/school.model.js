import pkg from "pg";
import dotenv from "dotenv";
import { sql } from "@vercel/postgres";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "skilledity",
    password: "admin",
    port: 5432
})


// const pool = new Pool({
//     host: process.env.POSTGRES_URL_NO_SSL,
//     user: process.env.POSTGRES_USER,
//     database: process.env.POSTGRES_DATABASE,
//     password: process.env.PGPASSWORD,
//     port: 5432,
//     ssl: false
// });

export default pool;
