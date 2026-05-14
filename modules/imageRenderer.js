import { createCanvas } from 'canvas';

export function renderBuildImage({ buildName, preShrineTalents }) {
    const PAD = 24;
    const ROW_H = 28;
    const HEADER_H = 60;
    const WIDTH = 480;
    const HEIGHT = HEADER_H + preShrineTalents.length * ROW_H + PAD;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#2b2d31';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#5865F2';
    ctx.fillRect(0, 0, 4, HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = '500 16px sans-serif';
    ctx.fillText(buildName, PAD, 36);

    ctx.fillStyle = '#b5bac1';
    ctx.font = '11px sans-serif';
    ctx.fillText('TALENT', PAD, HEADER_H - 8);
    ctx.fillText('REQS', WIDTH - PAD - 60, HEADER_H - 8);

    preShrineTalents.forEach((t, i) => {
        const y = HEADER_H + i * ROW_H + 20;

        // alternating row bg
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