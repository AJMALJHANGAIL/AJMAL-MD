
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
  getContentType,
  Browsers
} = require('@whiskeysockets/baileys');

const P = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const express = require('express');
const config = require('./config');

// server
const app = express();
const port = process.env.PORT || 9090;
app.get('/', (_, res) => res.send('LegendX-MD running ✅'));
app.listen(port, () => console.log('HTTP server on', port));

const commands = new Map();
function registerCommand(def){
  if(!def.pattern || !def.handler) return;
  commands.set(def.pattern, def);
  console.log('Loaded cmd:', def.pattern);
}

// load plugins
function loadPlugins(){
  const dir = path.join(__dirname,'plugins');
  fs.readdirSync(dir).filter(f=>f.endsWith('.js')).forEach(f=>{
    const plug = require(path.join(dir,f));
    if(typeof plug==='function') plug({cmd:registerCommand, PREFIX:config.PREFIX});
  });
}

async function connect(){
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname,'sessions'));
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    auth: state,
    browser: Browsers.macOS('Safari'),
    printQRInTerminal: true,
    logger: P({ level:'silent' }),
    version
  });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', ({connection, qr, lastDisconnect})=>{
    if(qr) qrcode.generate(qr,{small:true});
    if(connection==='open') console.log('✅ Connected as', sock.user.id);
    if(connection==='close'){
      const reason = lastDisconnect?.error?.output?.statusCode;
      if(reason!==DisconnectReason.loggedOut) connect();
    }
  });

  sock.ev.on('messages.upsert', async({messages})=>{
    const m = messages[0]; if(!m.message) return;
    if(getContentType(m.message)==='ephemeralMessage') m.message=m.message.ephemeralMessage.message;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
    if(!body.startsWith(config.PREFIX)) return;
    const [raw,...rest] = body.slice(config.PREFIX.length).trim().split(/\s+/);
    const command = raw.toLowerCase();
    const args = rest;
    const text = rest.join(' ');
    const reply = (txt)=>sock.sendMessage(m.key.remoteJid,{text:txt},{quoted:m});
    const def = commands.get(command);
    if(def) await def.handler({sock, m, args, text, reply});
  });
}

loadPlugins();
connect();
