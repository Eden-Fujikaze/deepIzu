import fs from "fs";

const url = "https://api.deepwoken.co/get?type=all";

export async function updateList() {
    const res = await fetch(url);
    const data = await res.json();

    const talents = data.talents.filter(t => !t.VOI);

    const cleaned = talents.map(t => ({
        name: t.name,
        rarity: t.rarity,

        requirements: {
            stats: t?.requirements?.stats ?? {},
            talents: t?.requirements?.talents ?? []
        },

        mutualExclusives: t.mutualExclusives ?? []
    }));

    fs.writeFileSync(
        "talentList.json",
        JSON.stringify(cleaned, null, 2),
        "utf-8"
    );

    console.log(`Saved ${cleaned.length} talents`);
}