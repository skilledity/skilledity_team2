import express from "express";
import { studentLogin } from "../controllers/student.controller.js";

const router = express.Router();

router.post('/student-login', studentLogin)

export default router;