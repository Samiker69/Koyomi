const { createCanvas } = require('canvas');
const db = require('../../services/DatabaseService');

const CARD_H = 32;
const CARD_PAD = 24;
const CARD_MIN_W = 75;
const SPOUSE_GAP = 30;
const SIBLING_GAP = 20;
const CHILD_GAP = 30;
const LEVEL_GAP = 130;
const CANVAS_PAD = 50;
const FONT = '13px Georgia, "Times New Roman", serif';
const FONT_TARGET = 'italic bold 13px Georgia, "Times New Roman", serif';

function measureCardWidth(ctx, text) {
    ctx.font = FONT;
    return Math.max(ctx.measureText(text).width + CARD_PAD, CARD_MIN_W);
}

function drawUserCard(ctx, text, x, y, isTarget = false) {
    ctx.save();
    ctx.font = isTarget ? FONT_TARGET : FONT;

    const textWidth = ctx.measureText(text).width;
    const cardWidth = Math.max(textWidth + CARD_PAD, CARD_MIN_W);
    const startX = x - cardWidth / 2;
    const startY = y - CARD_H / 2;

    ctx.fillStyle = isTarget ? '#3f51b5' : '#a0d5e8';
    ctx.fillRect(startX, startY, cardWidth, CARD_H);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, startY, cardWidth, CARD_H);

    ctx.fillStyle = isTarget ? '#ffffff' : '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);

    ctx.restore();
    return { startX, startY, width: cardWidth, height: CARD_H, x, y };
}

