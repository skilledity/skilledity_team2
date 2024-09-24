import pool from "../model/school.model.js";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";

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

export const test = async (req, res) => {
    res.status(200).json({ message: 'Admin API is working' });
}

//genertae 8 digit random password
const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
}

export const registerSchool = async (req, res) => {
    const { name, email, address } = req.body;
    try {
        // Check if the school already exists
        const result = await pool.query('SELECT * FROM school WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            return res.status(409).json({ error: 'School already exists' });
        }

        // Hash the password
        const password = generatePassword();
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Insert the new school into the database
        await pool.query('INSERT INTO school (name, email, password, address, email_sent, school_adm_no) VALUES ($1, $2, $3, $4, $5, $6)', [name, email, hashedPassword, address, false, "ADM901"]);

        // Send a welcome email to the school
        const mailOptions = {
            from: 'no-reply@skilledity.in',
            to: email,
            subject: 'Welcome to Skilledity',
            text: `Hi ${name},\n\nWelcome to Skilledity! Your school has been successfully registered.\n\nThanks!\nSkilledity Team and your email is ${email} and password is ${password}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to send email' });
            }
            console.log('Welcome email sent:', info.response);
        });

        return res.status(201).json({ message: 'School registered successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
