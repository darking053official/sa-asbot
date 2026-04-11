const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");
const os = require("os");

// ASCII Logo
console.log(`
╔════════════════════════════════════════╗
║    ███████╗ █████╗      █████╗ ███████╗ ║
║    ██╔════╝██╔══██╗    ██╔══██╗██╔════╝ ║
║    ███████╗███████║    ███████║███████╗ ║
║    ╚════██║██╔══██║    ██╔══██║╚════██║ ║
║    ███████║██║  ██║    ██║  ██║███████║ ║
║    ╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚══════╝ ║
║         🤲 SA - AS BOT 🤲              ║
║      Selam Verene Selam Cevabı        ║
║         📍 by DRK 📍                   ║
╚════════════════════════════════════════╝
`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// HTTP sunucu (Render için)
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "online", bot: "SaAsBot" }));
}).listen(PORT, () => console.log(`🌐 HTTP sunucu ${PORT} portunda`));

// Bot başlangıç zamanı
const botStartTime = Date.now();

// Sistem bilgileri
function getSystemStats() {
  const totalMem = os.totalmem() / 1024 / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024 / 1024;
  const usedMem = totalMem - freeMem;
  const memPercent = (usedMem / totalMem) * 100;
  
  const cpuUsage = os.loadavg()[0];
  const cpuPercent = Math.min(100, (cpuUsage / os.cpus().length) * 100);
  
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  return {
    cpu: cpuPercent.toFixed(1),
    ram: memPercent.toFixed(1),
    ramUsed: usedMem.toFixed(1),
    ramTotal: totalMem.toFixed(1),
    uptime: `${days}g ${hours}s ${minutes}d`,
    platform: os.platform(),
    arch: os.arch()
  };
}

// Progress bar
function createProgressBar(percent) {
  const filled = Math.floor(percent / 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

// Uptime format
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0) parts.push(`${hours}s`);
  if (minutes > 0) parts.push(`${minutes}d`);
  return parts.join(" ") || "0d";
}

client.on("ready", () => {
  console.log(`
╔════════════════════════════════════════╗
║     🤲 SA AS BOT AKTİF 🤲              ║
╠════════════════════════════════════════╣
║  ✅ ${client.user?.username} hazır!       ║
║  📊 ${client.guilds.size} sunucu          ║
║  🆔 ID: ${client.user?.id}               ║
║  📍 by DRK                             ║
╚════════════════════════════════════════╝
  `);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  
  const content = message.content.toLowerCase().trim();
  const cmd = message.content.startsWith("!") ? message.content.slice(1).trim().toLowerCase() : null;
  
  // ─── SELAM KOMUTLARI ─────────────────────────────────────────
  
  // sa, sea, selamın aleyküm
  if (content === "sa" || content === "sea" || content === "selamın aleyküm" || content === "selamünaleyküm") {
    await message.reply("**Aleyküm selam** 👋");
  }
  
  // as, aleyküm selam
  if (content === "as" || content === "aleyküm selam" || content === "aleykümselam") {
    await message.reply("**Ve aleyküm selam** 🤝");
  }
  
  // selam
  if (content === "selam") {
    await message.reply("**Aleyküm selam, hoş geldin!** 😊");
  }
  
  // günaydın
  if (content === "günaydın" || content === "gunaydin") {
    await message.reply("**Günaydın!** ☀️");
  }
  
  // iyi geceler
  if (content === "iyi geceler") {
    await message.reply("**İyi geceler!** 🌙");
  }
  
  // ─── BOT MONİTOR ─────────────────────────────────────────────
  if (cmd === "botmonitor" || cmd === "monitor") {
    const stats = getSystemStats();
    const cpuBar = createProgressBar(parseFloat(stats.cpu));
    const ramBar = createProgressBar(parseFloat(stats.ram));
    
    const embed = new EmbedBuilder()
      .setTitle("🖥️ Linux Server Monitor")
      .setColor(Colors.Blue)
      .addFields(
        { name: "⏱️ Uptime", value: `\`${stats.uptime}\``, inline: false },
        { name: "🖥️ CPU", value: `\`${stats.cpu}%\` ${cpuBar}`, inline: true },
        { name: "💾 RAM", value: `\`${stats.ram}%\` ${ramBar}\n${stats.ramUsed}GB / ${stats.ramTotal}GB`, inline: true },
        { name: "💿 Sistem", value: `\`${stats.platform} ${stats.arch}\``, inline: true }
      )
      .setFooter({ text: "Sa As Bot • by DRK" })
      .setTimestamp();
    
    await message.reply({ embeds: [embed] });
  }
  
  // ─── BOT İSTATİSTİK ──────────────────────────────────────────
  if (cmd === "botistatistik" || cmd === "botstats") {
    const botUptime = Date.now() - botStartTime;
    const stats = getSystemStats();
    
    const embed = new EmbedBuilder()
      .setTitle("📊 Sa As Bot İstatistikleri")
      .setColor(Colors.Gold)
      .addFields(
        { name: "📊 Sunucu", value: `\`${client.guilds.size}\``, inline: true },
        { name: "⏱️ Bot Uptime", value: `\`${formatUptime(botUptime)}\``, inline: true },
        { name: "🖥️ CPU", value: `\`${stats.cpu}%\``, inline: true },
        { name: "💾 RAM", value: `\`${stats.ram}%\``, inline: true },
        { name: "🆔 Bot ID", value: `\`${client.user?.id}\``, inline: true }
      )
      .setFooter({ text: "Sa As Bot • by DRK" })
      .setTimestamp();
    
    await message.reply({ embeds: [embed] });
  }
  
  // ─── YARDIM ──────────────────────────────────────────────────
  if (cmd === "yardim" || cmd === "help") {
    const embed = new EmbedBuilder()
      .setTitle("📖 Sa As Bot Komutları")
      .setDescription("🤲 Selam verene selam cevabı veren bot")
      .setColor(Colors.Purple)
      .addFields(
        { name: "🕌 Selam", value: "`sa` `selam` `selamın aleyküm`", inline: true },
        { name: "🤝 Selam Cevabı", value: "`as` `aleyküm selam`", inline: true },
        { name: "☀️ Günaydın", value: "`günaydın`", inline: true },
        { name: "🌙 İyi Geceler", value: "`iyi geceler`", inline: true },
        { name: "🖥️ !botmonitor", value: "Sistem durumu", inline: true },
        { name: "📊 !botistatistik", value: "Bot istatistik", inline: true }
      )
      .setFooter({ text: "Sa As Bot • by DRK" })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
});

client.login(process.env.BOT_TOKEN);
