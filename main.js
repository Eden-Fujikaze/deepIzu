import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { readFileSync, stat } from 'fs';
import { updateList } from './talentListUpdater.js';
await updateList();
var talentData = JSON.parse(readFileSync('./talentList.json', 'utf-8'));
const talentMap = Object.fromEntries(
    talentData.map(t => [t.name, t])
);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('clientReady', async (message) => {
    console.log(`Logged in as ${client.user.tag}`);
    validateBuild('g0cjQg4e', message);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const match = message.content.match(/deepwoken\.co\/builder\?id=([A-Za-z0-9_-]+)/);
    if (match) validateBuild(match[1], message);
});

async function validateBuild(buildId, message) {
    console.log("Working on bID: ", buildId);

    const build = await fetchBuild(buildId);
    if (!build) return message.reply('Build not found.');

    const flatPreShrine = flattenStats(build.preShrine);
    const flatPostShrine = flattenStats(build.postShrine);

    const preShrineTalents = resolvePreShrineTalents(
        build.talents,
        flatPreShrine,
        flatPostShrine
    );

    const practicalPreShrine = buildPracticalStats(preShrineTalents);
    console.log(practicalPreShrine);
    console.log(preShrineTalents);
}

function buildPracticalStats(talentCollection) {
    const result = {};

    for (const data of Object.values(talentCollection)) {
        const stats = data?.[1];
        if (!stats) continue;

        for (const [statName, value] of Object.entries(stats)) {
            if (result[statName] === undefined || value > result[statName]) {
                result[statName] = value;
            }
        }
    }

    return result;
}

function resolvePreShrineTalents(talents, preStats, postStats) {
    const result = new Set();

    for (const talent of talents) {
        const talentObj = talentMap[talent];
        if (!talentObj) {
            continue;
        }

        const preShrine = isPreShrineTalent(talentObj, preStats, postStats);

        if (!preShrine) continue;
        addTalentWithPrereqs(talent, result);
    }

    const finalTalents = [...result];
    return finalTalents;
}

function isPreShrineTalent(talentObj, preStats, postStats) {
    const statReqs = talentObj.requirements?.stats ?? {};

    const pre = meetsRequirements(preStats, statReqs);
    const post = meetsRequirements(postStats, statReqs);
    return pre && !post;
}

function meetsRequirements(stats, reqs) {
    for (const key in reqs) {
        if ((stats[key] ?? 0) < reqs[key]) {
            return false;
        }
    }
    return true;
}

function addTalentWithPrereqs(talentName, resultSet) {
    if (resultSet.has(talentName)) return;

    const talentObj = talentMap[talentName];
    if (!talentObj) return;

    resultSet.add([talentName, talentObj.requirements.stats]);

    const prereqs = talentObj.requirements?.talents;
    if (!Array.isArray(prereqs) || prereqs.length === 0) return;

    for (const prereq of prereqs) {
        addTalentWithPrereqs(prereq, resultSet);
    }
}

function flattenStats(statCollection) {
    const result = {};

    for (const category in statCollection) {
        for (const stat in statCollection[category]) {
            result[stat] = statCollection[category][stat];
        }
    }

    return result;
}

async function fetchBuild(buildId) {
    const res = await fetch(`https://deepwoken.co/api/proxy/builds/${buildId}`, {
        headers: {
            'Accept': 'application/json',
            'Referer': 'https://deepwoken.co/',
            'Origin': 'https://deepwoken.co',
        }
    });
    if (!res.ok) {
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