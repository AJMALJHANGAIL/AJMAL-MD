
require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  getContentType,
  Browsers
} = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const express = require('express');

const config = require('./config');

const app = express();
const port = process.env.PORT || 9090;
app.get('/', (_, res) => res.send(`🚀 ${config.BOT_NAME} is up!`));
app.listen(port, () => console.log('HTTP server on', port));

const registry = new Map();
function register(def) {
  if (!def || !def.pattern || !def.handler) return;
  registry.set(def.pattern.toLowerCase(), def);
  console.log('Loaded:', def.pattern);
}

function loadPlugins() {
  const dir = path.join(__dirname, 'plugins');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  files.forEach(f => {
    const plug = require(path.join(dir, f));
    if (typeof plug === 'function') plug({ cmd: register, PREFIX: config.PREFIX, OWNER: config.OWNER });
  });
  console.log('Plugins loaded:', files.length);
}

function buildCard({ timeStr }) {
  return [
    `*╭${'┈──'}「 ${config.BOT_NAME} 」${'┈──'}⊷*`,
    `*│ 🫟 ᴍᴏᴅᴇ:* ${config.MODE}`,
    `*│ 🪄 ᴘʀᴇғɪx:* ${config.PREFIX}`,
    `*│ 👑 ᴄʀᴇᴀᴛᴏʀ:* ${config.CREATOR}`,
    `*│ ⏰ ᴛɪᴍᴇ ɴᴏᴡ:* ${timeStr}`,
    `*╰${'┈─────────────────┈'}⊷*`
  ].join('\n');
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'));
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    auth: state,
    browser: Browsers.macOS('Safari'),
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
    version
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'open') console.log('✅ Connected');
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) start();
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0]; if (!m?.message) return;
    const from = m.key.remoteJid;
    if (getContentType(m.message) === 'ephemeralMessage') m.message = m.message.ephemeralMessage.message;

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      m.message.videoMessage?.caption || '';

    if (!text.startsWith(config.PREFIX)) return;

    const [cmd, ...args] = text.slice(config.PREFIX.length).trim().split(/\s+/);
    const command = (cmd || '').toLowerCase();
    const argText = args.join(' ');

    const reply = (t) => sock.sendMessage(from, { text: t }, { quoted: m });

    if (command === 'alive') {
      return reply([
        buildCard({ timeStr: new Date().toLocaleTimeString() }),
        '',
        '*I am alive & running ✅*'
      ].join('\n'));
    }
    if (command === 'menu') {
      const menuText = require('./plugins/menu').menuString(require('./config'));
      return reply([buildCard({ timeStr: new Date().toLocaleTimeString() }), menuText].join('\n'));
    }

    const def = registry.get(command);
    if (!def) return;
    try {
      await def.handler({ reply, text: argText });
    } catch (e) {
      console.error('Cmd error', e);
      reply('❌ Error: ' + (e?.message || e));
    }
  });
}

loadPlugins();
start();
