
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const logsRoutes = require('./routes/logs');

require('dotenv').config({ path: '../.env' }); // Load .env from root

// ── Startup safety check ─────────────────────────────────────────────────────
const REQUIRED_ENV = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
        console.error(`[FATAL] Missing required environment variable: ${key}`);
        console.error('Ensure .env file exists in the project root with all required values.');
        process.exit(1); // Stop the server — do not fall back to insecure defaults
    }
}
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers (helmet)
app.use(helmet());

// CORS — allow from same machine (localhost) and factory network IPs
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (same-origin, curl, PM2 health checks)
        if (!origin) return callback(null, true);
        // Allow any http://localhost:* or http://127.0.0.1:* origin
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        // Allow any private network IP (factory LAN: 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const privateIP = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/;
        if (privateIP.test(origin)) {
            return callback(null, true);
        }
        // Block everything else (public internet origins)
        callback(new Error('CORS: origin not allowed'));
    },
    credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);

// Helper route to check health
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
