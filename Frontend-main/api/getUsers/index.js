const mysql = require('mysql2/promise');

module.exports = async function (context, req) {
    context.log('Processing get users request');

    // makes the db connection
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_CONNECTION_STRING);
        
        // get all the users (excluding passwords for security)
        const [users] = await connection.execute(
            'SELECT id, username FROM users'
        );

        await connection.end();

        context.res = {
            status: 200,
            body: { users }
        };
    } catch (error) {
        context.log.error('Error fetching users:', error);
        context.res = {
            status: 500,
            body: { message: "Server error while fetching users", error: error.message }
        };
    }
};