const { EmbedBuilder } = require('discord.js');
const localeManager = require('../locales/localeManager');

class ModerationViews {
    static caseVerdict(caseData, targetUser, moderator, lang = 'ru') {
        const actionLabel = localeManager.get(`moderation.moderation.messages.labels.${caseData.action}`, lang) || caseData.action;
        const footerText = localeManager.get(`moderation.moderation.messages.${caseData.action}_done`, lang) || `${actionLabel} выполнено`;

        const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle(`${localeManager.get('services.embed.case', lang)} \`#${caseData.caseNum}\``)
            .addFields(
                { name: localeManager.get('services.embed.moderator', lang), value: `<@${moderator.id}>`, inline: true },
                { name: localeManager.get('services.embed.user', lang), value: `<@${targetUser.id}>`, inline: true },
                { name: localeManager.get('services.embed.reason', lang), value: caseData.reason || localeManager.get('moderation.moderation.messages.no_reason', lang), inline: false }
            );

        if (caseData.duration) {
            const minutes = Math.round(caseData.duration / 60000);
            embed.addFields({ name: localeManager.get('services.embed.duration', lang), value: `${minutes}m`, inline: true });
        }

        const timestampVal = caseData.timestamp ? new Date(caseData.timestamp) : new Date();
        const timeValue = `<t:${Math.floor(timestampVal.getTime() / 1000)}:F>`;
        embed.addFields({ name: localeManager.get('services.embed.time', lang), value: timeValue, inline: true })
             .setFooter({ text: footerText, iconURL: moderator.displayAvatarURL({ dynamic: true }) })
             .setTimestamp(timestampVal);

        if (caseData.evidenceUrl) {
            embed.addFields({ name: localeManager.get('services.embed.evidence', lang), value: `[${localeManager.get('services.embed.click_to_view', lang)}](${caseData.evidenceUrl})` });
            embed.setImage(caseData.evidenceUrl);
        }

        return { embeds: [embed] };
    }

    static historyLog(targetUser, cases, lang = 'ru') {
        const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle(localeManager.get('moderation.case.messages.history_title', lang, { user: targetUser.username }))
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        if (!cases || cases.length === 0) {
            embed.setDescription(localeManager.get('moderation.case.messages.history_empty', lang, { user: targetUser.username }));
            embed.setFooter({ text: localeManager.get('moderation.case.messages.history_footer_empty', lang) });
            return { embeds: [embed] };
        }

        const counts = {};
        for (const modCase of cases) {
            const action = modCase.action.toLowerCase();
            counts[action] = (counts[action] || 0) + 1;
        }

        const statsLines = Object.entries(counts)
            .map(([action, count]) => {
                const label = localeManager.get(`moderation.moderation.messages.labels.${action}`, lang) || action;
                return `• **${label}**: ${count} ${localeManager.get('moderation.case.messages.history_times', lang)}`;
            })
            .join('\n');

        const sortedCases = cases.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const maxDisplay = 10;
        const displayCases = sortedCases.slice(0, maxDisplay);
        const punishmentsText = displayCases
            .map((modCase) => {
                const actionLabel = localeManager.get(`moderation.moderation.messages.labels.${modCase.action}`, lang) || modCase.action;
                return `**#${modCase.caseNum}** — **${actionLabel.toUpperCase()}**: ${modCase.reason} (<t:${Math.floor(new Date(modCase.timestamp).getTime()/1000)}:R>)`;
            })
            .join('\n');

        const additionalText = sortedCases.length > maxDisplay
            ? `\n\n${localeManager.get('moderation.case.messages.history_more', lang, { max: maxDisplay, total: sortedCases.length })}`
            : '';

        embed.setDescription(
            `**${localeManager.get('moderation.case.messages.history_stats_title', lang)}**\n${statsLines}\n\n` +
            `**${localeManager.get('moderation.case.messages.history_last_title', lang, { count: displayCases.length })}**\n${punishmentsText}${additionalText}`
        );
        embed.setFooter({ text: localeManager.get('moderation.case.messages.history_footer_total', lang, { count: cases.length }) });

        return { embeds: [embed] };
    }
}

module.exports = ModerationViews;