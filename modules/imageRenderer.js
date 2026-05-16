import { createCanvas } from 'canvas';

const WIDTH = 480;
const PAD = 24;
const BG = '#2b2d31';
const ACCENT = '#5865F2';
const ROW_H = 28;
const LINE_H = 14;
const HEADER_H = 60;
const MAX_REQ_W = 200;
const REQ_FONT = '12px sans-serif';

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

function measureReqLines(ctx, reqs) {
    const reqPairs = Object.entries(reqs).map(([k, v]) => `${k} ${v}`);
    if (!reqPairs.length) return [''];

    const lines = [];
    let line = '';
    for (const pair of reqPairs) {
        const candidate = line ? `${line}, ${pair}` : pair;
        if (ctx.measureText(candidate).width > MAX_REQ_W && line) {
            lines.push(line);
            line = pair;
        } else {
            line = candidate;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function drawTalentPage(title, talents) {
    // measure required lines
    const { ctx: mCtx } = baseCanvas(1);
    mCtx.font = REQ_FONT;

    const talentLines = talents.map(t => measureReqLines(mCtx, t.reqs));

    const totalRowSpan = talentLines.reduce((s, ls) => s + ls.length, 0);
    const height = HEADER_H + totalRowSpan * ROW_H + PAD;
    const { canvas, ctx } = baseCanvas(height);

    // title
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 16px sans-serif';
    ctx.fillText(title, PAD, 36);

    // column headers
    ctx.fillStyle = '#b5bac1';
    ctx.font = '11px sans-serif';
    ctx.fillText('TALENT', PAD, HEADER_H - 8);
    ctx.textAlign = 'right';
    ctx.fillText('REQS', WIDTH - PAD, HEADER_H - 8);
    ctx.textAlign = 'left';

    let rowIndex = 0;
    talents.forEach((t, i) => {
        const lines = talentLines[i];
        const rowSpan = lines.length;
        const rowTop = HEADER_H + rowIndex * ROW_H;
        const y = rowTop + 20;

        // alternating background for rows
        if (i % 2 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fillRect(4, rowTop, WIDTH - 4, rowSpan * ROW_H);
        }

        // talent name
        ctx.fillStyle = '#dbdee1';
        ctx.font = '14px sans-serif';
        ctx.fillText(t.name, PAD, y);

        // req lines with new wrapping, Chorus of souls im looking at you
        ctx.fillStyle = '#b5bac1';
        ctx.font = REQ_FONT;
        ctx.textAlign = 'right';
        lines.forEach((ln, li) => {
            ctx.fillText(ln, WIDTH - PAD, y + li * LINE_H);
        });
        ctx.textAlign = 'left';

        rowIndex += rowSpan;
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