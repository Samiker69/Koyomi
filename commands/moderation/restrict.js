const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
    EmbedBuilder,
} = require('discord.js');

const DisabledCommandsDB = require('../../functions/db/restrictions');
const db = new DisabledCommandsDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restrict')
        .setDescription('Управляет ограничениями команд на сервере.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Включить или отключить команду для сервера или пользователя.')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Действие: disable (отключить) или enable (включить)')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Отключить', value: 'disable' },
                            { name: 'Включить', value: 'enable' },
                        ))
                .addStringOption(option =>
                    option.setName('command')
                        .setDescription('Название команды, которую нужно ограничить.')
                        .setRequired(true))
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('Пользователь, для которого применяется ограничение (оставьте пустым для всего сервера).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Причина ограничения (опционально).')
                        .setRequired(false)
                        .setMaxLength(256)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Показывает список команд, запрещенных на сервере или для пользователя.')
                 .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Показать ограничения для этого пользователя (оставьте пустым для всего сервера).')
                        .setRequired(false))),

    async execute(interaction) {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: 'У вас нет прав для использования этой команды.',
                flags: MessageFlags.Ephemeral
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === 'set') {
            const action = interaction.options.getString('action');
            const commandName = interaction.options.getString('command').toLowerCase();
            const user = interaction.options.getUser('user');
            const userId = user ? user.id : null;
            const reason = interaction.options.getString('reason');

            if (commandName === this.data.name) {
                return interaction.reply({
                    content: 'Нельзя запретить эту команду.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (!interaction.client.commands.has(commandName)) {
                return interaction.reply({
                    content: `Команда \`${commandName}\` не найдена.`,
                    flags: MessageFlags.Ephemeral
                });
            }

             if (userId && userId === interaction.user.id) {
                 return interaction.reply({
                     content: 'Вы не можете запретить команду самому себе.',
                     flags: MessageFlags.Ephemeral
                 });
             }

            let replyContent = '';
            const target = user ? `для пользователя ${user.tag}` : 'на этом сервере';

            if (action === 'disable') {
                 if (userId === null) {
                    isAlreadyDisabled = db.isGuildDisabled(guildId, commandName);
                 } else {
                    isAlreadyDisabled = db.getUserRestrictions(guildId, userId).includes(commandName);
                 }


                if (isAlreadyDisabled) {
                    replyContent = `Команда \`${commandName}\` уже была запрещена ${target}.`;
                } else {
                    if (db.add(guildId, commandName, userId)) {
                        replyContent = `Команда \`${commandName}\` теперь **запрещена** ${target}.`;
                        if (reason) {
                            replyContent += ` Причина: ${reason}`;
                        }
                    } else {
                        replyContent = `Произошла ошибка при попытке запретить команду \`${commandName}\` ${target}.`;
                    }
                }
            } else if (action === 'enable') {
                 if (db.remove(guildId, commandName, userId)) {
                     replyContent = `Команда \`${commandName}\` теперь **разрешена** ${target}.`;
                 } else {
                     replyContent = `Команда \`${commandName}\` не была запрещена ${target}.`;
                 }
            }

            return interaction.reply({
                content: replyContent,
                flags: MessageFlags.Ephemeral
            });

        } else if (subcommand === 'list') {
            const user = interaction.options.getUser('user');
            const userId = user ? user.id : null;

            let restrictionsList = [];
            let embedTitle = '';
            let footerText = '';

            if (userId === null) {
                restrictionsList = db.getGuildRestrictions(guildId);
                embedTitle = `Запрещенные команды на ${interaction.guild.name}`;
                footerText = `Всего: ${restrictionsList.length} команд(а)`;
            } else {
                restrictionsList = db.getUserRestrictions(guildId, userId);
                embedTitle = `Запрещенные команды для пользователя ${user.tag} на ${interaction.guild.name}`;
                footerText = `Всего: ${restrictionsList.length} команд(а)`;
            }


            const embed = new EmbedBuilder()
                .setColor(0x9B59B6)
                .setTitle(embedTitle)
                .setFooter({ text: footerText });

            if (restrictionsList.length === 0) {
                 if (userId === null) {
                    embed.setDescription('На этом сервере нет запрещенных команд для всех.');
                 } else {
                    embed.setDescription(`Для пользователя ${user.tag} нет персонально запрещенных команд.`);
                 }

            } else {
                const commandItems = restrictionsList.map(cmd => `• \`${cmd}\``).join('\n');
                const maxEmbedDescriptionLength = 2048;
                 if (commandItems.length > maxEmbedDescriptionLength) {
                     embed.setDescription(commandItems.substring(0, maxEmbedDescriptionLength - 3) + '...');
                 } else {
                     embed.setDescription(commandItems);
                 }
            }

            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        }
    },
};