const mysql = require('mysql2/promise');

// Create the MySQL connection using environment variables
const client_mysql = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_POR || 3306, // Default port for MySQL is 3306
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to check the MySQL connection
async function ConnectDBMySQL() {
    try {
        const connection = await client_mysql.getConnection();
        console.log('Connected to the MySQL database');
        connection.release();
    } catch (error) {
        console.error('Error connecting to the MySQL database:', error);
    }
}

// Export the MySQL client and connection function
module.exports = { client_mysql, ConnectDBMySQL };