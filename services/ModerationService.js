const PermissionService = require('./PermissionService');
const EmbedService = require('./EmbedService');
const ModerationDB = require('../functions/db/case');
const SettingsDB = require('../functions/db/settings');
const localeManager = require('../locales/localeManager');
const db = new ModerationDB();
const Sdb = new SettingsDB();

class ModerationService {
    static async banUser(interaction, targetUser, reason, evidence = null) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'ban');
        if (!check.allowed) {
            return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };
        }

        const member = check.member;
        const banReason = reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` });
        
        // Отправляем ЛС перед баном
        await this._sendUserDM(interaction, targetUser, 'ban', reason);

        try {
            if (member) {
                await member.ban({ reason: banReason });
            } else {
                await interaction.guild.members.ban(targetUser.id, { reason: banReason });
            }
            
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'ban',
                reason: reason,
                timestamp: new Date()
            });

            const latestCase = db.getServerModCases(interaction.guild.id)[0];
            await ModerationService.sendVerdict(interaction, 'ban', targetUser, latestCase, reason, null, evidence);
            return { success: true, caseData: latestCase };
        } catch (error) {
            console.error('Ошибка в ModerationService.banUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_ban', interaction.guildLocale) };
        }
    }

    static parseDuration(interaction, timeInput) {
        const lang = interaction.guildLocale;
        if (!timeInput) return { durationMs: null, durationString: localeManager.get('moderation.moderation.messages.duration_permanent', lang) };
        
        const timeRegex = /^(\d+)([mhdwy])$/i;
        const match = timeInput.match(timeRegex);
        if (!match) return { error: localeManager.get('moderation.moderation.messages.invalid_time', lang) };

        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        let multiplier = 0;
        let durationString = "";

        // Simple time units (could be moved to locale as well, but for now just using the current logic)
        switch (unit) {
            case 'm': multiplier = 60 * 1000; durationString = `${amount}m`; break;
            case 'h': multiplier = 60 * 60 * 1000; durationString = `${amount}h`; break;
            case 'd': multiplier = 24 * 60 * 60 * 1000; durationString = `${amount}d`; break;
            case 'w': multiplier = 7 * 24 * 60 * 60 * 1000; durationString = `${amount}w`; break;
        }
        
        const durationMs = amount * multiplier;
        const maxDurationMs = 28 * 24 * 60 * 60 * 1000;

        if (durationMs > maxDurationMs) {
            const overflowMs = durationMs - maxDurationMs;
            let overflowString = '';
            let tempMs = overflowMs;
            if (tempMs >= 7 * 24 * 60 * 60 * 1000) { overflowString += `${Math.floor(tempMs / (7 * 24 * 60 * 60 * 1000))}w `; tempMs %= (7 * 24 * 60 * 60 * 1000); }
            if (tempMs >= 24 * 60 * 60 * 1000) { overflowString += `${Math.floor(tempMs / (24 * 60 * 60 * 1000))}d `; tempMs %= (24 * 60 * 60 * 1000); }
            if (tempMs >= 60 * 60 * 1000) { overflowString += `${Math.floor(tempMs / (60 * 60 * 1000))}h `; tempMs %= (60 * 60 * 1000); }
            if (tempMs >= 60 * 1000) { overflowString += `${Math.floor(tempMs / (60 * 1000))}m`; }
            
            return { error: localeManager.get('moderation.moderation.messages.mute_max_duration', lang, { duration: durationString, overflow: overflowString.trim() }) };
        } else if (durationMs <= 0) {
            return { error: localeManager.get('moderation.moderation.messages.mute_positive', lang) };
        }

        return { durationMs, durationString };
    }

    static async muteUser(interaction, targetUser, timeInput, reason, evidence = null) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'mute');
        if (!check.allowed) return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };

        const parsedTime = this.parseDuration(interaction, timeInput);
        if (parsedTime.error) return { success: false, error: parsedTime.error };

        const { durationMs, durationString } = parsedTime;

        try {
            // Отправляем ЛС перед мутом
            await this._sendUserDM(interaction, targetUser, 'mute', reason, durationString);

            await check.member.timeout(durationMs, reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` }));
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'mute',
                reason: reason,
                timestamp: new Date(),
                duration: durationMs 
            });
            const latestCase = db.getServerModCases(interaction.guild.id)[0];
            await ModerationService.sendVerdict(interaction, 'mute', targetUser, latestCase, reason, durationString, evidence);
            return { success: true, caseData: latestCase, durationString };
        } catch (error) {
            console.error('Ошибка в ModerationService.muteUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_mute', interaction.guildLocale) };
        }
    }

    static async kickUser(interaction, targetUser, reason, evidence = null) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'kick');
        if (!check.allowed) return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };

        try {
            // Отправляем ЛС перед киком
            await this._sendUserDM(interaction, targetUser, 'kick', reason);

            await check.member.kick(reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` }));
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'kick',
                reason: reason,
                timestamp: new Date()
            });
            const latestCase = db.getServerModCases(interaction.guild.id)[0];
            await ModerationService.sendVerdict(interaction, 'kick', targetUser, latestCase, reason, null, evidence);
            return { success: true, caseData: latestCase };
        } catch (error) {
            console.error('Ошибка в ModerationService.kickUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_kick', interaction.guildLocale) };
        }
    }

    static async unmuteUser(interaction, targetUser, reason, evidence = null) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'unmute');
        if (!check.allowed) return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };

        try {
            // Отправляем ЛС перед размутом
            await this._sendUserDM(interaction, targetUser, 'unmute', reason);

            await check.member.timeout(null, reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` }));
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'unmute',
                reason: reason,
                timestamp: new Date()
            });
            const latestCase = db.getServerModCases(interaction.guild.id)[0];
            await ModerationService.sendVerdict(interaction, 'unmute', targetUser, latestCase, reason, null, evidence);
            return { success: true, caseData: latestCase };
        } catch (error) {
            console.error('Ошибка в ModerationService.unmuteUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_unmute', interaction.guildLocale) };
        }
    }

    static async unbanUser(interaction, userId, reason, evidence = null) {
        try {
            await interaction.guild.members.unban(userId, reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` }));
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: userId,
                moderatorId: interaction.user.id,
                action: 'unban',
                reason: reason,
                timestamp: new Date()
            });
            const targetUserObj = await interaction.client.users.fetch(userId).catch(() => ({ id: userId }));
            const latestCase = db.getServerModCases(interaction.guild.id)[0];
            await ModerationService.sendVerdict(interaction, 'unban', targetUserObj, latestCase, reason, null, evidence);
            
            // Отправляем ЛС после разбана
            await this._sendUserDM(interaction, targetUserObj, 'unban', reason);

            return { success: true, caseData: latestCase };
        } catch (error) {
            if (error.code === 10026) return { success: false, error: localeManager.get('moderation.moderation.messages.not_banned', interaction.guildLocale) };
            console.error('Ошибка в ModerationService.unbanUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_unban', interaction.guildLocale) };
        }
    }

    static async warnUser(interaction, targetUser, reason, evidence = null) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'warn');
        if (!check.allowed) return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };

        try {
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'warn',
                reason: reason,
                timestamp: new Date()
            });
            const latestCase = db.getServerModCases(interaction.guild.id)[0];
            await ModerationService.sendVerdict(interaction, 'warn', targetUser, latestCase, reason, null, evidence);
            return { success: true, caseData: latestCase };
        } catch (error) {
            console.error('Ошибка в ModerationService.warnUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_warn', interaction.guildLocale) };
        }
    }

    static async unwarnUser(interaction, targetUser, caseNum, reason, evidence = null) {
        let warnCase;
        let targetId;
        const lang = interaction.guildLocale;

        if (!targetUser) {
            warnCase = db.getModCase(interaction.guild.id, caseNum);
            if (!warnCase) return { success: false, error: localeManager.get('moderation.moderation.messages.case_not_found', lang) };
            targetId = warnCase.targetId;
        } else {
            const cases = db.getTargetModCases(interaction.guild.id, targetUser.id);
            const warnCases = cases.filter(i => i.action === "warn");
            if (warnCases.length === 0) return { success: false, error: localeManager.get('moderation.moderation.messages.no_warns', lang) };
            warnCase = db.getModCase(interaction.guild.id, warnCases[0].caseNum);
            targetId = targetUser.id;
        }

        if (warnCase.action !== "warn") return { success: false, error: localeManager.get('moderation.moderation.messages.case_not_warn', lang, { action: warnCase.action }) };

        const targetUserObj = await interaction.client.users.fetch(targetId).catch(() => null) || { id: targetId };

        const check = await PermissionService.checkModerationTarget(interaction, targetUserObj, 'unwarn');
        if (!check.allowed) return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };

        const warns = db.getUserWarnings(interaction.guild.id, targetId);
        if (warns.true_warns <= 0) return { success: false, error: localeManager.get('moderation.moderation.messages.no_active_punishments', lang) };

        try {
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetId,
                moderatorId: interaction.user.id,
                action: 'unwarn',
                reason: reason,
                timestamp: new Date()
            });
            const latestCase = db.getServerModCases(interaction.guild.id)[0];
            const tUser = await interaction.client.users.fetch(targetId).catch(() => ({ id: targetId }));
            await ModerationService.sendVerdict(interaction, 'unwarn', tUser, latestCase, reason, null, evidence);

            // Отправляем ЛС после снятия варна
            await this._sendUserDM(interaction, tUser, 'unwarn', reason);

            return { success: true, caseData: latestCase, targetId };
        } catch (error) {
            console.error('Ошибка в ModerationService.unwarnUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_unwarn', lang) };
        }
    }

    static async _sendUserDM(interaction, targetUser, action, reason, durationString = null) {
        if (!targetUser || !targetUser.send) return;
        try {
            const lang = interaction.guildLocale;
            const content = localeManager.get(`moderation.moderation.messages.dm_templates.${action}`, lang, {
                guildName: interaction.guild.name,
                reason: reason || localeManager.get('moderation.moderation.messages.no_reason', lang),
                duration: durationString || ''
            });
            await targetUser.send({ content });
        } catch (err) {
            // Игнорируем ошибки (закрытые ЛС)
        }
    }
}

ModerationService.sendVerdict = async function(interaction, action, targetUser, caseData, reason, durationString = null, evidence = null) {
    try {
        const cfg = Sdb.getSettings(interaction.guild.id);
        if (!cfg?.verdictChannelId) return;

        const channel = await interaction.client.channels.fetch(cfg.verdictChannelId).catch(() => null);
        if (!channel?.isTextBased()) return;

        const actionLabel = localeManager.get(`moderation.moderation.messages.labels.${action}`, interaction.guildLocale);

        const embed = EmbedService.createVerdictEmbed({
            action,
            label: actionLabel || action,
            color: EmbedService.BRAND_COLOR,
            caseNum: caseData?.caseNum ?? '?',
            targetId: targetUser?.id ?? '?',
            moderatorId: interaction.user.id,
            reason,
            evidence,
            durationString,
            timestamp: caseData?.timestamp,
            lang: interaction.guildLocale
        });

        await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    } catch (err) {
        console.error('[ModerationService] sendVerdict error:', err.message);
    }
};

module.exports = ModerationService;
