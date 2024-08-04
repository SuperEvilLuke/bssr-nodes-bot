const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'history',
    },
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const userHistory = global.moderationHistory.get(target.id);

        if (!userHistory || userHistory.length === 0) {
            return interaction.reply({ content: 'No moderation history found for this user.', ephemeral: true });
        }

        // Prepare moderation history embed
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle(`Moderation History for ${target.tag}`)
            .setDescription('This is the moderation history for the specified user.')
            .setTimestamp();

        // Add entries to embed
        userHistory.forEach(entry => {
            const date = new Date(entry.date).toLocaleString();
            embed.addFields({
                name: `${entry.action} - ${date}`,
                value: `**Moderator:** ${entry.moderator}\n**Reason:** ${entry.reason}\n**Duration:** ${entry.duration}`
            });
        });

        await interaction.reply({ embeds: [embed] });
    },
};
