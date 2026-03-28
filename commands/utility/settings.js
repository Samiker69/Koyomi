const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ComponentType
} = require('discord.js');

const Settings = require('../../functions/db/settings');
const { bot_log_channel } = require('../../config.json');
const replies = require('../../locales/answers/replies');
const { utility } = require('../../locales/descriptions/utility');

const Sdb = new Settings();

const getReply = (key, locale, vars = {}) => {
    let text = replies[key]?.[locale] || replies[key]?.['ru'] || key;
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
    }
    return text;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Открыть панель управления настройками сервера')
        .setDescriptionLocalizations(utility.settings.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const loc = interaction.locale;

        const generateDashboard = () => {
            const cfg = Sdb.getSettings(guildId) || {};

            const statusInvites = cfg.allowInviteLogging ? getReply('setting_enabled', loc) : getReply('setting_disabled', loc);
            const statusMembers = cfg.allowLogingMembersAdd ? getReply('setting_enabled', loc) : getReply('setting_disabled', loc);

            const valWelcome = cfg.newMemberChannelId ? `<#${cfg.newMemberChannelId}>` : getReply('setting_not_set', loc);
            const valInvites = cfg.inviteLoggerChannel ? `<#${cfg.inviteLoggerChannel}>` : getReply('setting_not_set', loc);
            const valVoiceCat = cfg.voiceCategoryId ? `<#${cfg.voiceCategoryId}>` : getReply('setting_not_set', loc);
            const valVoiceMain = cfg.mainVoiceChannelId ? `<#${cfg.mainVoiceChannelId}>` : getReply('setting_not_set', loc);
            const valSupport = cfg.supportChannelId ? `<#${cfg.supportChannelId}>` : getReply('setting_not_set', loc);
            const valReports = cfg.reportsModerationChannelId ? `<#${cfg.reportsModerationChannelId}>` : getReply('setting_not_set', loc);

            const settingsEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle(getReply('setting_title', loc, { guildName: interaction.guild.name }))
                .setDescription(getReply('setting_desc', loc))
                .addFields(
                    {
                        name: getReply('setting_welcome_logs', loc),
                        value: getReply('setting_welcome_logs_val', loc, { valWelcome: valWelcome, valInvites: valInvites, statusMembers: statusMembers, statusInvites: statusInvites }),
                        inline: false
                    },
                    {
                        name: getReply('setting_private_voice', loc),
                        value: getReply('setting_private_voice_val', loc, { valVoiceCat: valVoiceCat, valVoiceMain: valVoiceMain }),
                        inline: false
                    },
                    {
                        name: getReply('setting_support_reports', loc),
                        value: getReply('setting_support_reports_val', loc, { valSupport: valSupport, valReports: valReports }),
                        inline: false
                    }
                )
                .setFooter({ text: getReply('setting_footer', loc) })
                .setTimestamp();

            const rowWelcome = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('select_welcome')
                    .setPlaceholder(getReply('setting_select_welcome', loc))
                    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            );

            const rowVoice = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('select_voice_main')
                    .setPlaceholder(getReply('setting_select_voice', loc))
                    .setChannelTypes(ChannelType.GuildVoice)
            );

            const rowOtherChannels = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_actions')
                    .setPlaceholder(getReply('setting_menu_actions', loc))
                    .addOptions(
                        { label: getReply('setting_act_cat_label', loc), description: getReply('setting_act_cat_desc', loc), value: 'act_cat' },
                        { label: getReply('setting_act_log_label', loc), description: getReply('setting_act_log_desc', loc), value: 'act_log' },
                        { label: getReply('setting_act_sup_label', loc), description: getReply('setting_act_sup_desc', loc), value: 'act_sup' },
                        { label: getReply('setting_act_rep_label', loc), description: getReply('setting_act_rep_desc', loc), value: 'act_rep' },
                        { label: getReply('setting_act_reset_label', loc), description: getReply('setting_act_reset_desc', loc), value: 'act_reset' }
                    )
            );

            const rowToggles = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('toggle_invites')
                    .setLabel(`${getReply('setting_toggle_invites', loc)} ${cfg.allowInviteLogging ? getReply('setting_toggle_on', loc) : getReply('setting_toggle_off', loc)}`)
                    .setStyle(cfg.allowInviteLogging ? ButtonStyle.Success : ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('toggle_members')
                    .setLabel(`${getReply('setting_toggle_members', loc)} ${cfg.allowLogingMembersAdd ? getReply('setting_toggle_on', loc) : getReply('setting_toggle_off', loc)}`)
                    .setStyle(cfg.allowLogingMembersAdd ? ButtonStyle.Success : ButtonStyle.Secondary)
            );

            return { embeds: [settingsEmbed], components: [rowWelcome, rowVoice, rowOtherChannels, rowToggles] };
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

                    let typeFilter = [ChannelType.GuildText];
                    let promptText = getReply('setting_prompt_text', loc);
                    if (selection === 'act_cat') {
                        typeFilter = [ChannelType.GuildCategory];
                        promptText = getReply('setting_prompt_cat', loc);
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

                        await selectionInteraction.update({ content: getReply('setting_saved', loc), components: [] });
                        await interaction.editReply(generateDashboard());

                    } catch (err) {
                        await i.editReply({ content: getReply('setting_timeout', loc), components: [] });
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

                await i.update(generateDashboard());

            } catch (err) {
                console.error(err);
                const logChannel = await interaction.client.channels.fetch(bot_log_channel).catch(() => null);
                if (logChannel) logChannel.send(`Ошибка в Settings Dashboard: ${err.message}`);

                if (!i.replied && !i.deferred) {
                    await i.reply({ content: getReply('setting_save_error', loc), flags: MessageFlags.Ephemeral });
                }
            }
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] }).catch(() => { });
        });
    }
};