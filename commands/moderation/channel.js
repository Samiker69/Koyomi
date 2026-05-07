const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, ChannelType } = require('discord.js');
const EmbedService = require('../../services/EmbedService');

const data = new SlashCommandBuilder()
    .setName('channel')
    .setDescription('Команды для модерации каналов')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addSubcommand(subcommand =>
        subcommand
            .setName('lock')
            .setDescription('Заблокировать канал')
            .addChannelOption(option =>
                option.setName('канал')
                    .setDescription('Канал для блокировки')
                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement)
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('unlock')
            .setDescription('Разблокировать канал')
            .addChannelOption(option =>
                option.setName('канал')
                    .setDescription('Канал для разблокировки')
                     .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement)
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('slowmode')
            .setDescription('Установить слоумод на канале')
            .addIntegerOption(option =>
                option.setName('секунды')
                    .setDescription('Длительность слоумода в секундах (0 = выключить, макс. 21600)')
                    .setMinValue(0)
                    .setMaxValue(21600)
                    .setRequired(true)
            )
            .addChannelOption(option =>
                option.setName('канал')
                    .setDescription('Канал для слоумода')
                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildMedia)
                    .setRequired(false)
            )
    );


module.exports = {
    cooldown: 5,
    data,
    async execute(interaction) {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ content: "У вас недостаточно прав для выполнения действия: Управление каналами.", flags: MessageFlags.Ephemeral });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const targetChannel = interaction.options.getChannel('канал') || interaction.channel;
        const everyoneRole = interaction.guild.roles.everyone;

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels) ||
            !interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
             await interaction.reply({ content: "У меня недостаточно прав (Управление каналами и/или Управление ролями) для изменения разрешений канала.", flags: MessageFlags.Ephemeral });
             return;
        }
        if (!targetChannel.manageable) {
             await interaction.reply({ content: `У меня недостаточно прав для управления каналом ${targetChannel}.`, flags: MessageFlags.Ephemeral });
             return;
        }


        switch (subcommand) {
            case 'lock': {
                if (targetChannel.type !== ChannelType.GuildText &&
                    targetChannel.type !== ChannelType.GuildVoice &&
                    targetChannel.type !== ChannelType.GuildAnnouncement) {
                    await interaction.reply({ content: `Канал ${targetChannel} нельзя блокировать таким способом.`, flags: MessageFlags.Ephemeral });
                    return;
                }

                try {
                    const permissionOverwrite = targetChannel.type === ChannelType.GuildVoice ?
                                                 PermissionFlagsBits.Speak :
                                                 PermissionFlagsBits.SendMessages;

                    await targetChannel.permissionOverwrites.edit(everyoneRole, {
                        [permissionOverwrite]: false,
                    }, { reason: `Lock by ${interaction.user.username}` });
                    const embed = EmbedService.createBaseEmbed(interaction)
                        .setDescription(`Канал ${targetChannel} заблокирован.`)
                        .addFields(
                            { name: 'Модератор', value: `${interaction.user}`, inline: true },
                            { name: 'Канал', value: `${targetChannel}`, inline: true }
                        );

                    await interaction.reply({ embeds: [embed] });

                } catch (error) {
                    console.error('Ошибка при блокировке канала:', error);
                     await interaction.reply({ content: `Не удалось заблокировать канал ${targetChannel}.`, flags: MessageFlags.Ephemeral });
                }
                break;
            }

            case 'unlock': {
                 if (targetChannel.type !== ChannelType.GuildText &&
                     targetChannel.type !== ChannelType.ChannelType.GuildVoice &&
                     targetChannel.type !== ChannelType.GuildAnnouncement) {
                     await interaction.reply({ content: `Канал ${targetChannel} нельзя разблокировать таким способом.`, flags: MessageFlags.Ephemeral });
                     return;
                 }

                try {
                     const permissionOverwrite = targetChannel.type === ChannelType.GuildVoice ?
                                                  PermissionFlagsBits.Speak :
                                                  PermissionFlagsBits.SendMessages;

                    await targetChannel.permissionOverwrites.edit(everyoneRole, {
                        [permissionOverwrite]: null,
                    }, { reason: `Unlock by ${interaction.user.username}` });

                    const embed = EmbedService.createBaseEmbed(interaction)
                        .setDescription(`Канал ${targetChannel} разблокирован.`)
                        .addFields(
                            { name: 'Модератор', value: `${interaction.user}`, inline: true },
                            { name: 'Канал', value: `${targetChannel}`, inline: true }
                        );

                    await interaction.reply({ embeds: [embed] });

                } catch (error) {
                    console.error('Ошибка при разблокировке канала:', error);
                    await interaction.reply({ content: `Не удалось разблокировать канал ${targetChannel}.`, flags: MessageFlags.Ephemeral });
                }
                break;
            }

            case 'slowmode': {
                if (targetChannel.type !== ChannelType.GuildText &&
                    targetChannel.type !== ChannelType.GuildAnnouncement &&
                     targetChannel.type !== ChannelType.GuildForum &&
                      targetChannel.type !== ChannelType.GuildMedia) {
                    await interaction.reply({ content: `На канале ${targetChannel} нельзя установить слоумод.`, flags: MessageFlags.Ephemeral });
                    return;
                }

                const seconds = interaction.options.getInteger('секунды');

                try {
                    await targetChannel.setRateLimitPerUser(seconds, `Slowmode by ${interaction.user.username}`);

                    const embed = EmbedService.createBaseEmbed(interaction)
                        .setDescription(seconds === 0 ?
                            `Слоумод отключен на канале ${targetChannel}.` :
                            `На канале ${targetChannel} установлен слоумод: ${seconds} секунд.`
                        )
                         .addFields(
                            { name: 'Модератор', value: `${interaction.user}`, inline: true },
                            { name: 'Канал', value: `${targetChannel}`, inline: true }
                         );

                     if (seconds > 0) {
                          embed.addFields({ name: 'Длительность', value: `${seconds} секунд`, inline: true });
                     }


                    await interaction.reply({ embeds: [embed] });

                } catch (error) {
                    console.error('Ошибка при установке слоумода:', error);
                    await interaction.reply({ content: `Не удалось установить слоумод на канале ${targetChannel}.`, flags: MessageFlags.Ephemeral });
                }
                break;
            }

            default:
                await interaction.reply({ content: 'Неизвестная подкоманда.', flags: MessageFlags.Ephemeral });
                break;
        }
    }
};