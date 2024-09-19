import express from "express";
import multer from "multer";
import path from 'path';
import os from 'os';
import fs from 'fs';
// import fileUpload from '../controllers/school.controller.js';
import csv from 'csv-parser';
import { changePassword, deleteStudent, fileUpload, forgotPassword, getSchool, getStudents, registerStudent } from "../controllers/school.controller.js";

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(os.tmpdir());  // Use Vercel's temporary writable directory
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);  // Add timestamp to prevent filename collisions
    }
});

const upload = multer({ storage: storage });

// Ensure 'uploads' directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

router.get('/get-school', getSchool);
router.get('/get-student/:id', getStudents);
router.post('/register-student', registerStudent);
router.put('/forget-password', forgotPassword);
router.put('/change-password', changePassword);
router.post('/upload-csv', upload.single('file'), fileUpload);
router.delete('/delete-student', deleteStudent);

export default router;