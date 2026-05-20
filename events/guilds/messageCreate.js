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
        const subcommands = (options || []).filter(opt => opt.type === 1);

        if (subcommands.length > 0 && parts.length > 0) {
            const possibleSubName = parts[0].toLowerCase();
            const sub = subcommands.find(s => s.name === possibleSubName);
            if (sub) {
                return {
                    commandName: directCmd.data.name,
                    subcommandName: sub.name,
                    args: parts.slice(1)
                };
            }
        }
        
        return {
            commandName: directCmd.data.name,
            subcommandName: null,
            args: parts
        };
    }

    // 2. Поиск субкоманды (короткий вызов)
    for (const [name, cmd] of client.commands) {
        const options = cmd.data.toJSON ? cmd.data.toJSON().options : cmd.data.options || [];
        const subcommands = (options || []).filter(opt => opt.type === 1);
        const sub = subcommands.find(s => s.name === typedWord);
        
        if (sub) {
            return {
                commandName: name,
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
        if (!match) return; // Если не команда - это префикс, игнорируем

        const { commandName, subcommandName, args } = match;
        const command = message.client.commands.get(commandName);
        const preferredLang = settings.language || message.guild.preferredLocale || 'ru';

        // 5. Проверяем, не отключена ли команда
        if (await DatabaseService.isDisabled(message.guild.id, commandName, message.author.id)) {
            await message.reply({
                content: localeManager.get('events.errors.command_disabled', preferredLang, { commandName })
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
                    })
                });
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        // 7. Создаем mock-взаимодействие (MessageInteraction) и выполняем
        const interactionMock = new MessageInteraction(message, commandName, subcommandName, args, preferredLang);

        // 7.5 Валидация обязательных параметров для префиксных команд
        const rootOptions = (command.data.toJSON ? command.data.toJSON().options : command.data.options) || [];
        let activeOptions = [];
        if (subcommandName) {
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

            await message.reply({ content: errorText });
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
