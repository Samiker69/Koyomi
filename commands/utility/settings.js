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
const DatabaseService = require('../../services/DatabaseService');
const { bot_log_channel } = require('../../config.json');
const localeManager = require('../../locales/localeManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription(localeManager.get('utility.settings.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.settings.description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        let activePage = 'main';

        const render = async (pageId) => {
            const cfg = await DatabaseService.getSettings(guildId) || {};
            const lang = cfg.language || interaction.guildLocale || 'ru';

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

            let dbSpamConfig = cfg.antiSpamConfig || {};
            if (typeof dbSpamConfig === 'string') {
                try { dbSpamConfig = JSON.parse(dbSpamConfig); } catch(e) { dbSpamConfig = {}; }
            }
            const antiSpamAction = dbSpamConfig.action || 'mute';
            const antiSpamThreshold = dbSpamConfig.threshold || 18.0;
            const antiSpamDuration = dbSpamConfig.muteDuration ? `${Math.round(dbSpamConfig.muteDuration / 60000)}m` : '10m';

            const labelThreshold = localeManager.get('utility.settings.messages.antispam_threshold', lang) || 'Threshold';
            const labelAction = localeManager.get('utility.settings.messages.antispam_action', lang) || 'Action';
            const labelDuration = localeManager.get('utility.settings.messages.antispam_duration', lang) || 'Mute Duration';

            const embed = EmbedService.createBaseEmbed(interaction)
                .setFooter({ text: localeManager.get('utility.settings.messages.footer', lang) });

            const components = [];

            if (pageId === 'main') {
                embed
                    .setTitle(localeManager.get('utility.settings.messages.dashboard_title', lang, { name: interaction.guild.name }))
                    .setDescription(localeManager.get('utility.settings.messages.dashboard_desc', lang))
                    .addFields(
                        {
                            name: localeManager.get('utility.settings.messages.prefix_label', lang),
                            value: `> \`${cfg.prefix || '..'}\``,
                            inline: false
                        },
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
                        },
                        {
                            name: localeManager.get('utility.settings.messages.antispam', lang),
                            value: `> **Anti-Spam:** ${cfg.antiSpamEnabled ? localeManager.get('utility.settings.messages.enabled', lang) : localeManager.get('utility.settings.messages.disabled', lang)}\n` +
                                   `> **${labelThreshold}:** \`${antiSpamThreshold}\`\n` +
                                   `> **${labelAction}:** \`${antiSpamAction.toUpperCase()}\`\n` +
                                   `> **${labelDuration}:** \`${antiSpamDuration}\``,
                            inline: false
                        }
                    );

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('goto_welcome').setLabel(localeManager.get('utility.settings.messages.welcome_logs', lang)).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('goto_voice').setLabel(localeManager.get('utility.settings.messages.voice_rooms', lang)).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('goto_moderation').setLabel(localeManager.get('utility.settings.messages.support_reports', lang)).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('goto_antispam').setLabel(localeManager.get('utility.settings.messages.antispam', lang)).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('goto_general').setLabel(localeManager.get('utility.settings.messages.general', lang)).setStyle(ButtonStyle.Primary)
                );
                components.push(row);
            }
            else if (pageId === 'welcome') {
                embed
                    .setTitle(localeManager.get('utility.settings.messages.welcome_logs', lang))
                    .setDescription(
                        `**${localeManager.get('utility.settings.messages.welcome_channel', lang)}:** ${valWelcome}\n` +
                        `**${localeManager.get('utility.settings.messages.invite_log', lang)}:** ${valInvites}\n` +
                        `**${localeManager.get('utility.settings.messages.notify_join', lang)}:** ${statusMembers}\n` +
                        `**${localeManager.get('utility.settings.messages.notify_invites', lang)}:** ${statusInvites}`
                    );

                const rowWelcome = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('select_welcome')
                        .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_welcome', lang))
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                );

                const rowInviteLog = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('select_invite_log')
                        .setPlaceholder(localeManager.get('utility.settings.messages.act_log.description', lang))
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                );

                const rowToggles = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('toggle_members')
                        .setLabel(localeManager.get('utility.settings.messages.toggle_members', lang, { state: cfg.allowLogingMembersAdd ? localeManager.get('utility.settings.messages.on', lang) : localeManager.get('utility.settings.messages.off', lang) }))
                        .setStyle(cfg.allowLogingMembersAdd ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('toggle_invites')
                        .setLabel(localeManager.get('utility.settings.messages.toggle_invites', lang, { state: cfg.allowInviteLogging ? localeManager.get('utility.settings.messages.on', lang) : localeManager.get('utility.settings.messages.off', lang) }))
                        .setStyle(cfg.allowInviteLogging ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('back_to_main')
                        .setLabel(localeManager.get('utility.settings.messages.back', lang))
                        .setStyle(ButtonStyle.Danger)
                );

                components.push(rowWelcome, rowInviteLog, rowToggles);
            }
            else if (pageId === 'voice') {
                embed
                    .setTitle(localeManager.get('utility.settings.messages.voice_rooms', lang))
                    .setDescription(
                        `**${localeManager.get('utility.settings.messages.category', lang)}:** ${valVoiceCat}\n` +
                        `**${localeManager.get('utility.settings.messages.create_room', lang)}:** ${valVoiceMain}`
                    );

                const rowMainVoice = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('select_voice_main')
                        .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_voice', lang))
                        .setChannelTypes(ChannelType.GuildVoice)
                );

                const rowVoiceCat = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('select_voice_cat')
                        .setPlaceholder(localeManager.get('utility.settings.messages.act_cat.label', lang))
                        .setChannelTypes(ChannelType.GuildCategory)
                );

                const rowBack = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('back_to_main')
                        .setLabel(localeManager.get('utility.settings.messages.back', lang))
                        .setStyle(ButtonStyle.Danger)
                );

                components.push(rowMainVoice, rowVoiceCat, rowBack);
            }
            else if (pageId === 'moderation') {
                embed
                    .setTitle(localeManager.get('utility.settings.messages.support_reports', lang))
                    .setDescription(
                        `**${localeManager.get('utility.settings.messages.support_channel', lang)}:** ${valSupport}\n` +
                        `**${localeManager.get('utility.settings.messages.reports_channel', lang)}:** ${valReports}\n` +
                        `**${localeManager.get('utility.settings.messages.verdict_channel', lang)}:** ${valVerdict}\n` +
                        `**${localeManager.get('utility.settings.messages.trap_channel', lang)}:** ${valHoneypot}\n` +
                        `**${localeManager.get('utility.settings.messages.log_channel', lang)}:** ${valHoneypotLog}\n` +
                        `**${localeManager.get('utility.settings.messages.status', lang)}:** ${statusHoneypot}`
                    );

                const labelActSup = localeManager.get('utility.settings.messages.act_sup.label', lang);
                const descActSup = localeManager.get('utility.settings.messages.act_sup.description', lang);
                const labelActRep = localeManager.get('utility.settings.messages.act_rep.label', lang);
                const descActRep = localeManager.get('utility.settings.messages.act_rep.description', lang);
                const labelActVerdict = localeManager.get('utility.settings.messages.act_verdict.label', lang);
                const descActVerdict = localeManager.get('utility.settings.messages.act_verdict.description', lang);
                const labelActHoneypot = localeManager.get('utility.settings.messages.act_honeypot.label', lang);
                const descActHoneypot = localeManager.get('utility.settings.messages.act_honeypot.description', lang);
                const labelActHoneypotLog = localeManager.get('utility.settings.messages.act_honeypot_log.label', lang);
                const descActHoneypotLog = localeManager.get('utility.settings.messages.act_honeypot_log.description', lang);

                const rowChannels = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_mod_channel_type')
                        .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_extra', lang))
                        .addOptions(
                            { label: labelActSup, description: descActSup, value: 'act_sup' },
                            { label: labelActRep, description: descActRep, value: 'act_rep' },
                            { label: labelActVerdict, description: descActVerdict, value: 'act_verdict' },
                            { label: labelActHoneypot, description: descActHoneypot, value: 'act_honeypot' },
                            { label: labelActHoneypotLog, description: descActHoneypotLog, value: 'act_honeypot_log' }
                        )
                );

                const rowButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('toggle_honeypot')
                        .setLabel(localeManager.get('utility.settings.messages.toggle_honeypot', lang, { state: cfg.honeypotEnabled ? localeManager.get('utility.settings.messages.on', lang) : localeManager.get('utility.settings.messages.off', lang) }))
                        .setStyle(cfg.honeypotEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('back_to_main')
                        .setLabel(localeManager.get('utility.settings.messages.back', lang))
                        .setStyle(ButtonStyle.Danger)
                );

                components.push(rowChannels, rowButtons);
            }
            else if (pageId === 'antispam') {
                embed
                    .setTitle(localeManager.get('utility.settings.messages.antispam', lang))
                    .setDescription(
                        `**Anti-Spam:** ${cfg.antiSpamEnabled ? localeManager.get('utility.settings.messages.enabled', lang) : localeManager.get('utility.settings.messages.disabled', lang)}\n` +
                        `**${labelThreshold}:** \`${antiSpamThreshold}\`\n` +
                        `**${labelAction}:** \`${antiSpamAction.toUpperCase()}\`\n` +
                        `**${labelDuration}:** \`${antiSpamDuration}\``
                    );

                const rowAction = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_antispam_action')
                        .setPlaceholder(localeManager.get('utility.settings.messages.select_action_placeholder', lang))
                        .addOptions(
                            { label: localeManager.get('utility.settings.messages.warn', lang), value: 'warn', default: antiSpamAction === 'warn' },
                            { label: localeManager.get('utility.settings.messages.mute', lang), value: 'mute', default: antiSpamAction === 'mute' },
                            { label: localeManager.get('utility.settings.messages.kick', lang), value: 'kick', default: antiSpamAction === 'kick' },
                            { label: localeManager.get('utility.settings.messages.ban', lang), value: 'ban', default: antiSpamAction === 'ban' }
                        )
                );

                const rowButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('toggle_antispam')
                        .setLabel(localeManager.get('utility.settings.messages.toggle_antispam', lang, { state: cfg.antiSpamEnabled ? localeManager.get('utility.settings.messages.on', lang) : localeManager.get('utility.settings.messages.off', lang) }))
                        .setStyle(cfg.antiSpamEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('set_antispam_threshold')
                        .setLabel(localeManager.get('utility.settings.messages.set_threshold', lang))
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('set_antispam_duration')
                        .setLabel(localeManager.get('utility.settings.messages.set_duration', lang))
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('back_to_main')
                        .setLabel(localeManager.get('utility.settings.messages.back', lang))
                        .setStyle(ButtonStyle.Danger)
                );

                components.push(rowAction, rowButtons);
            }
            else if (pageId === 'general') {
                embed
                    .setTitle(localeManager.get('utility.settings.messages.general', lang))
                    .setDescription(
                        `**${localeManager.get('utility.settings.messages.prefix_label', lang)}:** \`${cfg.prefix || '..'}\`\n` +
                        `**Language:** ${lang.toUpperCase()}`
                    );

                const rowLang = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_language')
                        .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_lang', lang))
                        .addOptions(
                            { label: localeManager.get('utility.settings.messages.lang_ru', 'ru'), value: 'ru', default: cfg.language === 'ru' },
                            { label: localeManager.get('utility.settings.messages.lang_en', 'en-US'), value: 'en-US', default: cfg.language === 'en-US' },
                            { label: localeManager.get('utility.settings.messages.lang_uk', 'uk'), value: 'uk', default: cfg.language === 'uk' }
                        )
                );

                const rowButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('set_prefix')
                        .setLabel(localeManager.get('utility.settings.messages.act_prefix.label', lang))
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('reset_all')
                        .setLabel(localeManager.get('utility.settings.messages.reset_all', lang))
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('back_to_main')
                        .setLabel(localeManager.get('utility.settings.messages.back', lang))
                        .setStyle(ButtonStyle.Danger)
                );

                components.push(rowLang, rowButtons);
            }

            return { embeds: [embed], components };
        };

        const initialDashboard = await render('main');
        const msg = await interaction.reply({
            ...initialDashboard,
            flags: MessageFlags.Ephemeral,
            fetchReply: true
        });

        const collector = msg.createMessageComponentCollector({ time: 300_000 });

        collector.on('collect', async i => {
            try {
                const cfg = await DatabaseService.getSettings(guildId) || {};
                const lang = cfg.language || interaction.guildLocale || 'ru';

                if (i.customId === 'back_to_main') {
                    activePage = 'main';
                    return await i.update(await render('main'));
                }

                if (i.customId.startsWith('goto_')) {
                    activePage = i.customId.replace('goto_', '');
                    return await i.update(await render(activePage));
                }

                // WELCOME PAGE ACTIONS
                if (i.customId === 'select_welcome') {
                    await DatabaseService.updateSetting(guildId, 'newMemberChannelId', i.values[0]);
                    return await i.update(await render(activePage));
                }
                if (i.customId === 'select_invite_log') {
                    await DatabaseService.updateSetting(guildId, 'inviteLoggerChannel', i.values[0]);
                    return await i.update(await render(activePage));
                }
                if (i.customId === 'toggle_members') {
                    await DatabaseService.updateSetting(guildId, 'allowLogingMembersAdd', !cfg.allowLogingMembersAdd);
                    return await i.update(await render(activePage));
                }
                if (i.customId === 'toggle_invites') {
                    await DatabaseService.updateSetting(guildId, 'allowInviteLogging', !cfg.allowInviteLogging);
                    return await i.update(await render(activePage));
                }

                // VOICE PAGE ACTIONS
                if (i.customId === 'select_voice_main') {
                    await DatabaseService.updateSetting(guildId, 'mainVoiceChannelId', i.values[0]);
                    return await i.update(await render(activePage));
                }
                if (i.customId === 'select_voice_cat') {
                    await DatabaseService.updateSetting(guildId, 'voiceCategoryId', i.values[0]);
                    return await i.update(await render(activePage));
                }

                // MODERATION PAGE ACTIONS
                if (i.customId === 'toggle_honeypot') {
                    if (!cfg.honeypotChannelId) {
                        return await i.reply({ content: localeManager.get('utility.settings.messages.honeypot_trap_required', lang), flags: MessageFlags.Ephemeral });
                    }
                    await DatabaseService.updateSetting(guildId, 'honeypotEnabled', !cfg.honeypotEnabled);
                    return await i.update(await render(activePage));
                }
                if (i.customId === 'select_mod_channel_type') {
                    const selection = i.values[0];
                    let typeFilter = [ChannelType.GuildText, ChannelType.GuildForum];
                    let promptText = localeManager.get('utility.settings.messages.select_chan_prompt', lang);

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
                        if (selection === 'act_sup') await DatabaseService.updateSetting(guildId, 'supportChannelId', selectedId);
                        else if (selection === 'act_rep') await DatabaseService.updateSetting(guildId, 'reportsModerationChannelId', selectedId);
                        else if (selection === 'act_verdict') await DatabaseService.updateSetting(guildId, 'verdictChannelId', selectedId);
                        else if (selection === 'act_honeypot') {
                            await DatabaseService.updateSetting(guildId, 'honeypotChannelId', selectedId);
                            await DatabaseService.updateSetting(guildId, 'honeypotEnabled', true);
                        }
                        else if (selection === 'act_honeypot_log') await DatabaseService.updateSetting(guildId, 'honeypotLogChannelId', selectedId);

                        await selectionInteraction.update({ content: localeManager.get('utility.settings.messages.saved', lang), components: [] });
                        await interaction.editReply(await render(activePage));
                    } catch (err) {
                        await i.editReply({ content: localeManager.get('utility.settings.messages.select_timeout', lang), components: [] });
                    }
                    return;
                }

                // ANTISPAM PAGE ACTIONS
                if (i.customId === 'toggle_antispam') {
                    await DatabaseService.updateSetting(guildId, 'antiSpamEnabled', !cfg.antiSpamEnabled);
                    return await i.update(await render(activePage));
                }
                if (i.customId === 'select_antispam_action') {
                    let config = cfg.antiSpamConfig || {};
                    if (typeof config === 'string') {
                        try { config = JSON.parse(config); } catch(e) { config = {}; }
                    }
                    config.action = i.values[0];
                    await DatabaseService.updateSetting(guildId, 'antiSpamConfig', config);
                    return await i.update(await render(activePage));
                }
                if (i.customId === 'set_antispam_threshold') {
                    const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
                    const modalId = `modal_antispam_threshold_${i.id}`;
                    const modalTitle = lang === 'ru' ? 'Лимит очков спама' : lang === 'uk' ? 'Ліміт очок спаму' : 'Spam Penalty Limit';
                    const modal = new ModalBuilder().setCustomId(modalId).setTitle(modalTitle);

                    let config = cfg.antiSpamConfig || {};
                    if (typeof config === 'string') {
                        try { config = JSON.parse(config); } catch(e) { config = {}; }
                    }
                    const currentThreshold = (config.threshold || 18.0).toString();
                    const inputLabel = lang === 'ru' ? 'Порог' : lang === 'uk' ? 'Поріг' : 'Limit';

                    const thresholdInput = new TextInputBuilder()
                        .setCustomId('input_antispam_threshold')
                        .setLabel(inputLabel)
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(1)
                        .setMaxLength(5)
                        .setRequired(true)
                        .setValue(currentThreshold);

                    modal.addComponents(new ActionRowBuilder().addComponents(thresholdInput));
                    await i.showModal(modal);

                    try {
                        const modalInteraction = await i.awaitModalSubmit({
                            filter: (subI) => subI.customId === modalId && subI.user.id === i.user.id,
                            time: 60000
                        });
                        const newThresholdStr = modalInteraction.fields.getTextInputValue('input_antispam_threshold');
                        const newThreshold = parseFloat(newThresholdStr);
                        if (isNaN(newThreshold) || newThreshold <= 0) {
                            return await modalInteraction.reply({ content: localeManager.get('utility.settings.messages.antispam_invalid_num', lang), flags: MessageFlags.Ephemeral });
                        }
                        let configObj = cfg.antiSpamConfig || {};
                        if (typeof configObj === 'string') {
                            try { configObj = JSON.parse(configObj); } catch(e) { configObj = {}; }
                        }
                        configObj.threshold = newThreshold;
                        await DatabaseService.updateSetting(guildId, 'antiSpamConfig', configObj);
                        await modalInteraction.update(await render(activePage));
                    } catch (err) {}
                    return;
                }
                if (i.customId === 'set_antispam_duration') {
                    const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
                    const modalId = `modal_antispam_duration_${i.id}`;
                    const modalTitle = lang === 'ru' ? 'Время таймаута' : lang === 'uk' ? 'Час таймауту' : 'Timeout Duration';
                    const modal = new ModalBuilder().setCustomId(modalId).setTitle(modalTitle);

                    let config = cfg.antiSpamConfig || {};
                    if (typeof config === 'string') {
                        try { config = JSON.parse(config); } catch(e) { config = {}; }
                    }
                    const currentDurationMin = Math.round((config.muteDuration || 600000) / 60000).toString();
                    const inputLabel = lang === 'ru' ? 'Длительность в минутах' : lang === 'uk' ? 'Тривалість у хвилинах' : 'Duration in minutes';

                    const durationInput = new TextInputBuilder()
                        .setCustomId('input_antispam_duration')
                        .setLabel(inputLabel)
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(1)
                        .setMaxLength(5)
                        .setRequired(true)
                        .setValue(currentDurationMin);

                    modal.addComponents(new ActionRowBuilder().addComponents(durationInput));
                    await i.showModal(modal);

                    try {
                        const modalInteraction = await i.awaitModalSubmit({
                            filter: (subI) => subI.customId === modalId && subI.user.id === i.user.id,
                            time: 60000
                        });
                        const newDurationMinStr = modalInteraction.fields.getTextInputValue('input_antispam_duration');
                        const newDurationMin = parseInt(newDurationMinStr, 10);
                        if (isNaN(newDurationMin) || newDurationMin <= 0) {
                            return await modalInteraction.reply({ content: localeManager.get('utility.settings.messages.antispam_invalid_num', lang), flags: MessageFlags.Ephemeral });
                        }
                        let configObj = cfg.antiSpamConfig || {};
                        if (typeof configObj === 'string') {
                            try { configObj = JSON.parse(configObj); } catch(e) { configObj = {}; }
                        }
                        configObj.muteDuration = newDurationMin * 60 * 1000;
                        await DatabaseService.updateSetting(guildId, 'antiSpamConfig', configObj);
                        await modalInteraction.update(await render(activePage));
                    } catch (err) {}
                    return;
                }

                // GENERAL PAGE ACTIONS
                if (i.customId === 'select_language') {
                    await DatabaseService.updateSetting(guildId, 'language', i.values[0]);
                    return await i.update(await render(activePage));
                }
                if (i.customId === 'set_prefix') {
                    const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
                    const modalId = `modal_prefix_${i.id}`;
                    const modal = new ModalBuilder()
                        .setCustomId(modalId)
                        .setTitle(localeManager.get('utility.settings.messages.modal_prefix_title', lang));

                    const currentPrefix = cfg.prefix || '..';
                    const prefixInput = new TextInputBuilder()
                        .setCustomId('input_prefix')
                        .setLabel(localeManager.get('utility.settings.messages.modal_prefix_input', lang))
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(1)
                        .setMaxLength(5)
                        .setRequired(true)
                        .setValue(currentPrefix);

                    modal.addComponents(new ActionRowBuilder().addComponents(prefixInput));
                    await i.showModal(modal);

                    try {
                        const modalInteraction = await i.awaitModalSubmit({
                            filter: (subI) => subI.customId === modalId && subI.user.id === i.user.id,
                            time: 60000
                        });
                        const newPrefix = modalInteraction.fields.getTextInputValue('input_prefix');
                        await DatabaseService.updateSetting(guildId, 'prefix', newPrefix);
                        await modalInteraction.update(await render(activePage));
                    } catch (err) {}
                    return;
                }
                if (i.customId === 'reset_all') {
                    const confirmRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('confirm_reset').setLabel(localeManager.get('utility.settings.messages.confirm_btn', lang)).setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('cancel_reset').setLabel(localeManager.get('utility.settings.messages.cancel_btn', lang)).setStyle(ButtonStyle.Secondary)
                    );
                    const confirmMsg = await i.reply({
                        content: localeManager.get('utility.settings.messages.confirm_reset_desc', lang),
                        components: [confirmRow],
                        flags: MessageFlags.Ephemeral,
                        fetchReply: true
                    });
                    try {
                        const confirmInteraction = await confirmMsg.awaitMessageComponent({
                            filter: (subI) => subI.user.id === i.user.id,
                            time: 30000
                        });
                        if (confirmInteraction.customId === 'confirm_reset') {
                            await DatabaseService.removeServer(guildId);
                            await DatabaseService.addServer(guildId);
                            await confirmInteraction.update({ content: localeManager.get('utility.settings.messages.reset_success', lang), components: [] });
                            await interaction.editReply(await render(activePage));
                        } else {
                            await confirmInteraction.update({ content: localeManager.get('utility.settings.messages.cancel_btn', lang), components: [] });
                        }
                    } catch (err) {
                        await i.editReply({ content: localeManager.get('utility.settings.messages.select_timeout', lang), components: [] });
                    }
                    return;
                }

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