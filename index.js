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

client.once(Events.ClientReady, () => {
  console.log(`✅ Přihlášen jako ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
  if (message.content === "!start") {
    const randomNumber = Math.floor(Math.random() * 900) + 100;

    const embed = new EmbedBuilder()
      .setColor(0x00A86E)
      .setTitle("Náhodná frekvence")
      .setDescription(`Tvá frekvence je: **${randomNumber}**`);

    const button = new ButtonBuilder()
      .setCustomId("random_number")
      .setLabel("Změnit frekvenci vysílačky")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const roleId = "123456789012345678"; // <-- SEM zadej ID role, kterou chceš pingnout

    await message.channel.send({
      content: `<@&${roleId}>`, // zmínka na roli
      embeds: [embed],
      components: [row]
    });
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "random_number") {
    const newNumber = Math.floor(Math.random() * 900) + 100;

    const newEmbed = new EmbedBuilder()
      .setColor(0x00A86E)
      .setTitle("Nová frekvence")
      .setDescription(`Tvá frekvence: **${newNumber}**`);

    await interaction.update({ embeds: [newEmbed] });
  }
});

client.login(process.env.TOKEN);
