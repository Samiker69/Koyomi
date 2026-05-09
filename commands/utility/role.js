const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');

const data = new SlashCommandBuilder()
    .setName(localeManager.get('utility.role.name'))
    .setNameLocalizations(localeManager.getLocalizations('utility.role.name', 'name'))
    .setDescription(localeManager.get('utility.role.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.description'))
    .addSubcommand(subcommand => subcommand.setName(localeManager.get('utility.role.options.delete.name'))
        .setNameLocalizations(localeManager.getLocalizations('utility.role.options.delete.name', 'name'))
        .setDescription(localeManager.get('utility.role.options.delete.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.delete.description'))
        .addRoleOption(option => option.setName(localeManager.get('utility.role.options.delete.options.role.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.delete.options.role.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.delete.options.role.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.delete.options.role.description'))
            .setRequired(true))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.delete.options.reason.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.delete.options.reason.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.delete.options.reason.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.delete.options.reason.description'))
            .setRequired(false))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand => subcommand.setName(localeManager.get('utility.role.options.edit.name'))
        .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.name', 'name'))
        .setDescription(localeManager.get('utility.role.options.edit.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.description'))
        .addRoleOption(option => option.setName(localeManager.get('utility.role.options.edit.options.role.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.role.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.role.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.role.description'))
            .setRequired(true))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.edit.options.color.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.color.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.color.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.color.description')))
        .addBooleanOption(option => option.setName(localeManager.get('utility.role.options.edit.options.hoist.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.hoist.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.hoist.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.hoist.description')))
        .addAttachmentOption(option => option.setName(localeManager.get('utility.role.options.edit.options.icon.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.icon.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.icon.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.icon.description')))
        .addBooleanOption(option => option.setName(localeManager.get('utility.role.options.edit.options.mentionable.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.mentionable.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.mentionable.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.mentionable.description')))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.edit.options.name.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.name.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.name.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.name.description')))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.edit.options.permissions.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.permissions.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.permissions.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.permissions.description')))
        .addIntegerOption(option => option.setName(localeManager.get('utility.role.options.edit.options.position.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.position.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.position.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.position.description')))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.edit.options.reason.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.reason.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.reason.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.reason.description')))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.edit.options.unicodeemoji.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.unicodeemoji.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.edit.options.unicodeemoji.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.edit.options.unicodeemoji.description')))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand => subcommand.setName(localeManager.get('utility.role.options.create.name'))
        .setNameLocalizations(localeManager.getLocalizations('utility.role.options.create.name', 'name'))
        .setDescription(localeManager.get('utility.role.options.create.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.create.description'))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.create.options.color.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.create.options.color.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.create.options.color.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.create.options.color.description')))
        .addBooleanOption(option => option.setName(localeManager.get('utility.role.options.create.options.hoist.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.create.options.hoist.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.create.options.hoist.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.create.options.hoist.description')))
        .addBooleanOption(option => option.setName(localeManager.get('utility.role.options.create.options.mentionable.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.create.options.mentionable.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.create.options.mentionable.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.create.options.mentionable.description')))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.create.options.name.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.create.options.name.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.create.options.name.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.create.options.name.description')))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.create.options.permissions.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.create.options.permissions.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.create.options.permissions.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.create.options.permissions.description')))
        .addIntegerOption(option => option.setName(localeManager.get('utility.role.options.create.options.position.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.create.options.position.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.create.options.position.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.create.options.position.description')))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.create.options.reason.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.create.options.reason.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.create.options.reason.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.create.options.reason.description')))
        .addStringOption(option => option.setName(localeManager.get('utility.role.options.create.options.unicodeemoji.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.create.options.unicodeemoji.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.create.options.unicodeemoji.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.create.options.unicodeemoji.description')))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand => subcommand.setName(localeManager.get('utility.role.options.info.name'))
        .setNameLocalizations(localeManager.getLocalizations('utility.role.options.info.name', 'name'))
        .setDescription(localeManager.get('utility.role.options.info.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.info.description'))
        .addRoleOption(option => option.setName(localeManager.get('utility.role.options.info.options.role.name'))
            .setNameLocalizations(localeManager.getLocalizations('utility.role.options.info.options.role.name', 'name'))
            .setDescription(localeManager.get('utility.role.options.info.options.role.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.role.options.info.options.role.description'))
            .setRequired(true)))

