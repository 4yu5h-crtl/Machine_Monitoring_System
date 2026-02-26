
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const rateLimit = require('express-rate-limit');

// ── Rate Limiter — applies to /signin only ───────────────────────────────────
const signinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // max 20 attempts per IP per 15 min window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts. Please wait 15 minutes and try again.' },
});
// ─────────────────────────────────────────────────────────────────────────────

// Sign Up
router.post('/signup', async (req, res) => {
    const { token_no, password, first_name, last_name, full_name } = req.body;

    // Basic input validation
    if (!token_no || !password) {
        return res.status(400).json({ message: 'Token No and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE token_no = ?', [token_no]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User with this Token No already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (id, token_no, first_name, last_name, full_name, password_hash) VALUES (UUID(), ?, ?, ?, ?, ?)',
            [token_no, first_name, last_name, full_name, password_hash]
        );

        // Get the created user
        const [users] = await pool.query('SELECT * FROM users WHERE token_no = ?', [token_no]);
        const user = users[0];

        // Create token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                token_no: user.token_no,
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                user_metadata: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    token_no: user.token_no,
                    full_name: user.full_name
                }
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// Sign In (rate limited)
router.post('/signin', signinLimiter, async (req, res) => {
    const { token_no, password } = req.body;

    if (!token_no || !password) {
        return res.status(400).json({ message: 'Token No and password are required' });
    }

    try {
        // Find user
        const [users] = await pool.query('SELECT * FROM users WHERE token_no = ?', [token_no]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.id,
                token_no: user.token_no,
                user_metadata: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    token_no: user.token_no,
                    full_name: user.full_name
                }
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during signin' });
    }
});

// Get User (Me)
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        res.json({
            user: {
                id: user.id,
                token_no: user.token_no,
                user_metadata: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    token_no: user.token_no,
                    full_name: user.full_name
                }
            }
        });

    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
