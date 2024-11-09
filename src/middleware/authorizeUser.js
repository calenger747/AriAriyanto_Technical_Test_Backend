const jwt = require('jsonwebtoken');

const { client_mysql, ConnectDBMySQL } = require('../configs/database.config.js');

// Middleware to check JWT token and role
exports.authorize = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // Get the token from Authorization header
            const token = req.headers['authorization']?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: 'Access token is required' });
            }

            // Verify the token
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(403).json({ error: 'Invalid or expired token' });
                }

                // Get user data from decoded token
                const { id, role } = decoded;

                // Check if the user's role is allowed
                if (!allowedRoles.includes(role)) {
                    return res.status(403).json({ error: 'You do not have permission to access this resource' });
                }

                // Optionally, fetch user data from DB if needed (e.g., user status, permissions)
                const [user] = await client_mysql.query('SELECT * FROM users WHERE id = ?', [id]);
                if (!user.length) {
                    return res.status(404).json({ error: 'User not found' });
                }

                // Attach user info to the request object for use in the route handler
                req.user = user[0];

                next(); // Proceed to the next middleware or route handler
            });
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
