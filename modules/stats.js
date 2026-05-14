
export function mergeStatCategories(statsByCategory) {
    const result = {};

    for (const category in statsByCategory) {
        for (const stat in statsByCategory[category]) {
            result[stat] = statsByCategory[category][stat];
        }
    }

    return result;
}
