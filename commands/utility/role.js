const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

const data = new SlashCommandBuilder()
		.setName(localeManager.getString('commands.role.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.name'))
		.setDescription(localeManager.getString('commands.role.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.description'))
            .addSubcommand(subcommand => subcommand.setName(localeManager.getString('commands.role.options.delete.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.delete.name')).setDescription(localeManager.getString('commands.role.options.delete.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.delete.description'))
                .addRoleOption(option => option.setName(localeManager.getString('commands.role.options.delete.options.role.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.delete.options.role.name')).setDescription(localeManager.getString('commands.role.options.delete.options.role.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.delete.options.role.description')).setRequired(true))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.delete.options.reason.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.delete.options.reason.name')).setDescription(localeManager.getString('commands.role.options.delete.options.reason.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.delete.options.reason.description')).setRequired(false))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addSubcommand(subcommand => subcommand.setName(localeManager.getString('commands.role.options.edit.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.name')).setDescription(localeManager.getString('commands.role.options.edit.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.description'))
                .addRoleOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.role.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.role.name')).setDescription(localeManager.getString('commands.role.options.edit.options.role.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.role.description')).setRequired(true))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.color.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.color.name')).setDescription(localeManager.getString('commands.role.options.edit.options.color.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.color.description')))
                .addBooleanOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.hoist.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.hoist.name')).setDescription(localeManager.getString('commands.role.options.edit.options.hoist.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.hoist.description')))
                .addAttachmentOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.icon.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.icon.name')).setDescription(localeManager.getString('commands.role.options.edit.options.icon.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.icon.description')))
                .addBooleanOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.mentionable.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.mentionable.name')).setDescription(localeManager.getString('commands.role.options.edit.options.mentionable.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.mentionable.description')))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.name.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.name.name')).setDescription(localeManager.getString('commands.role.options.edit.options.name.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.name.description')))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.permissions.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.permissions.name')).setDescription(localeManager.getString('commands.role.options.edit.options.permissions.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.permissions.description')))
                .addIntegerOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.position.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.position.name')).setDescription(localeManager.getString('commands.role.options.edit.options.position.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.position.description')))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.reason.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.reason.name')).setDescription(localeManager.getString('commands.role.options.edit.options.reason.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.reason.description')))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.edit.options.unicodeemoji.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.unicodeemoji.name')).setDescription(localeManager.getString('commands.role.options.edit.options.unicodeemoji.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.edit.options.unicodeemoji.description')))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addSubcommand(subcommand => subcommand.setName(localeManager.getString('commands.role.options.create.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.name')).setDescription(localeManager.getString('commands.role.options.create.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.description'))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.create.options.color.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.color.name')).setDescription(localeManager.getString('commands.role.options.create.options.color.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.color.description')))
                .addBooleanOption(option => option.setName(localeManager.getString('commands.role.options.create.options.hoist.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.hoist.name')).setDescription(localeManager.getString('commands.role.options.create.options.hoist.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.hoist.description')))
                .addBooleanOption(option => option.setName(localeManager.getString('commands.role.options.create.options.mentionable.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.mentionable.name')).setDescription(localeManager.getString('commands.role.options.create.options.mentionable.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.mentionable.description')))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.create.options.name.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.name.name')).setDescription(localeManager.getString('commands.role.options.create.options.name.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.name.description')))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.create.options.permissions.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.permissions.name')).setDescription(localeManager.getString('commands.role.options.create.options.permissions.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.permissions.description')))
                .addIntegerOption(option => option.setName(localeManager.getString('commands.role.options.create.options.position.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.position.name')).setDescription(localeManager.getString('commands.role.options.create.options.position.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.position.description')))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.create.options.reason.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.reason.name')).setDescription(localeManager.getString('commands.role.options.create.options.reason.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.reason.description')))
                .addStringOption(option => option.setName(localeManager.getString('commands.role.options.create.options.unicodeemoji.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.unicodeemoji.name')).setDescription(localeManager.getString('commands.role.options.create.options.unicodeemoji.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.create.options.unicodeemoji.description')))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addSubcommand(subcommand => subcommand.setName(localeManager.getString('commands.role.options.info.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.info.name')).setDescription(localeManager.getString('commands.role.options.info.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.info.description'))
                .addRoleOption(option => option.setName(localeManager.getString('commands.role.options.info.options.role.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.info.options.role.name')).setDescription(localeManager.getString('commands.role.options.info.options.role.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.role.options.info.options.role.description')).setRequired(true)))
            //.addSubcommand(subcommand => subcommand.setName('mute').setDescription('Select muterole')
            //    .addRoleOption(option => option.setName('role').setDescription('Select role or text role id').setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

            module.exports = {
                cooldown: 5,
                data,
                async execute(interaction) {
                    switch (interaction.options.getSubcommand()) {
                        case "delete": {
                            if(!await interaction.member.permissions.has('ManageRoles', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                            const role = interaction.options.getRole('role');
                            const member = interaction.guild.members.cache.get(interaction.user.id);

                            const roleCompare = await role.comparePositionTo(member.roles.highest);
                            if (roleCompare >= 1) return await interaction.reply({content: 'Ваша позиция роли ниже выбранной', flags: MessageFlags.Ephemeral});

                            const reason = await interaction.options.getString('reason') ?? 'не указано';

                            await role.delete(reason + ` || by ${interaction.user.username}(${interaction.user.id})`);
                            await interaction.reply(`${role} была удалена по причине ${reason}`);
                            break;
                        }
                            
                        case "edit": {
                            if(!await interaction.member.permissions.has('ManageRoles', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});

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
                            if (roleCompare >= 1) return await interaction.reply({content: 'Ваша позиция роли ниже выбранной', flags: MessageFlags.Ephemeral});


                            if (interaction.guild.premiumTier >= 2) {
                                const icon = interaction.options.getAttachment('icon') ?? role.icon

                                await role.edit({color: color, hoist: hoist, icon: icon.url, mentionable: mentionable, name: name, permissions: permissions, position: position, unicodeemoji: unicodeemoji, reason: reason+ ` || by ${interaction.user.username}(${interaction.user.id})`})
                                await interaction.reply(`${role} была изменена`);
                            } else {
                                await role.edit({color: color, hoist: hoist, mentionable: mentionable, name: name, permissions: permissions, position: position, unicodeemoji: unicodeemoji, reason: reason+ ` || by ${interaction.user.username}(${interaction.user.id})`})
                                await interaction.reply(`${role} была изменена`);
                            }
                            break;
                        }

                        case "create": {
                            if(!interaction.member.permissions.has('Administrator', true)) return interaction.reply({content: 'Недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                            const color = interaction.options.getString('color');
                            const hoist = interaction.options.getBoolean('hoist');
                            const mentionable = interaction.options.getBoolean('mentionable');
                            const name = interaction.options.getString('name');
                            const permissions = interaction.options.getString('permissions');
                            const position = interaction.options.getInteger('position');
                            const reason = interaction.options.getString('reason') ?? 'не указано';
                            const unicodeemoji = interaction.options.getString('unicodeemoji');
    
                            await interaction.guild.roles.create({color: color, hoist: hoist, mentionable: mentionable, name: name, permissions: permissions, position: position, unicodeemoji: unicodeemoji, reason: reason+ ` || by ${interaction.user.username}(${interaction.user.id})`})
                            await interaction.reply(`Роль ${name} была создана`);
                            break;
                        }
                    
                        case "info": {
                            const role = interaction.options.getRole('role');
                            let hoisted = 'нет', managed = 'нет', mentionable = 'нет';
                            if (role.hoist === true) hoisted = `да`
                            if (role.managed === true) managed = `да`
                            if (role.mentionable === true) mentionable = `да`
    
                            /*const members = interaction.guild.members.cache
                            .filter(member => { return member.roles.find; })
                            .map(member=> { return member.user.username; })
                            .join(', ') || 'Нет ролей';*/
    
                            const roleper = role.permissions.toArray()
                            .join(', ') || 'Нет прав';
    
                            const roleinfo = new EmbedBuilder()
                                .setAuthor({name: `${interaction.client.user.tag}`, iconURL: `${interaction.client.user.avatarURL()}`})
                                .setThumbnail(interaction.guild.iconURL())
                                .setColor(0x9B59B6)
                                .setTitle('О роли')
                                .addFields(
                                    {name: `Визуальная информация`, value: ` `},
                                    {inline: true, name: `Название`, value: `${role.name}`},
                                    {inline: true, name: `ID`, value: `${role.id}`},
                                    {inline: true, name: `HEX цвет роли`, value: `${role.hexColor}`},
                                    {name: `Техническая информация`, value: ` `},
                                    {inline: true, name: `Дата создания роли`, value: `<t:${Math.round(role.createdTimestamp / 1000)}:F>`},
                                    {inline: true, name: `Создана в`, value: `${role.guild.name}`},
                                    {name: ` `, value: ` `},
                                    {inline: true, name: `Отображается отдельно?`, value: hoisted},
                                    {inline: true, name: `Создана внешним сервисом?`, value: managed},
                                    {inline: true, name: `Все могут упоминать?`, value: mentionable},
                                    {name: ` `, value: ` `},
                                    {inline: true, name: `Позиция роли`, value: `${role.position}`},
                                    //{inline: true, name: `Участники с этой ролью`, value: `${members}`},
                                    {inline: false, name: `Права роли`, value: "-# "+roleper},
                                );
                                await interaction.reply({ content: null, embeds: [roleinfo] });
                            break;
                        }

                        /*case 'mute': {
                            //todo
                            break;
                        }*/
                        default:
                            await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                            break;
                    }
                }
            }