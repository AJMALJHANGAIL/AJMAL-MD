
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const archiver = require('archiver');
const { useMultiFileAuthState, fetchLatestBaileysVersion, default: makeWASocket } = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
const port = process.env.SESSION_PORT || 8080;
const SESS_DIR = path.join(__dirname, 'sessions', 'pairing');
if (!fs.existsSync(SESS_DIR)) fs.mkdirSync(SESS_DIR, { recursive: true });

let currentQRDataUrl = null;
let lastPaired = false;

async function startPairing() {
  const { state, saveCreds } = await useMultiFileAuthState(SESS_DIR);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: 'silent' }),
    version
  });

  sock.ev.on('connection.update', async (update) => {
    // update may contain qr string to render
    if (update.qr) {
      try {
        currentQRDataUrl = await qrcode.toDataURL(update.qr);
        console.log('QR generated for web panel.');
      } catch (e) {
        console.error('QR gen error', e);
      }
    }
    if (update.connection === 'open') {
      console.log('Paired! Saving creds...');
      // creds will be saved automatically by Baileys to SESS_DIR via saveCreds
      lastPaired = true;
      currentQRDataUrl = null;
    }
  });

  sock.ev.on('creds.update', saveCreds);
  console.log('Pairing socket started. Visit / to see QR and download session after pairing.');
}

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const html = `
  <h2>LegendX-MD — Session Pairing Panel</h2>
  <p>Scan the QR with WhatsApp → Linked Devices → Link a Device.</p>
  <div style="margin:20px 0;">
    ${ currentQRDataUrl ? `<img src="${currentQRDataUrl}" alt="QR" />` : '<b>No QR currently. If you started pairing it will appear here.</b>' }
  </div>
  <p><a href="/generate">Generate QR (start pairing)</a> | <a href="/download">Download session (zip)</a></p>
  <p>Status: ${ lastPaired ? '<b style="color:green">Paired</b>' : '<b style="color:orange">Not paired</b>' }</p>
  `;
  res.send(html);
});

app.get('/generate', async (req, res) => {
  // Starting pairing socket will generate a QR visible on this page
  startPairing().catch(e => console.error(e));
  res.redirect('/');
});

app.get('/download', (req, res) => {
  const dirPath = path.join(__dirname, 'sessions', 'pairing');
  if (!fs.existsSync(dirPath)) return res.status(404).send('No session found. Pair first.');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=session-pairing.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(dirPath, false);
  archive.finalize();
  archive.pipe(res);
});

app.listen(port, () => console.log(`Session panel running on http://localhost:${port}`));
