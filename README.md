
# LegendX-MD with Session Pairing Panel

This package includes two apps:
1. `session-server.js` — small web panel to generate QR and download paired session credentials as a zip.
   - Run: `node session-server.js` (default port 8080) -> open http://localhost:8080 -> Click "Generate QR" -> Scan with WhatsApp -> After pairing, click "Download session"
2. `index.js` — main bot that will use the pairing session if present under `sessions/pairing/`, otherwise uses `sessions/`.

Steps to use locally:
- Install: `npm install`
- Start pairing server: `node session-server.js` -> open the page, generate QR and pair -> click download to get `session` zip.
- Extract session contents into `sessions/pairing/` (or upload to your host) or set as `SESSION_ID` base64 if you prefer.
- Start bot: `node index.js`

Deploy notes:
- On Railway/Heroku, run `session-server.js` to pair and then save sessions to repo (NOT recommended publicly). Better: download the session zip and store credentials in env/secure storage.
- Never commit `sessions/` to public GitHub.
