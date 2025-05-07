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
                .setDescription('Включить или отключить команду на этом сервере.')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Действие: enable (включить) или disable (отключить)')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Отключить', value: 'disable' },
                            { name: 'Включить', value: 'enable' },
                        ))
                .addStringOption(option =>
                    option.setName('command')
                        .setDescription('Название команды, которую нужно ограничить.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Причина ограничения (опционально).')
                        .setRequired(false)
                        .setMaxLength(256)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Показывает список команд, запрещенных на этом сервере.')),

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

            let replyContent = '';

            if (action === 'disable') {
                if (db.isDisabled(guildId, commandName)) {
                    replyContent = `Команда \`${commandName}\` уже была запрещена на этом сервере.`;
                } else {
                    if (db.add(guildId, commandName)) {
                        replyContent = `Команда \`${commandName}\` теперь **запрещена** на этом сервере.`;
                        if (reason) {
                            replyContent += ` Причина: ${reason}`;
                        }
                    } else {
                        replyContent = `Произошла ошибка при попытке запретить команду \`${commandName}\`.`;
                    }
                }
            } else if (action === 'enable') {
                 if (db.remove(guildId, commandName)) {
                     replyContent = `Команда \`${commandName}\` теперь **разрешена** на этом сервере.`;
                 } else {
                     replyContent = `Команда \`${commandName}\` не была запрещена на этом сервере.`;
                 }
            }

            return interaction.reply({
                content: replyContent,
                flags: MessageFlags.Ephemeral
            });

        } else if (subcommand === 'list') {
            const disabledList = db.getDisabledCommands(guildId);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Запрещенные команды на ${interaction.guild.name}`)
                .setFooter({ text: `Всего: ${disabledList.length} команд(а)` });

            if (disabledList.length === 0) {
                embed.setDescription('На этом сервере нет запрещенных команд.');
            } else {
                const commandItems = disabledList.map(cmd => `• \`${cmd}\``).join('\n');
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