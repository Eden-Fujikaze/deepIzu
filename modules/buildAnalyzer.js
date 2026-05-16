import { fetchBuild } from './api.js';
import { mergeStatCategories, calcShrine } from './stats.js';
import { AttachmentBuilder } from 'discord.js';
import { talentMap } from './talentMap.js';
import { renderPages } from './imageRenderer.js';
import { sendPaginatedBuild } from './paginator.js';

export async function analyzeBuild(buildId, message) {
    const build = await fetchBuild(buildId);
    if (!build) return message.reply('Build not found.');

    const preStats = mergeStatCategories(build.preShrine);
    const postStats = mergeStatCategories(build.postShrine);

    const [preShrineTalents, postShrineTalents] = filterTalents(build.talents, preStats, postStats);

    const pages = renderPages({
        buildName: build.name,
        preShrineTalents: computeLevelingOrder(preShrineTalents),
        postShrineTalents,
    });
    calcShrine(preStats);
    await sendPaginatedBuild(message, pages);
}

function computeLevelingOrder(talents) {
    const nameSet = new Set(talents.map(t => t.name));
    const talentByName = Object.fromEntries(talents.map(t => [t.name, t]));

    const visited = new Set();
    const result = [];

    function visit(name) {
        if (visited.has(name)) return;
        visited.add(name);
        const talentObj = talentMap[name];
        for (const prereq of talentObj?.requirements?.talents ?? []) {
            if (nameSet.has(prereq)) visit(prereq);
        }
        result.push(talentByName[name]);
    }

    const sorted = [...talents].sort((a, b) => {
        const maxA = Object.values(a.reqs).length ? Math.max(...Object.values(a.reqs)) : 0;
        const maxB = Object.values(b.reqs).length ? Math.max(...Object.values(b.reqs)) : 0;
        return maxA - maxB;
    });

    for (const t of sorted) visit(t.name);
    return result;
}

function filterTalents(talents, preStats, postStats) {
    const preShrineResult = [];
    const postShrineResult = [];
    const seen = new Set();

    for (const talent of talents) {
        const talentObj = talentMap[talent];
        if (!talentObj) continue;
        if (isPreShrineTalent(talentObj, preStats, postStats)) {
            collectTalentTree(talent, preShrineResult, seen);
        } else {
            collectTalentTree(talent, postShrineResult, seen);

        }
    }

    return [preShrineResult, postShrineResult];
}

function isPreShrineTalent(talentObj, preStats, postStats) {
    const statReqs = talentObj.requirements?.stats ?? {};

    const pre = statsSatisfyReqs(preStats, statReqs);
    const post = statsSatisfyReqs(postStats, statReqs);
    return pre && !post;
}

function statsSatisfyReqs(stats, reqs) {
    for (const key in reqs) {
        if ((stats[key] ?? 0) < reqs[key]) {
            return false;
        }
    }
    return true;
}

function collectTalentTree(talentName, talentTree, seen) {
    if (seen.has(talentName)) return;
    seen.add(talentName);

    const talentObj = talentMap[talentName];
    if (!talentObj) return;

    talentTree.push({ name: talentName, reqs: talentObj.requirements.stats });

    for (const prereq of talentObj.requirements?.talents ?? []) {
        collectTalentTree(prereq, talentTree, seen);
    }
}