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

// Prefix artık "selambot " (Komutlar: selambot yardim vb.)
const PREFIX = "selambot "; 
const BOT_NAME = "SelamBot";
const AUTHOR = "DRK";

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

// --- ANA OLAYLAR ---
client.on('ready', () => {
  console.log(`
╔════════════════════════════════════════╗
║    ${BOT_NAME} ŞU AN AKTİF!            ║
║    Prefix: ${PREFIX}                  ║
╚════════════════════════════════════════╝`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const rawContent = message.content;
  const content = rawContent.toLowerCase().trim();
  
  // ─── 1. KÜFÜR FİLTRESİ (TAM KORUMA) ──────────────────────────
  const yasakliKelimeler = [
    "amk", "amq", "aq", "orospu", "oç", "pic", "piç", "siktir", "sik", "am", "got", "göt", "yarrak", "yrk",
    "dassak", "tassak", "taşşak", "sikik", "serefsiz", "şerefsiz", "pezevenk", "pust", "puşt", "yavşak", 
    "ibne", "amcık", "sokarım", "amına", "ananı", "bacını", "mal", "salak", "gerizekali", "aptal", "sg"
  ];

  const cleanContent = content
    .replace(/[^a-z0-9ğüşıöç]/g, "") 
    .replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e")
    .replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t");

  const hasBadWord = yasakliKelimeler.some(word => content.includes(word) || cleanContent.includes(word));

  if (hasBadWord) {
    try {
      if (message.deletable) {
        await message.delete();
        const warn = await message.channel.send(`⚠️ <@${message.author.id}>, **Argo kullanımı yasaktır! Mesajın silindi.**`);
        setTimeout(() => warn.delete().catch(() => {}), 4000);
      }
      return; 
    } catch (e) { console.error("Silme hatası:", e); }
  }

  // ─── 2. OTOMATİK SELAMLAŞMA ────────────────────────────────
  const selamlar = {
    "sa": "Aleyküm Selam, hoş geldin! 👋",
    "selam": "Selam, hoş geldin! 😊",
    "selamun aleykum": "Aleyküm Selam, hoş geldin! 👋",
    "günaydın": "Günaydın! ☀️",
    "iyi geceler": "İyi geceler! 🌙"
  };

  if (selamlar[content]) {
    return await message.reply(`**${selamlar[content]}**`);
  }

    // ─── 3. KOMUTLAR (Gelişmiş Prefix Kontrolü) ─────────────────
  
  // Mesaj "selambot" ile başlıyorsa (boşluklu veya bitişik fark etmez)
  if (content.startsWith("selambot")) {
    
    // "selambot" kelimesini atıp geri kalan metni temizliyoruz
    // Örn: "selambot  yardim" -> "yardim"
    const cmd = content.replace("selambot", "").trim().split(" ")[0];

    switch(cmd) {
      case "yardim":
      case "help": {
        const embed = new EmbedBuilder()
          .setTitle("📖 SelamBot Yardım Menüsü")
          .setDescription("Komutları kullanmak için: `selambot <komut>`")
          .addFields(
            { name: "🔹 Komutlar", value: "`yardim`, `monitor`, `ascii`", inline: false },
            { name: "🔹 Örnek", value: "`selambot yardim` veya `selambot monitor`", inline: false }
          )
          .setColor(Colors.Green);
        
        return await message.reply({ embeds: [embed] });
      }

      case "monitor": {
        const stats = getSystemStats();
        const embed = new EmbedBuilder()
          .setTitle("🖥️ SelamBot Sistem Durumu")
          .setColor(Colors.Blue)
          .addFields(
            { name: "🚀 İşlemci", value: `\`%${stats.cpu}\``, inline: true },
            { name: "🧠 RAM", value: `\`%${stats.ram}\``, inline: true }
          );
        return await message.reply({ embeds: [embed] });
      }

      case "ascii": {
        return await message.reply("```\n╔══════════════════╗\n║    SELAMBOT      ║\n╚══════════════════╝\n```");
      }
    }
  }


client.login(process.env.BOT_TOKEN);
