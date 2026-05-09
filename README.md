# Entity X — Website Stack

Complete website for [entityx.app](https://entityx.app) — the landing page for the Entity X digital forensics AI platform.

```
╔══════════════════════════════════════════════════════════════╗
║  Frontend (HTML/CSS/Three.js)  ←→  Backend (Node/Express)   ║
║  Served by Express static            API Routes:            ║
║                                       /api/downloads        ║
║                                       /api/contact          ║
║                                       /api/analytics        ║
║                                       /api/waitlist         ║
║                                       /api/admin            ║
║                                       /api/health           ║
║                              ←→  SQLite Database            ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Project Structure

```
entityx-website/
├── frontend/
│   └── public/
│       └── index.html          ← Landing page (Three.js 3D, full UI)
│
├── backend/
│   ├── server.js               ← Express app entry point
│   ├── package.json
│   ├── .env.example            ← Copy to .env and fill in values
│   ├── Dockerfile
│   ├── config/
│   │   └── database.js         ← SQLite connection + schema init
│   ├── routes/
│   │   ├── downloads.js        ← Download tracking + GitHub release fetch
│   │   ├── contact.js          ← Contact form with email
│   │   ├── analytics.js        ← Page views + UI event tracking
│   │   ├── waitlist.js         ← macOS/mobile waitlist signups
│   │   ├── admin.js            ← Protected admin dashboard API
│   │   └── health.js           ← Health check
│   ├── middleware/
│   │   └── adminAuth.js        ← API key auth for admin routes
│   └── services/
│       └── mailer.js           ← Nodemailer email service
│
├── database/
│   ├── migrate.js              ← Migration runner
│   ├── seed.js                 ← Demo data seeder
│   ├── entityx.db              ← SQLite DB file (created on first run)
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── nginx/
│   └── entityx.conf            ← Production Nginx config
│
├── scripts/
│   └── setup.sh                ← First-time setup script
│
└── docker-compose.yml          ← Docker Compose (dev + prod)
```

---

## Quick Start (Local Development)

### 1. Run Setup
```bash
cd entityx-website
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment
```bash
# Edit backend/.env
cp backend/.env.example backend/.env
nano backend/.env
```

Minimum required config:
```env
PORT=4000
NODE_ENV=development
ADMIN_API_KEY=your_strong_random_key_here
```

### 3. Start the Backend
```bash
cd backend
npm run dev          # development (auto-reload)
# or
npm start            # production
```

### 4. Open in Browser
```
http://localhost:4000
```

---

## API Endpoints

### Downloads
| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/downloads/latest      | Latest GitHub release info (cached)|
| POST   | /api/downloads/track       | Track a download click             |
| GET    | /api/downloads/stats       | Public download stats              |

### Contact
| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| POST   | /api/contact               | Submit contact form                |
| GET    | /api/contact/types         | Get available contact types        |

### Analytics
| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| POST   | /api/analytics/pageview    | Track a page view                  |
| POST   | /api/analytics/event       | Track a UI event                   |
| GET    | /api/analytics/summary     | Public analytics summary           |

### Waitlist
| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| POST   | /api/waitlist              | Join waitlist                      |
| GET    | /api/waitlist/count        | Waitlist counts by platform        |

### Admin  *(requires `X-Admin-Key` header)*
| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/admin/dashboard       | Full dashboard stats               |
| GET    | /api/admin/contacts        | List contacts (filterable)         |
| PATCH  | /api/admin/contacts/:id    | Update contact status              |
| GET    | /api/admin/waitlist        | Full waitlist                      |
| GET    | /api/admin/downloads       | Paginated download log             |

### Health
| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/health                | Service health check               |

---

## Database Schema

| Table           | Purpose                                    |
|-----------------|--------------------------------------------|
| `downloads`     | Every download button click log            |
| `contacts`      | Contact form submissions                   |
| `waitlist`      | macOS / Linux / Mobile / Extension signups |
| `page_views`    | Website page visit tracking                |
| `events`        | UI interaction events (clicks, scrolls)    |
| `admins`        | Admin user accounts                        |
| `release_cache` | GitHub API response cache (1hr TTL)        |

---

## Frontend Integration

The landing page calls these APIs automatically:

```javascript
// Track download button clicks
fetch('/api/downloads/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ platform: 'windows', version: 'latest' })
});

// Show real version from GitHub releases
const { version, download_url } = await fetch('/api/downloads/latest').then(r=>r.json());

// Track page view on load
fetch('/api/analytics/pageview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ path: '/', referer: document.referrer, session_id: sid })
});
```

---

## Production Deployment

### Option 1: Docker Compose
```bash
# Set environment variables
cp backend/.env.example backend/.env
# Edit .env with production values

# Build and start
docker-compose up -d

# With Nginx (production profile)
docker-compose --profile production up -d
```

### Option 2: Manual (VPS/Ubuntu)
```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/jayaprakash2207/ENTITY-X-website.git
cd entityx-website
./scripts/setup.sh

# Start with PM2
npm install -g pm2
pm2 start backend/server.js --name entityx-website
pm2 save && pm2 startup
```

### Option 3: Railway / Render / Fly.io
- Set all environment variables in the platform dashboard
- Point build command to `cd backend && npm install`
- Point start command to `cd backend && node server.js`

---

## Email Setup (Optional but Recommended)

For Gmail:
1. Enable 2FA on your Google account
2. Create an App Password at https://myaccount.google.com/apppasswords
3. In `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_16_char_app_password
EMAIL_FROM=Entity X <noreply@entityx.app>
EMAIL_NOTIFY=your_personal@email.com
```

If `SMTP_HOST` is not set, emails are printed to the console — useful for development.

---

## Admin Dashboard

Query the admin API directly with curl or any HTTP client:

```bash
# Dashboard stats
curl -H "X-Admin-Key: your_key" http://localhost:4000/api/admin/dashboard | jq

# List open contacts
curl -H "X-Admin-Key: your_key" "http://localhost:4000/api/admin/contacts?status=open" | jq

# Mark contact as replied
curl -X PATCH -H "X-Admin-Key: your_key" -H "Content-Type: application/json" \
  -d '{"status":"replied"}' http://localhost:4000/api/admin/contacts/1 | jq
```

---

## License
MIT © 2026 Jayaprakash A R
