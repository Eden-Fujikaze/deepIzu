import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder, Partials } from 'discord.js';
import { readFileSync } from 'fs';
import { updateList } from './modules/talentListUpdater.js';
import { analyzeBuild } from './modules/buildAnalyzer.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
    ],
});

client.once('clientReady', async (message) => {
    console.log(`Logged in as ${client.user.tag}`)
    updateList();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const match = message.content.match(/deepwoken\.co\/builder\?id=([A-Za-z0-9_-]+)/);
    if (match) analyzeBuild(match[1], message);
});

client.login(process.env.TOKEN);