const { createCanvas } = require('canvas');

function drawUserCard(ctx, text, x, y, isTarget = false) {
    ctx.save();
    ctx.font = isTarget
        ? 'italic bold 13px Georgia, "Times New Roman", serif'
        : '13px Georgia, "Times New Roman", serif';

    const textWidth = ctx.measureText(text).width;
    const cardWidth = Math.max(textWidth + 24, 75);
    const cardHeight = 32;
    const startX = x - cardWidth / 2;
    const startY = y - cardHeight / 2;

    ctx.fillStyle = isTarget ? '#3f51b5' : '#a0d5e8';
    ctx.fillRect(startX, startY, cardWidth, cardHeight);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, startY, cardWidth, cardHeight);

    ctx.fillStyle = isTarget ? '#ffffff' : '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);

    ctx.restore();
    return { startX, startY, width: cardWidth, height: cardHeight, x, y };
}

function drawOrganicLine(ctx, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(len / 4);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;
        const wobble = (Math.sin(t * Math.PI * 3.5) * 0.4) + (Math.cos(t * Math.PI * 1.5) * 0.3);
        const nx = -dy / len;
        const ny = dx / len;
        ctx.lineTo(cx + nx * wobble, cy + ny * wobble);
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawCurve(ctx, x0, y0, x3, y3) {
    ctx.beginPath();
    const midY = y0 + (y3 - y0) / 2;
    const x1 = x0, y1 = midY;
    const x2 = x3, y2 = midY;
    const steps = 60;
    ctx.moveTo(x0, y0);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        const bx = mt*mt*mt*x0 + 3*mt*mt*t*x1 + 3*mt*t*t*x2 + t*t*t*x3;
        const by = mt*mt*mt*y0 + 3*mt*mt*t*y1 + 3*mt*t*t*y2 + t*t*t*y3;
        const tx = 3*mt*mt*(x1 - x0) + 6*mt*t*(x2 - x1) + 3*t*t*(x3 - x2);
        const ty = 3*mt*mt*(y1 - y0) + 6*mt*t*(y2 - y1) + 3*t*t*(y3 - y2);
        const len = Math.sqrt(tx*tx + ty*ty);
        const nx = -ty / len;
        const ny = tx / len;
        const wobble = (Math.sin(t * Math.PI * 4) * 0.5) + (Math.cos(t * Math.PI * 2) * 0.3);
        ctx.lineTo(bx + nx * wobble, by + ny * wobble);
    }
    ctx.lineTo(x3, y3);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1.2;
    ctx.stroke();
}

