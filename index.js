const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");
const os = require("os");

// --- BOT YAPILANDIRMASI ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

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
    cpu: (os.loadavg()[0] * 10).toFixed(1), // Daha gerçekçi bir yük tahmini
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
client.on("ready", () => {
  console.log(`[LOG] ${client.user.username} olarak giriş yapıldı!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const rawContent = message.content;
  const content = rawContent.toLowerCase().trim();
  
  // ─── DEV KÜFÜR VE ARGO LİSTESİ ──────────────────────────────
  const yasakliKelimeler = [
    // Genel ve Ağır Küfürler
    "amk", "amq", "aq", "orospu", "oç", "pic", "piç", "siktir", "sik", "am", "got", "göt", "yarrak", "yrk",
    "dassak", "tassak", "taşşak", "sikik", "serefsiz", "şerefsiz", "pezevenk", "pzvng", "pust", "puşt",
    "gavat", "pezevenk", "kahpe", "yavsak", "yavşak", "ibne", "top", "fahişe", "fahise",

    // Cümle İçinde Kullanılan Eylem Küfürleri
    "sokarım", "sokayım", "sikim", "siktiğim", "sikiş", "sikis", "amcık", "amcik", "götveren", "gotveren",
    "götlek", "amına", "amina", "ananı", "anani", "bacını", "bacini", "avradını", "avradini", "karını", "karini",
    "sülaleni", "sulaleni", "gelmişini", "geçmişini", "gelmisini", "gecmisini",

    // Dini/Milli Değerlere Saldırı (Hassas Filtre)
    "allahsız", "allahsiz", "kitapsız", "kitapsiz", "imansız", "imansiz", "dinini", "imanını",

    // Hakaret ve Aşağılama
    "mal", "salak", "gerizekali", "gerizekalı", "aptal", "it", "köpek", "gevşek", "adi", "alçak", "kodumun",
    "ezik", "kekonun", "beyinsiz", "özürlü", "ozurlu", "am biti", "am biti", "dağ ayısı",

    // Kısaltmalar ve Gizli Küfürler
    "sg", "sq", "amk", "amjk", "amnn", "31", "anan", "bacın", "bacin", "götün", "gotun", "götoş", "gotos"
  ];

  // Regex: Mesajdaki tüm noktalama, boşluk ve benzeri karakterleri siler (Örn: m.a.l -> mal)
  // Ayrıca sayıları harfe benzetmeye çalışanları da (Örn: 4mk -> amk) yakalaması için geliştirilebilir.
  const cleanContent = content
    .replace(/[^a-z0-9ğüşıöç]/g, "") // Noktalama işaretlerini siler
    .replace(/0/g, "o") // 0 -> o değişimi
    .replace(/1/g, "i") // 1 -> i değişimi
    .replace(/3/g, "e") // 3 -> e değişimi
    .replace(/4/g, "a") // 4 -> a değişimi
    .replace(/5/g, "s"); // 5 -> s değişimi

  const hasBadWord = yasakliKelimeler.some(word => 
    content.includes(word) || 
    cleanContent.includes(word)
  );

  if (hasBadWord) {
    if (message.deletable) {
      try {
        await message.delete();
        const warn = await message.channel.send(`⚠️ **Hey <@${message.author.id}>!** Filtreye takıldın. Argo/Küfür kullanımı yasaktır!`);
        setTimeout(() => warn.delete().catch(() => {}), 4000);
      } catch (e) { console.error("Silme hatası:", e); }
    }
    return;
  }


  // ─── OTOMATİK CEVAPLAR ─────────────────────────────────────
  const greetings = {
    "sa": "Aleyküm Selam, hoş geldin! 👋",
    "sea": "Aleyküm Selam, hoş geldin! 👋",
    "selam": "Selam, nasılsın? 😊",
    "günaydın": "Günaydın, harika bir gün dilerim! ☀️",
    "iyi geceler": "İyi geceler, tatlı rüyalar! 🌙"
  };

  if (greetings[content]) {
    return message.reply(`**${greetings[content]}**`);
  }

  // ─── KOMUTLAR ──────────────────────────────────────────────
  if (!message.content.startsWith("!")) return;
  const cmd = content.slice(1).split(" ")[0];

  switch(cmd) {
    case "monitor":
    case "botmonitor": {
      const stats = getSystemStats();
      const embed = new EmbedBuilder()
        .setTitle("🖥️ Sistem Durumu")
        .setColor(Colors.DarkVividPink)
        .addFields(
          { name: "🚀 İşlemci", value: `\`%${stats.cpu}\` ${createProgressBar(stats.cpu)}`, inline: true },
          { name: "🧠 Bellek", value: `\`%${stats.ram}\` ${createProgressBar(stats.ram)}\n${stats.ramUsed}/${stats.ramTotal}GB`, inline: true },
          { name: "⏲️ Çalışma", value: `\`${stats.uptime}\``, inline: false }
        )
        .setFooter({ text: `${BOT_NAME} • ${AUTHOR}` });
      
      message.reply({ embeds: [embed] });
      break;
    }

    case "ascii": {
      const ascii = "```\n" + 
`    ███████╗ █████╗      █████╗ ███████╗
    ██╔════╝██╔══██╗    ██╔══██╗██╔════╝
    ███████╗███████║    ███████║███████╗
    ╚════██║██╔══██║    ██╔══██║╚════██║
    ███████║██║  ██║    ██║  ██║███████║` + "\n```";
      
      const embed = new EmbedBuilder()
        .setTitle("✨ Bot Logo")
        .setDescription(ascii)
        .setColor(Colors.Blurple);
      
      message.reply({ embeds: [embed] });
      break;
    }

    case "yardim":
    case "help": {
      const embed = new EmbedBuilder()
        .setTitle("📖 Komut Menüsü")
        .addFields(
          { name: "🔹 Genel", value: "`!ascii`, `!monitor`, `!botstats`", inline: true },
          { name: "🔹 Otomasyon", value: "Selamlaşma ve Küfür Koruması Aktif!", inline: true }
        )
        .setColor(Colors.Green);
      message.reply({ embeds: [embed] });
      break;
    }
  }
});

client.login(process.env.BOT_TOKEN);
