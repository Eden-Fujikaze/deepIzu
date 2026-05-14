import { readFileSync } from 'fs';
export const talentMap = Object.fromEntries(
    JSON.parse(readFileSync('./talentList.json', 'utf-8')).map(t => [t.name, t])
);