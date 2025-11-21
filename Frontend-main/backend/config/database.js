require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// add the certficate to verify the dope sql db
const caPath = path.join(__dirname, 'DigiCertGlobalRootCA.crt.pem');

// for debugging in console login details
console.log('Attempting database connection to:', 
  `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
console.log('Using certificate from:', caPath);

// im praying this will create connection pool with SSL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true
  }
});

// once again test and debug the console with MySQL
pool.getConnection()
  .then(conn => {
    console.log('Successfully connected to MySQL database');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection error:', err);
  });

module.exports = pool;