require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let lastPingMessage = null;
const roleId = "1313235061675655228"; // Zadej ID své role

client.once(Events.ClientReady, () => {
  console.log(`✅ Přihlášen jako ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
  if (message.content === "!start") {
    const randomNumber = Math.floor(Math.random() * 900) + 100;

    const embed = new EmbedBuilder()
      .setColor(0x00a86e)
      .setTitle("Náhodná frekvence")
      .setDescription(`Tvá frekvence je: **${randomNumber}**`);

    const button = new ButtonBuilder()
      .setCustomId("random_number")
      .setLabel("Změnit frekvenci vysílačky")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    // Odeslat úvodní zprávu s embedem a tlačítkem
    await message.channel.send({
      content: `<@&${roleId}>`,
      embeds: [embed],
      components: [row],
      allowedMentions: { roles: [roleId] }
    });
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "random_number") return;

  const newNumber = Math.floor(Math.random() * 900) + 100;

  const newEmbed = new EmbedBuilder()
    .setColor(0x00a86e)
    .setTitle("Nová frekvence")
    .setDescription(`Tvá frekvence: **${newNumber}**`);

  // ❌ Smazat předchozí ping, pokud existuje
  if (lastPingMessage) {
    try {
      await lastPingMessage.delete();
    } catch (err) {
      console.error("Nepodařilo se smazat starý ping:", err.message);
    }
  }

  // ✅ Poslat pouze zmínku role
  lastPingMessage = await interaction.channel.send({
    content: `<@&${roleId}>`,
    allowedMentions: { roles: [roleId] }
  });

  // Aktualizovat embed v původní zprávě (neping zprávě)
  await interaction.update({
    embeds: [newEmbed]
  });
});

client.login(process.env.TOKEN);
