import express from "express";
import { studentLogin, logoutStudent } from "../controllers/student.controller.js"; // Import the logout function
import {authenticateToken} from '../middleware/auth.middleware.js'; // Import your authentication middleware if needed

const router = express.Router();

// Student login route
router.post('/student-login', studentLogin);

// Student logout route
router.post('/student-logout', authenticateToken, logoutStudent); // Protect with authenticateToken if needed

export default router;
