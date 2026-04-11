const { Client, GatewayIntentBits } = require("@jubbio/core");
const http = require("http");

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

client.on("ready", () => {
  console.log(`✅ ${client.user?.username} hazır!`);
  console.log(`📍 Sa As Bot by DRK`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  
  const content = message.content.toLowerCase().trim();
  
  // Selam kontrolü
  if (content === "sa" || content === "sea" || content === "selamın aleyküm" || content === "selamünaleyküm") {
    await message.reply("**Aleyküm selam** 👋");
  }
  
  // Karşılıklı selam
  if (content === "as" || content === "aleyküm selam" || content === "aleykümselam") {
    await message.reply("**Ve aleyküm selam** 🤝");
  }
  
  // Basit selam
  if (content === "selam") {
    await message.reply("**Aleyküm selam, hoş geldin!** 😊");
  }
  
  // Günaydın
  if (content === "günaydın" || content === "gunaydin") {
    await message.reply("**Günaydın!** ☀️");
  }
  
  // İyi geceler
  if (content === "iyi geceler") {
    await message.reply("**İyi geceler!** 🌙");
  }
});

client.login(process.env.BOT_TOKEN);
