import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// const pool = new Pool({
//     user: "postgres",
//     host: "localhost",
//     database: "skilledity",
//     password: "admin",
//     port: 5432
// })


const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;
