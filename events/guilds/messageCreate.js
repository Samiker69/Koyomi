const { Events, Collection, EmbedBuilder } = require('discord.js');
const { bot_log_channel } = require('../../config.json');
const DatabaseService = require('../../services/DatabaseService');
const localeManager = require('../../locales/localeManager');
const { MessageInteraction, parseArgs } = require('../../core/utils/messageToInteraction');

function findCommandAndSubcommand(client, typedWord, parts) {
    // 1. Прямое совпадение с корневой командой
    const directCmd = client.commands.get(typedWord);
    if (directCmd) {
        const options = directCmd.data.toJSON ? directCmd.data.toJSON().options : directCmd.data.options || [];

        // Проверяем первый параметр: это может быть группа субкоманд (тип 2)
        if (parts.length > 0) {
            const possibleGroupName = parts[0].toLowerCase();
            const groupOpt = (options || []).find(opt => opt.name === possibleGroupName && opt.type === 2);
            if (groupOpt) {
                // Если это группа, то следующий параметр должен быть субкомандой (тип 1) в этой группе
                if (parts.length > 1) {
                    const possibleSubName = parts[1].toLowerCase();
                    const subOpt = (groupOpt.options || []).find(opt => opt.name === possibleSubName && opt.type === 1);
                    if (subOpt) {
                        return {
                            commandName: directCmd.data.name,
                            subcommandGroupName: groupOpt.name,
                            subcommandName: subOpt.name,
                            args: parts.slice(2)
                        };
                    }
                }
                // Если субкоманда не передана или не найдена
                return {
                    commandName: directCmd.data.name,
                    subcommandGroupName: groupOpt.name,
                    subcommandName: null,
                    args: parts.slice(1)
                };
            }

            // Проверяем, может это прямая субкоманда (тип 1) без группы
            const possibleSubName = parts[0].toLowerCase();
            const subOpt = (options || []).find(opt => opt.name === possibleSubName && opt.type === 1);
            if (subOpt) {
                return {
                    commandName: directCmd.data.name,
                    subcommandGroupName: null,
                    subcommandName: subOpt.name,
                    args: parts.slice(1)
                };
            }
        }

        return {
            commandName: directCmd.data.name,
            subcommandGroupName: null,
            subcommandName: null,
            args: parts
        };
    }

    // 2. Поиск субкоманды (короткий вызов по имени субкоманды)
    for (const [name, cmd] of client.commands) {
        const options = cmd.data.toJSON ? cmd.data.toJSON().options : cmd.data.options || [];

        // Сначала ищем по группам субкоманд
        const groups = (options || []).filter(opt => opt.type === 2);
        for (const g of groups) {
            const sub = (g.options || []).find(s => s.name === typedWord && s.type === 1);
            if (sub) {
                return {
                    commandName: name,
                    subcommandGroupName: g.name,
                    subcommandName: sub.name,
                    args: parts
                };
            }
        }

        // Если не в группах, ищем среди прямых субкоманд
        const sub = (options || []).find(s => s.name === typedWord && s.type === 1);
        if (sub) {
            return {
                commandName: name,
                subcommandGroupName: null,
                subcommandName: sub.name,
                args: parts
            };
        }
    }

    return null;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // 1. Получаем префикс сервера
        const settings = await DatabaseService.getSettings(message.guild.id) || {};
        const prefix = settings.prefix || '..';

        // 2. Проверяем префикс
        if (!message.content.startsWith(prefix)) return;

        const content = message.content.slice(prefix.length).trim();
        if (!content) return;

        // 3. Выделяем команду и аргументы
        const allParts = parseArgs(content);
        if (allParts.length === 0) return;

        const typedWord = allParts[0].toLowerCase();
        const parts = allParts.slice(1);

        // 4. Ищем команду/субкоманду
        const match = findCommandAndSubcommand(message.client, typedWord, parts);
        if (!match) {
            // Если не команда — проверяем, возможно это сохраненный тег!
            try {
                const tag = await DatabaseService.getTag(message.guild.id, typedWord);
                if (tag) {
                    const channelId = Number(message.channel.id);
                    if (tag.allowedChannelId && tag.allowedChannelId.length > 0 && !tag.allowedChannelId.includes(channelId)) {
                        return;
                    }
                    if (tag.disallowedChannelsId && tag.disallowedChannelsId.length > 0 && tag.disallowedChannelsId.includes(channelId)) {
                        return;
                    }
                    if (message.reference && message.reference.messageId) {
                        try {
                            const referencedMsg = await message.channel.messages.fetch(message.reference.messageId);
                            const replyContent = referencedMsg.author.bot 
                                ? tag.content 
                                : `<@${referencedMsg.author.id}>\n${tag.content}`;
                            await referencedMsg.reply({ 
                                content: replyContent,
                                allowedMentions: { repliedUser: !referencedMsg.author.bot, parse: ['users'] }
                            });
                        } catch (refErr) {
                            await message.reply({ content: tag.content, allowedMentions: { repliedUser: true, parse: ['users'] } });
                        }
                    } else {
                        await message.reply({ content: tag.content, allowedMentions: { repliedUser: true, parse: ['users'] } });
                    }
                    return;
                }
            } catch (tagError) {
                console.error('[Tags Error] Failed to retrieve tag:', tagError);
            }
            return; // Если и не тег - это префикс, игнорируем
        }

        const { commandName, subcommandGroupName, subcommandName, args } = match;
        const command = message.client.commands.get(commandName);
        const preferredLang = settings.language || message.guild.preferredLocale || 'ru';

        // 5. Проверяем, не отключена ли команда
        if (await DatabaseService.isDisabled(message.guild.id, commandName, message.author.id)) {
            await message.reply({
                content: localeManager.get('events.errors.command_disabled', preferredLang, { commandName }),
                allowedMentions: { repliedUser: false, parse: [] }
            });
            return;
        }

        // 6. Кулдауны
        const { cooldowns } = message.client;
        if (!cooldowns.has(commandName)) {
            cooldowns.set(commandName, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(commandName);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return await message.reply({
                    content: localeManager.get('events.errors.cooldown', preferredLang, {
                        commandName: command.data.name,
                        timestamp: expiredTimestamp
                    }),
                    allowedMentions: { repliedUser: false, parse: [] }
                });
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        // 7. Создаем mock-взаимодействие (MessageInteraction) и выполняем
        const interactionMock = new MessageInteraction(message, commandName, subcommandGroupName, subcommandName, args, preferredLang);

        // 7.5 Валидация обязательных параметров для префиксных команд
        const rootOptions = (command.data.toJSON ? command.data.toJSON().options : command.data.options) || [];

        // Проверяем, требует ли команда вызова субкоманды (когда корневая команда содержит только субкоманды/группы)
        const subcommands = rootOptions.filter(opt => opt.type === 1);
        const subcommandGroups = rootOptions.filter(opt => opt.type === 2);
        const hasSubcommandsOrGroups = subcommands.length > 0 || subcommandGroups.length > 0;

        if (hasSubcommandsOrGroups && !subcommandName) {
            const availableUsage = [];
            for (const sub of subcommands) {
                availableUsage.push(sub.name);
            }
            for (const group of subcommandGroups) {
                const groupSubs = group.options || [];
                for (const sub of groupSubs) {
                    availableUsage.push(`${group.name} ${sub.name}`);
                }
            }

            const paramText = localeManager.get('events.errors.subcommand_param', preferredLang);
            const usageLabel = localeManager.get('events.errors.usage', preferredLang);
            const availLabel = localeManager.get('events.errors.available_subcommands', preferredLang);

            const header = localeManager.get('events.errors.missing_arguments', preferredLang, {
                params: paramText
            });

            const availableList = availableUsage.map(cmd => `\`${cmd}\``).join(', ');
            const errorText = `${header}\n**${usageLabel}:** \`${prefix}${commandName} ${paramText}\`\n**${availLabel}:** ${availableList}`;

            await message.reply({ content: errorText, allowedMentions: { repliedUser: false, parse: [] } });
            return;
        }

        let activeOptions = [];
        if (subcommandGroupName) {
            const groupOption = rootOptions.find(opt => opt.name === subcommandGroupName && opt.type === 2);
            if (groupOption && subcommandName) {
                const subOption = (groupOption.options || []).find(opt => opt.name === subcommandName && opt.type === 1);
                if (subOption) {
                    activeOptions = subOption.options || [];
                }
            }
        } else if (subcommandName) {
            const subOption = rootOptions.find(opt => opt.name === subcommandName && opt.type === 1);
            if (subOption) {
                activeOptions = subOption.options || [];
            }
        } else {
            activeOptions = rootOptions.filter(opt => opt.type !== 1 && opt.type !== 2);
        }

        const missingRequired = activeOptions.filter(opt => opt.required && interactionMock.options.parsed[opt.name] === null);
        if (missingRequired.length > 0) {
            const paramsList = missingRequired.map(opt => `<${opt.name}>`).join(', ');
            let usage = `${prefix}${commandName}`;
            if (subcommandGroupName) {
                usage += ` ${subcommandGroupName}`;
            }
            if (subcommandName) {
                usage += ` ${subcommandName}`;
            }
            for (const opt of activeOptions) {
                if (opt.required) {
                    usage += ` <${opt.name}>`;
                } else {
                    usage += ` [${opt.name}]`;
                }
            }

            const errorText = localeManager.get('events.errors.missing_arguments', preferredLang, {
                params: paramsList
            }) + `\n**${preferredLang === 'ru' ? 'Использование' : 'Usage'}:** \`${usage}\``;

            await message.reply({ content: errorText, allowedMentions: { repliedUser: false, parse: [] } });
            return;
        }

        try {
            await command.execute(interactionMock);
        } catch (error) {
            console.error(`[Prefix Command Error] ${commandName}:`, error);

            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(localeManager.get('events.interaction_log.title', preferredLang))
                .addFields(
                    { name: localeManager.get('events.interaction_log.command_label', preferredLang), value: `${commandName} (Prefix)` },
                    { name: localeManager.get('events.interaction_log.error_label', preferredLang), value: `\`\`\`txt\n${(error.stack || error.message).slice(0, 1000)}\n\`\`\`` }
                )
                .setTimestamp(new Date());

            try {
                const logChannel = await message.client.channels.fetch(bot_log_channel).catch(() => null);
                if (logChannel && logChannel.isTextBased()) {
                    await logChannel.send({ embeds: [errorEmbed] });
                }
            } catch (logErr) {
                console.error('[Logger Error] Could not send to log channel:', logErr.message);
            }

            const errorMessage = localeManager.get('events.errors.command_error', preferredLang);
            try {
                if (interactionMock.replied || interactionMock.deferred) {
                    await interactionMock.followUp({ content: errorMessage });
                } else {
                    await interactionMock.reply({ content: errorMessage });
                }
            } catch (replyError) {
                console.error('[Error Handler] Failed to send error message to user:', replyError.message);
            }
        }
    },
};
