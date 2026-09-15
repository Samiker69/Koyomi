const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, ChannelType } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription(localeManager.get('moderation.channel.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.channel.description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('lock')
                .setDescription(localeManager.get('moderation.channel.options.lock.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.channel.options.lock.description'))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(localeManager.get('moderation.channel.options.lock.options.channel.description', 'en-US'))
                        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.channel.options.lock.options.channel.description'))
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement)
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlock')
                .setDescription(localeManager.get('moderation.channel.options.unlock.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.channel.options.unlock.description'))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(localeManager.get('moderation.channel.options.unlock.options.channel.description', 'en-US'))
                        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.channel.options.unlock.options.channel.description'))
                         .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement)
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('slowmode')
                .setDescription(localeManager.get('moderation.channel.options.slowmode.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.channel.options.slowmode.description'))
                .addIntegerOption(option =>
                    option.setName('seconds')
                        .setDescription(localeManager.get('moderation.channel.options.slowmode.options.seconds.description', 'en-US'))
                        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.channel.options.slowmode.options.seconds.description'))
                        .setMinValue(0)
                        .setMaxValue(21600)
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription(localeManager.get('moderation.channel.options.slowmode.options.channel.description', 'en-US'))
                        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.channel.options.slowmode.options.channel.description'))
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildMedia)
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        const lang = interaction.guildLocale;
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ 
                content: localeManager.get('moderation.channel.messages.no_perms_manage', lang), 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
        const everyoneRole = interaction.guild.roles.everyone;

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels) ||
            !interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
             await interaction.reply({ 
                content: localeManager.get('moderation.channel.messages.bot_no_perms', lang), 
                flags: MessageFlags.Ephemeral 
            });
             return;
        }
        if (!targetChannel.manageable) {
             await interaction.reply({ 
                content: localeManager.get('moderation.channel.messages.bot_no_perms_channel', lang, { channel: targetChannel.toString() }), 
                flags: MessageFlags.Ephemeral 
            });
             return;
        }


        switch (subcommand) {
            case 'lock': {
                if (targetChannel.type !== ChannelType.GuildText &&
                    targetChannel.type !== ChannelType.GuildVoice &&
                    targetChannel.type !== ChannelType.GuildAnnouncement) {
                    await interaction.reply({ 
                        content: localeManager.get('moderation.channel.messages.invalid_channel_type', lang, { channel: targetChannel.toString() }), 
                        flags: MessageFlags.Ephemeral 
                    });
                    return;
                }

                await interaction.deferReply();
                try {
                    const permissionOverwrite = targetChannel.type === ChannelType.GuildVoice ?
                                                 PermissionFlagsBits.Speak :
                                                 PermissionFlagsBits.SendMessages;

                    await targetChannel.permissionOverwrites.edit(everyoneRole, {
                        [permissionOverwrite]: false,
                    }, { reason: `Lock by ${interaction.user.username}` });
                    const embed = EmbedService.createBaseEmbed(interaction)
                        .setDescription(localeManager.get('moderation.channel.messages.lock_desc', lang, { channel: targetChannel.toString() }))
                        .addFields(
                            { name: localeManager.get('moderation.channel.messages.mod_label', lang), value: `${interaction.user}`, inline: true },
                            { name: localeManager.get('moderation.channel.messages.channel_label', lang), value: `${targetChannel}`, inline: true }
                        );

                    await interaction.editReply({ embeds: [embed] });

                } catch (error) {
                    console.error('Ошибка при блокировке канала:', error);
                     await interaction.editReply({ 
                        content: localeManager.get('moderation.channel.messages.lock_error', lang, { channel: targetChannel.toString() })
                    });
                }
                break;
            }

            case 'unlock': {
                 if (targetChannel.type !== ChannelType.GuildText &&
                     targetChannel.type !== ChannelType.GuildVoice &&
                     targetChannel.type !== ChannelType.GuildAnnouncement) {
                     await interaction.reply({ 
                        content: localeManager.get('moderation.channel.messages.invalid_channel_type', lang, { channel: targetChannel.toString() }), 
                        flags: MessageFlags.Ephemeral 
                    });
                     return;
                 }

                await interaction.deferReply();
                try {
                     const permissionOverwrite = targetChannel.type === ChannelType.GuildVoice ?
                                                  PermissionFlagsBits.Speak :
                                                  PermissionFlagsBits.SendMessages;

                    await targetChannel.permissionOverwrites.edit(everyoneRole, {
                        [permissionOverwrite]: null,
                    }, { reason: `Unlock by ${interaction.user.username}` });

                    const embed = EmbedService.createBaseEmbed(interaction)
                        .setDescription(localeManager.get('moderation.channel.messages.unlock_desc', lang, { channel: targetChannel.toString() }))
                        .addFields(
                            { name: localeManager.get('moderation.channel.messages.mod_label', lang), value: `${interaction.user}`, inline: true },
                            { name: localeManager.get('moderation.channel.messages.channel_label', lang), value: `${targetChannel}`, inline: true }
                        );

                    await interaction.editReply({ embeds: [embed] });

                } catch (error) {
                    console.error('Ошибка при разблокировке канала:', error);
                    await interaction.editReply({ 
                        content: localeManager.get('moderation.channel.messages.unlock_error', lang, { channel: targetChannel.toString() })
                    });
                }
                break;
            }

            case 'slowmode': {
                if (targetChannel.type !== ChannelType.GuildText &&
                    targetChannel.type !== ChannelType.GuildAnnouncement &&
                     targetChannel.type !== ChannelType.GuildForum &&
                      targetChannel.type !== ChannelType.GuildMedia) {
                    await interaction.reply({ 
                        content: localeManager.get('moderation.channel.messages.slowmode_invalid_type', lang, { channel: targetChannel.toString() }), 
                        flags: MessageFlags.Ephemeral 
                    });
                    return;
                }

                const seconds = interaction.options.getInteger('seconds');

                await interaction.deferReply();
                try {
                    await targetChannel.setRateLimitPerUser(seconds, `Slowmode by ${interaction.user.username}`);

                    const embed = EmbedService.createBaseEmbed(interaction)
                        .setDescription(seconds === 0 ?
                            localeManager.get('moderation.channel.messages.slowmode_off', lang, { channel: targetChannel.toString() }) :
                            localeManager.get('moderation.channel.messages.slowmode_on', lang, { channel: targetChannel.toString(), seconds: seconds })
                        )
                         .addFields(
                            { name: localeManager.get('moderation.channel.messages.mod_label', lang), value: `${interaction.user}`, inline: true },
                            { name: localeManager.get('moderation.channel.messages.channel_label', lang), value: `${targetChannel}`, inline: true }
                         );

                     if (seconds > 0) {
                          embed.addFields({ name: localeManager.get('moderation.channel.messages.slowmode_duration_label', lang), value: `${seconds} ${localeManager.get('moderation.case.messages.history_times', lang)}`, inline: true });
                     }


                    await interaction.editReply({ embeds: [embed] });

                } catch (error) {
                    console.error('Ошибка при установке слоумода:', error);
                    await interaction.editReply({ 
                        content: localeManager.get('moderation.channel.messages.slowmode_error', lang, { channel: targetChannel.toString() })
                    });
                }
                break;
            }

            default:
                await interaction.reply({ 
                    content: localeManager.get('moderation.channel.messages.unknown_sub', lang), 
                    flags: MessageFlags.Ephemeral 
                });
                break;
        }
    }
};