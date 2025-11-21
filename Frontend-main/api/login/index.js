const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function (context, req) {
    context.log('Processing login request');

    // checks if username and password as input
    if (!req.body || !req.body.username || !req.body.password) {
        context.res = {
            status: 400,
            body: { message: "Please provide both username and password" }
        };
        return;
    }

    const { username, password } = req.body;

    // creates the db connection
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_CONNECTION_STRING);
        
        // search user in users table
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        await connection.end();

        if (users.length === 0) {
            context.res = {
                status: 401, // fail - unauthorized
                body: { message: "Invalid credentials" }
            };
            return;
        }

        const user = users[0];

        // verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            context.res = {
                status: 401, // fail - unauthorized
                body: { message: "Invalid credentials" }
            };
            return;
        }

        // Create JWT token
        // The secret key should be stored in environment variables
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'iLoveSuperSecretCodes',
            { expiresIn: '1d' }
        );

        context.res = {
            status: 200,
            body: { 
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            }
        };
    } catch (error) {
        context.log.error('Error during login:', error);
        context.res = {
            status: 500,
            body: { message: "Server error during login", error: error.message }
        };
    }
};