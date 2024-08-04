const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    if (amount < 1 || amount > 100) {
        return interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
    }

    try {
        await interaction.channel.bulkDelete(amount, true);

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Messages Cleared')
            .addFields(
                { name: 'Amount', value: `${amount}`, inline: true },
                { name: 'Reason', value: reason, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        const logChannel = interaction.guild.channels.cache.get('1250044011457024040');
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while trying to clear messages.', ephemeral: true });
    }
  },
};
