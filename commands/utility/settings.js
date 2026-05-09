const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    MessageFlags, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ChannelSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ComponentType
} = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const Settings = require('../../functions/db/settings');
const { bot_log_channel } = require('../../config.json');
const localeManager = require('../../locales/localeManager');

const Sdb = new Settings();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setNameLocalizations(localeManager.getLocalizations('utility.settings.name'))
        .setDescription(localeManager.get('utility.settings.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.settings.description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const initialCfg = Sdb.getSettings(guildId) || {};
        let lang = initialCfg.language || interaction.guildLocale || 'ru';

        const generateDashboard = () => {
            const cfg = Sdb.getSettings(guildId) || {}; 
            lang = cfg.language || interaction.guildLocale || 'ru';

            const statusInvites = cfg.allowInviteLogging ? localeManager.get('utility.settings.messages.enabled', lang) : localeManager.get('utility.settings.messages.disabled', lang);
            const statusMembers = cfg.allowLogingMembersAdd ? localeManager.get('utility.settings.messages.enabled', lang) : localeManager.get('utility.settings.messages.disabled', lang);
            
            const valWelcome = cfg.newMemberChannelId ? `<#${cfg.newMemberChannelId}>` : localeManager.get('utility.settings.messages.not_set', lang);
            const valInvites = cfg.inviteLoggerChannel ? `<#${cfg.inviteLoggerChannel}>` : localeManager.get('utility.settings.messages.not_set', lang);
            const valVoiceCat = cfg.voiceCategoryId ? `<#${cfg.voiceCategoryId}>` : localeManager.get('utility.settings.messages.not_set_fem', lang);
            const valVoiceMain = cfg.mainVoiceChannelId ? `<#${cfg.mainVoiceChannelId}>` : localeManager.get('utility.settings.messages.not_set', lang);
            const valSupport = cfg.supportChannelId ? `<#${cfg.supportChannelId}>` : localeManager.get('utility.settings.messages.not_set', lang);
            const valReports = cfg.reportsModerationChannelId ? `<#${cfg.reportsModerationChannelId}>` : localeManager.get('utility.settings.messages.not_set', lang);
            const valHoneypot = cfg.honeypotChannelId ? `<#${cfg.honeypotChannelId}>` : localeManager.get('utility.settings.messages.not_set', lang);
            const valHoneypotLog = cfg.honeypotLogChannelId ? `<#${cfg.honeypotLogChannelId}>` : localeManager.get('utility.settings.messages.not_set', lang);
            const statusHoneypot = cfg.honeypotEnabled ? localeManager.get('utility.settings.messages.enabled', lang) : localeManager.get('utility.settings.messages.disabled', lang);
            const valVerdict = cfg.verdictChannelId ? `<#${cfg.verdictChannelId}>` : localeManager.get('utility.settings.messages.not_set', lang);

            const settingsEmbed = EmbedService.createBaseEmbed(interaction)
                .setTitle(localeManager.get('utility.settings.messages.dashboard_title', lang, { name: interaction.guild.name }))
                .setDescription(localeManager.get('utility.settings.messages.dashboard_desc', lang))
                .addFields(
                    { 
                        name: localeManager.get('utility.settings.messages.welcome_logs', lang), 
                        value: `> **${localeManager.get('utility.settings.messages.welcome_channel', lang)}:** ${valWelcome}\n` +
                               `> **${localeManager.get('utility.settings.messages.invite_log', lang)}:** ${valInvites}\n` +
                               `> **${localeManager.get('utility.settings.messages.notify_join', lang)}:** ${statusMembers}\n` +
                               `> **${localeManager.get('utility.settings.messages.notify_invites', lang)}:** ${statusInvites}`, 
                        inline: false 
                    },
                    { 
                        name: localeManager.get('utility.settings.messages.voice_rooms', lang), 
                        value: `> **${localeManager.get('utility.settings.messages.category', lang)}:** ${valVoiceCat}\n` +
                               `> **${localeManager.get('utility.settings.messages.create_room', lang)}:** ${valVoiceMain}`, 
                        inline: false 
                    },
                    { 
                        name: localeManager.get('utility.settings.messages.support_reports', lang), 
                        value: `> **${localeManager.get('utility.settings.messages.support_channel', lang)}:** ${valSupport}\n` +
                               `> **${localeManager.get('utility.settings.messages.reports_channel', lang)}:** ${valReports}\n` +
                               `> **${localeManager.get('utility.settings.messages.verdict_channel', lang)}:** ${valVerdict}`, 
                        inline: false 
                    },
                    { 
                        name: localeManager.get('utility.settings.messages.honeypot', lang), 
                        value: `> **${localeManager.get('utility.settings.messages.trap_channel', lang)}:** ${valHoneypot}\n` +
                               `> **${localeManager.get('utility.settings.messages.log_channel', lang)}:** ${valHoneypotLog}\n` +
                               `> **${localeManager.get('utility.settings.messages.status', lang)}:** ${statusHoneypot}`, 
                        inline: false 
                    }
                )
                .setFooter({ text: localeManager.get('utility.settings.messages.footer', lang) });

            const rowWelcome = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('select_welcome')
                    .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_welcome', lang))
                    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            );

            const rowVoice = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('select_voice_main')
                    .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_voice', lang))
                    .setChannelTypes(ChannelType.GuildVoice)
            );
            
            const rowOtherChannels = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_actions')
                    .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_extra', lang))
                    .addOptions(
                        { label: localeManager.get('utility.settings.messages.act_cat.label', lang), description: localeManager.get('utility.settings.messages.act_cat.description', lang), value: 'act_cat' },
                        { label: localeManager.get('utility.settings.messages.act_log.label', lang), description: localeManager.get('utility.settings.messages.act_log.description', lang), value: 'act_log' },
                        { label: localeManager.get('utility.settings.messages.act_sup.label', lang), description: localeManager.get('utility.settings.messages.act_sup.description', lang), value: 'act_sup' },
                        { label: localeManager.get('utility.settings.messages.act_rep.label', lang), description: localeManager.get('utility.settings.messages.act_rep.description', lang), value: 'act_rep' },
                        { label: localeManager.get('utility.settings.messages.act_verdict.label', lang), description: localeManager.get('utility.settings.messages.act_verdict.description', lang), value: 'act_verdict' },
                        { label: localeManager.get('utility.settings.messages.act_honeypot.label', lang), description: localeManager.get('utility.settings.messages.act_honeypot.description', lang), value: 'act_honeypot' },
                        { label: localeManager.get('utility.settings.messages.act_honeypot_log.label', lang), description: localeManager.get('utility.settings.messages.act_honeypot_log.description', lang), value: 'act_honeypot_log' },
                        { label: localeManager.get('utility.settings.messages.act_lang.label', lang), description: localeManager.get('utility.settings.messages.act_lang.description', lang), value: 'act_lang' },
                        { label: localeManager.get('utility.settings.messages.act_reset.label', lang), description: localeManager.get('utility.settings.messages.act_reset.description', lang), value: 'act_reset' }
                    )
            );

            const rowToggles = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('toggle_invites')
                    .setLabel(localeManager.get('utility.settings.messages.toggle_invites', lang, { state: cfg.allowInviteLogging ? localeManager.get('utility.settings.messages.on', lang) : localeManager.get('utility.settings.messages.off', lang) }))
                    .setStyle(cfg.allowInviteLogging ? ButtonStyle.Success : ButtonStyle.Secondary),
                
                new ButtonBuilder()
                    .setCustomId('toggle_members')
                    .setLabel(localeManager.get('utility.settings.messages.toggle_members', lang, { state: cfg.allowLogingMembersAdd ? localeManager.get('utility.settings.messages.on', lang) : localeManager.get('utility.settings.messages.off', lang) }))
                    .setStyle(cfg.allowLogingMembersAdd ? ButtonStyle.Success : ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('toggle_honeypot')
                    .setLabel(localeManager.get('utility.settings.messages.toggle_honeypot', lang, { state: cfg.honeypotEnabled ? localeManager.get('utility.settings.messages.on', lang) : localeManager.get('utility.settings.messages.off', lang) }))
                    .setStyle(cfg.honeypotEnabled ? ButtonStyle.Success : ButtonStyle.Secondary)
            );

            const rowLang = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_language')
                    .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_lang', lang))
                    .addOptions(
                        { label: localeManager.get('utility.settings.messages.lang_ru', lang), value: 'ru', default: cfg.language === 'ru' },
                        { label: localeManager.get('utility.settings.messages.lang_en', lang), value: 'en-US', default: cfg.language === 'en-US' },
                        { label: localeManager.get('utility.settings.messages.lang_uk', lang), value: 'uk', default: cfg.language === 'uk' }
                    )
            );

            return { embeds: [settingsEmbed], components: [rowWelcome, rowVoice, rowOtherChannels, rowLang, rowToggles] };
        };

        const msg = await interaction.reply({ 
            ...generateDashboard(), 
            flags: MessageFlags.Ephemeral 
        });

        const collector = msg.createMessageComponentCollector({ time: 300_000 });

        collector.on('collect', async i => {
            try {
                if (i.customId === 'menu_actions') {
                    const selection = i.values[0];
                    
                    if (selection === 'act_reset') {
                        Sdb.removeServer(guildId);
                        Sdb.addServer(guildId);
                        await i.update(generateDashboard());
                        return;
                    }

                    if (selection === 'act_lang') {
                        const langSelect = new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('temp_lang_select')
                                .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_lang', lang))
                                .addOptions(
                                    { label: localeManager.get('utility.settings.messages.lang_ru', lang), value: 'ru' },
                                    { label: localeManager.get('utility.settings.messages.lang_en', lang), value: 'en-US' },
                                    { label: localeManager.get('utility.settings.messages.lang_uk', lang), value: 'uk' }
                                )
                        );

                        const langMsg = await i.reply({
                            content: localeManager.get('utility.settings.messages.lang_title', lang),
                            components: [langSelect],
                            flags: MessageFlags.Ephemeral,
                            fetchReply: true
                        });

                        try {
                            const langInteraction = await langMsg.awaitMessageComponent({
                                filter: (subI) => subI.user.id === i.user.id,
                                time: 60000,
                                componentType: ComponentType.StringSelect
                            });

                            Sdb.updateSetting(guildId, 'language', langInteraction.values[0]);
                            await langInteraction.update({ content: localeManager.get('utility.settings.messages.saved', lang), components: [] });
                            await interaction.editReply(generateDashboard());
                        } catch (err) {
                            await i.editReply({ content: localeManager.get('utility.settings.messages.timeout', lang), components: [] });
                        }
                        return;
                    }

                    let typeFilter = [ChannelType.GuildText];
                    let promptText = localeManager.get('utility.settings.messages.placeholder_extra', lang);
                    if (selection === 'act_cat') {
                        typeFilter = [ChannelType.GuildCategory];
                    }

                    const tempSelect = new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId('temp_select') 
                            .setPlaceholder(promptText)
                            .setChannelTypes(...typeFilter)
                    );
                    
                    const tempMsg = await i.reply({ 
                        content: promptText, 
                        components: [tempSelect], 
                        flags: MessageFlags.Ephemeral,
                        fetchReply: true 
                    });

                    try {
                        const selectionInteraction = await tempMsg.awaitMessageComponent({
                            filter: (subI) => subI.user.id === i.user.id,
                            time: 60000,
                            componentType: ComponentType.ChannelSelect
                        });

                        const selectedId = selectionInteraction.values[0];

                        if (selection === 'act_cat') Sdb.updateSetting(guildId, 'voiceCategoryId', selectedId);
                        else if (selection === 'act_log') Sdb.updateSetting(guildId, 'inviteLoggerChannel', selectedId);
                        else if (selection === 'act_sup') Sdb.updateSetting(guildId, 'supportChannelId', selectedId);
                        else if (selection === 'act_rep') Sdb.updateSetting(guildId, 'reportsModerationChannelId', selectedId);
                        else if (selection === 'act_verdict') Sdb.updateSetting(guildId, 'verdictChannelId', selectedId);
                        else if (selection === 'act_honeypot') {
                            Sdb.updateSetting(guildId, 'honeypotChannelId', selectedId);
                            Sdb.updateSetting(guildId, 'honeypotEnabled', true);
                        }
                        else if (selection === 'act_honeypot_log') Sdb.updateSetting(guildId, 'honeypotLogChannelId', selectedId);

                        await selectionInteraction.update({ content: localeManager.get('utility.settings.messages.saved', lang), components: [] });
                        await interaction.editReply(generateDashboard());

                    } catch (err) {
                        await i.editReply({ content: localeManager.get('utility.settings.messages.timeout', lang), components: [] });
                    }
                    return; 
                }

                const currentCfg = Sdb.getSettings(guildId) || {};
                
                if (i.customId === 'select_welcome') {
                    Sdb.updateSetting(guildId, 'newMemberChannelId', i.values[0]);
                } 
                else if (i.customId === 'select_voice_main') {
                    Sdb.updateSetting(guildId, 'mainVoiceChannelId', i.values[0]);
                }
                else if (i.customId === 'toggle_invites') {
                    Sdb.updateSetting(guildId, 'allowInviteLogging', !currentCfg.allowInviteLogging);
                }
                else if (i.customId === 'toggle_members') {
                    Sdb.updateSetting(guildId, 'allowLogingMembersAdd', !currentCfg.allowLogingMembersAdd);
                }
                else if (i.customId === 'select_language') {
                    Sdb.updateSetting(guildId, 'language', i.values[0]);
                }
                else if (i.customId === 'toggle_honeypot') {
                    if (!currentCfg.honeypotChannelId) {
                        return await i.reply({ content: localeManager.get('utility.settings.messages.honeypot_trap_required', lang), flags: MessageFlags.Ephemeral });
                    }
                    Sdb.updateSetting(guildId, 'honeypotEnabled', !currentCfg.honeypotEnabled);
                }

                await i.update(generateDashboard());

            } catch (err) {
                console.error(err);
                const logChannel = await interaction.client.channels.fetch(bot_log_channel).catch(() => null);
                if (logChannel) logChannel.send(`Settings Dashboard Error: ${err.message}`);
                
                if (!i.replied && !i.deferred) {
                    await i.reply({ content: localeManager.get('utility.settings.messages.error_saving', lang), flags: MessageFlags.Ephemeral });
                }
            }
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] }).catch(() => {});
        });
    }
};