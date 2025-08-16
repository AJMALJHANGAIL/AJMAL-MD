
require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, getContentType, Browsers } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const express = require('express');
const config = require('./config');

const app = express();
const port = process.env.PORT || 9090;
app.get('/', (_, res) => res.send(`${config.BOT_NAME} running`));
app.listen(port, () => console.log('HTTP server on', port));

async function startBot() {
  const sessPath = path.join(__dirname, 'sessions', 'pairing');
  const authPath = fs.existsSync(sessPath) ? sessPath : path.join(__dirname, 'sessions');
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
    browser: Browsers.macOS('Firefox'),
    version
  });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'open') console.log('Bot connected');
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }
  });

  // minimal handler
  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages && m.messages[0];
    if (!msg || !msg.message) return;
    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (!body.startsWith(config.PREFIX)) return;
    const cmd = body.slice(config.PREFIX.length).trim().split(/\s+/)[0].toLowerCase();
    if (cmd === 'alive') {
      sock.sendMessage(from, { text: `${config.BOT_NAME} is alive ✅` }, { quoted: msg });
    }
  });
}

startBot().catch(console.error);
