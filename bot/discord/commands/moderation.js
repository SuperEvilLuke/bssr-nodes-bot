const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('Moderation commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('warn')
                .setDescription('Warn a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to warn')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for the warning')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unmute')
                .setDescription('Unmute a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to unmute')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for the unmute')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unban')
                .setDescription('Unban a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to unban')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for the unban')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear messages in a channel')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The number of messages to clear')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for clearing messages')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('timeout')
                .setDescription('Timeout a user for a specified duration')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to timeout')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('The duration of the timeout (e.g., 1m, 5h, 1d)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for the timeout')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('lock')
                .setDescription('Lock a channel')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for locking the channel')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlock')
                .setDescription('Unlock a channel')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for unlocking the channel')
                        .setRequired(false)))
                        
        .addSubcommand(subcommand =>
            subcommand
                .setName('slowmode')
                .setDescription('Set slowmode for a channel')
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('The duration of the slowmode (e.g., 1s, 5m)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for the slowmode')
                        .setRequired(false))),        
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const subcommandPath = path.join(__dirname, 'moderation', `${subcommand}.js`);

        if (fs.existsSync(subcommandPath)) {
            const command = require(subcommandPath);
            return command.execute(interaction);
        }

        await interaction.reply({ content: 'Subcommand not found', ephemeral: true });
    },
};
