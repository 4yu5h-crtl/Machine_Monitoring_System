# 🏭 SKF Machine Monitoring System (Paperless SKF)

A web-based paperless machine monitoring system for SKF factory operations. Workers log machine status data (pass/fail/bypass/remarks) for each production channel and shift directly from any device on the factory network — replacing paper-based reporting.

---

## 📌 Accessing the Application

> **The application is hosted on the Control Room PC.**

| Access URL | Purpose |
|---|---|
| `http://your_ip:5173` | Open the app from **any device on the factory network** (tablets, office PCs, phones) |
| `http://localhost:5173` | Open the app **on the control room PC itself** |

> ⚠️ **If the IP changes** (e.g. after a network restart), see the [IP Address Changed](#-ip-address-changed) section below.

---

## ✨ Features

- **Multi-user authentication** — Each worker logs in with their Token No. and password
- **Machine Status Entry** — Log status for 16 machines per channel/shift/date combination:
  - Statuses: `OK-Working`, `By Pass`, `Not Set`, `Setting`, `Not Applicable`, `Tolerance not as per specification`, `Add Remark`
  - Each machine also accepts a free-text remark
- **11 Production Channels** — TRB T3/T4/T5/T6, DGBB 2/3/4/5/8/12/13
- **3 Shifts** per day
- **Review before submit** — Workers can review, edit, or delete pending entries before final submission
- **One-click CSV Export** — Any logged-in user can click **"⬇ Download All Data"** in the header to instantly download all logs from all users as a `.csv` file (opens directly in Excel)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Process Manager | PM2 (keeps app running 24/7) |

---

## 🗂️ Project Structure

```
Paperless_Skf_Project/
├── src/                        # Frontend source (React)
│   ├── components/
│   │   ├── Auth.tsx            # Login & Signup screen
│   │   ├── ChannelShiftSelect.tsx  # Step 1: Select channel/shift/date + review table
│   │   ├── MachineStatusEntry.tsx  # Step 2: Enter machine statuses
│   │   └── SuccessMessage.tsx  # Final submit & success screen
│   ├── contexts/
│   │   └── AuthContext.tsx     # Auth state management
│   ├── lib/
│   │   └── api.ts              # API helper (base URL, fetch wrappers)
│   └── App.tsx                 # Root app + header with Download button
├── server/                     # Backend (Node/Express)
│   ├── routes/
│   │   ├── auth.js             # POST /signup, POST /signin, GET /me
│   │   └── logs.js             # POST / (save logs), GET /export (CSV download)
│   ├── db.js                   # MySQL connection pool
│   ├── index.js                # Express server entry point (port 5000)
│   ├── init_db.js              # Run once to initialize the database
│   └── schema.sql              # Full database schema
├── dist/                       # Built frontend (served by PM2)
├── ecosystem.config.cjs        # PM2 process configuration
└── .env                        # Environment variables (DB, JWT, API URL)
```

---

## ⚙️ Setup (First Time)

### Prerequisites
- Node.js v18+
- MySQL Server running
- PM2 installed globally: `npm install -g pm2`
- `serve` installed globally: `npm install -g serve`

### 1. Clone & Install Dependencies

```bash
# Root dependencies (frontend)
npm install

# Server dependencies
cd server
npm install
cd ..
```

### 2. Configure `.env`

Edit `.env` in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=paperless_skf

JWT_SECRET=your_jwt_secret_key

# Set this to the Control Room PC's IP address on the factory network
VITE_API_URL=http://your_ip:5000/api
```

### 3. Initialize the Database

```bash
node server/init_db.js
```

### 4. Build the Frontend

```bash
npm run build
```

### 5. Start with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save         # Save process list so it restarts after reboot
pm2 startup      # (Run the output command it gives you to enable autostart)
```

---

## 🔄 Daily Operations

### Check if services are running
```bash
pm2 list
```

### Restart services
```bash
pm2 restart all
```

### View backend logs
```bash
pm2 logs paperless-backend
```

---

## 🔴 IP Address Changed

If the control room PC gets a new IP (e.g., after a network change), workers on other devices will get a **"Failed to fetch"** error. Fix it in 3 steps:

**1. Find the new IP** (run on control room PC):
```bash
ipconfig
# Look for "IPv4 Address" under your network adapter
```

**2. Update `.env`:**
```env
VITE_API_URL=http://<NEW_IP_HERE>:5000/api
```

**3. Rebuild and restart:**
```bash
npm run build
pm2 restart paperless-frontend
```

> 💡 **Permanent fix:** Ask your IT team to assign a **static IP** to the control room PC so the IP never changes.

---

## 📥 Downloading All Logged Data

Any logged-in user can download the complete database as a CSV file:

1. Log in to the app from **any device**
2. Click **"⬇ Download All Data"** in the top-right header
3. A file `machine_logs_YYYY-MM-DD.csv` will download automatically
4. Open it in **Microsoft Excel**

The CSV includes all 38 columns: ID, Date, Channel, Shift, Token No, Full Name of who logged it, all 16 machine statuses, all 16 remarks, and the submission timestamp. Rows are sorted newest first.

---

## 👤 User Management

Users self-register via the Sign Up screen using their **Token No.** as their username. There is no admin panel — contact the developer to delete or modify users directly in the database if needed.

```sql
-- View all users
SELECT id, token_no, full_name, created_at FROM users;

-- Delete a user
DELETE FROM users WHERE token_no = 'TOKEN_HERE';
```

---

## 🗄️ Database Schema (Summary)

**`users`** — Registered workers  
**`machine_status_logs`** — All submitted machine status records (one row per channel/shift/date, with 16 status + 16 remark columns)

Full schema: [`server/schema.sql`](./server/schema.sql)


