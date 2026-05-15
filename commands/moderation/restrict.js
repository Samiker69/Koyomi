const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
    EmbedBuilder,
} = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');

const DisabledCommandsDB = require('../../utils/db/restrictions');
const db = new DisabledCommandsDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restrict')
        .setDescription(localeManager.get('moderation.restrict.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.restrict.description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription(localeManager.get('moderation.restrict.options.set.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.restrict.options.set.description'))
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription(localeManager.get('moderation.restrict.options.set.options.action.description', 'en-US'))
                        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.restrict.options.set.options.action.description'))
                        .setRequired(true)
                        .addChoices(
                            { name: localeManager.get('moderation.restrict.options.set.options.action.choices.disable', 'en-US'), value: 'disable' },
                            { name: localeManager.get('moderation.restrict.options.set.options.action.choices.enable', 'en-US'), value: 'enable' },
                        ))
                .addStringOption(option =>
                    option.setName('command')
                        .setDescription(localeManager.get('moderation.restrict.options.set.options.command.description', 'en-US'))
                        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.restrict.options.set.options.command.description'))
                        .setRequired(true)
                        .setAutocomplete(true))
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription(localeManager.get('moderation.restrict.options.set.options.user.description', 'en-US'))
                        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.restrict.options.set.options.user.description'))
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription(localeManager.get('moderation.restrict.options.list.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.restrict.options.list.description'))
                 .addUserOption(option =>
                    option.setName('user')
                        .setDescription(localeManager.get('moderation.restrict.options.list.options.user.description', 'en-US'))
                        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.restrict.options.list.options.user.description'))
                        .setRequired(false))),

    async execute(interaction) {
        const lang = interaction.guildLocale || 'ru';
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: localeManager.get('moderation.restrict.messages.no_perms', lang),
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

            if (commandName === this.data.name) {
                return interaction.reply({
                    content: localeManager.get('moderation.restrict.messages.cannot_restrict_self', lang),
                    flags: MessageFlags.Ephemeral
                });
            }

            if (!interaction.client.commands.has(commandName)) {
                return interaction.reply({
                    content: localeManager.get('moderation.restrict.messages.cmd_not_found', lang, { name: commandName }),
                    flags: MessageFlags.Ephemeral
                });
            }

             if (userId && userId === interaction.user.id) {
                 return interaction.reply({
                     content: localeManager.get('moderation.restrict.messages.restrict_self_error', lang),
                     flags: MessageFlags.Ephemeral
                 });
             }

            let replyContent = '';
            const target = user ? localeManager.get('moderation.restrict.messages.target_user', lang, { user: user.tag }) : localeManager.get('moderation.restrict.messages.target_server', lang);

            if (action === 'disable') {
                 let isAlreadyDisabled;
                 if (userId === null) {
                    isAlreadyDisabled = db.isGuildDisabled(guildId, commandName);
                 } else {
                    const userRestrictions = db.getUserRestrictions(guildId, userId);
                    isAlreadyDisabled = userRestrictions.includes(commandName);
                 }

                if (isAlreadyDisabled) {
                    replyContent = localeManager.get('moderation.restrict.messages.already_disabled', lang, { name: commandName, target });
                } else {
                    if (db.add(guildId, commandName, userId)) {
                        replyContent = localeManager.get('moderation.restrict.messages.now_disabled', lang, { name: commandName, target });
                    } else {
                        replyContent = localeManager.get('moderation.restrict.messages.error_disable', lang, { name: commandName, target });
                    }
                }
            } else if (action === 'enable') {
                 if (db.remove(guildId, commandName, userId)) {
                     replyContent = localeManager.get('moderation.restrict.messages.now_enabled', lang, { name: commandName, target });
                 } else {
                     replyContent = localeManager.get('moderation.restrict.messages.not_disabled', lang, { name: commandName, target });
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
                embedTitle = localeManager.get('moderation.restrict.messages.list_title_server', lang, { server: interaction.guild.name });
                footerText = localeManager.get('moderation.restrict.messages.footer_total', lang, { count: restrictionsList.length });
            } else {
                restrictionsList = db.getUserRestrictions(guildId, userId);
                embedTitle = localeManager.get('moderation.restrict.messages.list_title_user', lang, { user: user.tag, server: interaction.guild.name });
                footerText = localeManager.get('moderation.restrict.messages.footer_total', lang, { count: restrictionsList.length });
            }


            const embed = EmbedService.createBaseEmbed(interaction)
                .setTitle(embedTitle)
                .setFooter({ text: footerText, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

            if (restrictionsList.length === 0) {
                 if (userId === null) {
                    embed.setDescription(localeManager.get('moderation.restrict.messages.empty_server', lang));
                 } else {
                    embed.setDescription(localeManager.get('moderation.restrict.messages.empty_user', lang, { user: user.tag }));
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
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const lang = interaction.guildLocale || 'ru';
        const commands = interaction.client.commands;

        const choices = [];
        for (const [name, command] of commands) {
            const cmdData = command.data;
            const cmdName = name;
            const cmdDesc = cmdData.description_localizations?.[lang] || cmdData.description || '';
            const localizedName = cmdName.toLowerCase();
            
            if (name.toLowerCase().includes(focusedValue) || localizedName.includes(focusedValue)) {
                choices.push({
                    name: `${cmdName} — ${cmdDesc}`.substring(0, 100),
                    value: name
                });
            }
            if (choices.length >= 25) break;
        }

        await interaction.respond(choices);
    }
};