const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const { client_mysql, ConnectDBMySQL } = require('../configs/database.config.js');

exports.registerUser = async (req, res) => {
    const { name, email, password, role, salesperson_type } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Determine the values for commercial_sales and residential_sales
        let commercial_sales = 0;
        let residential_sales = 0;

        if (role === 'Salesperson') {
            if (salesperson_type === 'commercial') {
                commercial_sales = 1; // Enable commercial sales
            } else if (salesperson_type === 'residential') {
                residential_sales = 1; // Enable residential sales
            }
        }

        const role_can_input = ['Super Admin', 'Customer Service', 'Salesperson', 'Operational']
        // check input post role
        if (!role_can_input.includes(role)) {
            throw new Error(`Role ${role} not provide to create account.`);
        }

        // Insert the user into the database with the appropriate sales type
        const insertUser = await client_mysql.query(
            'INSERT INTO users (name, email, password, role, commercial_sales, residential_sales) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, commercial_sales, residential_sales]
        );

        return res.status(201).json({ message: 'User created successfully', userId: insertUser.insertId });
    } catch (error) {
        return res.status(500).json({ error: 'User creation failed: ' + error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch the user by email
        const [user] = await client_mysql.query('SELECT * FROM users WHERE email = ?', [email]);

        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = user[0];

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            {
                id: userData.id,
                role: userData.role
            },
            process.env.JWT_SECRET, // Use a secret key from your environment variables
            { expiresIn: '2h' } // Token expiration time
        );

        return res.status(200).json({
            message: 'Login successful',
            name: userData.name,
            email: userData.email,
            token_type: "BearerToken",
            token,
            expires_in: 7200,
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Login failed: ' + error.message });
    }
};