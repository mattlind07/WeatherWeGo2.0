require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a connection to the database
const db = mysql.createConnection({
    host: process.env.DB_HOST, // e.g., 'localhost'
    user: process.env.DB_USER, // e.g., 'root'
    password: process.env.DB_PASSWORD, // e.g., 'my-secret-pw'
    database: process.env.DB_NAME, // e.g., 'authdb'
    port: process.env.DB_PORT // e.g., '3306'
});

db.connect(err => {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Connected to MySQL database");
    }
});

// Basic authentication route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // In production, use hashed passwords and secure verification!
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length > 0) {
            res.json({ message: 'Authentication successful' });
        } else {
            res.status(401).json({ message: 'Authentication failed' });
        }
    });
});

// Registration route
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'User registered successfully' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});