const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../services/DatabaseService');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('modstats')
        .setDescription(localeManager.get('moderation.modstats.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.modstats.description'))
        .addUserOption(option =>
            option.setName('moderator')
                .setDescription(localeManager.get('moderation.modstats.options.moderator.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.modstats.options.moderator.description'))
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const lang = interaction.guildLocale;
        if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers) && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: localeManager.get('moderation.moderation.messages.no_perms', lang), 
                flags: MessageFlags.Ephemeral 
            });
        }

        await interaction.deferReply();

        const serverId = interaction.guild.id;
        const targetUser = interaction.options.getUser('moderator');

        const allModCases = DatabaseService.getServerModCases(serverId);

        if (!allModCases || allModCases.length === 0) {
            const noCasesEmbed = EmbedService.createBaseEmbed(interaction)
                .setTitle(localeManager.get('moderation.modstats.messages.no_stats_title', lang))
                .setDescription(localeManager.get('moderation.modstats.messages.no_stats_desc', lang))
                .setFooter({ 
                    text: localeManager.get('moderation.modstats.messages.no_data_footer', lang), 
                    iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
                });
            return interaction.editReply({ embeds: [noCasesEmbed] });
        }

        const aggregatedStats = {};
        for (const modCase of allModCases) {
            const moderatorId = modCase.moderatorId;
            const action = modCase.action;

            if (!aggregatedStats[moderatorId]) {
                aggregatedStats[moderatorId] = {
                    total: 0,
                    types: {}
                };
            }
            aggregatedStats[moderatorId].total++;
            aggregatedStats[moderatorId].types[action] = (aggregatedStats[moderatorId].types[action] || 0) + 1;
        }

        const embed = EmbedService.createBaseEmbed(interaction);

        if (targetUser) {
            const userStats = aggregatedStats[targetUser.id];

            if (!userStats) {
                const notModeratorEmbed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(localeManager.get('moderation.modstats.messages.user_not_mod_title', lang))
                    .setDescription(localeManager.get('moderation.modstats.messages.user_not_mod_desc', lang, { user: targetUser.tag }))
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ 
                        text: localeManager.get('moderation.modstats.messages.user_not_mod_footer', lang), 
                        iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) 
                    });
                return interaction.editReply({ embeds: [notModeratorEmbed] });
            }

            embed.setTitle(localeManager.get('moderation.modstats.messages.stats_user_title', lang, { user: targetUser.username }))
                 .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                 .setDescription(localeManager.get('moderation.modstats.messages.stats_user_desc', lang, { user: targetUser.toString() }));

            embed.addFields(
                { name: localeManager.get('moderation.modstats.messages.mod_label', lang), value: `<@${targetUser.id}>`, inline: true },
                { name: localeManager.get('moderation.modstats.messages.total_label', lang), value: `\`${userStats.total}\``, inline: true }
            );

            const types = Object.keys(userStats.types);
            if (types.length > 0) {
                embed.addFields({ name: localeManager.get('moderation.modstats.messages.types_label', lang), value: '\u200B', inline: false });

                types.sort().forEach(type => {
                    const label = localeManager.get(`moderation.moderation.messages.labels.${type}`, lang) || type;
                    embed.addFields({
                        name: `  • ${label}`,
                        value: `\`${userStats.types[type]}\` ${localeManager.get('moderation.case.messages.history_times', lang)}`,
                        inline: true
                    });
                });
            } else {
                embed.addFields({ name: localeManager.get('moderation.modstats.messages.types_label', lang), value: localeManager.get('moderation.modstats.messages.no_data_label', lang), inline: false });
            }

            embed.setFooter({
                text: localeManager.get('moderation.modstats.messages.user_footer', lang, { user: targetUser.username }),
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            });

        } else {
            const moderatorIds = Object.keys(aggregatedStats);
            let members = new Map();
            try {
                members = await interaction.guild.members.fetch({ user: moderatorIds });
            } catch (error) {
                console.error('Ошибка при получении пользователей гильдии для статистики модераторов:', error);
            }

            const displayData = [];
            for (const modId of moderatorIds) {
                const modStats = aggregatedStats[modId];
                const member = members.get(modId);
                const tag = member ? `<@${member.user.id}>` : localeManager.get('moderation.modstats.messages.unknown_mod', lang, { id: modId });
                displayData.push({ id: modId, tag: tag, ...modStats });
            }

            displayData.sort((a, b) => b.total - a.total);

            embed.setTitle(localeManager.get('moderation.modstats.messages.server_title', lang))
                 .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                 .setDescription(localeManager.get('moderation.modstats.messages.server_desc', lang));

            const maxFields = 25;
            let currentFieldsCount = 0;
            let totalPunishmentsOverall = 0;

            for (const mod of displayData) {
                if (currentFieldsCount >= maxFields) {
                    embed.addFields({
                        name: localeManager.get('moderation.modstats.messages.stats_continue', lang),
                        value: localeManager.get('moderation.modstats.messages.stats_continue_desc', lang, { count: currentFieldsCount }),
                        inline: false
                    });
                    break;
                }

                let statsString = `**${localeManager.get('moderation.modstats.messages.total_label', lang)}:** \`${mod.total}\``;
                totalPunishmentsOverall += mod.total;

                const types = Object.keys(mod.types);
                if (types.length > 0) {
                    statsString += `\n**${localeManager.get('moderation.modstats.messages.types_label', lang).replace(':', '')}:** `;
                    statsString += types.sort().map(type => {
                        const label = localeManager.get(`moderation.moderation.messages.labels.${type}`, lang) || type;
                        return `${label}: \`${mod.types[type]}\``;
                    }).join(', ');
                } else {
                    statsString += `\n${localeManager.get('moderation.modstats.messages.no_type_details', lang)}`;
                }

                embed.addFields({
                    name: `${mod.tag}`,
                    value: statsString,
                    inline: false
                });
                currentFieldsCount++;
            }

            if (embed.data.description) {
                 embed.setDescription(embed.data.description + localeManager.get('moderation.modstats.messages.total_overall_desc', lang, { total: totalPunishmentsOverall }));
            } else {
                 embed.addFields({ name: localeManager.get('moderation.modstats.messages.total_label', lang), value: `\`${totalPunishmentsOverall}\``, inline: false });
            }

            embed.setFooter({
                text: localeManager.get('moderation.modstats.messages.server_footer', lang),
                iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },
};