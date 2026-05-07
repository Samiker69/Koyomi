const PermissionService = require('./PermissionService');
const ModerationDB = require('../functions/db/case');
const db = new ModerationDB();

class ModerationService {
    static async banUser(interaction, targetUser, reason) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'ban');
        if (!check.allowed) {
            return { success: false, error: check.reason };
        }

        const member = check.member;

        try {
            await member.ban({ reason: reason + ` | by ${interaction.user.username}(${interaction.user.id})` });
            
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'ban',
                reason: reason,
                timestamp: new Date()
            });

            const latestCase = db.getServerModCases(interaction.guild.id)[0];

            return { success: true, caseData: latestCase };
        } catch (error) {
            console.error('Ошибка в ModerationService.banUser:', error);
            return { success: false, error: "Произошла непредвиденная ошибка при попытке забанить пользователя." };
        }
    }

    static parseDuration(timeInput) {
        if (!timeInput) return { durationMs: null, durationString: "постоянно (до 28 дней)" };
        
        const timeRegex = /^(\d+)([mhdwy])$/i;
        const match = timeInput.match(timeRegex);
        if (!match) return { error: "Неверный формат времени. Используйте цифру и единицу (m/h/d/w), например: `10m`, `1h`, `7d`, `2w`." };

        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        let multiplier = 0;
        let durationString = "";

        switch (unit) {
            case 'm': multiplier = 60 * 1000; durationString = `${amount} минут`; break;
            case 'h': multiplier = 60 * 60 * 1000; durationString = `${amount} часов`; break;
            case 'd': multiplier = 24 * 60 * 60 * 1000; durationString = `${amount} дней`; break;
            case 'w': multiplier = 7 * 24 * 60 * 60 * 1000; durationString = `${amount} недель`; break;
        }
        
        const durationMs = amount * multiplier;
        const maxDurationMs = 28 * 24 * 60 * 60 * 1000;

        if (durationMs > maxDurationMs) {
            const overflowMs = durationMs - maxDurationMs;
            let overflowString = '';
            let tempMs = overflowMs;
            if (tempMs >= 7 * 24 * 60 * 60 * 1000) { overflowString += `${Math.floor(tempMs / (7 * 24 * 60 * 60 * 1000))} нед `; tempMs %= (7 * 24 * 60 * 60 * 1000); }
            if (tempMs >= 24 * 60 * 60 * 1000) { overflowString += `${Math.floor(tempMs / (24 * 60 * 60 * 1000))} д `; tempMs %= (24 * 60 * 60 * 1000); }
            if (tempMs >= 60 * 60 * 1000) { overflowString += `${Math.floor(tempMs / (60 * 60 * 1000))} ч `; tempMs %= (60 * 60 * 1000); }
            if (tempMs >= 60 * 1000) { overflowString += `${Math.floor(tempMs / (60 * 1000))} м`; }
            return { error: `Вы не можете замьютить участника на ${durationString}! Максимальная длительность мута - 28 дней. Превышение: ${overflowString.trim()}.` };
        } else if (durationMs <= 0) {
            return { error: "Длительность мута должна быть положительной." };
        }

        return { durationMs, durationString };
    }

    static async muteUser(interaction, targetUser, timeInput, reason) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'mute');
        if (!check.allowed) return { success: false, error: check.reason };

        const parsedTime = this.parseDuration(timeInput);
        if (parsedTime.error) return { success: false, error: parsedTime.error };

        const { durationMs, durationString } = parsedTime;

        try {
            await check.member.timeout(durationMs, reason + ` | by ${interaction.user.username}(${interaction.user.id})`);
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'mute',
                reason: reason,
                timestamp: new Date(),
                duration: durationMs 
            });
            return { success: true, caseData: db.getServerModCases(interaction.guild.id)[0], durationString };
        } catch (error) {
            console.error('Ошибка в ModerationService.muteUser:', error);
            return { success: false, error: "Произошла непредвиденная ошибка при попытке замьютить пользователя." };
        }
    }

    static async kickUser(interaction, targetUser, reason) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'kick');
        if (!check.allowed) return { success: false, error: check.reason };

        try {
            await check.member.kick(reason + ` | by ${interaction.user.username}(${interaction.user.id})`);
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'kick',
                reason: reason,
                timestamp: new Date()
            });
            return { success: true, caseData: db.getServerModCases(interaction.guild.id)[0] };
        } catch (error) {
            console.error('Ошибка в ModerationService.kickUser:', error);
            return { success: false, error: "Произошла непредвиденная ошибка при попытке кикнуть пользователя." };
        }
    }

    static async unmuteUser(interaction, targetUser, reason) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'unmute');
        if (!check.allowed) return { success: false, error: check.reason };

        try {
            await check.member.timeout(null, reason + ` | by ${interaction.user.username}(${interaction.user.id})`);
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'unmute',
                reason: reason,
                timestamp: new Date()
            });
            return { success: true, caseData: db.getServerModCases(interaction.guild.id)[0] };
        } catch (error) {
            console.error('Ошибка в ModerationService.unmuteUser:', error);
            return { success: false, error: "Произошла непредвиденная ошибка при попытке размутить пользователя." };
        }
    }

    static async unbanUser(interaction, userId, reason) {
        try {
            await interaction.guild.members.unban(userId, reason + ` | by ${interaction.user.username}(${interaction.user.id})`);
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: userId,
                moderatorId: interaction.user.id,
                action: 'unban',
                reason: reason,
                timestamp: new Date()
            });
            return { success: true, caseData: db.getServerModCases(interaction.guild.id)[0] };
        } catch (error) {
            if (error.code === 10026) return { success: false, error: "Участник не забанен" };
            console.error('Ошибка в ModerationService.unbanUser:', error);
            return { success: false, error: "Не удалось разбанить участника" };
        }
    }

    static async warnUser(interaction, targetUser, reason) {
        const check = await PermissionService.checkModerationTarget(interaction, targetUser, 'warn');
        if (!check.allowed) return { success: false, error: check.reason };

        try {
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetUser.id,
                moderatorId: interaction.user.id,
                action: 'warn',
                reason: reason,
                timestamp: new Date()
            });
            return { success: true, caseData: db.getServerModCases(interaction.guild.id)[0] };
        } catch (error) {
            console.error('Ошибка в ModerationService.warnUser:', error);
            return { success: false, error: "Не удалось выдать предупреждение участнику." };
        }
    }

    static async unwarnUser(interaction, targetUser, caseNum, reason) {
        let warnCase;
        let targetId;

        if (!targetUser) {
            warnCase = db.getModCase(interaction.guild.id, caseNum);
            if (!warnCase) return { success: false, error: "Не удалось найти кейс. Проверьте, что вы указали действительный номер кейса." };
            targetId = warnCase.targetId;
        } else {
            const cases = db.getTargetModCases(interaction.guild.id, targetUser.id);
            const warnCases = cases.filter(i => i.action === "warn");
            if (warnCases.length === 0) return { success: false, error: "У пользователя нет предупреждений." };
            warnCase = db.getModCase(interaction.guild.id, warnCases[0].caseNum);
            targetId = targetUser.id;
        }

        if (warnCase.action !== "warn") return { success: false, error: `Этот кейс не относится к предупреждениям! Это \`${warnCase.action}\`` };

        const targetUserObj = await interaction.client.users.fetch(targetId).catch(() => null) || { id: targetId };

        const check = await PermissionService.checkModerationTarget(interaction, targetUserObj, 'unwarn');
        if (!check.allowed) return { success: false, error: check.reason };

        const warns = db.getUserWarnings(interaction.guild.id, targetId);
        if (warns.true_warns <= 0) return { success: false, error: "У этого пользователя нет действующих наказаний!" };

        try {
            await db.addModCase({
                serverId: interaction.guild.id,
                targetId: targetId,
                moderatorId: interaction.user.id,
                action: 'unwarn',
                reason: reason,
                timestamp: new Date()
            });
            return { success: true, caseData: db.getServerModCases(interaction.guild.id)[0], targetId };
        } catch (error) {
            console.error('Ошибка в ModerationService.unwarnUser:', error);
            return { success: false, error: "Не удалось снять предупреждение." };
        }
    }
}

module.exports = ModerationService;
