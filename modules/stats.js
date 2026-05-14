const ATTUNEMENT_STATS = new Set(['flame', 'frost', 'lightning', 'shadow', 'gale', 'divinity']);

export function mergeStatCategories(statsByCategory) {
    const result = {};

    for (const category in statsByCategory) {
        for (const stat in statsByCategory[category]) {
            result[stat] = statsByCategory[category][stat];
        }
    }

    return result;
}

export function calcShrine(preStats) {
    const ATTUNEMENT_STATS = new Set(['Flamecharm', 'Frostdraw', 'Thundercall', 'Galebreathe', 'Shadowcast', 'Ironsing', 'Bloodrend']);
    const result = { ...preStats };
    const allStats = Object.keys(preStats).filter(s => preStats[s] > 0);
    const capped = new Set();

    const totalPool = allStats.reduce((s, k) => s + preStats[k], 0);

    while (true) {
        const cappedSum = [...capped].reduce((s, k) => s + result[k], 0);
        const uncappedStats = allStats.filter(s => !capped.has(s));
        const pool = totalPool - cappedSum;
        const avg = pool / uncappedStats.length;

        let anyCapped = false;
        for (const stat of uncappedStats) {
            const limit = ATTUNEMENT_STATS.has(stat) ? Infinity : 25;
            if (preStats[stat] - avg > limit) {
                result[stat] = preStats[stat] - limit;
                capped.add(stat);
                anyCapped = true;
                break;
            }
        }
        if (!anyCapped) {
            for (const stat of uncappedStats) result[stat] = Math.floor(avg);
            break;
        }
    }
    return result;
}