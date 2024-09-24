import express from "express";
import school_router from "./routers/school.route.js";
import student_router from './routers/student.route.js';
import admin_router from './routers/admin.route.js';
import { authenticateToken } from "./middleware/auth.middleware.js";
import { loginSchool } from "./controllers/school.controller.js"; // Import the school-login controller
import { studentLogin } from "./controllers/student.controller.js"; // Import student-login controller
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: 'https://www.skilledity.in/',  // Only allow requests from this origin
}));

// TESTING API
app.get('/', (req, res) => {
    res.json("API is Working");
});

app.post('/school-login', loginSchool);  // School login
app.post('/student-login', studentLogin); // Student login

app.use('/school', school_router);
app.use('/student', student_router);
app.use('/admin', admin_router);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

