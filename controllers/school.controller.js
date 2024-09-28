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
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { authenticateToken } from "../middleware/auth.middleware.js";

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
        user: 'gshyamali159@gmail.com',
        pass: process.env.EMAIL
    }
});

// Helper function to generate a random password
const generatePassword = () => {
    return crypto.randomBytes(8).toString('hex');  // Generates a 16-character random password
};

// Get all schools
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

//get all students
export const getStudents = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: 'School id is required' });
        }

        // Query to get all students from the "student" table from school id in params
        const result = await pool.query('SELECT * FROM student WHERE student_school_fk = $1', [req.params.id]);
        res.json(result.rows); // Send the students as JSON response

    } catch (error) {
        console.error('Error retrieving students:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Register a new student
export const registerStudent = async (req, res) => {
    const { student_id, name, email, std_class, section, gender, father_name, dob, contact_no } = req.body;
    let school_id;
    if (req.headers.Cookie) { // "authorization" should be lowercase in headers
        // console.log(req.headers.Cookie);
        const token = req.headers.Cookie.jwt; // "authorization" not "Authorization"
        // console.log("Register: " + token);
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Session expired or token invalid' });
            }
            school_id = user.schoolId; // Assuming the school_id is part of the token payload
            console.log(school_id); // Now this will log the correct value
        });
    }
    else {
        console.log(req.cookies);
        console.log(req.user);
        school_id = req.user.schoolId;
    }

    try {
        // Validate input
        if (!email || !std_class || !name || !dob || !section || !student_id || !gender || !father_name || !contact_no) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the student already exists
        const checkStudent = await pool.query('SELECT * FROM student WHERE email = $1', [email]);
        if (checkStudent.rows.length > 0) {
            return res.status(400).json({ message: 'Student already registered with this email' });
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
            [student_id, school_id, name, email, today, 0, hashedPassword, std_class, section, gender, father_name, dob, contact_no]
        );

        // Send the random password to the student via email
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Your Account Registration and Password',
            html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                background-color: #f9f9f9;
            }
            .header {
                text-align: center;
                padding: 20px;
                background-color: #55679c;
                color: white;
                border-radius: 10px 10px 0 0;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .content {
                font-size: 16px;
                line-height: 1.6;
                padding: 20px;
            }
            .signature {
                margin-top: 20px;
                font-weight: bold;
            }
            .link {
                color: #007BFF;
                text-decoration: none;
            }
            .link:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="company-name">Skilledity Solutions Pvt. Ltd.</h1>
            </div>

            <div class="content">
                <p>Dear ${name},</p>
                <p>Congratulations on your successful registration!</p>

                <p>Your login details are as follows:</p>
                <p>Email: ${email}<br>Password: ${randomPassword}</p>

                <p>Please change your password after your first login.</p>

                <p>We are excited to have you with us!</p>

                <p class="signature">Best regards,<br>Ankit Upadhyay<br>Team Skilledity</p>
            </div>
        </div>
    </body>
    </html>
    `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Failed to send registration email' });
            }
            console.log('Registration email sent:', info.response);
        });

        return res.status(201).json({ message: 'Student registered successfully, password sent via email' });

    } catch (error) {
        console.error('Error registering student:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//login school
export const loginSchool = async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;
    const today = moment().format('YYYY-MM-DD');

    try {
        // Check if the school exists
        const result = await pool.query('SELECT * FROM school WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'School not found' });
        }

        const school = result.rows[0];

        // Check if the password matches
        const passwordMatch = await bcryptjs.compare(password, school.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Update login information
        // await pool.query(
        //     'UPDATE school SET last_login = $1 WHERE email = $2',
        //     [today, email]
        // );

        // Create JWT token
        const tokenPayload = {
            schoolId: school.school_adm_no, // Include relevant information in the payload
            schoolName: school.name,
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '15m' }); // Set token expiration time

        // Set the token in a cookie
        res.cookie('jwt', token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Only set the cookie to be sent over HTTPS in production
            maxAge: 15 * 60 * 1000, // Cookie expiration time (15 minutes)
            domain: '.skilledity.in',
            path: '/',
        });

        // Login successful
        return res.json({ message: 'Login successful!' });

    } catch (error) {
        console.error('Error during school login:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

//logout school
export const logoutSchool = async (req, res) => {
    try {
        res.clearCookie('auth_token', { httpOnly: true, secure: true, sameSite: 'Strict' }); // Clear the authentication cookie with options
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during school logout:', error); // log message for clarity
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

//send mail if not loggedin for long time
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

//Remove the comment in production

// sendEmailIfNotLoggedInForFirstTime();
// resendEmailIfNotLoggedInForLongTime();

// Forgot password
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

// Change password
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

//upload csv file

const formatDate = (dob) => {
    const ddmmyyyyRegex = /^(\d{2})-(\d{2})-(\d{4})$/; // Matches dd-mm-yyyy
    if (ddmmyyyyRegex.test(dob)) {
        const [_, dd, mm, yyyy] = dob.match(ddmmyyyyRegex);
        return `${yyyy}-${mm}-${dd}`; // Convert to yyyy-mm-dd
    }
    return dob; // If already in yyyy-mm-dd format, return as is
};

export const fileUpload = async (req, res) => {
    // console.log(req.cookies.jwt);
    // console.log(req.user);
    try {
        if (!req.file.path) {
            return res.status(400).json({ message: "File not uploaded." });
        }
        const jsonfile = await csvToJSON(req.file.path);
        await fs.promises.unlink(req.file.path);
        console.log("file deleted successfully.");

        // Helper function to introduce delay
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const jsonData = removeDuplicatesByEmail(jsonfile).map(item => {
            if (item.dob) {
                item.dob = formatDate(item.dob);
            }
            return item;
        });

        // Sending each object in jsonData to a different rouawait Promise.all(

        // let data = [];
        for (const item of jsonData) {
            try {
                console.log('\nNew Item');
                console.log(item);
                const response = await axios.post(process.env.REGISTER_STUDENT_API, item,
                    {
                        headers: {
                            // authorization: `Bearer ${req.cookies.jwt}`
                            Cookie: `jwt=${req.cookies.jwt}`
                        },
                        withCredentials: true
                    }
                );
                // data.push({"name": response.name, "email": response.email, "password": response.password});
                console.log(response.data.message + ` - ${item.email}`);
                if (response.status !== 201) {
                    not_registered.push({ student_id: item.student_id, name: item.name, email: item.email, error: response.message });
                }
            }
            catch (error) {
                console.log(`Error registering student: ${item.email}. Error: ${error}`);
            }
            await delay(1000);
        }

        if (not_registered.length == 0) {
            res.status(200).json({ message: "CSV file parsed and data sent successfully.", data: jsonData });
        }
        else {
            res.status(400).json({ message: "Error registering some students.", students_not_registered: not_registered });
        }
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

//fetch students from database (post request containing class and section) of school_adm_no from jwt token
export const fetchStudents = async (req, res) => {
    const { std_class, section } = req.body;

    if (!std_class || !section) {
        return res.status(400).json({ error: 'Class and section are required' });
    }

    let school_id;
    if (req.headers.Cookie) { // "authorization" should be lowercase in headers
        // console.log(req.headers.Cookie);
        const token = req.headers.Cookie.jwt; // "authorization
        // console.log("Register: " + token);
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Session expired or token invalid' });
            }
            school_id = user.schoolId; // Assuming the school_id is part of the token payload
            console.log(school_id); // Now this will log the correct value
        });
    }
    else {
        console.log(req.cookies);
        console.log(req.user);
        school_id = req.user.schoolId;
    }

    try {
        const result = await pool.query(
            'SELECT * FROM student WHERE student_school_fk = $1 AND class = $2 AND section = $3',
            [school_id, std_class, section]
        );

        return res.json(result.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


