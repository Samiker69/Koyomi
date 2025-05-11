const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModerationDB = require('../../functions/db/case');
const db = new ModerationDB('./database/cases.db');
const {moderation} = require('../../locales/descriptions/moderation')

const data = new SlashCommandBuilder()
    .setName('case')
    .setDescription(moderation.case.description.ru)
    .addSubcommand(sub =>
        sub.setName('remove')
        .setDescription(moderation.case.options.description || "Удаляет кейс")
        .addIntegerOption(opt => 
            opt.setName('num')
            .setDescription(moderation.case.options.num.description.ru)
            .setDescriptionLocalizations(moderation.case.options.num.description)
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('reason')
        .setDescription("Сменить причину кейса")
        .addIntegerOption(opt => 
            opt.setName('num')
            .setDescription(moderation.case.options.num.description.ru)
            .setDescriptionLocalizations(moderation.case.options.num.description)
            .setMinValue(0)
            .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('reason')
            .setDescription(moderation.case.options.reason.description.ru)
            .setDescriptionLocalizations(moderation.case.options.reason.description)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('view')
        .setDescription("Показывает указанный кейс")
        .addIntegerOption(opt => 
            opt.setName('num')
            .setDescription(moderation.case.options.num.description.ru)
            .setDescriptionLocalizations(moderation.case.options.num.description)
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('user_punishments')
        .setDescription('Проверить историю наказаний пользователя')
        .addUserOption(option =>
            option.setName('user')
                .setDescription(moderation.case.options.user.description.ru)
                .setDescriptionLocalizations(moderation.case.options.user.description)
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
                const targetUser = interaction.options.getUser('пользователь');
                const modCases = db.getTargetModCases(interaction.guild.id, targetUser.id);
                
                if (!modCases || modCases.length === 0) {
                    await interaction.reply({ content: `У ${targetUser} нет наказаний`, flsgs: MessageFlags.Ephemeral });
                    return;
                }
                
                const counts = {};
                for (const modCase of modCases) {
                    const action = modCase.action.toLowerCase();
                    counts[action] = (counts[action] || 0) + 1;
                }
                const statsLines = Object.entries(counts)
                    .map(([action, count]) => `${action.charAt(0).toUpperCase() + action.slice(1)}: ${count}`)
                    .join('\n');
                
                const sortedCases = modCases.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                const maxDisplay = 10;
                const displayCases = sortedCases.slice(0, maxDisplay);
                const punishmentsText = displayCases
                    .map((modCase, index) => {
                        return `**#${index + 1}** — **${modCase.action.toUpperCase()}**: ${modCase.reason} (<t:${Math.floor(new Date(modCase.timestamp).getTime()/1000)}:F>)`;
                    })
                    .join('\n');
                const additionalText = sortedCases.length > maxDisplay 
                    ? `\n\nПоказаны последние ${maxDisplay} наказаний из ${sortedCases}.`
                    : '';
                
                const embed = new EmbedBuilder()
                    .setColor(0x3498db)
                    .setTitle(`История наказаний для ${targetUser}`)
                    .setDescription(`**Общая статистика:**\n${statsLines}\n\n**Последние наказания:**\n${punishmentsText}${additionalText}`)
                    .setFooter({ text: `Всего наказаний ${modCases.length}` })
                    .setTimestamp(new Date())
                
                await interaction.reply({ embeds: [embed] });
                break;
            }
        
            default:
                await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                break;
        }
    }
}