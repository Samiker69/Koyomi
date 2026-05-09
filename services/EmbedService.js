const { EmbedBuilder } = require('discord.js');

class EmbedService {
    static BRAND_COLOR = 0x9B59B6;

    /**
     * Создает стандартизированный Embed для действий модерации
     * @param {Object} options 
     * @returns {EmbedBuilder}
     */
    static createModerationEmbed({ interaction, caseNum, targetId, reason, evidence, color, footerText, durationString, timestamp, moderatorUser }) {
        const moderator = moderatorUser || interaction.user;
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`Case \`#${caseNum}\``)
            .setThumbnail(interaction.guild?.iconURL() || '')
            .addFields(
                { name: 'Модератор', value: `<@${moderator.id}>`, inline: true },
                { name: 'Пользователь', value: `<@${targetId}>`, inline: true },
                { name: 'Причина', value: reason, inline: false }
            );

        if (durationString) {
            embed.addFields({ name: 'Длительность', value: durationString, inline: true });
        }

        const timeValue = timestamp ? `<t:${Math.floor(new Date(timestamp).getTime() / 1000)}:F>` : `<t:${Math.floor(Date.now() / 1000)}:F>`;

        embed.addFields({ name: 'Время', value: timeValue, inline: true })
             .setFooter({ text: footerText, iconURL: moderator.displayAvatarURL({ dynamic: true }) })
             .setTimestamp(timestamp ? new Date(timestamp) : undefined);

        if (evidence) {
            embed.addFields({ name: 'Доказательства', value: `[Нажмите для просмотра](${evidence.url})` });
            embed.setImage(evidence.url);
        }

        return embed;
    }

    /**
     * Создает базовый универсальный Embed с единым стилем проекта.
     * @param {Object} interaction - Объект взаимодействия для извлечения пользователя (опционально)
     * @returns {EmbedBuilder}
     */
    static createBaseEmbed(interaction = null) {
        const embed = new EmbedBuilder()
            .setColor(EmbedService.BRAND_COLOR)
            .setTimestamp();

        if (interaction && interaction.user) {
            embed.setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
        }

        return embed;
    }
    /**
     * Создаёт публичный embed для канала Verdict.
     * Отличается от createModerationEmbed: компактный, без thumbnail, двухколоночный лейаут.
     * @param {object} opts
     * @returns {EmbedBuilder}
     */
    static createVerdictEmbed({ action, label, color, caseNum, targetId, moderatorId, reason, durationString, timestamp }) {
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${label} — Кейс #${caseNum}`)
            .addFields(
                { name: 'Пользователь', value: `<@${targetId}>`, inline: true },
                { name: 'Модератор', value: `<@${moderatorId}>`, inline: true }
            );

        if (durationString) {
            embed.addFields({ name: 'Длительность', value: durationString, inline: true });
        }

        embed.addFields({ name: 'Причина', value: reason, inline: false });

        const timeValue = timestamp
            ? `<t:${Math.floor(new Date(timestamp).getTime() / 1000)}:F>`
            : `<t:${Math.floor(Date.now() / 1000)}:F>`;
        embed.addFields({ name: 'Время', value: timeValue, inline: true });

        embed.setTimestamp(timestamp ? new Date(timestamp) : undefined);

        return embed;
    }
}

module.exports = EmbedService;
