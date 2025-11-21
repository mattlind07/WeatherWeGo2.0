const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

module.exports = async function (context, req) {
    context.log('Processing registration request');

    // Check if username and password are acutally there
    if (!req.body || !req.body.username || !req.body.password) {
        context.res = {
            status: 400,
            body: { message: "Please provide both username and password" }
        };
        return;
    }

    const { username, password } = req.body;

    // creates a db connection to the user table
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_CONNECTION_STRING);
        
        // checkjs if the usernamce exsists
        const [existingUsers] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            await connection.end();
            context.res = {
                status: 409, //fail
                body: { message: "Username already exists" }
            };
            return;
        }

        // hash the password here
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // insert new user into table
        await connection.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        await connection.end();

        context.res = {
            status: 201, // success
            body: { 
                message: "User registered successfully",
                username: username
            }
        };
    } catch (error) {
        context.log.error('Error during registration:', error);
        context.res = {
            status: 500,
            body: { message: "Server error during registration", error: error.message }
        };
    }
};