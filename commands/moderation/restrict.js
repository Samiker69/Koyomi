const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
    EmbedBuilder,
} = require('discord.js');

const { disableCommandForGuild, enableCommandForGuild, getDisabledCommandsForGuild } = require('../../events/restrictions');

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

            const guildId = interaction.guild.id;
            let replyContent = '';

            if (action === 'disable') {
                if (disableCommandForGuild(guildId, commandName)) {
                    replyContent = `Команда \`${commandName}\` теперь **запрещена** на этом сервере.`;
                    if (reason) {
                        replyContent += ` Причина: ${reason}`;
                    }
                } else {
                    replyContent = `ℹКоманда \`${commandName}\` уже была запрещена на этом сервере.`;
                }
            } else if (action === 'enable') {
                 if (enableCommandForGuild(guildId, commandName)) {
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
            const guildId = interaction.guild.id;
            const disabledList = getDisabledCommandsForGuild(guildId);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Запрещенные команды на ${interaction.guild.name}`)
                .setFooter({ text: `Всего: ${disabledList.length} команд(а)` });

            if (disabledList.length === 0) {
                embed.setDescription('На этом сервере нет запрещенных команд.');
            } else {
                const commandItems = disabledList.map(cmd => `• \`${cmd}\``).join('\n');
                embed.setDescription(commandItems);
            }

            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });
        }
    },
};