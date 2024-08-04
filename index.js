global.config = require("./config.json");

// New global cache system (Lazy way)
global.users = [];

global.fs = require("fs");
const path = require("path");
global.chalk = require("chalk");
const nodemailer = require("nodemailer");
global.axios = require("axios");
global.transport = nodemailer.createTransport({
    host: config.Email.Host,
    port: config.Email.Port,
    auth: {
        user: config.Email.User,
        pass: config.Email.Password,
    },
});

// Initialising Node Checker
require("./nodestatsChecker");

// Discord Bot
let db = require("quick.db");
const { Client, Collection, IntentsBitField, Partials, REST, Routes } = require("discord.js");
global.Discord = require("discord.js");

global.moment = require("moment");
global.userData = new db.table("userData"); // User data, Email, ConsoleID, Link time, Username, DiscordID
global.settings = new db.table("settings"); // Admin settings
global.webSettings = new db.table("webSettings"); // Web settings (forgot what this is even for)
global.domains = new db.table("linkedDomains"); // Linked domains for unproxy and proxy cmd
global.nodeStatus = new db.table("nodeStatus"); // Node status. Online or offline nodes
global.userPrem = new db.table("userPrem"); // Premium user data, Donated, Boosted, Total
global.nodeServers = new db.table("nodeServers"); // Server count for node limits to stop nodes becoming overloaded
global.codes = new db.table("redeemCodes"); // Premium server redeem codes...
global.nodePing = new db.table("nodePing"); // Node ping response time
global.moderationHistory = new db.table("moderationHistory"); // Moderation history, duh.

global.client = new Client({
    intents: [
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
    ],
    partials: [
        Partials.Message,
        Partials.User,
        Partials.Channel,
    ],
});

global.bot = global.client;

global.pollPingLastUsed = 0;

// Event handler
fs.readdir("./bot/discord/events/", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => f.endsWith(".js"));
    files.forEach(f => {
        const event = require(`./bot/discord/events/${f}`);
        client.on(f.split(".")[0], event.bind(null, client));
        delete require.cache[require.resolve(`./bot/discord/events/${f}`)];
    });
});

global.createList = {};
global.createListPrem = {};

// Import all create server lists
fs.readdir("./create-free/", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => f.endsWith(".js"));
    files.forEach(f => {
        require(`./create-free/${f}`);
    });
});

fs.readdir("./create-premium/", (err, files) => {
    if (err) console.error(err);
    files = files.filter(f => f.endsWith(".js"));
    files.forEach(f => {
        delete require.cache[require.resolve(`./create-premium/${f}`)];
        require(`./create-premium/${f}`);
    });
});

// Global password gen
const CAPSNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
global.getPassword = () => {
    var password = "";
    while (password.length < 16) {
        password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
    }
    return password;
};

// Slash command setup
global.client.commands = new Collection();
const commands = [];

// Function to handle loading commands
function loadCommands(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            loadCommands(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            try {
                const command = require(fullPath);

                if (command.data && command.data.name) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                } else {
                    console.error(`Command in ${fullPath} is missing the 'data' property or 'name' property.`);
                }
            } catch (error) {
                console.error(`Failed to load command from ${fullPath}:`, error);
            }
        } else {
            console.error(`Skipped non-JS file or non-directory entry: ${fullPath}`);
        }
    }
}

// Start loading commands from the base directory
const baseDirectory = path.resolve('./bot/discord/commands');
loadCommands(baseDirectory);

// Register slash commands
client.once('ready', async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const rest = new REST({ version: '10' }).setToken(config.DiscordBot.Token);

        await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands,
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error while registering commands:', error);
    }
    console.log(`${client.user.tag} is logged in!`);
});

// Command handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Bot login
client.login(config.DiscordBot.Token);

// setInterval(async () => {
//    users.length = 0;
//    axios({
//        url: "https://private-panel.bssr-nodes.com/api/application/users?per_page=9999999999999",
//        method: "GET",
//        followRedirect: true,
//        maxRedirects: 5,
//        headers: {
//        Authorization: "Bearer " + config.Pterodactyl.apikey,
//        "Content-Type": "application/json",
//        Accept: "Application/vnd.pterodactyl.v1+json",
//        },
//    })
//        .then((resources) => {
//            users.push(...resources.data.data);
//        })
//        .catch((err) => {
//            console.error(err);
//        });
// }, 10 * 60 * 1000);

process.on("unhandledRejection", (reason, p) => {
    console.log("[AntiCrash] :: Unhandled Rejection/Catch");
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log("[AntiCrash] :: Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log("[AntiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
    console.log("[AntiCrash] :: Multiple Resolves");
    console.log(type, promise, reason);
});