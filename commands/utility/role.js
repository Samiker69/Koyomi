const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
		.setName('role')
		.setDescription('role editor command')
            .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Deletes the role')
                .addRoleOption(option => option.setName('role').setDescription('Select role or text role id').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('Reason for role deletion').setRequired(false))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addSubcommand(subcommand => subcommand.setName('edit').setDescription('Create or edit the role')
                .addRoleOption(option => option.setName('role').setDescription('Select role or text role id').setRequired(true))
                .addStringOption(option => option.setName('color').setDescription('The color of the role, either a hex string or a base 10 number'))
                .addBooleanOption(option => option.setName('hoist').setDescription('Whether or not the role should be hoisted'))
                .addStringOption(option => option.setName('icon').setDescription('The icon for the role'))
                .addBooleanOption(option => option.setName('mentionable').setDescription('Whether or not the role should be mentionable'))
                .addStringOption(option => option.setName('name').setDescription('The name of the role'))
                .addStringOption(option => option.setName('permissions').setDescription('The permissions of the role'))
                .addIntegerOption(option => option.setName('position').setDescription('The position of the role'))
                .addStringOption(option => option.setName('reason').setDescription('The reason for editing this role'))
                .addStringOption(option => option.setName('unicodeemoji').setDescription('The unicode emoji for the role'))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addSubcommand(subcommand => subcommand.setName('create').setDescription('Create the role')
                .addStringOption(option => option.setName('color').setDescription('The color of the role, either a hex string or a base 10 number'))
                .addBooleanOption(option => option.setName('hoist').setDescription('Whether or not the role should be hoisted'))
                .addBooleanOption(option => option.setName('mentionable').setDescription('Whether or not the role should be mentionable'))
                .addStringOption(option => option.setName('name').setDescription('The name of the role'))
                .addStringOption(option => option.setName('permissions').setDescription('The permissions of the role'))
                .addIntegerOption(option => option.setName('position').setDescription('The position of the role'))
                .addStringOption(option => option.setName('reason').setDescription('The reason for editing this role'))
                .addStringOption(option => option.setName('unicodeemoji').setDescription('The unicode emoji for the role'))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addSubcommand(subcommand => subcommand.setName('info').setDescription('send embed-message about role')
                .addRoleOption(option => option.setName('role').setDescription('Select role or text role id').setRequired(true)))
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

                            if (interaction.guild.premiumTier >= 2) {
                                const icon = interaction.options.getString('icon') ?? role.icon

                                await role.edit({color: color, hoist: hoist, icon: icon, mentionable: mentionable, name: name, permissions: permissions, position: position, unicodeemoji: unicodeemoji, reason: reason+ ` || by ${interaction.user.username}(${interaction.user.id})`})
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