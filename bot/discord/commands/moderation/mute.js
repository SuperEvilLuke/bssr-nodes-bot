const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const member = await interaction.guild.members.fetch(target.id);
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
    
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
          return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
    
        if (!member) {
          return interaction.reply({ content: 'The specified user is not a member of this server.', ephemeral: true });
        }
    
        try {
          const durationMs = ms(duration);
          const humanDuration = ms(durationMs, { long: true });
          const now = new Date();
          const endTime = new Date(now.getTime() + durationMs);
    
          let embed = new EmbedBuilder().setColor('Red').setTitle('User Muted');
          
          if (member.isCommunicationDisabled()) {
            // User is already muted
            const currentTimeout = member.communicationDisabledUntilTimestamp;
            const currentTimeLeft = currentTimeout - now.getTime();
    
            if (durationMs < currentTimeLeft) {
              // Shorten the mute duration
              await member.timeout(durationMs, reason);
              embed
                .setDescription(`Mute duration adjusted. User was already muted until <t:${Math.floor(currentTimeout / 1000)}:F>`)
                .addFields(
                  { name: 'User', value: `${member.user.tag}`, inline: true },
                  { name: 'New Duration', value: humanDuration, inline: true },
                  { name: 'Reason', value: reason, inline: true },
                  { name: 'Moderator', value: interaction.user.tag, inline: true },
                  { name: 'Start Time', value: `<t:${Math.floor(now.getTime() / 1000)}:F>`, inline: true },
                  { name: 'New End Time', value: `<t:${Math.floor(endTime.getTime() / 1000)}:F>`, inline: true }
                );
            } else {
              // Extend the mute duration
              const newEndTime = new Date(currentTimeout + durationMs);
              await member.timeout(currentTimeout + durationMs, reason);
              embed
                .setDescription(`Mute duration extended. User was already muted until <t:${Math.floor(currentTimeout / 1000)}:F>`)
                .addFields(
                  { name: 'User', value: `${member.user.tag}`, inline: true },
                  { name: 'Additional Duration', value: humanDuration, inline: true },
                  { name: 'Reason', value: reason, inline: true },
                  { name: 'Moderator', value: interaction.user.tag, inline: true },
                  { name: 'Start Time', value: `<t:${Math.floor(now.getTime() / 1000)}:F>`, inline: true },
                  { name: 'New End Time', value: `<t:${Math.floor(newEndTime.getTime() / 1000)}:F>`, inline: true }
                );
            }
          } else {
            // User is not muted
            await member.timeout(durationMs, reason);
            embed.addFields(
              { name: 'User', value: `${member.user.tag}`, inline: true },
              { name: 'Duration', value: humanDuration, inline: true },
              { name: 'Reason', value: reason, inline: true },
              { name: 'Moderator', value: interaction.user.tag, inline: true },
              { name: 'Start Time', value: `<t:${Math.floor(now.getTime() / 1000)}:F>`, inline: true },
              { name: 'End Time', value: `<t:${Math.floor(endTime.getTime() / 1000)}:F>`, inline: true }
            );
          }
    
          embed.setTimestamp();
          await interaction.reply({ embeds: [embed] });
    
          const moderationEntry = {
            action: 'Mute',
            reason: reason,
            date: now.toISOString(),
            moderator: interaction.user.id,
            duration: humanDuration,
          };
    
          const userHistory = global.moderationHistory.get(member.id) || [];
          userHistory.push(moderationEntry);
          global.moderationHistory.set(member.id, userHistory);
    
          const logChannel = interaction.guild.channels.cache.get('1250044011457024040'); // Replace with your log channel ID
          if (logChannel) {
            await logChannel.send({ embeds: [embed] });
          }
        } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'An error occurred while trying to mute the user.', ephemeral: true });
        }
      },
    };