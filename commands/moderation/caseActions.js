const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModerationDB = require('../../functions/db/case');
const LocaleManager = require('../../locales/localesManager');

const db = new ModerationDB();
const localeManager = new LocaleManager();

const data = new SlashCommandBuilder()
    .setName(localeManager.getString('commands.case.name'))
    .setDescription(localeManager.getString('commands.case.description'))
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.case.options.remove.name'))
        .setDescription(localeManager.getString('commands.case.options.remove.description'))
        .addIntegerOption(opt => 
            opt.setName(localeManager.getString('commands.case.options.remove.options.num.name'))
            .setDescription(localeManager.getString('commands.case.options.remove.options.num.description'))
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.case.options.reason.name'))
        .setDescription(localeManager.getString('commands.case.options.reason.description'))
        .addIntegerOption(opt => 
            opt.setName(localeManager.getString('commands.case.options.reason.options.num.name'))
            .setDescription(localeManager.getString('commands.case.options.reason.options.num.description'))
            .setMinValue(0)
            .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName(localeManager.getString('commands.case.options.reason.options.reason.name'))
            .setDescription(localeManager.getString('commands.case.options.reason.options.reason.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.case.options.view.name'))
        .setDescription(localeManager.getString('commands.case.options.view.description'))
        .addIntegerOption(opt => 
            opt.setName(localeManager.getString('commands.case.options.view.options.num.name'))
            .setDescription(localeManager.getString('commands.case.options.view.options.num.description'))
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.case.options.user_punishments.name'))
        .setDescription(localeManager.getString('commands.case.options.user_punishments.description'))
        .addUserOption(option =>
            option.setName(localeManager.getString('commands.case.options.user_punishments.options.user.name'))
                .setDescription(localeManager.getString('commands.case.options.user_punishments.options.user.description'))
                .setRequired(true)
        )
    ).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)


    module.exports = {
    cooldown: 3,
    data,
    async execute(interaction) {
        if (!(interaction.memberPermissions.has('BanMembers') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }

        const caseNum = interaction.options.getInteger('num');
        const reason = interaction.options.getString('reason');

        switch (interaction.options.getSubcommand()) {
            case "remove": {
                const Promise = db.deleteModCase(interaction.guild.id, caseNum)
                if (Promise) {
                    await interaction.reply(`Кейс \`#${caseNum}\` удалён`)
                } else {
                    await interaction.reply(`Кейс \`#${caseNum}\` не был удалён. Возможно, вы указали неверный номер кейса`)
                }
                break;
            }
            case "reason": {
                const Promise = db.updateModCaseReason(interaction.guild.id, caseNum, reason);
                if (Promise) {
                    await interaction.reply(`Причина кейса \`#${caseNum}\` обновлена`)
                } else {
                    await interaction.reply(`Причина кейса \`#${caseNum}\` не обновлена. Возможно, вы указали неверный номер кейса`)
                }
                break;
            }
            case "view": {
                const caseObj = db.getModCase(interaction.guild.id, caseNum);
                if (!caseObj) return await interaction.reply({ content: "Кейс не найден!", flags: MessageFlags.Ephemeral })

                const moderator = await interaction.guild.members.fetch(caseObj.moderatorId)
                let action;
                switch (caseObj.action) {
                    case "ban":
                        action = "Бан"
                        break;
                    case "mute":
                        action = "Мут"
                        break;
                    case "kick":
                        action = "Кик"
                        break;
                    case "unban":
                        action = "Разбан"
                        break;
                    case "unmute":
                        action = "Размут"
                        break;
                    default:
                        action = "?"
                        break;
                }

                const embed = new EmbedBuilder()
                .setColor(0x808080)
                .setTitle(`Case \`#${caseObj.caseNum}\``)
                .setThumbnail(interaction.guild.iconURL() || null)
                .addFields(
                  { name: 'Модератор', value: `<@${caseObj.moderatorId}>`, inline: true },
                  { name: 'Пользователь', value: `<@${caseObj.targetId}>`, inline: true },
                  { name: 'Причина', value: caseObj.reason, inline: false },
                  { name: 'Время', value: `<t:${Math.floor(caseObj.timestamp / 1000)}:F>`, inline: true }
                )
                .setFooter({ text: action+' выполнен', iconURL: moderator.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp(caseObj.timestamp);

                await interaction.reply({ embeds: [embed] })
                break;
            }
            case "user_punishments": {
                const targetUser = interaction.options.getUser('user');
                const modCases = db.getTargetModCases(interaction.guild.id, targetUser.id);

                const embed = new EmbedBuilder()
                    .setColor(0x9B59B6)
                    .setTitle(`История наказаний для ${targetUser.username}`)
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                if (!modCases || modCases.length === 0) {
                    embed.setDescription(`У **${targetUser.username}** нет зарегистрированных наказаний на этом сервере.`);
                    embed.setFooter({ text: `Пользователь не имеет наказаний` });
                    await interaction.reply({ embeds: [embed] });
                    return;
                }

                const counts = {};
                for (const modCase of modCases) {
                    const action = modCase.action.toLowerCase();
                    counts[action] = (counts[action] || 0) + 1;
                }

                const statsLines = Object.entries(counts)
                    .map(([action, count]) => `• **${action.charAt(0).toUpperCase() + action.slice(1)}**: ${count} раз(а)`)
                    .join('\n');

                const sortedCases = modCases.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                const maxDisplay = 10;
                const displayCases = sortedCases.slice(0, maxDisplay);

                const punishmentsText = displayCases
                    .map((modCase, index) => {
                        return `**#${modCase.caseNum}** — **${modCase.action.toUpperCase()}**: ${modCase.reason} (<t:${Math.floor(new Date(modCase.timestamp).getTime()/1000)}:R>)`;
                    })
                    .join('\n');

                const additionalText = sortedCases.length > maxDisplay
                    ? `\n\nПоказаны последние ${maxDisplay} наказаний из ${sortedCases.length}.`
                    : '';

                embed.setDescription(
                    `**Общая статистика наказаний:**\n${statsLines}\n\n` +
                    `**Последние ${displayCases.length} наказаний:**\n${punishmentsText}${additionalText}`
                );
                embed.setFooter({ text: `Всего зарегистрированных наказаний: ${modCases.length}` });

                await interaction.reply({ embeds: [embed] });
                break;
            }

            default:
                await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                break;
        }
    }
}