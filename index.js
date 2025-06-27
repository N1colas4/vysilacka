require('dotenv').config();
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const cooldowns = new Map();

// ID role pro ping
const roleId = "1386850498509799555";

// ID logovacího kanálu
const logChannelId = "1388245637337714861";

client.once(Events.ClientReady, () => {
  console.log(`✅ Přihlášen jako ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
  if (message.content === "!vysilacka") {
    const randomNumber = Math.floor(Math.random() * 900) + 100;

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("Náhodná frekvence")
      .setDescription(`Tvá frekvence je: **${randomNumber}**`);

    const button = new ButtonBuilder()
      .setCustomId("random_number")
      .setLabel("Změnit frekvenci vysílačky")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(button);

    // Ping zpráva
    const pingMsg = await message.channel.send({
      content: `<@&${roleId}>`,
      allowedMentions: { roles: [roleId] }
    });

    // 🧹 Smazat ping po 5 sekundách
    setTimeout(() => {
      pingMsg.delete().catch(() => {});
    }, 5000);

    // Embed s tlačítkem
    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "random_number") return;

  const userId = interaction.user.id;
  const now = Date.now();
  const cooldownAmount = 2 * 60 * 1000; // 2 minuty

  if (cooldowns.has(userId)) {
    const expirationTime = cooldowns.get(userId) + cooldownAmount;

    if (now < expirationTime) {
      const remaining = Math.ceil((expirationTime - now) / 1000);
      return interaction.reply({
        content: `⏳ Počkej ještě ${remaining} sekund, než to zkusíš znovu.`,
        ephemeral: true
      });
    }
  }

  cooldowns.set(userId, now);

  const newNumber = Math.floor(Math.random() * 900) + 100;

  const newEmbed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle("Nová frekvence")
    .setDescription(`Tvá frekvence: **${newNumber}**`);

  // Log embed
  const logEmbed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("📻 Změna frekvence")
    .addFields(
      { name: "Uživatel", value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
      { name: "Nová frekvence", value: `**${newNumber}**`, inline: true },
      { name: "Čas", value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }
    )
    .setFooter({ text: "Vysílačka log" });

  // Odeslat log
  const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
  if (logChannel && logChannel.isTextBased()) {
    logChannel.send({ embeds: [logEmbed] }).catch(console.error);
  }

  // ✅ Odpověď s novým embedem (bez pingu role!)
  await interaction.update({
    embeds: [newEmbed]
  });
});

// Přihlášení
client.login(process.env.TOKEN);

// Web server pro Render
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Bot je aktivní ✅");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server běží na portu ${PORT}`);
});
