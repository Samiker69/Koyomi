const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

const data = new SlashCommandBuilder()
    .setName(localeManager.getString('commands.channel.name'))
    .setDescription(localeManager.getString('commands.channel.description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addSubcommand(subcommand =>
        subcommand
            .setName(localeManager.getString('commands.channel.lock.name'))
            .setDescription(localeManager.getString('commands.channel.lock.description'))
            .addChannelOption(option =>
                option.setName(localeManager.getString('commands.channel.lock.options.channel.name'))
                    .setDescription(localeManager.getString('commands.channel.lock.options.channel.description'))
                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement)
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName(localeManager.getString('commands.channel.unlock.name'))
            .setDescription(localeManager.getString('commands.channel.unlock.description'))
            .addChannelOption(option =>
                option.setName(localeManager.getString('commands.channel.unlock.options.channel.name'))
                    .setDescription(localeManager.getString('commands.channel.unlock.options.channel.description'))
                     .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement)
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName(localeManager.getString('commands.channel.slowmode.name'))
            .setDescription(localeManager.getString('commands.channel.slowmode.description'))
            .addIntegerOption(option =>
                option.setName(localeManager.getString('commands.channel.slowmode.options.seconds.name'))
                    .setDescription(localeManager.getString('commands.channel.slowmode.options.seconds.description'))
                    .setMinValue(0)
                    .setMaxValue(21600)
                    .setRequired(true)
            )
            .addChannelOption(option =>
                option.setName(localeManager.getString('commands.channel.slowmode.options.channel.name'))
                    .setDescription(localeManager.getString('commands.channel.slowmode.options.channel.description'))
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
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`Канал ${targetChannel} заблокирован.`)
                        .addFields(
                            { name: 'Модератор', value: `${interaction.user}`, inline: true },
                            { name: 'Канал', value: `${targetChannel}`, inline: true }
                        )
                        .setTimestamp();

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

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setDescription(`Канал ${targetChannel} разблокирован.`)
                        .addFields(
                            { name: 'Модератор', value: `${interaction.user}`, inline: true },
                            { name: 'Канал', value: `${targetChannel}`, inline: true }
                        )
                        .setTimestamp();

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

                    const embed = new EmbedBuilder()
                        .setColor('Orange')
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

                     embed.setTimestamp();


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