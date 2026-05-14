import { createCanvas } from 'canvas';

const WIDTH = 480;
const PAD = 24;
const BG = '#2b2d31';
const ACCENT = '#5865F2';

function baseCanvas(height) {
    const canvas = createCanvas(WIDTH, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, WIDTH, height);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(0, 0, 4, height);
    return { canvas, ctx };
}

function drawPlaceholder(label) {
    const { canvas, ctx } = baseCanvas(300);
    ctx.fillStyle = '#b5bac1';
    ctx.font = '500 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, WIDTH / 2, 150);
    ctx.textAlign = 'left';
    return canvas.toBuffer('image/png');
}

function drawTalentPage(title, talents) {
    const ROW_H = 28;
    const HEADER_H = 60;
    const height = HEADER_H + talents.length * ROW_H + PAD;
    const { canvas, ctx } = baseCanvas(height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '500 16px sans-serif';
    ctx.fillText(title, PAD, 36);

    ctx.fillStyle = '#b5bac1';
    ctx.font = '11px sans-serif';
    ctx.fillText('TALENT', PAD, HEADER_H - 8);
    ctx.textAlign = 'right';
    ctx.fillText('REQS', WIDTH - PAD, HEADER_H - 8);
    ctx.textAlign = 'left';

    talents.forEach((t, i) => {
        const y = HEADER_H + i * ROW_H + 20;

        if (i % 2 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fillRect(4, HEADER_H + i * ROW_H, WIDTH - 4, ROW_H);
        }

        const reqs = Object.entries(t.reqs).map(([k, v]) => `${k} ${v}`).join(', ');

        ctx.fillStyle = '#dbdee1';
        ctx.font = '14px sans-serif';
        ctx.fillText(t.name, PAD, y);

        ctx.fillStyle = '#b5bac1';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(reqs, WIDTH - PAD, y);
        ctx.textAlign = 'left';
    });

    return canvas.toBuffer('image/png');
}

export function renderPages({ buildName, preShrineTalents, postShrineTalents }) {
    return [
        drawTalentPage(`${buildName} — Pre-shrine`, preShrineTalents),
        drawPlaceholder('MANTRAS'),
        drawPlaceholder('WEAPON'),
        drawPlaceholder('EQUIPMENT'),
        drawPlaceholder('FULL STATS'),
    ];
}