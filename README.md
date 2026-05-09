<div align="center">

```
███████╗███╗   ██╗████████╗██╗████████╗██╗   ██╗    ██╗  ██╗
██╔════╝████╗  ██║╚══██╔══╝██║╚══██╔══╝╚██╗ ██╔╝    ╚██╗██╔╝
█████╗  ██╔██╗ ██║   ██║   ██║   ██║    ╚████╔╝      ╚███╔╝ 
██╔══╝  ██║╚██╗██║   ██║   ██║   ██║     ╚██╔╝       ██╔██╗ 
███████╗██║ ╚████║   ██║   ██║   ██║      ██║        ██╔╝ ██╗
╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝   ╚═╝      ╚═╝        ╚═╝  ╚═╝
```

**Digital Forensics AI Platform — Official Website**

[![Live](https://img.shields.io/badge/LIVE-entityx.app-00d4ff?style=for-the-badge&logo=netlify&logoColor=white)](https://entityx.app)
[![Netlify](https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://app.netlify.com/projects/entityx-website)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffd700?style=for-the-badge)](LICENSE)

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=flat-square&logo=three.js)](https://threejs.org)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?style=flat-square)](https://greensock.com/gsap/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com)

<br/>

> *Silently wraps a live browser in a real-time AI monitoring layer — detecting deepfakes, AI-generated content, and misinformation as you browse.*

</div>

---

## ✦ Live Demo

| | |
|---|---|
| 🌐 **Website** | [https://entityx.app](https://entityx.app) |
| 🔧 **API Health** | [https://entityx.app/api/health](https://entityx.app/api/health) |
| 💾 **Download** | [Latest Release on GitHub](https://github.com/jayaprakash2207/ENTITY-X/releases/latest) |

---

## ✦ Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                        entityx.app (Netlify CDN)                     ║
╠══════════════════════════════╦═══════════════════════════════════════╣
║   FRONTEND                   ║   BACKEND (Serverless)                ║
║   ─────────────────────────  ║   ────────────────────────────────    ║
║   frontend/public/           ║   netlify/functions/api.js            ║
║   ├── index.html             ║   ├── POST  /api/downloads/track      ║
║   │   ├── Three.js 3D scene  ║   ├── GET   /api/downloads/latest     ║
║   │   ├── GSAP animations    ║   ├── POST  /api/contact              ║
║   │   ├── 5 orbital rings    ║   ├── POST  /api/analytics/pageview   ║
║   │   ├── 800 particles      ║   ├── POST  /api/analytics/event      ║
║   │   └── 8 feature cards    ║   ├── POST  /api/waitlist             ║
║                               ║   ├── GET   /api/admin/*  🔒         ║
║                               ║   └── GET   /api/health              ║
║                               ║                                       ║
║                               ║   DATABASE (Supabase / PostgreSQL)    ║
║                               ║   ────────────────────────────────    ║
║                               ║   downloads · contacts · waitlist     ║
║                               ║   page_views · events · release_cache ║
╚══════════════════════════════╩═══════════════════════════════════════╝
```

---

## ✦ Features

| Layer | Technology | Purpose |
|---|---|---|
| **3D Scene** | Three.js r128 | Holographic icosahedra, 5 orbital rings, 800 particles, orbiting data nodes, grid floor |
| **Animations** | GSAP 3.12 + ScrollTrigger | Scroll-linked camera transitions, staggered reveals, counter animations |
| **Backend** | Netlify Functions (Node 18) | Serverless API — zero cold-start overhead via esbuild bundler |
| **Database** | Supabase (PostgreSQL) | Downloads, contacts, waitlist, analytics, GitHub release cache |
| **Email** | Nodemailer | Contact form notifications |
| **Security** | API Key auth | Admin routes protected via `X-Admin-Key` header |

### Detection Capabilities (8 Threat Vectors)
```
 01  🔵  IMAGE DEEPFAKES     ViT 99.3% · SwinV2 · UniversalFakeDetect ensemble
 02  🔷  VIDEO DETECTION     Frame-by-frame AI-generated footage analysis
 03  🩷  AUDIO DETECTION     Voice cloning + synthetic audio via RNN + spectral analysis
 04  🔴  AI TEXT DETECTION   RoBERTa classifier + statistical burstiness
 05  🟦  ARTICLE FORENSICS   Gemini 2.0 Flash credibility + bias analysis
 06  🟡  LEGAL AI ENGINE     Auto-complaint generation · DeepSeek R1 legal chat
 07  🟢  REAL-TIME ALERTS    Silent background monitoring + instant alert toasts
 08  🟣  THREAT INTELLIGENCE Domain intel · live threat map · case management
```

---

## ✦ Project Structure

```
ENTITY-X-website/
│
├── 📄 netlify.toml                 ← Build config, redirects, function bundler
├── 📄 supabase-schema.sql          ← Run once in Supabase SQL Editor to init DB
├── 📄 package.json                 ← Root deps (supabase-js, nodemailer, validator)
│
├── 📁 frontend/
│   └── public/
│       └── index.html              ← Full SPA (Three.js · GSAP · Font Awesome)
│
├── 📁 netlify/
│   └── functions/
│       └── api.js                  ← All 14 API endpoints in one serverless function
│
├── 📁 backend/                     ← Legacy Express server (Render deployment)
│   ├── server.js
│   ├── .env.example
│   ├── Dockerfile
│   ├── routes/                     ← downloads · contact · analytics · waitlist · admin
│   ├── middleware/adminAuth.js
│   └── services/mailer.js
│
├── 📁 database/
│   ├── migrate.js
│   └── migrations/001_initial_schema.sql
│
├── 📁 nginx/entityx.conf           ← Production Nginx config
├── 📁 scripts/setup.sh             ← First-time setup
└── 📄 docker-compose.yml
```

---

## ✦ Quick Start (Local)

```bash
# 1. Clone
git clone https://github.com/jayaprakash2207/ENTITY-X-website.git
cd ENTITY-X-website

# 2. Install dependencies
npm install

# 3. Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env — minimum required:
#   ADMIN_API_KEY=your_strong_random_key
#   SUPABASE_URL=https://xxxx.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 4. Set up Supabase database
#    → Open supabase-schema.sql in Supabase SQL Editor and run it

# 5. Serve the frontend locally
npx serve frontend/public
# → http://localhost:3000
```

---

## ✦ Netlify Deployment

### One-click CLI deploy
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir frontend/public --site <your-site-id>
```

### Environment Variables (set in Netlify dashboard)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret) |
| `ADMIN_API_KEY` | Strong random key for admin API access |
| `SMTP_HOST` | SMTP server (optional — for contact emails) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / app password |
| `EMAIL_NOTIFY` | Email address to receive contact notifications |

### Database Setup
```sql
-- Run supabase-schema.sql in your Supabase SQL Editor
-- Creates: downloads, contacts, waitlist, page_views, events, release_cache
```

---

## ✦ API Reference

### Public Endpoints

```http
GET  /api/health                    → Service + database status
GET  /api/downloads/latest          → Latest GitHub release (cached 1hr)
GET  /api/downloads/stats           → Total download count
POST /api/downloads/track           → Log a download click
POST /api/contact                   → Submit contact / support message
GET  /api/contact/types             → Available message types
POST /api/analytics/pageview        → Track page visit
POST /api/analytics/event           → Track UI click / interaction
GET  /api/analytics/summary         → Aggregated public stats
POST /api/waitlist                  → Join macOS / Linux / mobile waitlist
GET  /api/waitlist/count            → Waitlist counts by platform
```

### Admin Endpoints *(require `X-Admin-Key` header)*

```http
GET   /api/admin/dashboard          → Full stats overview
GET   /api/admin/contacts           → Contact submissions (filter by status)
PATCH /api/admin/contacts/:id       → Update contact status
GET   /api/admin/waitlist           → Full waitlist entries
GET   /api/admin/downloads          → Paginated download log
```

**Example:**
```bash
# Check dashboard
curl -H "X-Admin-Key: YOUR_KEY" https://entityx.app/api/admin/dashboard | jq

# Mark contact as replied
curl -X PATCH \
  -H "X-Admin-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"replied"}' \
  https://entityx.app/api/admin/contacts/1
```

---

## ✦ Database Schema

```sql
downloads     → ip · user_agent · platform · version · country · referer · created_at
contacts      → name · email · subject · message · type · status · ip · created_at
waitlist      → email · platform · name · created_at  [UNIQUE email+platform]
page_views    → path · referer · user_agent · ip · session_id · created_at
events        → event_type · element · page · session_id · ip · meta · created_at
release_cache → version · tag_name · download_url · size_bytes · release_notes · fetched_at
```

---

## ✦ Frontend Tech Stack

```
Three.js r128     Holographic icosahedra · orbital rings · particle field · grid floor
GSAP 3.12         ScrollTrigger · ScrollToPlugin · camera state transitions
Font Awesome 6    Feature card icons
Orbitron          Display / heading font
Rajdhani          Body font
Share Tech Mono   Monospace / code font
```

**CSS Features:**
- Glassmorphism feature cards with per-card accent color (`--ca` CSS variable)
- Glitch animation on hero title with chromatic aberration
- Scan beam overlay · HUD corner brackets · neon flicker effects
- 3D card tilt on hover (perspective + rotateX/Y via JS)
- Animated stat counters on page load

---

## ✦ Legacy Docker Deployment

```bash
# Development
docker-compose up

# Production (with Nginx)
docker-compose --profile production up -d
```

---

## ✦ License

```
MIT License — © 2026 Jayaprakash A R

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software.
```

---

<div align="center">

**[entityx.app](https://entityx.app)** · **[GitHub](https://github.com/jayaprakash2207/ENTITY-X)** · **[Releases](https://github.com/jayaprakash2207/ENTITY-X/releases)**

*Built with Three.js · GSAP · Netlify Functions · Supabase*

</div>
