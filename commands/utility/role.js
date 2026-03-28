const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const replies = require('../../locales/answers/replies');
const { utility } = require('../../locales/descriptions/utility');

const getReply = (key, locale, vars = {}) => {
    let text = replies[key]?.[locale] || replies[key]?.['ru'] || key;
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
    }
    return text;
};

const data = new SlashCommandBuilder()
    .setName('role')
    .setDescription('role editor command')
    .setDescriptionLocalizations(utility.role.description)
    .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Deletes the role')
        .setDescriptionLocalizations(utility.role.subcommands.delete.description)
        .addRoleOption(option => option.setName('role').setDescription('Select role or text role id').setDescriptionLocalizations(utility.role.options.role.description).setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for role deletion').setDescriptionLocalizations(utility.role.options.reason.description).setRequired(false))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand => subcommand.setName('edit').setDescription('Create or edit the role')
        .setDescriptionLocalizations(utility.role.subcommands.edit.description)
        .addRoleOption(option => option.setName('role').setDescription('Select role or text role id').setDescriptionLocalizations(utility.role.options.role.description).setRequired(true))
        .addStringOption(option => option.setName('color').setDescription('The color of the role, either a hex string or a base 10 number').setDescriptionLocalizations(utility.role.options.color.description))
        .addBooleanOption(option => option.setName('hoist').setDescription('Whether or not the role should be hoisted').setDescriptionLocalizations(utility.role.options.hoist.description))
        .addAttachmentOption(option => option.setName('icon').setDescription('The icon for the role').setDescriptionLocalizations(utility.role.options.icon.description))
        .addBooleanOption(option => option.setName('mentionable').setDescription('Whether or not the role should be mentionable').setDescriptionLocalizations(utility.role.options.mentionable.description))
        .addStringOption(option => option.setName('name').setDescription('The name of the role').setDescriptionLocalizations(utility.role.options.name.description))
        .addStringOption(option => option.setName('permissions').setDescription('The permissions of the role').setDescriptionLocalizations(utility.role.options.permissions.description))
        .addIntegerOption(option => option.setName('position').setDescription('The position of the role').setDescriptionLocalizations(utility.role.options.position.description))
        .addStringOption(option => option.setName('reason').setDescription('The reason for editing this role').setDescriptionLocalizations(utility.role.options.reason.description))
        .addStringOption(option => option.setName('unicodeemoji').setDescription('The unicode emoji for the role').setDescriptionLocalizations(utility.role.options.unicodeemoji.description))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand => subcommand.setName('create').setDescription('Create the role')
        .setDescriptionLocalizations(utility.role.subcommands.create.description)
        .addStringOption(option => option.setName('color').setDescription('The color of the role, either a hex string or a base 10 number').setDescriptionLocalizations(utility.role.options.color.description))
        .addBooleanOption(option => option.setName('hoist').setDescription('Whether or not the role should be hoisted').setDescriptionLocalizations(utility.role.options.hoist.description))
        .addBooleanOption(option => option.setName('mentionable').setDescription('Whether or not the role should be mentionable').setDescriptionLocalizations(utility.role.options.mentionable.description))
        .addStringOption(option => option.setName('name').setDescription('The name of the role').setDescriptionLocalizations(utility.role.options.name.description))
        .addStringOption(option => option.setName('permissions').setDescription('The permissions of the role').setDescriptionLocalizations(utility.role.options.permissions.description))
        .addIntegerOption(option => option.setName('position').setDescription('The position of the role').setDescriptionLocalizations(utility.role.options.position.description))
        .addStringOption(option => option.setName('reason').setDescription('The reason for editing this role').setDescriptionLocalizations(utility.role.options.reason.description))
        .addStringOption(option => option.setName('unicodeemoji').setDescription('The unicode emoji for the role').setDescriptionLocalizations(utility.role.options.unicodeemoji.description))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand => subcommand.setName('info').setDescription('send embed-message about role')
        .setDescriptionLocalizations(utility.role.subcommands.info.description)
        .addRoleOption(option => option.setName('role').setDescription('Select role or text role id').setDescriptionLocalizations(utility.role.options.role.description).setRequired(true)))

