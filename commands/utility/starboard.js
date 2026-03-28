const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
    EmbedBuilder,
    ActionRowBuilder,
    ChannelSelectMenuBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require('discord.js');

const StarboardDB = require('../../functions/db/starboard');
const db = new StarboardDB();

const { utility } = require('../../locales/descriptions/utility');
const replies = require('../../locales/answers/replies');

// Вспомогательная функция (даже лучше вынести потом, но согласно плану всё делаем "как есть")
const getReply = (key, locale, vars = {}) => {
    let text = replies[key]?.[locale] || replies[key]?.['ru'] || key;
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('starboard')
        .setDescription('Открыть панель управления доской звёзд (Starboard)')
        .setDescriptionLocalizations(utility.starboard.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        const generateDashboard = () => {
            const settings = db.getSettings(guildId) || {};

            const isEnabled = settings.enabled || false;
            const channelId = settings.starboardChannelId;
            const minReactions = settings.minReactions || 3;

            const loc = interaction.locale;

            const statusText = isEnabled ? getReply('starboard_enabled', loc) : getReply('starboard_disabled', loc);
            const channelText = channelId ? `<#${channelId}>` : getReply('starboard_notset', loc);

            const dashboardEmbed = new EmbedBuilder()
                .setColor(isEnabled ? '#FFAC33' : '#2b2d31')
                .setTitle(getReply('starboard_title', loc, { guildName: interaction.guild.name }))
                .setDescription(getReply('starboard_desc', loc))
                .addFields(
                    {
                        name: getReply('starboard_status', loc),
                        value: `> **${statusText}**`,
                        inline: true
                    },
                    {
                        name: getReply('starboard_min', loc),
                        value: `> **${minReactions}**`,
                        inline: true
                    },
                    {
                        name: getReply('starboard_channel', loc),
                        value: `> ${channelText}`,
                        inline: false
                    }
                )
                .setFooter({ text: getReply('starboard_inst', loc) })
                .setTimestamp();

            const rowChannel = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('sb_select_channel')
                    .setPlaceholder(getReply('starboard_ph1', loc))
                    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            );

            const rowCount = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('sb_select_count')
                    .setPlaceholder(getReply('starboard_ph2', loc))
                    .addOptions([
                        { label: '1', value: '1' },
                        { label: '3', value: '3' },
                        { label: '5', value: '5' },
                        { label: '10', value: '10' },
                        { label: '15', value: '15' },
                        { label: '20', value: '20' },
                    ])
            );

            const rowToggle = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('sb_toggle')
                    .setLabel(isEnabled ? getReply('starboard_btn_off', loc) : getReply('starboard_btn_on', loc))
                    .setStyle(isEnabled ? ButtonStyle.Danger : ButtonStyle.Success)
            );

            return { embeds: [dashboardEmbed], components: [rowChannel, rowCount, rowToggle] };
        };

        const msg = await interaction.reply({
            ...generateDashboard(),
            flags: MessageFlags.Ephemeral
        });

        const collector = msg.createMessageComponentCollector({ time: 300_000 });

        collector.on('collect', async i => {
            const currentSettings = db.getSettings(guildId) || {};

            try {
                if (i.customId === 'sb_select_channel') {
                    const selectedChannel = i.values[0];
                    db.updateSettings(guildId, { starboardChannelId: selectedChannel });
                }
                else if (i.customId === 'sb_select_count') {
                    const count = parseInt(i.values[0]);
                    db.updateSettings(guildId, { minReactions: count });
                }
                else if (i.customId === 'sb_toggle') {
                    const newState = !currentSettings.enabled;
                    db.updateSettings(guildId, { enabled: newState });
                }

                await i.update(generateDashboard());

            } catch (err) {
                console.error(err);
                if (!i.replied && !i.deferred) {
                    const errorText = getReply('starboard_err', interaction.locale);
                    await i.reply({ content: errorText, flags: MessageFlags.Ephemeral });
                }
            }
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] }).catch(() => { });
        });
    }
};