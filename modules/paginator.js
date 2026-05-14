import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';

const PAGE_LABELS = ['Pre-shrine', 'Mantras', 'Weapon', 'Equipment', 'Full stats'];

function buildRow(current, total) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(current === 0),
        new ButtonBuilder()
            .setCustomId('page_indicator')
            .setLabel(`${PAGE_LABELS[current]} (${current + 1}/${total})`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(current === total - 1),
    );
}

export async function sendPaginatedBuild(message, pages) {
    let current = 0;

    const msg = await message.reply({
        content: '-# this interaction below (pages) will time out in a certain amount of time and scrolling through pages will be unavailable',
        files: [new AttachmentBuilder(pages[current], { name: 'build.png' })],
        components: [buildRow(current, pages.length)],
    });

    const collector = msg.createMessageComponentCollector({ time: 120_000 });

    collector.on('collect', async i => {
        if (i.user.id !== message.author.id) {
            return i.reply({ content: 'this is not your build', ephemeral: true });
        }

        if (i.customId === 'next') current = Math.min(current + 1, pages.length - 1);
        if (i.customId === 'prev') current = Math.max(current - 1, 0);

        await i.update({
            files: [new AttachmentBuilder(pages[current], { name: 'build.png' })],
            components: [buildRow(current, pages.length)],
        });
    });

    collector.on('end', async () => {
        await msg.edit({ components: [] }).catch(() => { });
    });
}