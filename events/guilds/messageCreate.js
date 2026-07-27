const { Events, EmbedBuilder } = require('discord.js');
const { bot_log_channel } = require('../../config.json');
const DatabaseService = require('../../database/repositories');
const localeManager = require('../../locales/localeManager');
const { MessageInteraction, parseArgs } = require('../../core/utils/messageToInteraction');
const Pipeline = require('../../core/middlewares/Pipeline');
const ContextMiddleware = require('../../core/middlewares/ContextMiddleware');
const PermissionMiddleware = require('../../core/middlewares/PermissionMiddleware');
const CooldownMiddleware = require('../../core/middlewares/CooldownMiddleware');
const pipeline = new Pipeline()
    .use(ContextMiddleware)
    .use(PermissionMiddleware)
    .use(CooldownMiddleware);
function findCommandAndSubcommand(client, typedWord, parts) {
    const directCmd = client.commands.get(typedWord);
    if (directCmd) {
        const options = directCmd.data.toJSON ? directCmd.data.toJSON().options : directCmd.data.options || [];
        if (parts.length > 0) {
            const possibleGroupName = parts[0].toLowerCase();
            const groupOpt = (options || []).find(opt => opt.name === possibleGroupName && opt.type === 2);
            if (groupOpt) {
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
                return {
                    commandName: directCmd.data.name,
                    subcommandGroupName: groupOpt.name,
                    subcommandName: null,
                    args: parts.slice(1)
                };
            }
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
    for (const [name, cmd] of client.commands) {
        const options = cmd.data.toJSON ? cmd.data.toJSON().options : cmd.data.options || [];
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
        const settings = await DatabaseService.getSettings(message.guild.id) || {};
        const prefix = settings.prefix || '..';
        if (!message.content.startsWith(prefix)) return;
        const content = message.content.slice(prefix.length).trim();
        if (!content) return;
        const allParts = parseArgs(content);
        if (allParts.length === 0) return;
        const typedWord = allParts[0].toLowerCase();
        const parts = allParts.slice(1);
        const match = findCommandAndSubcommand(message.client, typedWord, parts);
        if (!match) {
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
            return;
        }
        const { commandName, subcommandGroupName, subcommandName, args } = match;
        const command = message.client.commands.get(commandName);
        const preferredLang = settings.language || message.guild.preferredLocale || 'ru';
        const interactionMock = new MessageInteraction(message, commandName, subcommandGroupName, subcommandName, args, preferredLang);
        const rootOptions = (command.data.toJSON ? command.data.toJSON().options : command.data.options) || [];
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
            await pipeline.execute(interactionMock, async (ctx) => {
                await command.execute(ctx);
            });
        } catch (error) {
            console.error(`[Prefix Command Error] ${commandName}:`, error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(interactionMock.t('events.interaction_log.title') || 'Error')
                .addFields(
                    { name: interactionMock.t('events.interaction_log.command_label') || 'Command', value: `${commandName} (Prefix)` },
                    { name: interactionMock.t('events.interaction_log.error_label') || 'Error', value: `\`\`\`txt\n${(error.stack || error.message).slice(0, 1000)}\n\`\`\`` }
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
            const errorMessage = interactionMock.t('events.errors.command_error') || 'An error occurred while executing the command.';
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