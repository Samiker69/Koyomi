const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
    ActionRowBuilder,
    ChannelSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ComponentType
} = require('discord.js');
const SettingsViews = require('../../views/SettingsViews');
const DatabaseService = require('../../database/repositories');
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
            return SettingsViews.renderDashboard(pageId, cfg, lang, interaction);
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
                if (i.customId === 'select_voice_main') {
                    await DatabaseService.updateSetting(guildId, 'mainVoiceChannelId', i.values[0]);
                    return await i.update(await render(activePage));
                }
                if (i.customId === 'select_voice_cat') {
                    await DatabaseService.updateSetting(guildId, 'voiceCategoryId', i.values[0]);
                    return await i.update(await render(activePage));
                }
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