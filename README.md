# BhasaCheck

Audio Dataset Viewer + RSML Annotation UI with a Node.js/MongoDB backend. Browse Parquet-sourced audio segments, play WAV audio in the browser, annotate text with RSML, and optionally merge segments with timestamps.

## Contents
- Overview
- Architecture
- Key Features
- Quick Start (Local)
- Environment Variables
- Seed Database from Parquet
- API Endpoints
- Frontend Usage
- Deploy on Render
- Troubleshooting

---

## Overview
BhasaCheck lets you select a Parquet dataset, browse its files and segments, play per-segment audio, and edit transcripts with RSML (Rich Semantic Markup Language). Audio is stored in MongoDB as base64 WAV to ensure broad browser playback compatibility.

## Architecture
- `BhasaCheck-Backend/` — Node.js + Express + Mongoose API
  - Converts FLAC bytes from Parquet to WAV during seeding using FFmpeg
  - Serves per-segment audio and metadata
- `frontend/` — React + Vite UI
  - Clean, mobile-friendly UI (Bootstrap 5)
  - RSML editor for tags/entities/language spans

Data flow:
1) Parquet (.parquet) → seed script → MongoDB (segments + `audio_data` base64 WAV)
2) Frontend fetches lists and segments → plays audio via `<audio>` tag
3) RSML editor enhances transcript entry/preview

## Key Features
- Parquet/file selectors with a simple dropdown-driven flow
- One-by-one segment cards showing speaker, scenario, and audio player
- RSML editor: `@tag`, `#entity`, `!lang{...}` with live preview
- Merge-all utility: decode+concatenate segments with 1s silence and emit a timestamped transcript (client-side)
- WAV-in-DB for universal browser playback

## Quick Start (Local)
Prereqs: Node 18+, MongoDB Atlas (or local Mongo), FFmpeg.

Backend
```powershell
cd BhasaCheck-Backend
npm install
# .env must contain MONGODB_URI
node server.js
```

Frontend
```powershell
cd frontend
npm install
# set API base in .env for dev if needed (see Environment Variables)
npm run dev
```

Open: http://localhost:5173

## Environment Variables
Backend (`BhasaCheck-Backend/.env`)
- `MONGODB_URI` — MongoDB connection string
- `PORT` — optional; default 4000 (Render provides its own)

Frontend (`frontend/.env`)
- `VITE_API_URL` — API base URL. Examples:
  - Local: `http://localhost:4000/api`
  - Render: `https://<your-backend>.onrender.com/api`

## Seed Database from Parquet
The seeder reads Parquet files and converts FLAC bytes → WAV bytes via FFmpeg, storing base64 WAV in MongoDB.

Prereqs
- FFmpeg available (the project uses `@ffmpeg-installer/ffmpeg`, but ensure it works on your OS)

Commands (Windows PowerShell)
```powershell
cd BhasaCheck-Backend
# optional: wipe existing segments
node clearData.js
# seed the sample parquet files configured in utils/seedParquest.js
node utils/seedParquest.js
```
If audio playback fails and `audio_data` length is tiny (e.g., ~136 bytes), reseed after ensuring FFmpeg works.

## API Endpoints
Base: `{VITE_API_URL}` (e.g., `http://localhost:4000/api`)
- `GET /parquets` → `[parquet_id]`
- `GET /parquets/:pid/files` → `[file_id]`
- `GET /parquets/:pid/files/:fid` → `[{ segment /* no audio_data */ }]`
- `GET /audio/:pid/:fid/:sid` → WAV bytes for a segment

## Frontend Usage
1) Select a Parquet, then a file, then click `Load`
2) Scroll segment cards: each shows metadata + audio + RSML editor
3) Use RSML syntax:
   - `@laughing`, `@background_noise`
   - `#Mumbai`, `#John_Smith`
   - `!hi{नमस्ते}` `!en{hello}`
4) Optionally click "Merge All Segments" to preview a combined WAV and timestamped transcript (best when all segments decode properly)

## Deploy on Render
Backend (Web Service)
- Root: `BhasaCheck-Backend`
- Build: `npm install`
- Start: `node server.js`
- Env: `MONGODB_URI`, `NODE_ENV=production`
- Region: Singapore (closest for India)

Frontend (Static Site)
- Root: `frontend`
- Build: `npm install && npm run build`
- Publish: `dist`
- Env: `VITE_API_URL=https://<your-backend>.onrender.com/api`

## Troubleshooting
- "MediaError code: 4" / audio won’t play
  - Likely wrong format. Ensure DB contains WAV (not raw FLAC). Rerun seeding.
- `audio_data` too small (e.g., ~136 bytes)
  - Conversion failed or not run. Re-run seed script after `clearData.js`.
- RSML suggestions stacked
  - Use the latest code which scopes and cleans suggestion boxes per editor.
- Render cold starts
  - Free instances sleep; first request may take ~30s.

---

Made with React, Express, MongoDB, FFmpeg, and RSML.