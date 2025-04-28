const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');

const { ChangeSettings } = require('../../functions/ChangeSettings');

let data = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

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
                    await ChangeSettings('newMemberChannelId', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания участников`);
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'invite-logger-channel':
                try {
                    await ChangeSettings('inviteLoggerChannel', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания приглашений`);
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'allowlogging':
                try {
                    if (data.allowInviteLogging === bool) return await interaction.reply('Этот параметр уже установлен на ' + bool);
                    let answerLog;
                    await ChangeSettings('allowInviteLogging', bool);
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
                    if (data.allowLogingMembersAdd === bool) return await interaction.reply('Этот параметр уже установлен на ' + bool);
                    let answerMemberLog;
                    await ChangeSettings('allowLogingMembersAdd', bool);
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
                    await ChangeSettings('voiceCategoryId', category.id);
                    await interaction.reply(`Теперь ${category} выбрана как категория для новых войс-каналов`);
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            case 'set-main-voice':
                try {
                    if (channel.type !== 2) return await interaction.reply('Выберите именно голосовой канал!');
                    await ChangeSettings('mainVoiceChannelId', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как основной голосовой канал для создания комнат`);
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.');
                }
                break;

            default:
                break;
        }
    }
};
