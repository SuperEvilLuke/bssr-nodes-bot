const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction) {
    const duration = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const durationSeconds = ms(duration) / 1000;

    if (isNaN(durationSeconds) || durationSeconds < 0 || durationSeconds > 21600) {
        return interaction.reply({ content: 'Please provide a valid duration between 0 seconds and 6 hours.', ephemeral: true });
    }

    try {
        await interaction.channel.setRateLimitPerUser(durationSeconds, reason);

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Slowmode Enabled')
            .addFields(
                { name: 'Channel', value: `${interaction.channel.name}`, inline: true },
                { name: 'Duration', value: duration, inline: true },
                { name: 'Reason', value: reason, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const logChannel = interaction.guild.channels.cache.get('1250044011457024040');
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while trying to set slowmode.', ephemeral: true });
    }
  },
};
