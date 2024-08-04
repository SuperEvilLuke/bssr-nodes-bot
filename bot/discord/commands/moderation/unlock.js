const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SEND_MESSAGES: true });

        const embed = new EmbedBuilder()
            .setColor('GREEN')
            .setTitle('Channel Unlocked')
            .setDescription(`**${interaction.channel.name}** has been unlocked.`)
            .addField('Reason', reason)
            .setFooter(`Moderator: ${interaction.user.tag}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const logChannel = interaction.guild.channels.cache.get('1250044011457024040');
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'An error occurred while trying to unlock the channel.', ephemeral: true });
    }
  },
};
