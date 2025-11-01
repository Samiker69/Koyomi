const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly');
const { createCanvas, loadImage } = require('canvas');

function drawHeart(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.25);
    ctx.bezierCurveTo(x - size * 0.7, y - size * 0.5, x - size * 0.3, y - size * 0.8, x, y - size * 0.3);
    ctx.bezierCurveTo(x + size * 0.3, y - size * 0.8, x + size * 0.7, y - size * 0.5, x, y + size * 0.25);
    ctx.fill();
    ctx.closePath();
}

function drawSparkle(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size); // Верхняя точка
    ctx.quadraticCurveTo(x, y, x + size, y); // Правая
    ctx.quadraticCurveTo(x, y, x, y + size); // Нижняя
    ctx.quadraticCurveTo(x, y, x - size, y); // Левая
    ctx.quadraticCurveTo(x, y, x, y - size); // Обратно к верхней
    ctx.fill();
    ctx.closePath();
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('love')
        .setDescription(forFunOnly.love.description.ru)
        .setDescriptionLocalizations(forFunOnly.love.description)
        .addUserOption(opt =>
            opt
            .setName('user1')
            .setDescription(forFunOnly.love.options.user1.description.ru)
            .setDescriptionLocalizations(forFunOnly.love.options.user1.description)
            .setRequired(true)
        )
        .addUserOption(opt =>
            opt
            .setName('user2')
            .setDescription(forFunOnly.love.options.user2.description.ru)
            .setDescriptionLocalizations(forFunOnly.love.options.user2.description)
            .setRequired(true)
        ),

    async execute(interaction) {
        const u1 = interaction.options.getUser('user1');
        const u2 = interaction.options.getUser('user2');

        const [a, b] = [u1.id, u2.id].sort();
        const seed = BigInt(a) ^ BigInt(b);

        const lcg = (seed * 9301n + 49297n) % 233280n;
        const percentage = Math.floor(Number(lcg) / 233280 * 100);

        const canvasWidth = 800;
        const canvasHeight = 300;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, canvasWidth / 2);
        gradient.addColorStop(0, '#59364A');
        gradient.addColorStop(1, '#2F3136');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.globalAlpha = 0.2;
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight;
            const size = Math.random() * 10 + 5;
            drawHeart(ctx, x, y, size, '#FF69B4');
        }
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight;
            const size = Math.random() * 5 + 3;
            drawSparkle(ctx, x, y, size, '#FFFFFF');
        }
        ctx.globalAlpha = 1.0;

        // Загрузка аватаров
        const avatar1 = await loadImage(u1.displayAvatarURL({ extension: 'png', size: 128 }));
        const avatar2 = await loadImage(u2.displayAvatarURL({ extension: 'png', size: 128 }));

        // Настройки аватаров
        const avatarSize = 128;
        const padding = 50;
        const avatarY = (canvasHeight - avatarSize) / 2 - 40;
        const avatarRadius = avatarSize / 2;

        // --- Аватар 1 ---
        ctx.save();
        ctx.beginPath();
        ctx.arc(padding + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.shadowColor = '#FF69B4';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FF69B4';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.clip();
        ctx.drawImage(avatar1, padding, avatarY, avatarSize, avatarSize);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(padding + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();


        // --- Аватар 2 ---
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvasWidth - padding - avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.shadowColor = '#FF69B4';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FF69B4';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.clip();
        ctx.drawImage(avatar2, canvasWidth - padding - avatarSize, avatarY, avatarSize, avatarSize);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(canvasWidth - padding - avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        const heartX = canvasWidth / 2;
        const heartY = avatarY + avatarRadius + 10;
        drawHeart(ctx, heartX, heartY, 50, '#E91E63');

        // --- Текст с белым свечением ---
        ctx.font = 'bold 36px "Comic Sans MS", "Arial", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        // Свечение
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 10;
        ctx.fillText(`${percentage}%`, heartX, heartY - 50);
        
        ctx.font = '24px "Comic Sans MS", "Arial", sans-serif';
        ctx.fillText(u1.username, padding + avatarRadius, avatarY + avatarSize + 30); 
        ctx.fillText(u2.username, canvasWidth - padding - avatarRadius, avatarY + avatarSize + 30);
        
        // Сброс свечения
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;


        const barWidth = 500;
        const barHeight = 30;
        const barX = (canvasWidth - barWidth) / 2;
        const barY = canvasHeight - 50;
        const barRadius = 15;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        roundRect(ctx, barX, barY, barWidth, barHeight, barRadius);
        ctx.fill();

        const filledWidth = (barWidth * percentage) / 100;
        if (filledWidth > 0) {
            const barGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
            barGradient.addColorStop(0, '#FFC0CB'); // Светло-розовый
            barGradient.addColorStop(1, '#FF69B4'); // Ярко-розовый
            
            ctx.fillStyle = barGradient;
            roundRect(ctx, barX, barY, filledWidth, barHeight, barRadius);
            ctx.fill();
        }
        
        const sliderX = (barX + filledWidth) - barRadius; 
        const sliderY = barY + barHeight / 2;
        if (filledWidth > barRadius) { 
            drawHeart(ctx, Math.min(sliderX, barX + barWidth - barRadius - 5), sliderY, 20, '#FFFFFF'); // Размер 20
        }

        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'love_meter.png' });

        const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('💕 Калькулятор Любви 💕')
            .setDescription(`Насколько совместимы ${u1} и ${u2}?`)
            .setImage('attachment://love_meter.png'); 

        await interaction.reply({ 
            embeds: [embed], 
            files: [attachment],
            allowedMentions: { parse: [] } 
        });
    }
};