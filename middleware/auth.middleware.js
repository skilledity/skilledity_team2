import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt; // Fetch the token from cookies

    if (!token) {
        return res.status(401).json({ message: 'Session expired or not logged in' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Session expired or token invalid' });
        }

        req.user = user; // Attach user info to request
        next();
    });
};
