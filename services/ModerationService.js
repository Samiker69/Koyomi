const PermissionService = require('./PermissionService');
const EmbedService = require('./EmbedService');
const GuildSettingsRepository = require('../database/repositories/GuildSettingsRepository');
const ModerationRepository = require('../database/repositories/ModerationRepository');
const localeManager = require('../locales/localeManager');
const UploadService = require('./UploadService');

class ModerationService {
    static async _processEvidence(interaction, evidence) {
        if (!evidence) return null;
        try {
            const uploadedUrl = await UploadService.upload(evidence, process.env.IMAGE_API_KEY);
            if (uploadedUrl) {
                return typeof evidence === 'string' ? uploadedUrl : { ...evidence, url: uploadedUrl };
            }
        } catch (error) {
            console.error('[ModerationService] Error processing evidence upload:', error);
        }
        return evidence;
    }

    static async banUser(interaction, targetUser, reason, evidence = null) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'ban');
        if (!check.allowed) {
            return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };
        }
        const processedEvidence = await this._processEvidence(interaction, evidence);
        const member = check.member;
        const resolvedUser = member ? member.user : (await interaction.client.users.fetch(targetUser.id).catch(() => targetUser));
        const banReason = reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` });
        await this._sendUserDM(interaction, resolvedUser, 'ban', reason);
        try {
            if (member) {
                await member.ban({ reason: banReason });
            } else {
                await interaction.guild.members.ban(resolvedUser.id, { reason: banReason });
            }
            const latestCase = await ModerationRepository.addModCase({
                serverId: interaction.guild.id,
                targetId: resolvedUser.id,
                moderatorId: interaction.user.id,
                action: 'ban',
                reason: reason,
                evidenceUrl: processedEvidence?.url || null,
                timestamp: new Date()
            });
            await ModerationService.sendVerdict(interaction, 'ban', resolvedUser, latestCase, reason, null, processedEvidence);
            return { success: true, caseData: latestCase };
        } catch (error) {
            console.error('Error in ModerationService.banUser:', error);
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
        const resolvedUser = check.member.user;
        const processedEvidence = await this._processEvidence(interaction, evidence);
        try {
            await this._sendUserDM(interaction, resolvedUser, 'mute', reason, durationString);
            await check.member.timeout(durationMs, reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` }));
            const latestCase = await ModerationRepository.addModCase({
                serverId: interaction.guild.id,
                targetId: resolvedUser.id,
                moderatorId: interaction.user.id,
                action: 'mute',
                reason: reason,
                evidenceUrl: processedEvidence?.url || null,
                timestamp: new Date(),
                duration: durationMs
            });
            await ModerationService.sendVerdict(interaction, 'mute', resolvedUser, latestCase, reason, durationString, processedEvidence);
            return { success: true, caseData: latestCase, durationString };
        } catch (error) {
            console.error('Error in ModerationService.muteUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_mute', interaction.guildLocale) };
        }
    }

    static async kickUser(interaction, targetUser, reason, evidence = null) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'kick');
        if (!check.allowed) return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };
        const resolvedUser = check.member.user;
        const processedEvidence = await this._processEvidence(interaction, evidence);
        try {
            await this._sendUserDM(interaction, resolvedUser, 'kick', reason);
            await check.member.kick(reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` }));
            const latestCase = await ModerationRepository.addModCase({
                serverId: interaction.guild.id,
                targetId: resolvedUser.id,
                moderatorId: interaction.user.id,
                action: 'kick',
                reason: reason,
                evidenceUrl: processedEvidence?.url || null,
                timestamp: new Date()
            });
            await ModerationService.sendVerdict(interaction, 'kick', resolvedUser, latestCase, reason, null, processedEvidence);
            return { success: true, caseData: latestCase };
        } catch (error) {
            console.error('Error in ModerationService.kickUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_kick', interaction.guildLocale) };
        }
    }

    static async unmuteUser(interaction, targetUser, reason, evidence = null) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'unmute');
        if (!check.allowed) return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };
        const resolvedUser = check.member.user;
        const processedEvidence = await this._processEvidence(interaction, evidence);
        try {
            await this._sendUserDM(interaction, resolvedUser, 'unmute', reason);
            await check.member.timeout(null, reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` }));
            const latestCase = await ModerationRepository.addModCase({
                serverId: interaction.guild.id,
                targetId: resolvedUser.id,
                moderatorId: interaction.user.id,
                action: 'unmute',
                reason: reason,
                evidenceUrl: processedEvidence?.url || null,
                timestamp: new Date()
            });
            await ModerationService.sendVerdict(interaction, 'unmute', resolvedUser, latestCase, reason, null, processedEvidence);
            return { success: true, caseData: latestCase };
        } catch (error) {
            console.error('Error in ModerationService.unmuteUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_unmute', interaction.guildLocale) };
        }
    }

    static async unbanUser(interaction, userId, reason, evidence = null) {
        const processedEvidence = await this._processEvidence(interaction, evidence);
        try {
            await interaction.guild.members.unban(userId, reason + localeManager.get('moderation.moderation.messages.by_moderator', interaction.guildLocale, { user: `${interaction.user.username}(${interaction.user.id})` }));
            const latestCase = await ModerationRepository.addModCase({
                serverId: interaction.guild.id,
                targetId: userId,
                moderatorId: interaction.user.id,
                action: 'unban',
                reason: reason,
                evidenceUrl: processedEvidence?.url || null,
                timestamp: new Date()
            });
            const targetUserObj = await interaction.client.users.fetch(userId).catch(() => ({ id: userId }));
            await ModerationService.sendVerdict(interaction, 'unban', targetUserObj, latestCase, reason, null, processedEvidence);
            await this._sendUserDM(interaction, targetUserObj, 'unban', reason);
            return { success: true, caseData: latestCase };
        } catch (error) {
            if (error.code === 10026) return { success: false, error: localeManager.get('moderation.moderation.messages.not_banned', interaction.guildLocale) };
            console.error('Error in ModerationService.unbanUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_unban', interaction.guildLocale) };
        }
    }

    static async warnUser(interaction, targetUser, reason, evidence = null) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'warn');
        if (!check.allowed) return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };
        const resolvedUser = check.member.user;
        const processedEvidence = await this._processEvidence(interaction, evidence);
        try {
            const latestCase = await ModerationRepository.addModCase({
                serverId: interaction.guild.id,
                targetId: resolvedUser.id,
                moderatorId: interaction.user.id,
                action: 'warn',
                reason: reason,
                evidenceUrl: processedEvidence?.url || null,
                timestamp: new Date()
            });
            await ModerationService.sendVerdict(interaction, 'warn', resolvedUser, latestCase, reason, null, processedEvidence);
            return { success: true, caseData: latestCase };
        } catch (error) {
            console.error('Error in ModerationService.warnUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_warn', interaction.guildLocale) };
        }
    }

    static async unwarnUser(interaction, targetUser, caseNum, reason, evidence = null) {
        let warnCase;
        let targetId;
        const lang = interaction.guildLocale;
        if (!targetUser) {
            warnCase = await ModerationRepository.getModCase(interaction.guild.id, caseNum);
            if (!warnCase) return { success: false, error: localeManager.get('moderation.moderation.messages.case_not_found', lang) };
            targetId = warnCase.targetId;
        } else {
            const cases = await ModerationRepository.getTargetModCases(interaction.guild.id, targetUser.id);
            const warnCases = cases.filter(i => i.action === "warn");
            if (warnCases.length === 0) return { success: false, error: localeManager.get('moderation.moderation.messages.no_warns', lang) };
            warnCase = await ModerationRepository.getModCase(interaction.guild.id, warnCases[0].caseNum);
            targetId = targetUser.id;
        }
        if (warnCase.action !== "warn") return { success: false, error: localeManager.get('moderation.moderation.messages.case_not_warn', lang, { action: warnCase.action }) };
        const targetUserObj = await interaction.client.users.fetch(targetId).catch(() => null) || { id: targetId };
        const check = await PermissionService.checkModerationTarget(interaction, targetUserObj, 'unwarn');
        if (!check.allowed) return { success: false, error: localeManager.get(check.reasonKey, interaction.guildLocale) };
        const warns = await ModerationRepository.getUserWarnings(interaction.guild.id, targetId);
        if (warns.true_warns <= 0) return { success: false, error: localeManager.get('moderation.moderation.messages.no_active_punishments', lang) };
        const processedEvidence = await this._processEvidence(interaction, evidence);
        try {
            const latestCase = await ModerationRepository.addModCase({
                serverId: interaction.guild.id,
                targetId: targetId,
                moderatorId: interaction.user.id,
                action: 'unwarn',
                reason: reason,
                evidenceUrl: processedEvidence?.url || null,
                timestamp: new Date()
            });
            const tUser = await interaction.client.users.fetch(targetId).catch(() => ({ id: targetId }));
            await ModerationService.sendVerdict(interaction, 'unwarn', tUser, latestCase, reason, null, processedEvidence);
            this._sendUserDM(interaction, tUser, 'unwarn', reason);
            return { success: true, caseData: latestCase, targetId };
        } catch (error) {
            console.error('Error in ModerationService.unwarnUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_unwarn', lang) };
        }
    }

    static async supportBanUser(interaction, targetUser, reason, evidence = null) {
        const lang = interaction.guildLocale;
        const roleId = await GuildSettingsRepository.getBannedRoleId(interaction.guild.id);
        if (!roleId) {
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_supportban_no_role', lang) };
        }
        let member;
        try {
            member = await interaction.guild.members.fetch(targetUser.id);
        } catch (e) {
            return { success: false, error: localeManager.get('moderation.moderation.messages.user_not_found', lang) };
        }
        const resolvedUser = member.user;
        const processedEvidence = await this._processEvidence(interaction, evidence);
        try {
            await member.roles.add(roleId);
        } catch (error) {
            console.error('Error in ModerationService.supportBanUser adding role:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_supportban', lang) };
        }
        try {
            const latestCase = await ModerationRepository.addModCase({
                serverId: interaction.guild.id,
                targetId: resolvedUser.id,
                moderatorId: interaction.user.id,
                action: 'supportban',
                reason: reason,
                evidenceUrl: processedEvidence?.url || null,
                timestamp: new Date()
            });
            await this._sendUserDM(interaction, resolvedUser, 'supportban', reason);
            await ModerationService.sendVerdict(interaction, 'supportban', resolvedUser, latestCase, reason, null, processedEvidence);
            return { success: true, caseData: latestCase, targetId: resolvedUser.id };
        } catch (error) {
            console.error('Error in ModerationService.supportBanUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_supportban', lang) };
        }
    }

    static async supportUnbanUser(interaction, targetUser, reason, evidence = null) {
        const lang = interaction.guildLocale;
        const roleId = await GuildSettingsRepository.getBannedRoleId(interaction.guild.id);
        if (!roleId) {
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_supportban_no_role', lang) };
        }
        let member;
        try {
            member = await interaction.guild.members.fetch(targetUser.id);
        } catch (e) {
            return { success: false, error: localeManager.get('moderation.moderation.messages.user_not_found', lang) };
        }
        const resolvedUser = member.user;
        const processedEvidence = await this._processEvidence(interaction, evidence);
        try {
            await member.roles.remove(roleId);
        } catch (error) {
            console.error('Error in ModerationService.supportUnbanUser removing role:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_supportunban', lang) };
        }
        try {
            const latestCase = await ModerationRepository.addModCase({
                serverId: interaction.guild.id,
                targetId: resolvedUser.id,
                moderatorId: interaction.user.id,
                action: 'supportunban',
                reason: reason,
                evidenceUrl: processedEvidence?.url || null,
                timestamp: new Date()
            });
            await this._sendUserDM(interaction, resolvedUser, 'supportunban', reason);
            await ModerationService.sendVerdict(interaction, 'supportunban', resolvedUser, latestCase, reason, null, processedEvidence);
            return { success: true, caseData: latestCase, targetId: resolvedUser.id };
        } catch (error) {
            console.error('Error in ModerationService.supportUnbanUser:', error);
            return { success: false, error: localeManager.get('moderation.moderation.messages.error_supportunban', lang) };
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
        } catch (err) {}
    }
}

ModerationService.sendVerdict = async function(interaction, action, targetUser, caseData, reason, durationString = null, evidence = null) {
    try {
        const cfg = await GuildSettingsRepository.getSettings(interaction.guild.id);
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
        const msg = await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
        if (msg && caseData && caseData.caseNum) {
            await ModerationRepository.updateModCaseLogMessageId(interaction.guild.id, caseData.caseNum, msg.id).catch(err => {
                console.error('[ModerationService] Failed to update mod case logMessageId:', err.message);
            });
        }
    } catch (err) {
        console.error('[ModerationService] sendVerdict error:', err.message);
    }
};

module.exports = ModerationService;