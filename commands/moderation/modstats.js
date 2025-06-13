const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const ModerationDB = require('../../functions/db/case');
const db = new ModerationDB();

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('modstats')
        .setDescription('Статистика наказаний модераторов.')
        .addUserOption(option =>
            option.setName('moderator')
                .setDescription('Выберите модератора для статистики.')
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers) && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "У вас нет прав для использования этой команды.", flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply();

        const serverId = interaction.guild.id;
        const targetUser = interaction.options.getUser('moderator');

        const allModCases = db.getServerModCases(serverId);

        if (!allModCases || allModCases.length === 0) {
            const noCasesEmbed = new EmbedBuilder()
                .setColor(0x800080)
                .setTitle('Статистика модерации')
                .setDescription('На этом сервере пока нет зарегистрированных наказаний. Начните модерировать, чтобы увидеть статистику здесь!')
                .setTimestamp()
                .setFooter({ text: 'Нет данных для отображения', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) });
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

        const embed = new EmbedBuilder()
            .setColor(0x800080)
            .setTimestamp(new Date());

        if (targetUser) {
            const userStats = aggregatedStats[targetUser.id];

            if (!userStats) {
                const notModeratorEmbed = new EmbedBuilder()
                    .setColor(0x800080)
                    .setTitle('Статистика модератора')
                    .setDescription(`Пользователь **${targetUser.tag}** либо не является модератором, либо ещё не выдавал наказаний на этом сервере.`)
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: 'Проверьте другого пользователя или общую статистику', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) });
                return interaction.editReply({ embeds: [notModeratorEmbed] });
            }

            embed.setTitle(`Статистика: ${targetUser.username}`)
                 .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                 .setDescription(`Здесь представлена активность **${targetUser}** по выдаче наказаний.`);

            embed.addFields(
                { name: 'Модератор', value: `<@${targetUser.id}>`, inline: true },
                { name: 'Всего наказаний', value: `\`${userStats.total}\``, inline: true }
            );

            const types = Object.keys(userStats.types);
            if (types.length > 0) {
                embed.addFields({ name: 'Типы наказаний:', value: '\u200B', inline: false });

                types.sort().forEach(type => {
                    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
                    embed.addFields({
                        name: `  • ${formattedType}`,
                        value: `\`${userStats.types[type]}\` раз`,
                        inline: true
                    });
                });
            } else {
                embed.addFields({ name: 'Типы наказаний:', value: 'Нет данных.', inline: false });
            }

            embed.setFooter({
                text: `Статистика модератора ${targetUser.username}`,
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
                const tag = member ? `<@${member.user.id}>` : `Неизвестный (${modId})`;
                displayData.push({ id: modId, tag: tag, ...modStats });
            }

            displayData.sort((a, b) => b.total - a.total);

            embed.setTitle('Общая статистика модераторов')
                 .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                 .setDescription('Активность модераторов на сервере:\n\u200B');

            const maxFields = 25;
            let currentFieldsCount = 0;
            let totalPunishmentsOverall = 0;

            for (const mod of displayData) {
                if (currentFieldsCount >= maxFields) {
                    embed.addFields({
                        name: 'Продолжение статистики',
                        value: `Показана статистика по ${currentFieldsCount} модераторам. Для полной информации обратитесь к администратору.`,
                        inline: false
                    });
                    break;
                }

                let statsString = `**Всего:** \`${mod.total}\``;
                totalPunishmentsOverall += mod.total;

                const types = Object.keys(mod.types);
                if (types.length > 0) {
                    statsString += '\n**Типы:** ';
                    statsString += types.sort().map(type =>
                        `${type.charAt(0).toUpperCase() + type.slice(1)}: \`${mod.types[type]}\``
                    ).join(', ');
                } else {
                    statsString += '\n*Без детализации по типам.*';
                }

                embed.addFields({
                    name: `${mod.tag}`,
                    value: statsString,
                    inline: false
                });
                currentFieldsCount++;
            }

            if (embed.data.description) {
                 embed.setDescription(embed.data.description + `\n**Общее количество наказаний на сервере: \`${totalPunishmentsOverall}\`**`);
            } else {
                 embed.addFields({ name: 'Всего наказаний на сервере', value: `\`${totalPunishmentsOverall}\``, inline: false });
            }

            embed.setFooter({
                text: 'Общая статистика модерации сервера',
                iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },
};