module.exports = {
    cooldown: 5,
    data,
    async execute(interaction) {
        const lang = interaction.guildLocale || 'ru';
        switch (interaction.options.getSubcommand()) {
            case "delete": {
                if (!await interaction.member.permissions.has('ManageRoles', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.role.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                const role = interaction.options.getRole('role');
                const member = interaction.guild.members.cache.get(interaction.user.id);

                const roleCompare = await role.comparePositionTo(member.roles.highest);
                if (roleCompare >= 1) return await interaction.reply({ content: localeManager.get('utility.role.messages.role_pos_low', lang), flags: MessageFlags.Ephemeral });

                const reason = interaction.options.getString('reason') ?? localeManager.get('utility.role.messages.no_reason', lang);

                await role.delete(`${reason} || by ${interaction.user.username}(${interaction.user.id})`);
                await interaction.reply(localeManager.get('utility.role.messages.role_deleted', lang, { role: role.toString(), reason }));
                break;
            }

            case "edit": {
                if (!await interaction.member.permissions.has('ManageRoles', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.role.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }

                const role = interaction.options.getRole('role');
                const color = interaction.options.getString('color') ?? role.color;
                const hoist = interaction.options.getBoolean('hoist') ?? role.hoist;
                const mentionable = interaction.options.getBoolean('mentionable') ?? role.mentionable;
                const name = interaction.options.getString('name') ?? role.name;
                const permissions = interaction.options.getString('permissions') ?? role.permissions;
                const position = interaction.options.getInteger('position') ?? role.position;
                const reason = interaction.options.getString('reason') ?? localeManager.get('utility.role.messages.no_reason', lang);
                const unicodeemoji = interaction.options.getString('unicodeemoji') ?? role.unicodeEmoji;

                const member = interaction.guild.members.cache.get(interaction.user.id);
                const roleCompare = await role.comparePositionTo(member.roles.highest);
                if (roleCompare >= 1) return await interaction.reply({ content: localeManager.get('utility.role.messages.role_pos_low', lang), flags: MessageFlags.Ephemeral });

                const editData = { color, hoist, mentionable, name, permissions, position, unicodeemoji, reason: `${reason} || by ${interaction.user.username}(${interaction.user.id})` };

                if (interaction.guild.premiumTier >= 2) {
                    const icon = interaction.options.getAttachment('icon') ?? role.icon;
                    if (icon) editData.icon = icon.url;
                }

                await role.edit(editData);
                await interaction.reply(localeManager.get('utility.role.messages.role_edited', lang, { role: role.toString() }));
                break;
            }

            case "create": {
                if (!interaction.member.permissions.has('Administrator', true)) {
                    return interaction.reply({ content: localeManager.get('utility.role.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                const color = interaction.options.getString('color');
                const hoist = interaction.options.getBoolean('hoist');
                const mentionable = interaction.options.getBoolean('mentionable');
                const name = interaction.options.getString('name');
                const permissions = interaction.options.getString('permissions');
                const position = interaction.options.getInteger('position');
                const reason = interaction.options.getString('reason') ?? localeManager.get('utility.role.messages.no_reason', lang);
                const unicodeemoji = interaction.options.getString('unicodeemoji');

                await interaction.guild.roles.create({ color, hoist, mentionable, name, permissions, position, unicodeemoji, reason: `${reason} || by ${interaction.user.username}(${interaction.user.id})` });
                await interaction.reply(localeManager.get('utility.role.messages.role_created', lang, { name }));
                break;
            }

            case "info": {
                const role = interaction.options.getRole('role');
                const hoisted = role.hoist ? localeManager.get('utility.role.messages.yes', lang) : localeManager.get('utility.role.messages.no', lang);
                const managed = role.managed ? localeManager.get('utility.role.messages.yes', lang) : localeManager.get('utility.role.messages.no', lang);
                const mentionable = role.mentionable ? localeManager.get('utility.role.messages.yes', lang) : localeManager.get('utility.role.messages.no', lang);

                const roleper = role.permissions.toArray().join(', ') || localeManager.get('utility.role.messages.no_perms_list', lang);

                const roleinfo = EmbedService.createBaseEmbed(interaction)
                    .setAuthor({ name: `${interaction.client.user.tag}`, iconURL: `${interaction.client.user.avatarURL()}` })
                    .setThumbnail(interaction.guild.iconURL())
                    .setTitle(localeManager.get('utility.role.messages.info_title', lang))
                    .addFields(
                        { name: localeManager.get('utility.role.messages.visual_info', lang), value: ' ' },
                        { inline: true, name: localeManager.get('utility.role.messages.name_label', lang), value: `${role.name}` },
                        { inline: true, name: 'ID', value: `${role.id}` },
                        { inline: true, name: localeManager.get('utility.role.messages.hex_label', lang), value: `${role.hexColor}` },
                        { name: localeManager.get('utility.role.messages.tech_info', lang), value: ' ' },
                        { inline: true, name: localeManager.get('utility.role.messages.created_label', lang), value: `<t:${Math.round(role.createdTimestamp / 1000)}:F>` },
                        { inline: true, name: localeManager.get('utility.role.messages.guild_label', lang), value: `${role.guild.name}` },
                        { name: ' ', value: ' ' },
                        { inline: true, name: localeManager.get('utility.role.messages.hoist_label', lang), value: hoisted },
                        { inline: true, name: localeManager.get('utility.role.messages.managed_label', lang), value: managed },
                        { inline: true, name: localeManager.get('utility.role.messages.mention_label', lang), value: mentionable },
                        { name: ' ', value: ' ' },
                        { inline: true, name: localeManager.get('utility.role.messages.pos_label', lang), value: `${role.position}` },
                        { inline: false, name: localeManager.get('utility.role.messages.perms_label', lang), value: "-# " + roleper },
                    );
                await interaction.reply({ content: null, embeds: [roleinfo] });
                break;
            }

            default:
                await interaction.reply({ content: localeManager.get('utility.role.messages.unknown_sub', lang), flags: MessageFlags.Ephemeral });
                break;
        }
    }
};