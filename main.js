import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const match = message.content.match(/deepwoken\.co\/builder\?id=([A-Za-z0-9_-]+)/);
    if (!match) return;

    const buildId = match[1];
    console.log(`build ID: ${buildId}`);
    const build = await fetchBuild(buildId);
    if (!build) return message.reply('Build not found.');
    console.log(build);
});

async function fetchBuild(buildId) {
    const res = await fetch(`https://deepwoken.co/api/proxy/builds/${buildId}`, {
        headers: {
            'Accept': 'application/json',
            'Referer': 'https://deepwoken.co/',
            'Origin': 'https://deepwoken.co',
        }
    });
    if (!res.ok) {
        console.log(res.status, await res.text());
        return null;
    }
    const data = await res.json();
    return {
        name: data.stats.buildName,
        meta: data.stats.meta,
        attributes: data.attributes,
        preShrine: data.preShrine,
        postShrine: data.postShrine,
        talents: data.talents,
        mantras: data.mantras,
    };
}

client.login(process.env.TOKEN);