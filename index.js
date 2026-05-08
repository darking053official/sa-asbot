const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");
const os = require("os");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const BOT_NAME = "SelamBot";

// Render Uptime Sunucusu
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "online", bot: BOT_NAME }));
}).listen(PORT);

function getSystemStats() {
  const uptime = os.uptime();
  return {
    cpu: (os.loadavg()[0] * 10).toFixed(1),
    ram: (( (os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1),
    uptime: `${Math.floor(uptime / 86400)}g ${Math.floor((uptime % 86400) / 3600)}s`
  };
}

client.on('ready', () => {
  console.log(`[!] ${client.user.username} olarak giriş yapıldı. Küfür avcısı aktif!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const content = message.content.toLowerCase().trim();

  // ─── 🛡️ DEV KÜFÜR LİSTESİ ────────────────────────────
  const yasakliKelimeler = [
    // Ağır Küfürler & Cinsel İçerik
    "amk", "amq", "aq", "orospu", "oç", "o.ç", "piç", "siktir", "sik", "am", "göt", "got", "yarrak", "yrk",
    "dassak", "tassak", "taşşak", "sikik", "serefsiz", "şerefsiz", "pezevenk", "pzvng", "puşt", "pust",
    "gavat", "kahpe", "yavşak", "yavsak", "ibne", "fahişe", "amcık", "amcik", "sokarım", "sokayım",
    "amına", "amina", "ananı", "anani", "bacını", "bacini", "avradını", "karını", "sülaleni",
    // Hakaretler
    "mal", "salak", "gerizekali", "gerizekalı", "aptal", "it", "köpek", "gevşek", "adi", "alçak",
    "kodumun", "ezik", "beyinsiz", "özürlü", "götoş", "gotos", "sg", "sq", "am biti", "sik kırığı",
    // Eklemeler
    "amca", "amj", "skm", "amık", "amın feryadı", "huur", "kaşar", "gavat", "meme", "taşşak"
  ];

  // Filtre Aşımlarını Yakalama (m.a.l -> mal, 4mk -> amk vb.)
  const cleanContent = content
    .replace(/[^a-z0-9ğüşıöç]/g, "") 
    .replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e")
    .replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t");

  const hasBadWord = yasakliKelimeler.some(word => 
    content.includes(word) || cleanContent.includes(word)
  );

  if (hasBadWord) {
    try {
      if (message.deletable) {
        await message.delete();
        const warn = await message.channel.send(`⚠️ <@${message.author.id}>, **Küfür/Argo kullanımı yasaktır! Mesajın imha edildi.**`);
        setTimeout(() => warn.delete().catch(() => {}), 4000);
      }
      return; 
    } catch (e) { console.error("Silme hatası:", e); }
  }

  // ─── 👋 SELAMLAŞMA ──────────────────────────────────
  const selamlar = { 
    "sa": "Aleyküm Selam, hoş geldin! 👋", 
    "sea": "Aleyküm Selam! 🤝",
    "selam": "Selam, nasılsın? 😊",
    "selamünaleyküm": "Aleyküm Selam, hoş geldin kardeş! 👋",
    "günaydın": "Günaydın, güzel bir gün dilerim! ☀️"
  };
  if (selamlar[content]) return await message.reply(`**${selamlar[content]}**`);

  // ─── ⚙️ KOMUTLAR (selambot yardim vb.) ───────────────
  if (content.startsWith("selambot")) {
    const cmd = content.replace("selambot", "").trim().split(" ")[0];

    if (cmd === "yardim" || cmd === "help") {
      const embed = new EmbedBuilder()
        .setTitle("📖 SelamBot Yardım Menüsü")
        .setDescription("Kullanım: `selambot <komut>`")
        .addFields(
          { name: "🛠️ Komutlar", value: "`yardim`, `monitor`, `ascii`", inline: true },
          { name: "🛡️ Koruma", value: "Küfür Filtresi (Aktif)", inline: true }
        )
        .setColor(Colors.Green)
        .setTimestamp();
      return await message.reply({ embeds: [embed] });
    }

    if (cmd === "monitor") {
      const stats = getSystemStats();
      const embed = new EmbedBuilder()
        .setTitle("🖥️ SelamBot Sistem Durumu")
        .addFields(
          { name: "🚀 İşlemci", value: `\`%${stats.cpu}\``, inline: true },
          { name: "🧠 Bellek", value: `\`%${stats.ram}\``, inline: true },
          { name: "⏲️ Çalışma", value: `\`${stats.uptime}\``, inline: true }
        )
        .setColor(Colors.Blue);
      return await message.reply({ embeds: [embed] });
    }

    if (cmd === "ascii") {
      return await message.reply("```\n╔════════════════════╗\n║      SELAMBOT      ║\n║   BY DARKING053    ║\n╚════════════════════╝\n```");
    }
  }
}); // Dosya sonu parantezi

client.login(process.env.BOT_TOKEN);
