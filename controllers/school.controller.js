import pool from "../model/school.model.js";
import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import moment from "moment";
import Papa from 'papaparse';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');

dotenv.config();

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

//tranportor for mail Globally Same
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'amey.tripathi2022@vitstudent.ac.in',
        pass: process.env.EMAIL
    }
});

// Helper function to generate a random password
const generatePassword = () => {
    return crypto.randomBytes(8).toString('hex');  // Generates a 16-character random password
};

export const getSchool = async (req, res) => {
    try {
        // Query to get all schools from the "school" table
        const result = await pool.query('SELECT * FROM school');
        res.json(result.rows); // Send the schools as JSON response
    } catch (error) {
        console.error('Error retrieving schools:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const registerStudent = async (req, res) => {
    const { student_id, student_school_fk, name, email, std_class, section, gender, father_name, dob, contact_no } = req.body;

    try {
        // Validate input
        if (!email || !std_class || !name || !dob || !section || !student_school_fk || !student_id || !gender || !father_name || !contact_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if the student already exists
        const checkStudent = await pool.query('SELECT * FROM student WHERE email = $1', [email]);
        if (checkStudent.rows.length > 0) {
            return res.status(400).json({ error: 'Student already registered with this email' });
        }

        // Generate a random password
        const randomPassword = generatePassword();

        // Hash the random password
        const hashedPassword = await bcryptjs.hash(randomPassword, 10);

        // Get today's date for lastlogin
        const today = new Date().toISOString().split('T')[0];

        // Insert student data into the student table
        await pool.query(
            'INSERT INTO student (student_id, student_school_fk, name, email, lastlogin, no_of_logins, password, class, section, gender, fathers_name, dob, contact_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
            [student_id, student_school_fk, name, email, today, 0, hashedPassword, std_class, section, gender, father_name, dob, contact_no]
        );

        // Send the random password to the student via email
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Your Account Registration and Password',
            text: `Hi ${name},\n\nYou have been successfully registered\nYour login details are as follows:\nEmail: ${email}\nPassword: ${randomPassword}\n\nPlease change your password upon first login.\n\nThanks!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Failed to send registration email' });
            }
            console.log('Registration email sent:', info.response);
        });

        return res.status(201).json({ message: 'Student registered successfully, password sent via email' });

    } catch (error) {
        console.error('Error registering student:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const resendEmailIfNotLoggedInForLongTime = async () => {
    const daysThreshold = 30;  // Number of days to consider as "long time"
    const today = moment().format('YYYY-MM-DD');
    const thresholdDate = moment().subtract(daysThreshold, 'days').format('YYYY-MM-DD');

    try {
        // Query for students who have not logged in for a long time and haven't been emailed yet
        const studentsResult = await pool.query(
            `SELECT email, name FROM student 
            WHERE lastlogin < $1 AND email_sent = FALSE`,
            [thresholdDate]
        );

        const students = studentsResult.rows;

        for (const student of students) {
            const mailOptions = {
                from: 'helpdesk@skilledity.com',
                to: student.email,
                subject: 'We Miss You!',
                text: `Hi ${student.name},\n\nWe noticed you haven't logged in for a while. We miss having you around and wanted to remind you to check out our latest updates.\n\nBest regards,\nYour Team`
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Resent email to student: ${student.email}`);

                // Update the database to indicate that an email has been sent
                await pool.query(
                    'UPDATE student SET email_sent = TRUE WHERE email = $1',
                    [student.email]
                );
            } catch (error) {
                console.error(`Error sending email to ${student.email}:`, error);
            }
        }

    } catch (error) {
        console.error('Error querying students or schools:', error);
    }
};

//send mail if not loggedin for first time for 2 days
const sendEmailIfNotLoggedInForFirstTime = async () => {
    const daysThreshold = 2;  // Number of days to consider as "long time"
    const today = moment().format('YYYY-MM-DD');
    const thresholdDate = moment().subtract(daysThreshold, 'days').format('YYYY-MM-DD');

    //query to get students who have not logged in for first time
    try {
        const studentsResult = await pool.query(
            `SELECT email, name FROM student 
            WHERE lastlogin < $1 AND email_sent = FALSE`,
            [thresholdDate]
        );

        // console.log(studentsResult.rows);

        const students = studentsResult.rows;

        for (const student of students) {
            const mailOptions = {
                from: 'helpdesk@skilledity.com',
                to: student.email,
                subject: 'Welcome to Skilledity!',
                text: `Hi ${student.name},\n\nWelcome to Skilledity! We noticed you haven't logged in yet. Please log in to get started.\n\nBest regards,\nYour Team`
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Sent email to student: ${student.email}`);

                // Update the database to indicate that an email has been sent
                await pool.query(
                    'UPDATE student SET email_sent = TRUE WHERE email = $1',
                    [student.email]
                );
            }
            catch (error) {
                console.error(`Error sending email to ${student.email}:`, error);
            }
        }
    } catch (error) {
        console.error('Error querying students or schools:', error);
    }
}

sendEmailIfNotLoggedInForFirstTime();
resendEmailIfNotLoggedInForLongTime();

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const result = await pool.query('SELECT * FROM student WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = result.rows[0];

        // Generate a new random password
        const newPassword = crypto.randomBytes(8).toString('hex');  // Generate a random 16-character hex string

        // Hash the new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        // Update the password in the database
        await pool.query(
            'UPDATE student SET password = $1 WHERE email = $2',
            [hashedPassword, email]
        );

        // Send the new password via email
        const mailOptions = {
            from: 'helpdesk@skilledity.com',
            to: email,
            subject: 'Your New Password',
            text: `Hi ${student.name},\n\nYour password has been reset. Your new password is: ${newPassword}\n\nPlease use this password to log in and change it to something more secure.\n\nBest regards,\nYour Team`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to send email' });
            }
            console.log('New password email sent:', info.response);
        });

        return res.json({ message: 'New password has been sent to your email.' });

    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const changePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required' });
    }

    try {
        // Check if the user exists
        const result = await pool.query('SELECT * FROM student WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Hash the new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        // Update the password in the database
        await pool.query(
            'UPDATE student SET password = $1 WHERE email = $2',
            [hashedPassword, email]
        );

        return res.json({ message: 'Password successfully changed' });

    } catch (error) {
        console.error('Error during password change:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Helper function to remove duplicates based on email field
const removeDuplicatesByEmail = (data) => {
    const seen = new Set();
    return data.filter(item => {
        if (seen.has(item.email)) {
            return false;
        } else {
            seen.add(item.email);
            return true;
        }
    });
};

//convert csv to json
const csvToJSON = async (csvfilepath) => {
    try {
        const csvContent = await fs.promises.readFile(csvfilepath, 'utf-8');
        let jsonData;
        Papa.parse(csvContent, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                jsonData = results.data;
            }
        });

        return jsonData;
    }
    catch (error) {
        console.log(error);
    }
};

export const fileUpload = async (req, res) => {
    try {
        const jsonfile = await csvToJSON(req.file.path);
        console.log(jsonfile);
        await fs.promises.unlink(req.file.path);
        console.log("file deleted successfully.");
        const jsonData = removeDuplicatesByEmail(jsonfile);
        console.log(jsonData);
        res.status(200).json({ message: "CSV file parsed successfully.", data: jsonData });
    }
    catch (error) {
        console.log(error);
        await fs.promises.unlink(req.file.path);
        console.log("file deleted successfully.");
        res.status(500).json({ message: "Internal server error." });
    }
};

//delete student from database
export const deleteStudent = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the student exists
        const result = await pool.query('SELECT * FROM student WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Delete the student from the database
        await pool.query('DELETE FROM student WHERE email = $1', [email]);

        return res.json({ message: 'Student deleted successfully' });

    } catch (error) {
        console.error('Error deleting student:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}



