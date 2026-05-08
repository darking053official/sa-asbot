const { Client, GatewayIntentBits, EmbedBuilder, Colors } = require("@jubbio/core");
const http = require("http");
const os = require("os");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
  ]
});

// Render Uptime
http.createServer((req, res) => { res.end("SelamBot Online"); }).listen(process.env.PORT || 10000);

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const content = message.content.toLowerCase().trim();
  const words = content.split(/\s+/); // Mesajı kelimelere böler

  // ─── 🛡️ MAX KORUMA KÜFÜR LİSTESİ ──────────────────────────
  const yasakliKelimeler = [
    // Ağır Küfürler
    "amk", "amq", "aq", "orospu", "oç", "oc", "pic", "piç", "siktir", "sik", "am", "göt", "got", "yarrak", "yrk",
    "dassak", "tassak", "taşşak", "sikik", "serefsiz", "pezevenk", "pust", "puşt", "gavat", "kahpe", "yavsak",
    "ibne", "fahişe", "amcık", "sokarım", "sokayım", "sikim", "siktiğim", "amına", "ananı", "bacını", "avradını",
    // Hakaretler (Tam eşleşme için önemli)
    "mal", "salak", "gerizekali", "aptal", "it", "köpek", "gevşek", "adi", "alçak", "kodumun", "ezik", "beyinsiz",
    "götoş", "sg", "sq", "skm", "kaşar", "meme", "dalyarak", "pipi", "daşşak", "manyak", "o.ç", "a.m.k"
  ];

  // Filtre Aşımlarını Temizleme (m.a.l -> mal)
  const cleanContent = content.replace(/[^a-z0-9ğüşıöç]/g, "").replace(/0/g, "o").replace(/4/g, "a").replace(/3/g, "e");

  // ─── KONTROL MEKANİZMASI (Content === "text" Mantığı) ───
  const isBadWord = yasakliKelimeler.some(word => 
    content === word ||           // Mesaj sadece küfürden mi ibaret? (Tam eşleşme)
    words.includes(word) ||       // Mesajın içindeki kelimelerden biri küfür mü?
    cleanContent.includes(word)   // Noktalama silinince küfür çıkıyor mu?
  );

  if (isBadWord) {
    try {
      if (message.deletable) {
        await message.delete();
        const warn = await message.channel.send(`⚠️ <@${message.author.id}>, **Yasaklı kelime kullandın!**`);
        setTimeout(() => warn.delete().catch(() => {}), 4000);
      }
      return; 
    } catch (e) { console.error("Silme hatası:", e); }
  }

  // ─── SELAMLAŞMA ──────────────────────────────────
  const selamlar = { "sa": "Aleyküm Selam! 👋", "selam": "Selam hoş geldin! 😊" };
  if (selamlar[content]) return await message.reply(`**${selamlar[content]}**`);

  // ─── KOMUTLAR (selambot ...) ──────────────────────
  if (content.startsWith("selambot")) {
    const cmd = content.replace("selambot", "").trim().split(" ")[0];
    if (cmd === "yardim") {
        const embed = new EmbedBuilder()
          .setTitle("📖 Yardım")
          .setDescription("`selambot yardim`, `selambot monitor`").setColor(Colors.Green);
        return await message.reply({ embeds: [embed] });
    }
  }
});

client.login(process.env.BOT_TOKEN);
