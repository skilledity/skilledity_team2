import express from "express";
import { registerSchool, test } from "../controllers/admin.controller.js";

const router = express.Router();

router.get('/test', test);
router.post('/register-school', registerSchool);

export default router;