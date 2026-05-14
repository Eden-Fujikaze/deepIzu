import { fetchBuild } from './api.js';
import { mergeStatCategories } from './stats.js';
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

    await sendPaginatedBuild(message, pages);
}

function computeLevelingOrder(talents) {
    return [...talents].sort((a, b) => {
        const maxA = Math.max(...Object.values(a.reqs));
        const maxB = Math.max(...Object.values(b.reqs));
        return maxA - maxB;
    });
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