const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const settings = require('../../functions/db/settings')

const Sdb = new settings('./database/settings.db')

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Изменить настройки бота')
        .addSubcommand(subcommand => 
            subcommand.setName('welcomechannel').setDescription('Канал для уведомления о новых участниках')
                .addChannelOption(option => option.setName('channel').setDescription('Канал').setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand.setName('invite-logger-channel').setDescription('Канал для логирования ссылок приглашений')
                .addChannelOption(option => option.setName('channel').setDescription('Канал').setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand.setName('allowlogging').setDescription('Отправлять сообщения об использованной ссылке?')
                .addBooleanOption(option => option.setName('bool').setDescription('включить/выключить').setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand.setName('allowmembersaddlogging').setDescription('Отправлять сообщения о новых/ушедших участниках')
                .addBooleanOption(option => option.setName('bool').setDescription('включить/выключить').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('set-voice-category').setDescription('Установить категорию для новых войс-каналов')
                .addChannelOption(option => option.setName('category').setDescription('Категория').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('set-main-voice').setDescription('Установить основной голосовой канал для создания комнат')
                .addChannelOption(option => option.setName('channel').setDescription('Основной войс').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand.setName('to-default').setDescription('Безвозвратно сбрасывает настройки сервера')
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction) {
        if (!(interaction.memberPermissions.has('ManageGuild') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }
        const channel = interaction.options.getChannel('channel');
        const category = interaction.options.getChannel('category');
        const bool = interaction.options.getBoolean('bool');

        switch (interaction.options.getSubcommand()) {
            case "welcomechannel":
                try {
                    Sdb.updateSetting(interaction.guild.id, 'newMemberChannelId', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания участников`);
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'invite-logger-channel':
                try {
                    Sdb.updateSetting(interaction.guild.id, 'inviteLoggerChannel', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания приглашений`);
                } catch (error) {
                    console.error(error);
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
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'allowmembersaddlogging':
                try {
                    const data = Sdb.getSettings(interaction.guild.id)
                    if (data.allowLogingMembersAdd === bool) return await interaction.reply('Этот параметр уже установлен на ' + bool);
                    let answerMemberLog;
                    Sdb.updateSetting(interaction.guild.id, 'allowLogingMembersAdd', bool);
                    if (bool) {answerMemberLog = 'Теперь бот будет уведомлять о новых/ушедших участниках';} 
                    else {answerMemberLog = 'Теперь бот не будет уведомлять о новых/ушедших участниках';}
                    await interaction.reply(answerMemberLog);
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'set-voice-category':
                try {
                    if (category.type !== 4) return await interaction.reply('Выберите именно категорию!');
                    Sdb.updateSetting(interaction.guild.id, 'voiceCategoryId', category.id);
                    await interaction.reply(`Теперь ${category} выбрана как категория для новых войс-каналов`);
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'set-main-voice':
                try {
                    if (channel.type !== 2) return await interaction.reply('Выберите именно голосовой канал!');
                    Sdb.updateSetting(interaction.guild.id, 'mainVoiceChannelId', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как основной голосовой канал для создания комнат`);
                } catch (error) {
                    console.error(error);
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
            }

            default:
                break;
        }
    }
};