function drawOrganicLine(ctx, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(Math.floor(len / 4), 1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;
        const wobble = (Math.sin(t * Math.PI * 3.5) * 0.4) + (Math.cos(t * Math.PI * 1.5) * 0.3);
        const nx = -dy / len || 0;
        const ny = dx / len || 0;
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
        const len = Math.sqrt(tx*tx + ty*ty) || 1;
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

async function fetchProfile(client, id) {
    if (!id) return null;
    try {
        const fetched = await client.users.fetch(id);
        return { id, username: fetched.username, displayName: fetched.displayName };
    } catch (e) {
        return { id, username: 'User', displayName: 'User' };
    }
}

function getDisplayName(profile) {
    return profile ? (profile.displayName || profile.username) : 'Unknown';
}

function computeSubtreeWidth(ctx, node, profiles) {
    const profile = profiles.get(node.userId);
    const name = getDisplayName(profile);
    let nodeWidth = measureCardWidth(ctx, name);

    if (node.spouseId) {
        const spouseProfile = profiles.get(node.spouseId);
        const spouseName = getDisplayName(spouseProfile);
        nodeWidth += SPOUSE_GAP + measureCardWidth(ctx, spouseName);
    }

    if (!node.children || node.children.length === 0) {
        return nodeWidth;
    }

    let childrenTotalWidth = 0;
    for (let i = 0; i < node.children.length; i++) {
        childrenTotalWidth += computeSubtreeWidth(ctx, node.children[i], profiles);
        if (i < node.children.length - 1) childrenTotalWidth += CHILD_GAP;
    }

    return Math.max(nodeWidth, childrenTotalWidth);
}

function computeTreeDepth(node) {
    if (!node || !node.children || node.children.length === 0) return 1;
    let maxChildDepth = 0;
    for (const child of node.children) {
        maxChildDepth = Math.max(maxChildDepth, computeTreeDepth(child));
    }
    return 1 + maxChildDepth;
}

async function collectAllUserIds(node, ids = new Set()) {
    if (!node) return ids;
    ids.add(node.userId);
    if (node.spouseId) ids.add(node.spouseId);
    if (node.parentIds) node.parentIds.forEach(id => ids.add(id));
    if (node.siblingIds) node.siblingIds.forEach(id => ids.add(id));
    if (node.children) {
        for (const child of node.children) {
            await collectAllUserIds(child, ids);
        }
    }
    return ids;
}

function layoutNode(ctx, node, centerX, y, profiles, positions) {
    const profile = profiles.get(node.userId);
    const name = getDisplayName(profile);
    const nodeWidth = measureCardWidth(ctx, name);

    let nodeX = centerX;
    let spouseX = null;

    if (node.spouseId) {
        const spouseProfile = profiles.get(node.spouseId);
        const spouseName = getDisplayName(spouseProfile);
        const spouseWidth = measureCardWidth(ctx, spouseName);
        const totalPairWidth = nodeWidth + SPOUSE_GAP + spouseWidth;
        nodeX = centerX - totalPairWidth / 2 + nodeWidth / 2;
        spouseX = centerX + totalPairWidth / 2 - spouseWidth / 2;

        positions.set(node.spouseId, { x: spouseX, y, width: spouseWidth });
    }

    positions.set(node.userId, { x: nodeX, y, width: nodeWidth });

    if (node.children && node.children.length > 0) {
        const childY = y + LEVEL_GAP;
        const childWidths = node.children.map(c => computeSubtreeWidth(ctx, c, profiles));
        const totalChildrenWidth = childWidths.reduce((a, b) => a + b, 0) + (node.children.length - 1) * CHILD_GAP;

        let currentX = centerX - totalChildrenWidth / 2;

        for (let i = 0; i < node.children.length; i++) {
            const childSubtreeW = childWidths[i];
            const childCenterX = currentX + childSubtreeW / 2;
            layoutNode(ctx, node.children[i], childCenterX, childY, profiles, positions);
            currentX += childSubtreeW + CHILD_GAP;
        }
    }
}

function drawConnections(ctx, node, positions) {
    const pos = positions.get(node.userId);
    if (!pos) return;

    if (node.spouseId) {
        const spousePos = positions.get(node.spouseId);
        if (spousePos) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.2;
            drawOrganicLine(ctx,
                pos.x + pos.width / 2, pos.y,
                spousePos.x - spousePos.width / 2, spousePos.y
            );
        }
    }

    if (node.children && node.children.length > 0) {
        const parentSourceX = node.spouseId
            ? (pos.x + (positions.get(node.spouseId)?.x || pos.x)) / 2
            : pos.x;
        const parentSourceY = pos.y + CARD_H / 2;
        const dropY = parentSourceY + 35;

        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1.2;
        drawOrganicLine(ctx, parentSourceX, parentSourceY, parentSourceX, dropY);

        for (const child of node.children) {
            const childPos = positions.get(child.userId);
            if (childPos) {
                drawCurve(ctx, parentSourceX, dropY, childPos.x, childPos.y - CARD_H / 2);
            }
        }
    }

    if (node.children) {
        for (const child of node.children) {
            drawConnections(ctx, child, positions);
        }
    }
}

function drawAllCards(ctx, node, targetUserId, profiles, positions) {
    const pos = positions.get(node.userId);
    if (pos) {
        const name = getDisplayName(profiles.get(node.userId));
        drawUserCard(ctx, name, pos.x, pos.y, node.userId === targetUserId);
    }

    if (node.spouseId) {
        const spousePos = positions.get(node.spouseId);
        if (spousePos) {
            const spouseName = getDisplayName(profiles.get(node.spouseId));
            drawUserCard(ctx, spouseName, spousePos.x, spousePos.y, false);
        }
    }

    if (node.children) {
        for (const child of node.children) {
            drawAllCards(ctx, child, targetUserId, profiles, positions);
        }
    }
}

async function generateFamilyTree(client, guildId, targetUserId, familyData, lang = 'ru') {
    const treeData = await db.getFullFamilyTree(guildId, targetUserId);

    if (!treeData) {
        const width = 400;
        const height = 100;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#000000';
        ctx.font = FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lang === 'ru' ? 'Семья не найдена' : 'No family found', width / 2, height / 2);
        return canvas.toBuffer();
    }

    const allIds = await collectAllUserIds(treeData);

    const parentProfiles = [];
    for (const pid of (treeData.parentIds || [])) {
        allIds.add(pid);
    }
    for (const sid of (treeData.siblingIds || [])) {
        allIds.add(sid);
    }

    const profiles = new Map();
    for (const id of allIds) {
        const p = await fetchProfile(client, id);
        if (p) profiles.set(id, p);
    }

    const measureCanvas = createCanvas(1, 1);
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = FONT;

    const parents = (treeData.parentIds || []).map(id => profiles.get(id)).filter(Boolean);
    const siblings = (treeData.siblingIds || []).map(id => profiles.get(id)).filter(Boolean);

    const treeDepth = computeTreeDepth(treeData);
    const hasParents = parents.length > 0;
    const hasSiblings = siblings.length > 0;

    const totalLevels = (hasParents ? 1 : 0) + treeDepth;
    const treeSubtreeWidth = computeSubtreeWidth(measureCtx, treeData, profiles);

    let siblingsTotalWidth = 0;
    if (hasSiblings) {
        for (let i = 0; i < siblings.length; i++) {
            siblingsTotalWidth += measureCardWidth(measureCtx, getDisplayName(siblings[i]));
            if (i < siblings.length - 1) siblingsTotalWidth += SIBLING_GAP;
        }
    }

    let parentsWidth = 0;
    if (parents.length === 2) {
        parentsWidth = measureCardWidth(measureCtx, getDisplayName(parents[0]))
            + SPOUSE_GAP
            + measureCardWidth(measureCtx, getDisplayName(parents[1]));
    } else if (parents.length === 1) {
        parentsWidth = measureCardWidth(measureCtx, getDisplayName(parents[0]));
    }

    const targetLevelWidth = treeSubtreeWidth + (hasSiblings ? siblingsTotalWidth + 80 : 0);
    const totalWidth = Math.max(targetLevelWidth, parentsWidth, 400) + CANVAS_PAD * 2;
    const totalHeight = totalLevels * LEVEL_GAP + CANVAS_PAD * 2 + 50;

    const width = Math.min(Math.ceil(totalWidth), 4000);
    const height = Math.min(Math.ceil(totalHeight), 4000);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.font = FONT;

    const midX = width / 2;
    const targetY = (hasParents ? CANVAS_PAD + LEVEL_GAP : CANVAS_PAD) + CARD_H;

    const positions = new Map();

    layoutNode(ctx, treeData, midX, targetY, profiles, positions);

    const drawLines = [];
    const drawCards = [];

    if (hasParents) {
        const parentY = CANVAS_PAD + CARD_H / 2;

        if (parents.length === 2) {
            const p1Name = getDisplayName(parents[0]);
            const p2Name = getDisplayName(parents[1]);
            const p1W = measureCardWidth(ctx, p1Name);
            const p2W = measureCardWidth(ctx, p2Name);
            const totalPW = p1W + p2W + SPOUSE_GAP;
            const p1X = midX - totalPW / 2 + p1W / 2;
            const p2X = midX + totalPW / 2 - p2W / 2;

            drawCards.push(() => drawUserCard(ctx, p1Name, p1X, parentY));
            drawCards.push(() => drawUserCard(ctx, p2Name, p2X, parentY));

            drawLines.push(() => {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1.2;
                drawOrganicLine(ctx, p1X + p1W / 2, parentY, p2X - p2W / 2, parentY);

                const dropY = parentY + CARD_H / 2 + 35;
                ctx.strokeStyle = '#555555';
                ctx.lineWidth = 1.2;
                drawOrganicLine(ctx, midX, parentY + CARD_H / 2, midX, dropY);

                const targetPos = positions.get(targetUserId);
                if (targetPos) {
                    drawCurve(ctx, midX, dropY, targetPos.x, targetPos.y - CARD_H / 2);
                }

                for (const sib of siblings) {
                    const sibPos = positions.get(sib.id);
                    if (sibPos) {
                        drawCurve(ctx, midX, dropY, sibPos.x, sibPos.y - CARD_H / 2);
                    }
                }
            });
        } else if (parents.length === 1) {
            const pName = getDisplayName(parents[0]);

            drawCards.push(() => drawUserCard(ctx, pName, midX, parentY));

            drawLines.push(() => {
                const dropY = parentY + CARD_H / 2 + 35;
                ctx.strokeStyle = '#555555';
                ctx.lineWidth = 1.2;
                drawOrganicLine(ctx, midX, parentY + CARD_H / 2, midX, dropY);

                const targetPos = positions.get(targetUserId);
                if (targetPos) {
                    drawCurve(ctx, midX, dropY, targetPos.x, targetPos.y - CARD_H / 2);
                }

                for (const sib of siblings) {
                    const sibPos = positions.get(sib.id);
                    if (sibPos) {
                        drawCurve(ctx, midX, dropY, sibPos.x, sibPos.y - CARD_H / 2);
                    }
                }
            });
        }
    }

    if (hasSiblings) {
        const targetPos = positions.get(targetUserId);
        const treeRight = midX + treeSubtreeWidth / 2;

        let currentSibX = treeRight + 60;
        for (const sib of siblings) {
            const sibName = getDisplayName(sib);
            const sibW = measureCardWidth(ctx, sibName);
            const sibX = currentSibX + sibW / 2;
            positions.set(sib.id, { x: sibX, y: targetY, width: sibW });
            drawCards.push(() => drawUserCard(ctx, sibName, sibX, targetY));
            currentSibX += sibW + SIBLING_GAP;
        }
    }

    drawConnections(ctx, treeData, positions);
    for (const fn of drawLines) fn();

    drawAllCards(ctx, treeData, targetUserId, profiles, positions);
    for (const fn of drawCards) fn();

    return canvas.toBuffer();
}

module.exports = { generateFamilyTree };
