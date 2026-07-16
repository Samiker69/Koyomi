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
        const initialCfg = await DatabaseService.getSettings(guildId) || {};
        let lang = initialCfg.language || interaction.guildLocale || 'ru';

        const generateDashboard = async () => {
            const cfg = await DatabaseService.getSettings(guildId) || {};
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

            // Обработка конфигурации антиспама
            let dbSpamConfig = cfg.antiSpamConfig || {};
            if (typeof dbSpamConfig === 'string') {
                try { dbSpamConfig = JSON.parse(dbSpamConfig); } catch(e) { dbSpamConfig = {}; }
            }
            const antiSpamAction = dbSpamConfig.action || 'mute';
            const antiSpamThreshold = dbSpamConfig.threshold || 18.0;
            const antiSpamDuration = dbSpamConfig.muteDuration ? `${Math.round(dbSpamConfig.muteDuration / 60000)}m` : '10m';

            const labelThreshold = localeManager.get('utility.settings.messages.antispam_threshold', lang) || (lang === 'ru' ? 'Порог' : lang === 'uk' ? 'Поріг' : 'Threshold');
            const labelAction = localeManager.get('utility.settings.messages.antispam_action', lang) || (lang === 'ru' ? 'Наказание' : lang === 'uk' ? 'Покарання' : 'Action');
            const labelDuration = localeManager.get('utility.settings.messages.antispam_duration', lang) || (lang === 'ru' ? 'Длительность мута' : lang === 'uk' ? 'Тривалість муту' : 'Mute Duration');

            const settingsEmbed = EmbedService.createBaseEmbed(interaction)
                .setTitle(localeManager.get('utility.settings.messages.dashboard_title', lang, { name: interaction.guild.name }))
                .setDescription(localeManager.get('utility.settings.messages.dashboard_desc', lang))
                .addFields(
                    {
                        name: localeManager.get('utility.settings.messages.prefix_label', lang),
                        value: `> \`${cfg.prefix || '..'}\` *(${lang === 'ru' ? 'сменить в меню ниже' : lang === 'uk' ? 'змінити в меню нижче' : 'change in the menu below'})*`,
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

            // Метки дополнительных действий с учетом структуры локализации
            const labelActCat = localeManager.get('utility.settings.messages.act_cat.label', lang);
            const descActCat = localeManager.get('utility.settings.messages.act_cat.description', lang);
            const labelActLog = localeManager.get('utility.settings.messages.act_log.label', lang);
            const descActLog = localeManager.get('utility.settings.messages.act_log.description', lang);
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
            const labelActPrefix = localeManager.get('utility.settings.messages.act_prefix.label', lang);
            const descActPrefix = localeManager.get('utility.settings.messages.act_prefix.description', lang);
            const labelActReset = localeManager.get('utility.settings.messages.act_reset.label', lang);
            const descActReset = localeManager.get('utility.settings.messages.act_reset.description', lang);

            const labelActSpamThreshold = localeManager.get('utility.settings.messages.act_antispam_threshold.label', lang) || (lang === 'ru' ? 'Антиспам: Изменить порог' : lang === 'uk' ? 'Антиспам: Змінити поріг' : 'Anti-Spam: Set threshold');
            const descActSpamThreshold = localeManager.get('utility.settings.messages.act_antispam_threshold.description', lang) || (lang === 'ru' ? 'Настройка лимита очков для срабатывания защиты' : lang === 'uk' ? 'Налаштування ліміту очок для спрацьовування захисту' : 'Set spam penalty limit');
            const labelActSpamAction = localeManager.get('utility.settings.messages.act_antispam_action.label', lang) || (lang === 'ru' ? 'Антиспам: Выбрать действие' : lang === 'uk' ? 'Антиспам: Вибрати дію' : 'Anti-Spam: Set action');
            const descActSpamAction = localeManager.get('utility.settings.messages.act_antispam_action.description', lang) || (lang === 'ru' ? 'Выбор наказания: Mute, Ban, Kick, Warn' : lang === 'uk' ? 'Вибір покарання: Mute, Ban, Kick, Warn' : 'Action on spam: Mute, Ban, Kick, Warn');
            const labelActSpamDuration = localeManager.get('utility.settings.messages.act_antispam_duration.label', lang) || (lang === 'ru' ? 'Антиспам: Длительность мута' : lang === 'uk' ? 'Антиспам: Тривалість муту' : 'Anti-Spam: Set mute duration');
            const descActSpamDuration = localeManager.get('utility.settings.messages.act_antispam_duration.description', lang) || (lang === 'ru' ? 'Длительность ограничения общения (в минутах)' : lang === 'uk' ? 'Тривалість обмеження спілкування (у хвилинах)' : 'Mute duration in minutes');

            const rowOtherChannels = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_actions')
                    .setPlaceholder(localeManager.get('utility.settings.messages.placeholder_extra', lang))
                    .addOptions(
                        { label: labelActCat, description: descActCat, value: 'act_cat' },
                        { label: labelActLog, description: descActLog, value: 'act_log' },
                        { label: labelActSup, description: descActSup, value: 'act_sup' },
                        { label: labelActRep, description: descActRep, value: 'act_rep' },
                        { label: labelActVerdict, description: descActVerdict, value: 'act_verdict' },
                        { label: labelActHoneypot, description: descActHoneypot, value: 'act_honeypot' },
                        { label: labelActHoneypotLog, description: descActHoneypotLog, value: 'act_honeypot_log' },
                        { label: labelActPrefix, description: descActPrefix, value: 'act_prefix' },
                        { label: labelActSpamThreshold, description: descActSpamThreshold, value: 'act_antispam_threshold' },
                        { label: labelActSpamAction, description: descActSpamAction, value: 'act_antispam_action' },
                        { label: labelActSpamDuration, description: descActSpamDuration, value: 'act_antispam_duration' },
                        { label: labelActReset, description: descActReset, value: 'act_reset' }
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
                    .setStyle(cfg.honeypotEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('toggle_antispam')
                    .setLabel(localeManager.get('utility.settings.messages.toggle_antispam', lang, { state: cfg.antiSpamEnabled ? localeManager.get('utility.settings.messages.on', lang) : localeManager.get('utility.settings.messages.off', lang) }))
                    .setStyle(cfg.antiSpamEnabled ? ButtonStyle.Success : ButtonStyle.Secondary)
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

            return { embeds: [settingsEmbed], components: [rowWelcome, rowVoice, rowOtherChannels, rowLang, rowToggles] };
        };

        const msg = await interaction.reply({
            ...await generateDashboard(),
            flags: MessageFlags.Ephemeral
        });

        const collector = msg.createMessageComponentCollector({ time: 300_000 });

        collector.on('collect', async i => {
            try {
                if (i.customId === 'menu_actions') {
                    const selection = i.values[0];
                    if (selection === 'act_reset') {
                        await DatabaseService.removeServer(guildId);
                        await DatabaseService.addServer(guildId);
                        await i.update(await generateDashboard());
                        return;
                    }
                    if (selection === 'act_prefix') {
                        const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
                        const modalId = `modal_prefix_${i.id}`;
                        const modal = new ModalBuilder()
                            .setCustomId(modalId)
                            .setTitle(localeManager.get('utility.settings.messages.modal_prefix_title', lang));

                        const settings = await DatabaseService.getSettings(guildId) || {};
                        const currentPrefix = settings.prefix || '..';

                        const prefixInput = new TextInputBuilder()
                            .setCustomId('input_prefix')
                            .setLabel(localeManager.get('utility.settings.messages.modal_prefix_input', lang))
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(5)
                            .setRequired(true)
                            .setValue(currentPrefix);

                        const row = new ActionRowBuilder().addComponents(prefixInput);
                        modal.addComponents(row);

                        await i.showModal(modal);

                        try {
                            const modalInteraction = await i.awaitModalSubmit({
                                filter: (subI) => subI.customId === modalId && subI.user.id === i.user.id,
                                time: 60000
                            });
                            const newPrefix = modalInteraction.fields.getTextInputValue('input_prefix');
                            await DatabaseService.updateSetting(guildId, 'prefix', newPrefix);
                            await modalInteraction.update(await generateDashboard());
                        } catch (err) {}
                        return;
                    }

                    // Конфигурация действия антиспама
                    //TODO: переместить в локали
                    if (selection === 'act_antispam_action') {
                        const actionRow = new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('select_antispam_action')
                                .setPlaceholder(localeManager.get('utility.settings.messages.select_action_placeholder', lang) || 'Выберите наказание / Select action')
                                .addOptions(
                                    { label: lang === 'ru' ? 'Предупреждение' : lang === 'uk' ? 'Попередження' : 'Warning', value: 'warn' },
                                    { label: lang === 'ru' ? 'Таймаут' : lang === 'uk' ? 'Таймаут' : 'Timeout', value: 'mute' },
                                    { label: lang === 'ru' ? 'Кик' : lang === 'uk' ? 'Кік' : 'Kick', value: 'kick' },
                                    { label: lang === 'ru' ? 'Бан' : lang === 'uk' ? 'Бан' : 'Ban', value: 'ban' }
                                )
                        );
                        const promptText = lang === 'ru' ? 'Выберите действие при нарушении антиспама:' : lang === 'uk' ? 'Виберіть дію при порушенні антиспаму:' : 'Select action on spam violation:';
                        const actionMsg = await i.reply({
                            content: promptText,
                            components: [actionRow],
                            flags: MessageFlags.Ephemeral,
                            withResponse: true
                        });
                        try {
                            const selectInteraction = await actionMsg.awaitMessageComponent({
                                filter: (subI) => subI.user.id === i.user.id,
                                time: 60000,
                                componentType: ComponentType.StringSelect
                            });
                            const selectedAction = selectInteraction.values[0];
                            const settings = await DatabaseService.getSettings(guildId) || {};
                            let config = settings.antiSpamConfig || {};
                            if (typeof config === 'string') {
                                try { config = JSON.parse(config); } catch(e) { config = {}; }
                            }
                            config.action = selectedAction;
                            await DatabaseService.updateSetting(guildId, 'antiSpamConfig', config);
                            const successMsg = lang === 'ru' ? `Успешно сохранено: **${selectedAction}**` : lang === 'uk' ? `Успішно збережено: **${selectedAction}**` : `Successfully saved: **${selectedAction}**`;
                            await selectInteraction.update({ content: successMsg, components: [] });
                            await interaction.editReply(await generateDashboard());
                        } catch (err) {
                            const timeoutMsg = lang === 'ru' ? 'Время ожидания истекло.' : lang === 'uk' ? 'Час очікування закінчився.' : 'Timeout.';
                            await i.editReply({ content: timeoutMsg, components: [] });
                        }
                        return;
                    }

                    // Конфигурация порога антиспама
                    if (selection === 'act_antispam_threshold') {
                        const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
                        const modalId = `modal_antispam_threshold_${i.id}`;
                        const modalTitle = lang === 'ru' ? 'Лимит очков спама' : lang === 'uk' ? 'Ліміт очок спаму' : 'Spam Penalty Limit';
                        const modal = new ModalBuilder()
                            .setCustomId(modalId)
                            .setTitle(modalTitle);

                        const settings = await DatabaseService.getSettings(guildId) || {};
                        let config = settings.antiSpamConfig || {};
                        if (typeof config === 'string') {
                            try { config = JSON.parse(config); } catch(e) { config = {}; }
                        }
                        const currentThreshold = (config.threshold || 18.0).toString();

                        //TODO: переместить в локали
                        const inputLabel = lang === 'ru' ? 'Порог' : lang === 'uk' ? 'Поріг' : 'Limit';
                        const thresholdInput = new TextInputBuilder()
                            .setCustomId('input_antispam_threshold')
                            .setLabel(inputLabel)
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(5)
                            .setRequired(true)
                            .setValue(currentThreshold);

                        const row = new ActionRowBuilder().addComponents(thresholdInput);
                        modal.addComponents(row);

                        await i.showModal(modal);

                        try {
                            const modalInteraction = await i.awaitModalSubmit({
                                filter: (subI) => subI.customId === modalId && subI.user.id === i.user.id,
                                time: 60000
                            });
                            const newThresholdStr = modalInteraction.fields.getTextInputValue('input_antispam_threshold');
                            const newThreshold = parseFloat(newThresholdStr);
                            if (isNaN(newThreshold) || newThreshold <= 0) {
                                const invalidMsg = lang === 'ru' ? 'Некорректное число.' : lang === 'uk' ? 'Некоректне число.' : 'Invalid number.';
                                return await modalInteraction.reply({ content: invalidMsg, flags: MessageFlags.Ephemeral });
                            }
                            const settingsObj = await DatabaseService.getSettings(guildId) || {};
                            let configObj = settingsObj.antiSpamConfig || {};
                            if (typeof configObj === 'string') {
                                try { configObj = JSON.parse(configObj); } catch(e) { configObj = {}; }
                            }
                            configObj.threshold = newThreshold;
                            await DatabaseService.updateSetting(guildId, 'antiSpamConfig', configObj);
                            await modalInteraction.update(await generateDashboard());
                        } catch (err) {}
                        return;
                    }

                    // Конфигурация времени таймаута
                    if (selection === 'act_antispam_duration') {
                        const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
                        const modalId = `modal_antispam_duration_${i.id}`;
                        const modalTitle = lang === 'ru' ? 'Время таймаута' : lang === 'uk' ? 'Час таймауту' : 'Timeout Duration';
                        const modal = new ModalBuilder()
                            .setCustomId(modalId)
                            .setTitle(modalTitle);

                        const settings = await DatabaseService.getSettings(guildId) || {};
                        let config = settings.antiSpamConfig || {};
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

                        const row = new ActionRowBuilder().addComponents(durationInput);
                        modal.addComponents(row);

                        await i.showModal(modal);

                        try {
                            const modalInteraction = await i.awaitModalSubmit({
                                filter: (subI) => subI.customId === modalId && subI.user.id === i.user.id,
                                time: 60000
                            });
                            const newDurationMinStr = modalInteraction.fields.getTextInputValue('input_antispam_duration');
                            const newDurationMin = parseInt(newDurationMinStr, 10);
                            if (isNaN(newDurationMin) || newDurationMin <= 0) {
                                const invalidMsg = lang === 'ru' ? 'Некорректное число.' : lang === 'uk' ? 'Некоректне число.' : 'Invalid number.';
                                return await modalInteraction.reply({ content: invalidMsg, flags: MessageFlags.Ephemeral });
                            }
                            const settingsObj = await DatabaseService.getSettings(guildId) || {};
                            let configObj = settingsObj.antiSpamConfig || {};
                            if (typeof configObj === 'string') {
                                try { configObj = JSON.parse(configObj); } catch(e) { configObj = {}; }
                            }
                            configObj.muteDuration = newDurationMin * 60 * 1000;
                            await DatabaseService.updateSetting(guildId, 'antiSpamConfig', configObj);
                            await modalInteraction.update(await generateDashboard());
                        } catch (err) {}
                        return;
                    }

                    let typeFilter = [ChannelType.GuildText, ChannelType.GuildForum];
                    let promptText = 'Выберите текстовый канал:';
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
                        if (selection === 'act_cat') await DatabaseService.updateSetting(guildId, 'voiceCategoryId', selectedId);
                        else if (selection === 'act_log') await DatabaseService.updateSetting(guildId, 'inviteLoggerChannel', selectedId);
                        else if (selection === 'act_sup') await DatabaseService.updateSetting(guildId, 'supportChannelId', selectedId);
                        else if (selection === 'act_rep') await DatabaseService.updateSetting(guildId, 'reportsModerationChannelId', selectedId);
                        else if (selection === 'act_verdict') await DatabaseService.updateSetting(guildId, 'verdictChannelId', selectedId);
                        else if (selection === 'act_honeypot') {
                            await DatabaseService.updateSetting(guildId, 'honeypotChannelId', selectedId);
                            await DatabaseService.updateSetting(guildId, 'honeypotEnabled', true);
                        }
                        else if (selection === 'act_honeypot_log') await DatabaseService.updateSetting(guildId, 'honeypotLogChannelId', selectedId);
                        await selectionInteraction.update({ content: localeManager.get('utility.settings.messages.saved', lang), components: [] });
                        await interaction.editReply(await generateDashboard());
                    } catch (err) {
                        await i.editReply({ content: localeManager.get('utility.settings.messages.select_timeout', lang), components: [] });
                    }
                    return;
                }

                const currentCfg = await DatabaseService.getSettings(guildId) || {};
                if (i.customId === 'select_welcome') {
                    await DatabaseService.updateSetting(guildId, 'newMemberChannelId', i.values[0]);
                }
                else if (i.customId === 'select_voice_main') {
                    await DatabaseService.updateSetting(guildId, 'mainVoiceChannelId', i.values[0]);
                }
                else if (i.customId === 'toggle_invites') {
                    await DatabaseService.updateSetting(guildId, 'allowInviteLogging', !currentCfg.allowInviteLogging);
                }
                else if (i.customId === 'toggle_members') {
                    await DatabaseService.updateSetting(guildId, 'allowLogingMembersAdd', !currentCfg.allowLogingMembersAdd);
                }
                else if (i.customId === 'select_language') {
                    await DatabaseService.updateSetting(guildId, 'language', i.values[0]);
                }
                else if (i.customId === 'toggle_honeypot') {
                    if (!currentCfg.honeypotChannelId) {
                        return await i.reply({ content: localeManager.get('utility.settings.messages.honeypot_trap_required', lang), flags: MessageFlags.Ephemeral });
                    }
                    await DatabaseService.updateSetting(guildId, 'honeypotEnabled', !currentCfg.honeypotEnabled);
                }
                else if (i.customId === 'toggle_antispam') {
                    await DatabaseService.updateSetting(guildId, 'antiSpamEnabled', !currentCfg.antiSpamEnabled);
                }
                await i.update(await generateDashboard());
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