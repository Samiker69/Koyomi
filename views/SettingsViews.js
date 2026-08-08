const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const localeManager = require('../locales/localeManager');

class SettingsViews {
    static renderDashboard(pageId, cfg, lang, interaction) {
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

        const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTimestamp()
            .setFooter({ text: localeManager.get('utility.settings.messages.footer', lang) });

        if (interaction && interaction.user) {
            embed.setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
        }

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
    }

    static renderStarboard(starboardCfg, lang, interaction) {
        const valStarboardChannel = starboardCfg.starboardChannelId ? `<#${starboardCfg.starboardChannelId}>` : localeManager.get('utility.starboard.messages.not_set', lang);
        const valStarboardMin = starboardCfg.minReactions || 5;
        const statusStarboard = starboardCfg.enabled ? localeManager.get('utility.starboard.messages.enabled', lang) : localeManager.get('utility.starboard.messages.disabled', lang);

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTimestamp()
            .setTitle(localeManager.get('utility.starboard.messages.dashboard_title', lang, { name: interaction.guild.name }))
            .setDescription(localeManager.get('utility.starboard.messages.dashboard_desc', lang))
            .addFields(
                {
                    name: localeManager.get('utility.starboard.messages.starboard_channel', lang),
                    value: `> ${valStarboardChannel}`,
                    inline: true
                },
                {
                    name: localeManager.get('utility.starboard.messages.starboard_min', lang),
                    value: `> \`${valStarboardMin}\``,
                    inline: true
                },
                {
                    name: localeManager.get('utility.starboard.messages.status', lang),
                    value: `> ${statusStarboard}`,
                    inline: true
                }
            )
            .setFooter({ text: localeManager.get('utility.starboard.messages.footer', lang) });

        if (interaction && interaction.user) {
            embed.setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
        }

        const rowActions = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('menu_starboard')
                .setPlaceholder(localeManager.get('utility.starboard.messages.placeholder_extra', lang))
                .addOptions(
                    {
                        label: localeManager.get('utility.starboard.messages.act_starboard_channel.label', lang),
                        description: localeManager.get('utility.starboard.messages.act_starboard_channel.description', lang),
                        value: 'act_starboard_channel'
                    },
                    {
                        label: localeManager.get('utility.starboard.messages.act_starboard_min.label', lang),
                        description: localeManager.get('utility.starboard.messages.act_starboard_min.description', lang),
                        value: 'act_starboard_min'
                    }
                )
        );

        const rowToggles = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('toggle_starboard')
                .setLabel(localeManager.get('utility.starboard.messages.toggle_starboard', lang, { state: starboardCfg.enabled ? localeManager.get('utility.starboard.messages.on', lang) : localeManager.get('utility.starboard.messages.off', lang) }))
                .setStyle(starboardCfg.enabled ? ButtonStyle.Success : ButtonStyle.Secondary)
        );

        return { embeds: [embed], components: [rowActions, rowToggles] };
    }
}

module.exports = SettingsViews;