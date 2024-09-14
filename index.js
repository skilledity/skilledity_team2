import express from "express";
import school_router from "./routers/school.route.js";
import student_router from './routers/student.route.js';
import pool from "./model/school.model.js";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;
app.use(express.json());

//TESTING API
app.get('/', (req, res) => {
    res.json("API is Working");
})

app.use('/school', school_router);
app.use('/student', student_router);



app.listen(port, () => {
    console.log(`Server is running on port https://skilledilty-test.vercel.app/`);
});