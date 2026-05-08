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

// Render için Uptime Sunucusu
http.createServer((req, res) => { res.end("SelamBot Aktif"); }).listen(process.env.PORT || 10000);

client.on('ready', () => {
  console.log(`${client.user.username} yayında!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // Mesajı işleme hazırlayalım (Küçük harf ve boşluk temizliği)
  const content = message.content.toLowerCase().trim();
  const words = content.split(/\s+/);

  // ─── 🛡️ EKSTRA GÜÇLENDİRİLMİŞ KÜFÜR FİLTRESİ ────────────────
  const yasakliKelimeler = [
    // Ağır Küfürler
    "amk", "amq", "aq", "orospu", "oç", "oc", "pic", "piç", "siktir", "sik", "am", "göt", "got", "yarrak", "yrk",
    "dassak", "tassak", "taşşak", "sikik", "serefsiz", "pezevenk", "pust", "puşt", "gavat", "kahpe", "yavsak",
    "ibne", "fahişe", "amcık", "sokarım", "sokayım", "sikim", "siktiğim", "amına", "ananı", "bacını", "avradını",
    // Hakaretler
    "mal", "salak", "gerizekali", "aptal", "it", "köpek", "gevşek", "adi", "alçak", "kodumun", "ezik", "beyinsiz",
    "götoş", "sg", "sq", "skm", "kaşar", "kasar", "yalaka", "soysuz", "haysiyetsiz", "manyak", "pipi", "meme"
  ];

  // Noktalama temizlenmiş içerik (m.a.l -> mal)
  const cleanContent = content.replace(/[^a-z0-9ğüşıöç]/g, "").replace(/0/g, "o").replace(/4/g, "a").replace(/3/g, "e");

  // ÖNCE KÜFÜR KONTROLÜ (Eğer mesaj komut DEĞİLSE)
  // Not: Komutun içindeki "mal" (selambot yardim) gibi kelimelerin silinmemesi için filtreyi sadece komut değilse çalıştıralım.
  if (!content.startsWith("selambot")) {
    const isBadWord = yasakliKelimeler.some(word => 
      content === word || 
      words.includes(word) || 
      cleanContent.includes(word)
    );

    if (isBadWord) {
      try {
        if (message.deletable) {
          await message.delete();
          const warn = await message.channel.send(`⚠️ <@${message.author.id}>, **Küfür/Argo yasaktır!**`);
          setTimeout(() => warn.delete().catch(() => {}), 4000);
        }
        return; 
      } catch (e) {}
    }
  }

  // ─── 👋 SELAMLAŞMA ──────────────────────────────────
  const selamlar = { 
    "sa": "Aleyküm Selam, hoş geldin! 👋", 
    "selam": "Selam, hoş geldin! 😊",
    "selamun aleykum": "Aleyküm Selam! 👋",
    "selamünaleyküm": "Aleyküm Selam! 👋"
  };

  if (selamlar[content]) {
    return await message.reply(`**${selamlar[content]}**`);
  }

  // ─── ⚙️ KOMUTLAR (selambot yardim vb.) ───────────────
  // İçerik "selambot" ile başlıyorsa komutlara bak
  if (content.startsWith("selambot")) {
    // "selambot" kelimesini at, geri kalanı komut olarak al
    const cmd = content.replace("selambot", "").trim().split(" ")[0];

    if (cmd === "yardim" || cmd === "") {
      const embed = new EmbedBuilder()
        .setTitle("📖 SelamBot Yardım")
        .setDescription("Komutlar:")
        .addFields(
          { name: "🔹 `selambot yardim`", value: "Bu menüyü açar.", inline: true },
          { name: "🔹 `selambot monitor`", value: "Sistemi gösterir.", inline: true }
        )
        .setColor(Colors.Green)
        .setTimestamp();
      
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