async function generateFamilyTree(client, guildId, targetUserId, familyData, lang = 'ru') {
    const width = 1000;
    const height = 550;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const fetchProfile = async (id) => {
        if (!id) return null;
        try {
            const fetched = await client.users.fetch(id);
            return { id, username: fetched.username, displayName: fetched.displayName };
        } catch (e) {
            return { id, username: 'User', displayName: 'User' };
        }
    };

    const targetUser = await fetchProfile(targetUserId);
    const spouse = await fetchProfile(familyData.spouseId);

    const parents = [];
    for (const pid of familyData.parentIds || []) {
        const p = await fetchProfile(pid);
        if (p) parents.push(p);
    }

    const children = [];
    for (const cid of familyData.childrenIds || []) {
        const c = await fetchProfile(cid);
        if (c) children.push(c);
    }

    const siblings = [];
    for (const sid of familyData.siblingIds || []) {
        const s = await fetchProfile(sid);
        if (s) siblings.push(s);
    }

    const targetName = targetUser.displayName || targetUser.username;

    ctx.font = '13px Georgia, "Times New Roman", serif';
    const measureWidth = (txt) => Math.max(ctx.measureText(txt).width + 24, 75);

    const targetWidth = measureWidth(targetName);
    const spouseWidth = spouse ? measureWidth(spouse.displayName || spouse.username) : 0;
    const parentWidths = parents.map(p => measureWidth(p.displayName || p.username));
    const siblingWidths = siblings.map(s => measureWidth(s.displayName || s.username));
    const childrenWidths = children.map(c => measureWidth(c.displayName || c.username));

    const yParents = 130;
    const yTarget = 280;
    const yChildren = 430;

    const drawTasks = [];
    const connectionLines = [];

    let targetX = 500;
    let spouseX = 500;

    if (spouse) {
        const gap = 35;
        const totalMidWidth = targetWidth + spouseWidth + gap;
        targetX = 500 - totalMidWidth / 2 + targetWidth / 2;
        spouseX = 500 + totalMidWidth / 2 - spouseWidth / 2;

        drawTasks.push(() => drawUserCard(ctx, targetName, targetX, yTarget, true));
        drawTasks.push(() => drawUserCard(ctx, spouse.displayName || spouse.username, spouseX, yTarget));

        connectionLines.push(() => {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.2;
            drawOrganicLine(ctx, targetX + targetWidth / 2, yTarget, spouseX - spouseWidth / 2, yTarget);
        });
    } else {
        targetX = 500;
        drawTasks.push(() => drawUserCard(ctx, targetName, targetX, yTarget, true));
    }

    const siblingCoords = [];
    if (siblings.length > 0) {
        const leftLimit = spouse ? (targetX - targetWidth / 2 - 50) : (targetX - targetWidth / 2 - 60);
        const rightLimit = spouse ? (spouseX + spouseWidth / 2 + 50) : (targetX + targetWidth / 2 + 60);

        for (let i = 0; i < siblings.length; i++) {
            const name = siblings[i].displayName || siblings[i].username;
            const w = siblingWidths[i];
            const sibX = (i % 2 === 0)
                ? (leftLimit - w / 2 - Math.floor(i / 2) * 110)
                : (rightLimit + w / 2 + Math.floor(i / 2) * 110);

            siblingCoords.push({ x: sibX, width: w });
            drawTasks.push(() => drawUserCard(ctx, name, sibX, yTarget));
        }
    }

    let parentMidX = 500;
    if (parents.length > 0) {
        if (parents.length === 1) {
            parentMidX = 500;
            drawTasks.push(() => drawUserCard(ctx, parents[0].displayName || parents[0].username, parentMidX, yParents));

            connectionLines.push(() => {
                const parentBottomY = yParents + 16;
                const dropY = parentBottomY + 45;
                ctx.strokeStyle = '#555555';
                ctx.lineWidth = 1.2;
                drawOrganicLine(ctx, parentMidX, parentBottomY, parentMidX, dropY);
                drawCurve(ctx, parentMidX, dropY, targetX, yTarget - 16);
                for (const sib of siblingCoords) {
                    drawCurve(ctx, parentMidX, dropY, sib.x, yTarget - 16);
                }
            });
        } else {
            const gap = 35;
            const p1Width = parentWidths[0];
            const p2Width = parentWidths[1];
            const totalParentWidth = p1Width + p2Width + gap;
            const p1X = 500 - totalParentWidth / 2 + p1Width / 2;
            const p2X = 500 + totalParentWidth / 2 - p2Width / 2;

            drawTasks.push(() => drawUserCard(ctx, parents[0].displayName || parents[0].username, p1X, yParents));
            drawTasks.push(() => drawUserCard(ctx, parents[1].displayName || parents[1].username, p2X, yParents));

            connectionLines.push(() => {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1.2;
                drawOrganicLine(ctx, p1X + p1Width / 2, yParents, p2X - p2Width / 2, yParents);

                const midX = 500;
                const dropY = yParents + 45;
                ctx.strokeStyle = '#555555';
                ctx.lineWidth = 1.2;
                drawOrganicLine(ctx, midX, yParents, midX, dropY);
                drawCurve(ctx, midX, dropY, targetX, yTarget - 16);
                for (const sib of siblingCoords) {
                    drawCurve(ctx, midX, dropY, sib.x, yTarget - 16);
                }
            });
        }
    }

    if (children.length > 0) {
        const spacing = 35;
        const totalChildrenWidth = childrenWidths.reduce((a, b) => a + b, 0) + (children.length - 1) * spacing;
        let currentX = 500 - totalChildrenWidth / 2;

        const childrenData = [];
        for (let i = 0; i < children.length; i++) {
            const w = childrenWidths[i];
            const childX = currentX + w / 2;
            currentX += w + spacing;

            childrenData.push({ x: childX, width: w });
            const name = children[i].displayName || children[i].username;
            drawTasks.push(() => drawUserCard(ctx, name, childX, yChildren));
        }

        connectionLines.push(() => {
            const parentSourceX = spouse ? 500 : targetX;
            const parentSourceY = spouse ? yTarget : (yTarget + 16);
            const dropY = parentSourceY + 45;
            ctx.strokeStyle = '#555555';
            ctx.lineWidth = 1.2;
            drawOrganicLine(ctx, parentSourceX, parentSourceY, parentSourceX, dropY);
            for (const child of childrenData) {
                drawCurve(ctx, parentSourceX, dropY, child.x, yChildren - 16);
            }
        });
    }

    for (const drawLine of connectionLines) drawLine();
    for (const drawCard of drawTasks) drawCard();

    return canvas.toBuffer();
}

module.exports = { generateFamilyTree };
