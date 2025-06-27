client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "random_number") return;

  const userId = interaction.user.id;
  const now = Date.now();
  const cooldownAmount = 2 * 60 * 1000; // 2 minuty

  const logChannelId = "TVÉ_LOG_CHANNEL_ID"; // <- ZDE vlož ID kanálu pro logy

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

  const roleId = "1386850498509799555";

  // Ping zpráva
  const pingMsg = await interaction.channel.send({
    content: `<@&${roleId}>`,
    allowedMentions: { roles: [roleId] }
  });

  // 🧹 Smazat ping po 5 sekundách
  setTimeout(() => {
    pingMsg.delete().catch(() => {});
  }, 5000);

  // ✅ ODESLAT LOG DO URČITÉHO KANÁLU
  const logChannel = await client.channels.fetch(1388245637337714861).catch(() => null);
  if (logChannel && logChannel.isTextBased()) {
    logChannel.send({
      content: `🛠️ Uživatel <@${userId}> (${interaction.user.tag}) změnil frekvenci na **${newNumber}**.`
    });
  }

  // Aktualizovat embed
  await interaction.update({
    embeds: [newEmbed]
  });
});
