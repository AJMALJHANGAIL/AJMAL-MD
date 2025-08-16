const categories = {
  '🪀 GROUP-CMD': [
    'antic','welcome','goodbye','online','delete','groupstats','add','poll','tagall','tagadmins','description','left','join','groupname','ginfo','getgpp','kick','invite','mute','lockgc','promote','demote','revoke','unlockgc','unmute','opentime','closetime','hidetag','vcf'
  ],
  '🫟 EDITS-CMD': [
    'passed','blur','imggay','invert','jail','remini','rmbg','checkp','vision','wanted'
  ],
  '🧠 AI-CMD': [
    'ai','openai','deepseek','fluxai','stablediffusion','stabilityai','google'
  ],
  '⚙️ INFO-CMD': [
    'alive','allvar','ping','ping2','runtime','repo','channel','support','csave','body','available','composing','status'
  ],
  '👑 OWNER-CMD': [
    'antidelete','block','unblock','boom','mode','admin-events','welcome','anti-call','goodbye','auto-typing','mention-reply','always-online','auto-recording','auto-seen','status-react','read-message','auto-voice','auto-sticker','auto-reply','auto-react','owner-react','jid','get','getpp','out','update','pmforward','vv2','restart','spam','ask','tovv','vv','wa'
  ],
  '🏮 DOWNLOAD-CMD': [
    'apk','fbdl','image','img2','igdl','igdl4','ig2','ig3','ringtone','tiktok','tiktok2','ytpost','twitter','mediafire','gdrive','snap','gitclone','movieinfo','pinterest','sptdl','video','play','song2'
  ],
  '🎡 CONVERTER-CMD': [
    'tomp3','tovoice','fancy','analyze','ade','photo','take','sticker','tiny','obfuscate','deobfuscate','vsticker','attp','tgs','url','tts2','tts3'
  ],
  '🪩 SEARCH': [
    'couplepp','lyrics','timezone','npm','pair','qrcode','praytime','rdanime','srepo','rw','ytstalk','xstalk','tiktokstalk','wastalk','githubstalk','newsletter','country','screenshot','weather','yts'
  ],
  '🎮 FUN-GAMES': [
    'dragon','emix','nikal','compatibility','aura','roast','8ball','compliment','lovetest','emoji','chai','shadi','insult','meme','ship','hack','dailyfact','age','quote','superhero','timetravel','joke','flirt','truth','dare','fact','pickupline','character','repeat','ngl'
  ],
  '🪼 REACTION-CMD': [
    'happy','heart','angry','sad','shy','moon','confused','hot','cry','cuddle','bully','hug','awoo','lick','pat','smug','bonk','yeet','blush','handhold','highfive','nom','wave','smile','wink','happy','glomp','bite','poke','cringe','dance','kill','slap','kiss'
  ],
  '🎗️ LOGOS-CMD': [
    '3dcomic','dragonball','deadpool','blackpink','neonlight','cat','sadgirl','pornhub','naruto','thor','america','eraser','3dpaper','futuristic','clouds','sans','galaxy','leaf','sunset','nigeria','devilwings','hacker','boom','luxury','zodiac','angelwings','bulb','tattoo','castle','frozen','paint','birthday','typography','bear','valorant'
  ],
  '🪾 PRIVACY-CMD': [
    'blocklist','getbio','setppall','setonline','setpp','setmyname','updatebio','groupsprivacy','getprivacy'
  ]
};

function menuString(config){
  const line = '*╭──────────────────✑*';
  const end = '*╰──────────────────✑*';
  const bullet = `*┋* *${config.THEME.bullet} `;
  let out = [];
  for(const [title, cmds] of Object.entries(categories)){
    out.push(`*${title}*`);
    out.push(line);
    out.push(cmds.map(c => `${bullet} ${c}*`).join('\n'));
    out.push(end);
  }
  return '\n' + out.join('\n');
}

module.exports = { categories, menuString };
