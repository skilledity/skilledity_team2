import pool from "../model/school.model.js";
import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import moment from "moment";

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

export const studentLogin = async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    const today = moment().format('YYYY-MM-DD');
    try {
        // Check if the user exists
        const result = await pool.query('SELECT * FROM student WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = result.rows[0];

        // Check if the password matches
        const passwordMatch = await bcryptjs.compare(password, student.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Check if it's the first login (no_of_logins = 0)
        if (student.no_of_logins === 0) {
            // Generate a password reset token (example method)
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Send the password reset email
            const mailOptions = {
                from: 'helpdesk@skilledity.com',
                to: student.email,
                subject: 'Reset your password',
                text: `Hi ${student.name},\n\nPlease reset your password using the following link: \nhttp://localhost:3000/reset-password?token=${resetToken}\n\nThanks!\n
                HERE WE EXPECT EMAIL AND NEW PASSWORD FROM THE USER`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ error: 'Failed to send email' });
                }
                console.log('Password reset email sent:', info.response);
            });

            // Update `no_of_logins` and set `email_sent` to TRUE to avoid sending the reset email again
            await pool.query(
                'UPDATE student SET no_of_logins = no_of_logins + 1, email_sent = FALSE, lastlogin = $1 WHERE email = $2',
                [today, email]
            );

            return res.json({ message: 'Reset email sent. Please check your inbox.' });
        }

        // Update `no_of_logins` and set `email_sent` to TRUE to avoid sending the reset email again
        await pool.query(
            'UPDATE student SET no_of_logins = no_of_logins + 1, email_sent = FALSE, lastlogin = $1 WHERE email = $2',
            [today, email]
        );

        // If it's not the first login, allow regular login
        return res.json({ message: 'Login successful!' });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}