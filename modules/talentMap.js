import { readFileSync, existsSync } from 'fs';

function loadTalentMap() {
    if (!existsSync('./talentList.json')) return {};
    return Object.fromEntries(
        JSON.parse(readFileSync('./talentList.json', 'utf-8')).map(t => [t.name, t])
    );
}

export const talentMap = loadTalentMap();