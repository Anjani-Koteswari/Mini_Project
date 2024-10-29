const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Anknk@3663',
    database: 'money_maze_navigator'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

// Register endpoint
app.post('/register', (req, res) => {
    const { firstName, lastName, email, pincode, username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.query('SELECT username FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = { firstName, lastName, email, pincode, username, password: hashedPassword };
        db.query('INSERT INTO users SET ?', user, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }
            res.status(200).json({ message: 'Registration successful', redirect: 'login.html' });
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Username not found' });
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.status(200).json({ message: 'Welcome to Money Maze Navigator!', redirect: 'welcome.html' });
    });
});

// Serve the welcome page (expense tracker)
app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// API route to get all expenses
app.get('/expenses', (req, res) => {
    const sql = 'SELECT * FROM expenses';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// API route to add a new expense
app.post('/expenses', (req, res) => {
    const { date, name, amount } = req.body;
    const sql = 'INSERT INTO expenses (date, name, amount) VALUES (?, ?, ?)';
    db.query(sql, [date, name, amount], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, date, name, amount });
    });
});

// API route to delete an expense
app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM expenses WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Expense deleted' });
    });
});

// API route to update an expense
app.put('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const { date, name, amount } = req.body;
    const sql = 'UPDATE expenses SET date = ?, name = ?, amount = ? WHERE id = ?';
    db.query(sql, [date, name, amount, id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Expense updated' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
