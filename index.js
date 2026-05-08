const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");
const os = require("os");

// --- BOT YAPILANDIRMASI ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const PREFIX = "!"; // Prefix burada tanımlandı
const BOT_NAME = "Sa-As Bot";
const AUTHOR = "DRK";
const botStartTime = Date.now();

// --- HTTP SUNUCU (Uptime Hizmetleri İçin) ---
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "online", bot: BOT_NAME }));
}).listen(PORT);

// --- YARDIMCI FONKSİYONLAR ---
function getSystemStats() {
  const totalMem = os.totalmem() / (1024 ** 3);
  const freeMem = os.freemem() / (1024 ** 3);
  const usedMem = totalMem - freeMem;
  const uptime = os.uptime();
  
  return {
    cpu: (os.loadavg()[0] * 10).toFixed(1),
    ram: ((usedMem / totalMem) * 100).toFixed(1),
    ramUsed: usedMem.toFixed(1),
    ramTotal: totalMem.toFixed(1),
    uptime: `${Math.floor(uptime / 86400)}g ${Math.floor((uptime % 86400) / 3600)}s`,
    platform: os.platform(),
    arch: os.arch()
  };
}

function createProgressBar(percent) {
  const filled = Math.min(10, Math.floor(percent / 10));
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

// --- ANA OLAYLAR ---
client.on('ready', () => {
  console.log(`
╔════════════════════════════════════════╗
║    ${client.user.username} AKTİF!      ║
║    Prefix: ${PREFIX}                       ║
╚════════════════════════════════════════╝`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const rawContent = message.content;
  const content = rawContent.toLowerCase().trim();
  
  // ─── 1. DEV KÜFÜR VE ARGO FİLTRESİ ──────────────────────────
  const yasakliKelimeler = [
    "amk", "amq", "aq", "orospu", "oç", "pic", "piç", "siktir", "sik", "am", "got", "göt", "yarrak", "yrk",
    "dassak", "tassak", "taşşak", "sikik", "serefsiz", "şerefsiz", "pezevenk", "pzvng", "pust", "puşt",
    "gavat", "kahpe", "yavsak", "yavşak", "ibne", "fahişe", "amcık", "sokarım", "sokayım", "sikim", 
    "siktiğim", "sikiş", "götveren", "amına", "ananı", "anani", "bacını", "avradını", "mal", "salak", 
    "gerizekali", "aptal", "it", "köpek", "gevşek", "adi", "alçak", "kodumun", "ezik", "beyinsiz", "sg", "sq"
  ];

  // Filtre Aşımlarını Temizleme (m.a.l -> mal, 4mk -> amk vb.)
  const cleanContent = content
    .replace(/[^a-z0-9ğüşıöç]/g, "") 
    .replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e")
    .replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t");

  const hasBadWord = yasakliKelimeler.some(word => content.includes(word) || cleanContent.includes(word));

  if (hasBadWord) {
    try {
      if (message.deletable) {
        await message.delete();
        const warn = await message.channel.send(`⚠️ <@${message.author.id}>, **Argo/Küfür kullanımı yasaktır! Mesajın silindi.**`);
        setTimeout(() => warn.delete().catch(() => {}), 4000);
      }
      return; 
    } catch (e) { console.error("Silme hatası:", e); }
  }

  // ─── 2. OTOMATİK SELAMLAŞMA (Prefix Gerektirmez) ──────────
  const selamlar = {
    "sa": "Aleyküm Selam, hoş geldin! 👋",
    "sea": "Aleyküm Selam, hoş geldin! 👋",
    "selam": "Selam, hoş geldin! 😊",
    "selamun aleykum": "Aleyküm Selam, hoş geldin! 👋",
    "selamünaleyküm": "Aleyküm Selam, hoş geldin! 👋",
    "günaydın": "Günaydın! ☀️",
    "iyi geceler": "İyi geceler! 🌙"
  };

  if (selamlar[content]) {
    return await message.reply(`**${selamlar[content]}**`);
  }

  // ─── 3. KOMUTLAR (Prefix Kontrolü) ──────────────────────────
  if (!message.content.startsWith(PREFIX)) return;
  const cmd = content.slice(PREFIX.length).split(" ")[0];

  switch(cmd) {
    case "monitor":
    case "botmonitor": {
      const stats = getSystemStats();
      const embed = new EmbedBuilder()
        .setTitle("🖥️ Sistem Durumu")
        .setColor(Colors.Blue)
        .addFields(
          { name: "⏲️ Uptime", value: `\`${stats.uptime}\``, inline: false },
          { name: "🚀 İşlemci", value: `\`%${stats.cpu}\` ${createProgressBar(stats.cpu)}`, inline: true },
          { name: "🧠 RAM", value: `\`%${stats.ram}\` ${createProgressBar(stats.ram)}\n${stats.ramUsed}/${stats.ramTotal}GB`, inline: true }
        )
        .setFooter({ text: `${BOT_NAME} • ${AUTHOR}` });
      
      await message.reply({ embeds: [embed] });
      break;
    }

    case "ascii": {
      const art = "```\n" + 
`╔════════════════════════════════════════╗
║    ███████╗ █████╗      █████╗ ███████╗  ║
║    ██╔════╝██╔══██╗    ██╔══██╗██╔════╝ ║
║    ███████╗███████║    ███████║███████╗ ║
║    ╚════██║██╔══██║    ██╔══██║╚════██║ ║
║    ███████║██║  ██║    ██║  ██║███████║  ║
║    ╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚══════╝  ║
╚════════════════════════════════════════╝` + "\n```";
      
      const embed = new EmbedBuilder()
        .setTitle("✨ Bot Logo")
        .setDescription(art)
        .setColor(Colors.Blurple);
      
      await message.reply({ embeds: [embed] });
      break;
    }

    case "yardim":
    case "help": {
      const embed = new EmbedBuilder()
        .setTitle("📖 Komut Menüsü")
        .setDescription(`Botun prefixi: \`${PREFIX}\``)
        .addFields(
          { name: "🔹 Komutlar", value: `\`${PREFIX}monitor\`, \`${PREFIX}ascii\`, \`${PREFIX}help\``, inline: true },
          { name: "🔹 Otomasyon", value: "Selamlaşma ve Küfür Filtresi Aktif!", inline: true }
        )
        .setColor(Colors.Green)
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      break;
    }
  }
});

client.login(process.env.BOT_TOKEN);
