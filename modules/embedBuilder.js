import { EmbedBuilder } from 'discord.js';

export function createBuildEmbed({ buildId, buildName, preShrineTalents = [] }) {
    const embed = new EmbedBuilder()
        .setTitle(buildName)
        .setColor(0x5865F2)
        .setFooter({ text: `Build ID: ${buildId}` });

    const NAME_W = 20;
    const REQ_W = 18;

    const talentText = preShrineTalents.length
        ? preShrineTalents.map(t => {
            const name = t.name.padEnd(NAME_W);
            const reqs = Object.entries(t.reqs).map(([k, v]) => `${k} ${v}`).join(', ');
            return `${name}${reqs.padStart(REQ_W)}`;
        }).join('\n')
        : 'None found';

    embed.addFields({
        name: 'Pre-shrine talents',
        value: '```\n' + talentText + '\n```',
        inline: false
    });

    return embed;
}