module.exports = {
    cooldown: 5,
    data,
    async execute(interaction) {
        const loc = interaction.locale;
        switch (interaction.options.getSubcommand()) {
            case "delete": {
                if (!await interaction.member.permissions.has('ManageRoles', true)) return await interaction.reply({ content: getReply('role_no_admin', loc), flags: MessageFlags.Ephemeral });
                const role = interaction.options.getRole('role');
                const member = interaction.guild.members.cache.get(interaction.user.id);

                const roleCompare = await role.comparePositionTo(member.roles.highest);
                if (roleCompare >= 1) return await interaction.reply({ content: getReply('role_pos_lower', loc), flags: MessageFlags.Ephemeral });

                const reason = await interaction.options.getString('reason') ?? 'не указано';

                await role.delete(reason + ` || by ${interaction.user.username}(${interaction.user.id})`);
                await interaction.reply(getReply('role_deleted', loc, { role: role, reason: reason }));
                break;
            }

            case "edit": {
                if (!await interaction.member.permissions.has('ManageRoles', true)) return await interaction.reply({ content: getReply('role_no_admin', loc), flags: MessageFlags.Ephemeral });

                const role = interaction.options.getRole('role');
                const color = interaction.options.getString('color') ?? role.color;
                const hoist = interaction.options.getBoolean('hoist') ?? role.hoist;
                const mentionable = interaction.options.getBoolean('mentionable') ?? role.mentionable;
                const name = interaction.options.getString('name') ?? role.name;
                const permissions = interaction.options.getString('permissions') ?? role.permissions;
                const position = interaction.options.getInteger('position') ?? role.position;
                const reason = interaction.options.getString('reason') ?? 'не указано';
                const unicodeemoji = interaction.options.getString('unicodeemoji') ?? role.unicodeEmoji;

                const member = interaction.guild.members.cache.get(interaction.user.id);
                const roleCompare = await role.comparePositionTo(member.roles.highest);
                if (roleCompare >= 1) return await interaction.reply({ content: getReply('role_pos_lower', loc), flags: MessageFlags.Ephemeral });


                if (interaction.guild.premiumTier >= 2) {
                    const icon = interaction.options.getAttachment('icon') ?? role.icon

                    await role.edit({ color: color, hoist: hoist, icon: icon.url, mentionable: mentionable, name: name, permissions: permissions, position: position, unicodeemoji: unicodeemoji, reason: reason + ` || by ${interaction.user.username}(${interaction.user.id})` })
                    await interaction.reply(getReply('role_edited', loc, { role: role }));
                } else {
                    await role.edit({ color: color, hoist: hoist, mentionable: mentionable, name: name, permissions: permissions, position: position, unicodeemoji: unicodeemoji, reason: reason + ` || by ${interaction.user.username}(${interaction.user.id})` })
                    await interaction.reply(getReply('role_edited', loc, { role: role }));
                }
                break;
            }

            case "create": {
                if (!interaction.member.permissions.has('Administrator', true)) return interaction.reply({ content: getReply('role_no_admin', loc), flags: MessageFlags.Ephemeral });
                const color = interaction.options.getString('color');
                const hoist = interaction.options.getBoolean('hoist');
                const mentionable = interaction.options.getBoolean('mentionable');
                const name = interaction.options.getString('name');
                const permissions = interaction.options.getString('permissions');
                const position = interaction.options.getInteger('position');
                const reason = interaction.options.getString('reason') ?? 'не указано';
                const unicodeemoji = interaction.options.getString('unicodeemoji');

                await interaction.guild.roles.create({ color: color, hoist: hoist, mentionable: mentionable, name: name, permissions: permissions, position: position, unicodeemoji: unicodeemoji, reason: reason + ` || by ${interaction.user.username}(${interaction.user.id})` })
                await interaction.reply(getReply('role_created', loc, { name: name }));
                break;
            }

            case "info": {
                const role = interaction.options.getRole('role');
                let hoisted = getReply('role_no', loc), managed = getReply('role_no', loc), mentionable = getReply('role_no', loc);
                if (role.hoist === true) hoisted = getReply('role_yes', loc)
                if (role.managed === true) managed = getReply('role_yes', loc)
                if (role.mentionable === true) mentionable = getReply('role_yes', loc)

                /*const members = interaction.guild.members.cache
                .filter(member => { return member.roles.find; })
                .map(member=> { return member.user.username; })
                .join(', ') || 'Нет ролей';*/

                const roleper = role.permissions.toArray()
                    .join(', ') || getReply('role_no_perms', loc);

                const roleinfo = new EmbedBuilder()
                    .setAuthor({ name: `${interaction.client.user.tag}`, iconURL: `${interaction.client.user.avatarURL()}` })
                    .setThumbnail(interaction.guild.iconURL())
                    .setColor(0x9B59B6)
                    .setTitle(getReply('role_info_title', loc))
                    .addFields(
                        { name: getReply('role_info_visual', loc), value: ` ` },
                        { inline: true, name: getReply('role_info_name', loc), value: `${role.name}` },
                        { inline: true, name: getReply('role_info_id', loc), value: `${role.id}` },
                        { inline: true, name: getReply('role_info_color', loc), value: `${role.hexColor}` },
                        { name: getReply('role_info_tech', loc), value: ` ` },
                        { inline: true, name: getReply('role_info_created', loc), value: `<t:${Math.round(role.createdTimestamp / 1000)}:F>` },
                        { inline: true, name: getReply('role_info_guild', loc), value: `${role.guild.name}` },
                        { name: ` `, value: ` ` },
                        { inline: true, name: getReply('role_info_hoisted', loc), value: hoisted },
                        { inline: true, name: getReply('role_info_managed', loc), value: managed },
                        { inline: true, name: getReply('role_info_mentionable', loc), value: mentionable },
                        { name: ` `, value: ` ` },
                        { inline: true, name: getReply('role_info_position', loc), value: `${role.position}` },
                        //{inline: true, name: `Участники с этой ролью`, value: `${members}`},
                        { inline: false, name: getReply('role_info_permissions', loc), value: "-# " + roleper },
                    );
                await interaction.reply({ content: null, embeds: [roleinfo] });
                break;
            }

            /*case 'mute': {
                //todo
                break;
            }*/
            default:
                await interaction.reply({ content: getReply('unknown_subcommand', loc), flags: MessageFlags.Ephemeral })
                break;
        }
    }
}