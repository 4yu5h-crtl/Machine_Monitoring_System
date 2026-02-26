
const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};


// Create Logs (Batch Insert)
router.post('/', authenticateToken, async (req, res) => {
    const records = req.body; // Expecting an array of records

    if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: 'No records provided' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Fetch token_no from DB using the authenticated user's ID (from JWT)
        // This is more secure than trusting the client to send their own token_no
        const [userRows] = await pool.query('SELECT token_no FROM users WHERE id = ?', [req.user.id]);
        if (userRows.length === 0) {
            // Throw so the finally block releases the connection cleanly (avoids double-release leak)
            throw new Error('Authenticated user not found in database');
        }
        const tokenNo = userRows[0].token_no;


        const query = `
      INSERT INTO machine_status_logs (
        user_id, token_no, channel_no, shift, date,
        ndt_or_status, ndt_ir_status, mma_status, abg_status, xhf_cone_ht_status, mvr_status, missing_roller_status, ir_width_status, or_width_status, outer_diameter_mib_status, double_cage_hit_status, ball_missing_myd_status, rivet_missing_myd_status, break_myd_status, clearance_mgi_status, shield_check_status,
        ndt_or_remark, ndt_ir_remark, mma_remark, abg_remark, xhf_cone_ht_remark, mvr_remark, missing_roller_remark, ir_width_remark, or_width_remark, outer_diameter_mib_remark, double_cage_hit_remark, ball_missing_myd_remark, rivet_missing_myd_remark, break_myd_remark, clearance_mgi_remark, shield_check_remark
      ) VALUES ?
    `;

        const values = records.map(record => [
            req.user.id,
            tokenNo,   // From DB — not from client body
            record.channel_no,
            record.shift,
            record.date,
            record.ndt_or_status,
            record.ndt_ir_status,
            record.mma_status,
            record.abg_status,
            record.xhf_cone_ht_status,
            record.mvr_status,
            record.missing_roller_status,
            record.ir_width_status,
            record.or_width_status,
            record.outer_diameter_mib_status,
            record.double_cage_hit_status,
            record.ball_missing_myd_status,
            record.rivet_missing_myd_status,
            record.break_myd_status,
            record.clearance_mgi_status,
            record.shield_check_status,
            record.ndt_or_remark,
            record.ndt_ir_remark,
            record.mma_remark,
            record.abg_remark,
            record.xhf_cone_ht_remark,
            record.mvr_remark,
            record.missing_roller_remark,
            record.ir_width_remark,
            record.or_width_remark,
            record.outer_diameter_mib_remark,
            record.double_cage_hit_remark,
            record.ball_missing_myd_remark,
            record.rivet_missing_myd_remark,
            record.break_myd_remark,
            record.clearance_mgi_remark,
            record.shield_check_remark
        ]);

        await connection.query(query, [values]);

        await connection.commit();
        res.status(201).json({ message: 'Records saved successfully' });

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Failed to save records' });
    } finally {
        connection.release();
    }
});

// Export ALL logs as CSV (all users, all time)
router.get('/export', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                l.id,
                l.date,
                l.channel_no,
                l.shift,
                u.token_no,
                u.full_name,
                l.ndt_or_status,
                l.ndt_ir_status,
                l.mma_status,
                l.abg_status,
                l.xhf_cone_ht_status,
                l.mvr_status,
                l.missing_roller_status,
                l.ir_width_status,
                l.or_width_status,
                l.outer_diameter_mib_status,
                l.double_cage_hit_status,
                l.ball_missing_myd_status,
                l.rivet_missing_myd_status,
                l.break_myd_status,
                l.clearance_mgi_status,
                l.shield_check_status,
                l.ndt_or_remark,
                l.ndt_ir_remark,
                l.mma_remark,
                l.abg_remark,
                l.xhf_cone_ht_remark,
                l.mvr_remark,
                l.missing_roller_remark,
                l.ir_width_remark,
                l.or_width_remark,
                l.outer_diameter_mib_remark,
                l.double_cage_hit_remark,
                l.ball_missing_myd_remark,
                l.rivet_missing_myd_remark,
                l.break_myd_remark,
                l.clearance_mgi_remark,
                l.shield_check_remark,
                l.created_at
            FROM machine_status_logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.date DESC, l.created_at DESC
        `);

        // Build CSV header
        const headers = [
            'ID', 'Date', 'Time Logged', 'Channel No', 'Shift', 'Token No', 'Full Name',
            'NDT-OR Status', 'NDT-IR Status', 'MMA Status', 'ABG Status',
            'XHF (Cone Ht.) Status', 'MVR Status', 'Missing Roller Status',
            'IR Width Status', 'OR Width Status', 'Outer Diameter (MIB) Status',
            'Double Cage (HIT) Status', 'Ball Missing (MYD) Status',
            'Rivet Missing (MYD) Status', 'Break (MYD) Status',
            'Clearance (MGI) Status', 'Shield Check Status',
            'NDT-OR Remark', 'NDT-IR Remark', 'MMA Remark', 'ABG Remark',
            'XHF (Cone Ht.) Remark', 'MVR Remark', 'Missing Roller Remark',
            'IR Width Remark', 'OR Width Remark', 'Outer Diameter (MIB) Remark',
            'Double Cage (HIT) Remark', 'Ball Missing (MYD) Remark',
            'Rivet Missing (MYD) Remark', 'Break (MYD) Remark',
            'Clearance (MGI) Remark', 'Shield Check Remark'
        ];

        const formatDate = (val) => {
            if (!val) return '';
            const d = new Date(val);
            if (isNaN(d.getTime())) return String(val);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const formatTime = (val) => {
            if (!val) return '';
            const d = new Date(val);
            if (isNaN(d.getTime())) return String(val);
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        };

        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        };

        const csvRows = rows.map(row => [
            row.id, formatDate(row.date), formatTime(row.created_at), row.channel_no, row.shift, row.token_no, row.full_name,
            row.ndt_or_status, row.ndt_ir_status, row.mma_status, row.abg_status,
            row.xhf_cone_ht_status, row.mvr_status, row.missing_roller_status,
            row.ir_width_status, row.or_width_status, row.outer_diameter_mib_status,
            row.double_cage_hit_status, row.ball_missing_myd_status,
            row.rivet_missing_myd_status, row.break_myd_status,
            row.clearance_mgi_status, row.shield_check_status,
            row.ndt_or_remark, row.ndt_ir_remark, row.mma_remark, row.abg_remark,
            row.xhf_cone_ht_remark, row.mvr_remark, row.missing_roller_remark,
            row.ir_width_remark, row.or_width_remark, row.outer_diameter_mib_remark,
            row.double_cage_hit_remark, row.ball_missing_myd_remark,
            row.rivet_missing_myd_remark, row.break_myd_remark,
            row.clearance_mgi_remark, row.shield_check_remark
        ].map(escapeCSV).join(','));

        const csv = [headers.join(','), ...csvRows].join('\n');

        const today = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="machine_logs_${today}.csv"`);
        res.send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to export logs' });
    }
});

module.exports = router;
