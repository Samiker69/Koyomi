const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModerationDB = require('../../functions/db/case');
const db = new ModerationDB();
const ModerationService = require('../../services/ModerationService');
const EmbedService = require('../../services/EmbedService');
const data = new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('all mod-type command')
    .addSubcommand(sub =>
        sub.setName('ban')
            .setDescription('Забанить пользователя на сервере')
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь для бана')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Причина бана')
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('доказательства')
                    .setDescription('Прикрепите доказательства (если есть)')
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('mute')
            .setDescription('Замьютить пользователя')
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь для мута')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('время')
                    .setDescription('Длительность мута (например, 10m, 1h, 7d, 2w). Макс. 28 дней.')
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Причина мута')
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('доказательства')
                    .setDescription('Прикрепите доказательства (если есть)')
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('kick')
            .setDescription('Кикнуть пользователя с сервера')
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь для кика')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Причина кика')
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('доказательства')
                    .setDescription('Прикрепите доказательства (если есть)')
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('unmute')
            .setDescription('Снять мут (таймаут) с пользователя')
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь, у которого снимают мут')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Причина снятия мута')
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('доказательства')
                    .setDescription('Прикрепите доказательства (если есть)')
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('unban')
            .setDescription('Разбанить пользователя по ID')
            .addUserOption(option =>
                option.setName('userid')
                    .setDescription('ID пользователя для разбанивания')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Причина разбана')
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('evidence')
                    .setDescription('Прикрепите доказательства (если есть)')
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('warn')
            .setDescription('Выдать предупреждение пользователю')
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь для предупреждения')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Причина предупреждения')
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('доказательства')
                    .setDescription('Прикрепите доказательства (если есть)')
                    .setRequired(false)
            )
    )
    .addSubcommand(sub =>
        sub.setName('unwarn')
            .setDescription('Снять предупреждение пользователя')
            .addUserOption(option =>
                option.setName('пользователь')
                    .setDescription('Пользователь для снятия последнего предупреждения')
                    .setRequired(false)
            )
            .addNumberOption(option =>
                option.setName('кейс')
                    .setDescription('Номер кейса с предупреждением, которое надо снять')
                    .setRequired(false)
            )
            .addStringOption(option =>
                option.setName('причина')
                    .setDescription('Причина снятия предупреждения')
                    .setRequired(false)
            )
            .addAttachmentOption(option =>
                option.setName('доказательства')
                    .setDescription('Прикрепите доказательства (если есть)')
                    .setRequired(false)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)


module.exports = {
    cooldown: 3,
    data,
    async execute(interaction) {
        if (!(interaction.memberPermissions.has('KickMembers') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }
        if (!interaction.guild.members.me.permissions.has('BanMembers')) {
            await interaction.reply({ content: "У меня недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "ban": {
                if (!interaction.memberPermissions.has('BanMembers')) {
                    return await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                }
                const targetUser = interaction.options.getUser('пользователь');
                const reason = interaction.options.getString('причина') || 'Без причины';
                const evidence = interaction.options.getAttachment('доказательства');

                const result = await ModerationService.banUser(interaction, targetUser, reason);

                if (!result.success) {
                    return await interaction.reply({ content: result.error, flags: MessageFlags.Ephemeral });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: 0xff0000,
                    footerText: 'Бан выполнен'
                });

                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "mute": {
                if (!(interaction.memberPermissions.has('MuteMembers') || interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers))) {
                    return await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                }
                await interaction.deferReply();

                const targetUser = interaction.options.getUser('пользователь');
                const timeInput = interaction.options.getString('время');
                const reason = interaction.options.getString('причина') || "Без причины";
                const evidence = interaction.options.getAttachment('доказательства');

                const result = await ModerationService.muteUser(interaction, targetUser, timeInput, reason);
                if (!result.success) {
                    return await interaction.editReply({ content: result.error });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: 0x808080,
                    footerText: 'Мут выполнен',
                    durationString: result.durationString
                });

                await interaction.editReply({ embeds: [embed] });
                break;
            }
            case "kick": {
                if (!interaction.memberPermissions.has('KickMembers')) {
                    return await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                }
                const targetUser = interaction.options.getUser('пользователь');
                const reason = interaction.options.getString('причина') || 'Без причины';
                const evidence = interaction.options.getAttachment('доказательства');

                const result = await ModerationService.kickUser(interaction, targetUser, reason);
                if (!result.success) {
                    return await interaction.reply({ content: result.error, flags: MessageFlags.Ephemeral });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: 0xffa500,
                    footerText: 'Кик выполнен'
                });

                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "unmute": {
                if (!interaction.memberPermissions.has('ModerateMembers') && !interaction.memberPermissions.has('MuteMembers')) {
                    return await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                }
                const targetUser = interaction.options.getUser('пользователь');
                const reason = interaction.options.getString('причина') || 'Без причины';
                const evidence = interaction.options.getAttachment('доказательства');

                const result = await ModerationService.unmuteUser(interaction, targetUser, reason);
                if (!result.success) {
                    return await interaction.reply({ content: result.error, flags: MessageFlags.Ephemeral });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: 0x00ff00,
                    footerText: 'Размут выполнен'
                });

                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "unban": {
                if (!interaction.memberPermissions.has('BanMembers')) {
                    return await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                }
                const user = interaction.options.getUser('userid');
                const reason = interaction.options.getString('reason') || 'Без причины';
                const evidence = interaction.options.getAttachment('evidence');

                const result = await ModerationService.unbanUser(interaction, user.id, reason);
                if (!result.success) {
                    return await interaction.reply({ content: result.error, flags: MessageFlags.Ephemeral });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: user.id,
                    reason,
                    evidence,
                    color: 0x00ff00,
                    footerText: 'Разбан выполнен'
                });

                await interaction.reply({ embeds: [embed] });
                break;
            }
            case "warn": {
                if (!(interaction.memberPermissions.has('KickMembers') || interaction.memberPermissions.has('Administrator'))) {
                    return await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                }
                await interaction.deferReply();

                const targetUser = interaction.options.getUser('пользователь');
                const reason = interaction.options.getString('причина') || 'Без причины';
                const evidence = interaction.options.getAttachment('доказательства');

                const result = await ModerationService.warnUser(interaction, targetUser, reason);
                if (!result.success) {
                    return await interaction.editReply({ content: result.error });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: targetUser.id,
                    reason,
                    evidence,
                    color: 0xffa500,
                    footerText: 'Предупреждение выдано'
                });

                await interaction.editReply({ embeds: [embed] });
                break;
            }
            case "unwarn": {
                if (!(interaction.memberPermissions.has('KickMembers') || interaction.memberPermissions.has('Administrator'))) {
                    return await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                }
                await interaction.deferReply();

                const targetUser = interaction.options.getUser('пользователь');
                const caseNum = interaction.options.getNumber('кейс');
                const reason = interaction.options.getString('причина') || 'Без причины';
                const evidence = interaction.options.getAttachment('доказательства');

                const result = await ModerationService.unwarnUser(interaction, targetUser, caseNum, reason);
                if (!result.success) {
                    return await interaction.editReply({ content: result.error });
                }

                const embed = EmbedService.createModerationEmbed({
                    interaction,
                    caseNum: result.caseData.caseNum,
                    targetId: result.targetId,
                    reason,
                    evidence,
                    color: 0x00ff00,
                    footerText: 'Предупреждение снято'
                });

                await interaction.editReply({ embeds: [embed] });
                break;
            }
            default:
                await interaction.reply({ content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral })
                break;
        }
    }
}

async function sendPunishmentToUserChannel(userId) {

}