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

// Render Uptime için basit server
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("SelamBot Aktif!");
}).listen(process.env.PORT || 10000);

client.on('ready', () => {
  console.log(`[!] ${client.user.username} yayında. Küfür avı başladı!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const content = message.content.toLowerCase().trim();

  // ─── 🛡️ DEVASA KÜFÜR VE ARGO SİSTEMİ ───────────────────────
  const yasakliKelimeler = [
    // Ağır Küfürler & Cinsel
    "amk", "amq", "aq", "orospu", "oç", "oc", "pic", "piç", "siktir", "sik", "am", "göt", "got", "yarrak", "yrk",
    "dassak", "tassak", "taşşak", "sikik", "serefsiz", "şerefsiz", "pezevenk", "pzvng", "pust", "puşt", "gavat", 
    "kahpe", "yavsak", "yavşak", "ibne", "fahişe", "amcık", "amcik", "sokarım", "sokayım", "sikim", "siktiğim", 
    "sikiş", "götveren", "amına", "amina", "ananı", "anani", "bacını", "bacini", "avradını", "karını", "sülaleni",
    "gecmisini", "gelmisini", "ceddini", "mına", "mınakoyim", "am feryadı", "am biti", "sik kırığı",
    // Hakaret & Aşağılama
    "mal", "salak", "gerizekali", "gerizekalı", "aptal", "it", "köpek", "gevşek", "adi", "alçak", "kodumun", 
    "ezik", "beyinsiz", "özürlü", "götoş", "gotos", "sg", "sq", "skm", "kaşar", "kasar", "yalaka", "yavşak",
    "it soyu", "soysuz", "karaktersiz", "haysiyetsiz", "şark kurnazı", "çakal", "it herif",
    // Yaratıcı & Gizli Yazımlar
    "a.m.k", "a m k", "o.ç", "o ç", "s.i.k", "s i k", "y.a.r.r.a.k", "4mk", "3vlat", "0rospu", "p.i.ç",
    "g.ö.t", "siktirgit", "sgit", "amınakoyim", "amkoyim", "amkoyayım", "aqkoyim"
  ];

  // 1. Aşama: Mesajı tüm sembollerden arındır (m.a.l -> mal)
  const cleanContent = content
    .replace(/[^a-z0-9ğüşıöç]/g, "") 
    .replace(/0/g, "o") // 0 -> o
    .replace(/1/g, "i") // 1 -> i
    .replace(/3/g, "e") // 3 -> e
    .replace(/4/g, "a") // 4 -> a
    .replace(/5/g, "s") // 5 -> s
    .replace(/7/g, "t") // 7 -> t
    .replace(/8/g, "b"); // 8 -> b

  // 2. Aşama: Kontrol (Hem tam metin, hem temizlenmiş metin, hem de kelime kelime)
  const words = content.split(/\s+/);
  const isBad = yasakliKelimeler.some(bad => 
    content.includes(bad) || 
    cleanContent.includes(bad) ||
    words.some(w => w === bad)
  );

  if (isBad) {
    try {
      if (message.deletable) {
        await message.delete();
        const warn = await message.channel.send(`⚠️ <@${message.author.id}>, **Küfür/Argo kullanımı yasaktır! Mesajın yok edildi.**`);
        setTimeout(() => warn.delete().catch(() => {}), 4000);
      }
      return; 
    } catch (e) { console.error("Silme Hatası:", e); }
  }

  // ─── 👋 SELAMLAŞMA ──────────────────────────────────
  const selamlar = { 
    "sa": "Aleyküm Selam, hoş geldin! 👋", 
    "sea": "Aleyküm Selam! 🤝",
    "selam": "Selam, nasılsın? 😊",
    "slm": "Selam, hoş geldin! 👋"
  };
  if (selamlar[content]) return await message.reply(`**${selamlar[content]}**`);

  // ─── ⚙️ KOMUTLAR (selambot ...) ──────────────────────
  if (content.startsWith("selambot")) {
    const cmd = content.replace("selambot", "").trim().split(" ")[0];

    if (cmd === "yardim") {
      const embed = new EmbedBuilder()
        .setTitle("📖 SelamBot Yardım")
        .setDescription("Prefix: `selambot` \nKomutlar: `yardim`, `monitor`, `ascii` ")
        .setColor(Colors.Green);
      return await message.reply({ embeds: [embed] });
    }

    if (cmd === "monitor") {
      const stats = {
        cpu: (os.loadavg()[0] * 10).toFixed(1),
        ram: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1)
      };
      const embed = new EmbedBuilder()
        .setTitle("🖥️ Sistem Durumu")
        .addFields(
          { name: "🚀 CPU", value: `%${stats.cpu}`, inline: true },
          { name: "🧠 RAM", value: `%${stats.ram}`, inline: true }
        )
        .setColor(Colors.Blue);
      return await message.reply({ embeds: [embed] });
    }
  }
});

client.login(process.env.BOT_TOKEN);
