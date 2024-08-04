const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const member = await interaction.guild.members.fetch(target.id);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: 'You are missing the permission `BanMembers`.', ephemeral: true });
    }

    if (!member) {
        return interaction.reply({ content: 'The specified user is not a member of this server.', ephemeral: true });
    }

    try {
        await member.ban({ reason });

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('User Banned')
            .addFields(
                { name: 'User', value: `${member.user.tag}`, inline: true },
                { name: 'Reason', value: reason, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const moderationEntry = {
            action: 'Ban',
            reason: reason,
            date: new Date().toISOString(),
            moderator: interaction.user.id,
        };

        const userHistory = global.moderationHistory.get(member.id) || [];
        userHistory.push(moderationEntry);
        global.moderationHistory.set(member.id, userHistory);

        const logChannel = interaction.guild.channels.cache.get('1250044011457024040');
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while trying to ban the user.', ephemeral: true });
    }
  },
};
