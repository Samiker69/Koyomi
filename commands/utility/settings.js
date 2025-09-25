const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder, ChannelType } = require('discord.js');
const settings = require('../../functions/db/settings');
const { bot_log_channel } = require('../../config.json');
const LocaleManager = require('../../locales/localesManager');

const Sdb = new settings();
const localeManager = new LocaleManager();

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName(localeManager.getString('commands.settings.name'))
		.setDescription(localeManager.getString('commands.settings.description'))
        .addSubcommand(subcommand => 
            subcommand.setName(localeManager.getString('commands.settings.welcomechannel.name'))
            .setDescription(localeManager.getString('commands.settings.welcomechannel.description'))
            .addChannelOption(option => option.setName(localeManager.getString('commands.settings.welcomechannel.options.channel.name')).setDescription(localeManager.getString('commands.settings.welcomechannel.options.channel.description')).setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            
        .addSubcommand(subcommand => 
            subcommand.setName(localeManager.getString('commands.settings.invite-logger-channel.name'))
            .setDescription(localeManager.getString('commands.settings.invite-logger-channel.description'))
            .addChannelOption(option => option.setName(localeManager.getString('commands.settings.invite-logger-channel.options.channel.name')).setDescription(localeManager.getString('commands.settings.invite-logger-channel.options.channel.description')).setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand => 
            subcommand.setName(localeManager.getString('commands.settings.allowlogging.name'))
            .setDescription(localeManager.getString('commands.settings.allowlogging.description'))
            .addBooleanOption(option => option.setName(localeManager.getString('commands.settings.allowlogging.options.bool.name')).setDescription(localeManager.getString('commands.settings.allowlogging.options.bool.description')).setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand => 
            subcommand.setName(localeManager.getString('commands.settings.allow-membersadd-logging.name'))
            .setDescription(localeManager.getString('commands.settings.allow-membersadd-logging.description'))
            .addBooleanOption(option => option.setName(localeManager.getString('commands.settings.allow-membersadd-logging.options.bool.name')).setDescription(localeManager.getString('commands.settings.allow-membersadd-logging.options.bool.description')).setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.settings.set-voice-category.name'))
            .setDescription(localeManager.getString('commands.settings.set-voice-category.description'))
            .addChannelOption(option => option.setName(localeManager.getString('commands.settings.set-voice-category.options.category.name')).setDescription(localeManager.getString('commands.settings.set-voice-category.options.category.description')).setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.settings.set-main-voice.name'))
            .setDescription(localeManager.getString('commands.settings.set-main-voice.description'))
            .addChannelOption(option => option.setName(localeManager.getString('commands.settings.set-main-voice.options.channel.name')).setDescription(localeManager.getString('commands.settings.set-main-voice.options.channel.description')).setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.settings.support-channel.name'))
            .setDescription(localeManager.getString('commands.settings.support-channel.description'))
            .addChannelOption(opt =>
                opt.setName(localeManager.getString('commands.settings.support-channel.options.channel.name'))
                .setDescription(localeManager.getString('commands.settings.support-channel.options.channel.description'))
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.settings.to-default.name'))
            .setDescription(localeManager.getString('commands.settings.to-default.description'))
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.settings.set-reports-channel.name'))
                .setDescription(localeManager.getString('commands.settings.set-reports-channel.description'))
                .addChannelOption(option =>
                    option.setName(localeManager.getString('commands.settings.set-reports-channel.options.channel.name'))
                        .setDescription(localeManager.getString('commands.settings.set-reports-channel.options.channel.description'))
                        .setRequired(true)
                )
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction) {
        if (!(interaction.memberPermissions.has('ManageGuild') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }
        const channel = interaction.options.getChannel('channel');
        const category = interaction.options.getChannel('category');
        const bool = interaction.options.getBoolean('bool');
        const guildId = interaction.guild.id;

        switch (interaction.options.getSubcommand()) {
            case "welcomechannel":
                try {
                    Sdb.updateSetting(interaction.guild.id, 'newMemberChannelId', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания участников`);
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Произошла ошибка при обработке команды`)
            .addFields(
                { name: `Команда`, value: `${interaction.commandName}` },
                { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
            )
            .setTimestamp(new Date())
            console.error(error);
            const logChannel = await interaction.client.channels.fetch(bot_log_channel)
            await logChannel.send({ embeds: [errorEmbed] });;
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'invite-logger-channel':
                try {
                    Sdb.updateSetting(interaction.guild.id, 'inviteLoggerChannel', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания приглашений`);
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Произошла ошибка при обработке команды`)
            .addFields(
                { name: `Команда`, value: `${interaction.commandName}` },
                { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
            )
            .setTimestamp(new Date())
            console.error(error);
            const logChannel = await interaction.client.channels.fetch(bot_log_channel)
            await logChannel.send({ embeds: [errorEmbed] });;
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'allowlogging':
                try {
                    const data = Sdb.getSettings(interaction.guild.id)
                    if (data.allowInviteLogging === bool) return await interaction.reply('Этот параметр уже установлен на ' + bool);
                    let answerLog;
                    Sdb.updateSetting(interaction.guild.id, 'allowInviteLogging', bool);
                    if (bool) {answerLog = 'Теперь бот будет уведомлять об использованной ссылке-приглашения';} 
                    else {answerLog = 'Теперь бот не будет уведомлять об использованной ссылке-приглашения';}
                    await interaction.reply(answerLog);
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Произошла ошибка при обработке команды`)
            .addFields(
                { name: `Команда`, value: `${interaction.commandName}` },
                { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
            )
            .setTimestamp(new Date())
            console.error(error);
            const logChannel = await interaction.client.channels.fetch(bot_log_channel)
            await logChannel.send({ embeds: [errorEmbed] });;
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'allow-membersadd-logging':
                try {
                    const data = Sdb.getSettings(interaction.guild.id)
                    if (data.allowLogingMembersAdd === bool) return await interaction.reply('Этот параметр уже установлен на ' + bool);
                    const answerMemberLog = bool ? "Теперь бот будет уведомлять о новых/ушедших участниках" : 'Теперь бот не будет уведомлять о новых/ушедших участниках'
                    Sdb.updateSetting(interaction.guild.id, 'allowLogingMembersAdd', bool);
                    await interaction.reply(answerMemberLog);
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Произошла ошибка при обработке команды`)
            .addFields(
                { name: `Команда`, value: `${interaction.commandName}` },
                { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
            )
            .setTimestamp(new Date())
            console.error(error);
            const logChannel = await interaction.client.channels.fetch(bot_log_channel)
            await logChannel.send({ embeds: [errorEmbed] });;
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'set-voice-category':
                try {
                    if (category.type !== 4) return await interaction.reply('Выберите именно категорию!');
                    Sdb.updateSetting(interaction.guild.id, 'voiceCategoryId', category.id);
                    await interaction.reply(`Теперь ${category} выбрана как категория для новых войс-каналов`);
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Произошла ошибка при обработке команды`)
            .addFields(
                { name: `Команда`, value: `${interaction.commandName}` },
                { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
            )
            .setTimestamp(new Date())
            console.error(error);
            const logChannel = await interaction.client.channels.fetch(bot_log_channel)
            await logChannel.send({ embeds: [errorEmbed] });;
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'set-main-voice':
                try {
                    if (channel.type !== 2) return await interaction.reply('Выберите именно голосовой канал!');
                    Sdb.updateSetting(interaction.guild.id, 'mainVoiceChannelId', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как основной голосовой канал для создания комнат`);
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Произошла ошибка при обработке команды`)
            .addFields(
                { name: `Команда`, value: `${interaction.commandName}` },
                { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
            )
            .setTimestamp(new Date())
            console.error(error);
            const logChannel = await interaction.client.channels.fetch(bot_log_channel)
            await logChannel.send({ embeds: [errorEmbed] });;
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;
            case "to-default": {
                //todo: должно вылезти подтверждение выполнения действия
                const Promise = Sdb.removeServer(interaction.guild.id)
                if (Promise) {
                    Sdb.addServer(interaction.guild.id)
                    await interaction.reply('Настройки сервера были сброшены!')
                } else {
                    await interaction.reply('Ничего не произошло, возможно, вашего сервера ещё не было в бд.')
                }
                break;
            }
            case "support-channel": {
                Sdb.updateSetting(interaction.guild.id, "supportChannelId", channel.id)
                await interaction.reply(`Канал поддержки изменён на ${channel}`);
                break;
            }

            case 'set-reports-channel': { 
                try {
                    Sdb.updateSetting(guildId, 'reportsModerationChannelId', channel.id);
                    await interaction.reply({ content: `Канал для получения жалоб модераторам установлен на ${channel}.`, flags: MessageFlags.Ephemeral });
                } catch (error) {
                    const errorStackShort = String(error.stack).substring(0, 1000) + '...';
                    const errorEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(`Произошла ошибка при обработке команды`)
                        .addFields(
                            { name: `Команда`, value: `${interaction.commandName} set-reports-channel` },
                            { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${errorStackShort}\`\`\`` }
                        )
                        .setTimestamp(new Date());
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel);
                    await logChannel.send({ embeds: [errorEmbed] });
                    await interaction.reply({ content: 'Не удалось изменить параметр.', flags: MessageFlags.Ephemeral });
                }
                break;
            }

            default:
                await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                break;
        }
    }
};