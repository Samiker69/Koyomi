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
                    .addChannelOption(option => option.setName('channel').setDescription('Канал').setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).setDMPermission(false)
            .addSubcommand(subcommand => 
                subcommand.setName('invite-logger-channel').setDescription('Канал для логироавния ссылок приглашений')
                        .addChannelOption(option => option.setName('channel').setDescription('Канал').setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).setDMPermission(false)
            .addSubcommand(subcommand => 
                subcommand.setName('allowlogging').setDescription('Отправлять сообщения об использованной ссылке?')
                    .addBooleanOption(option => option.setName('bool').setDescription('включить/выключить').setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).setDMPermission(false)
            .addSubcommand(subcommand => 
                subcommand.setName('allowmembersaddlogging').setDescription('Отправлять сообщения о новых/ушедших участниках')
                    .addBooleanOption(option => option.setName('bool').setDescription('включить/выключить').setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).setDMPermission(false),

	async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const bool = interaction.options.getBoolean('bool');

        switch (interaction.options.getSubcommand()) {
            case "welcomechannel":
                try {
                    ChangeSettings('newMemberChannelId', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания участников`)
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.')
                }
                break;

            case 'invite-logger-channel':
                try {
                    ChangeSettings('inviteLoggerChannel', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания приглашений`)
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.')
                }
                break;

            case 'allowlogging':
                try {
                    if (data.allowInviteLogging = bool) return await interaction.reply('Этот параметр уже установлен на ' + bool)
                    let answerLog;
                    ChangeSettings('allowInviteLogging', bool);
                    if (bool) {answerLog = 'Теперь бот будет уведомлять об использованной ссылке-приглашения'} else {answerLog = 'Теперь бот не будет уведомлять об использованной ссылке-приглашения'}
                    await interaction.reply(answerLog);
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.')
                }
                break;

            case 'allowmembersaddlogging':
                try {
                    if (data.allowLogingMembersAdd = bool) return await interaction.reply('Этот параметр уже установлен на ' + bool)
                    let answerMemberLog;
                    ChangeSettings('allowLogingMembersAdd', bool);
                    if (bool) {answerMemberLog = 'Теперь бот будет уведомлять об новых/ушедших участниках'} else {answerMemberLog = 'Теперь бот не будет уведомлять об новых/ушедших участниках'}
                    await interaction.reply(answerMemberLog);
                } catch (error) {
                    console.error(error);
                    await interaction.reply('Не удалось изменить параметр.')
                }
                break;
            default:
                break;
        }
    }
}