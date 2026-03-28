const { SlashCommandBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const SettingsDB = require('../../functions/db/settings');
const replies = require('../../locales/answers/replies');
const { utility } = require('../../locales/descriptions/utility');

const Sdb = new SettingsDB();

const getReply = (key, locale, vars = {}) => {
    let text = replies[key]?.[locale] || replies[key]?.['ru'] || key;
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
    }
    return text;
};

function parseEmoji(emojiInput) {
    if (!emojiInput) return null;

    const customEmojiMatch = emojiInput.match(/<a?:(\w+):(\d+)>/);
    if (customEmojiMatch) {
        const animated = emojiInput.startsWith('<a:');
        const name = customEmojiMatch[1];
        const id = customEmojiMatch[2];
        return { id, animated, name };
    } else if (/\p{Emoji}/u.test(emojiInput)) {
        return { name: emojiInput };
    }
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolemenu')
        .setDescription('Создать или обновить сообщение с меню выбора ролей (кнопки или Select Menu).')
        .setDescriptionLocalizations(utility.rolemenu.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create-select')
                .setDescription('Создать новое сообщение с Select Menu выбора ролей.')
                .setDescriptionLocalizations(utility.rolemenu.subcommands['create-select'].description)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Канал, куда будет отправлено сообщение с меню ролей.')
                        .setDescriptionLocalizations(utility.rolemenu.options.channel.description)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Заголовок для эмбеда сообщения с меню ролей.')
                        .setDescriptionLocalizations(utility.rolemenu.options.title.description)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Описание для эмбеда сообщения с меню ролей.')
                        .setDescriptionLocalizations(utility.rolemenu.options.description.description)
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('placeholder')
                        .setDescription('Текст-заглушка для Select Menu (по умолчанию: "Выберите ваши роли...").')
                        .setDescriptionLocalizations(utility.rolemenu.options.placeholder.description)
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('create-buttons')
                .setDescription('Создать новое сообщение с кнопками для выдачи ролей.')
                .setDescriptionLocalizations(utility.rolemenu.subcommands['create-buttons'].description)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Канал, куда будет отправлено сообщение с кнопками.')
                        .setDescriptionLocalizations(utility.rolemenu.options.channel.description)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Заголовок для эмбеда сообщения с кнопками.')
                        .setDescriptionLocalizations(utility.rolemenu.options.title.description)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Описание для эмбеда сообщения с кнопками.')
                        .setDescriptionLocalizations(utility.rolemenu.options.description.description)
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-role')
                .setDescription('Добавить роль в существующее меню (кнопки или Select Menu).')
                .setDescriptionLocalizations(utility.rolemenu.subcommands['add-role'].description)
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('ID сообщения с меню выбора ролей.')
                        .setDescriptionLocalizations(utility.rolemenu.options.message_id.description)
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Роль, которую нужно добавить.')
                        .setDescriptionLocalizations(utility.rolemenu.options.role.description)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('label')
                        .setDescription('Отображаемое имя роли в меню/на кнопке (по умолчанию: название роли).')
                        .setDescriptionLocalizations(utility.rolemenu.options.label.description)
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Описание роли в Select Menu (не используется для кнопок).')
                        .setDescriptionLocalizations(utility.rolemenu.options.rm_description.description)
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji для отображения рядом с ролью в меню/на кнопке. Формат: <:name:id> или стандартный.')
                        .setDescriptionLocalizations(utility.rolemenu.options.emoji.description)
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-role')
                .setDescription('Удалить роль из существующего меню (кнопки или Select Menu).')
                .setDescriptionLocalizations(utility.rolemenu.subcommands['remove-role'].description)
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('ID сообщения с меню выбора ролей.')
                        .setDescriptionLocalizations(utility.rolemenu.options.message_id.description)
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Роль, которую нужно удалить.')
                        .setDescriptionLocalizations(utility.rolemenu.options.role.description)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Удалить сообщение с меню выбора ролей и его данные.')
                .setDescriptionLocalizations(utility.rolemenu.subcommands.delete.description)
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('ID сообщения с меню выбора ролей, которое нужно удалить.')
                        .setDescriptionLocalizations(utility.rolemenu.options.message_id.description)
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const loc = interaction.locale;

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch (e) {
            console.error(`[Команда RoleMenu] Не удалось отложить ответ для /${subcommand}:`, e);
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await interaction.editReply({ content: getReply('rm_no_perms', loc) });
        }

        if (subcommand === 'create-select') {
            const channel = interaction.options.getChannel('channel');
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description') || getReply('rm_desc_select', loc);
            const placeholder = interaction.options.getString('placeholder') || getReply('rm_placeholder', loc);

            if (!channel || !channel.isTextBased()) {
                return await interaction.editReply({ content: getReply('rm_no_channel', loc) });
            }

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle(title)
                .setDescription(description + `\n\n**${getReply('rm_available_roles', loc)}**\n${getReply('rm_no_roles_in_menu', loc)}`)
                .setFooter({ text: getReply('rm_footer_select', loc) })
                .setTimestamp();

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('role_select_menu')
                .setPlaceholder(placeholder)
                .setMinValues(0)
                .setMaxValues(1);

            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(getReply('rm_no_roles_yet', loc))
                    .setValue('no_roles_yet')
                    .setDescription(getReply('rm_add_hint', loc))
            );
            selectMenu.setDisabled(true);


            const row = new ActionRowBuilder().addComponents(selectMenu);

            try {
                const targetChannel = interaction.guild.channels.cache.get(channel.id);
                if (!targetChannel || !targetChannel.isTextBased()) {
                    return await interaction.editReply({ content: getReply('rm_channel_fail', loc) });
                }

                const message = await targetChannel.send({ embeds: [embed], components: [row] });
                Sdb.addRoleMenu(message.id, guildId, channel.id, 'select', [], placeholder);
                await interaction.editReply({ content: getReply('rm_select_success', loc, { channel: channel, id: message.id }) });
            } catch (error) {
                console.error('Ошибка при создании Select Menu ролей:', error);
                let errorMessage = getReply('rm_select_error', loc);
                if (error.code === 50001) {
                    errorMessage += getReply('rm_no_send_perms', loc);
                }
                await interaction.editReply({ content: errorMessage });
            }

        } else if (subcommand === 'create-buttons') {
            const channel = interaction.options.getChannel('channel');
            const title = interaction.options.getString('title');
            const interactionDescription = interaction.options.getString('description') || getReply('rm_desc_buttons', loc);

            if (!channel || !channel.isTextBased()) {
                return await interaction.editReply({ content: getReply('rm_no_channel', loc) });
            }

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle(title)
                .setDescription(interactionDescription + `\n\n**${getReply('rm_available_roles', loc)}**\n${getReply('rm_no_roles_in_menu', loc)}`)
                .setFooter({ text: getReply('rm_footer_buttons', loc) })
                .setTimestamp();

            try {
                const targetChannel = interaction.guild.channels.cache.get(channel.id);
                if (!targetChannel || !targetChannel.isTextBased()) {
                    return await interaction.editReply({ content: getReply('rm_channel_fail', loc) });
                }

                const message = await targetChannel.send({ embeds: [embed], components: [] });
                Sdb.addRoleMenu(message.id, guildId, channel.id, 'buttons', [], null);
                await interaction.editReply({ content: getReply('rm_buttons_success', loc, { channel: channel, id: message.id }) });
            } catch (error) {
                console.error('Ошибка при создании меню кнопок ролей:', error);
                let errorMessage = getReply('rm_buttons_error', loc);
                if (error.code === 50001) {
                    errorMessage += getReply('rm_no_send_perms', loc);
                }
                await interaction.editReply({ content: errorMessage });
            }

        } else if (subcommand === 'add-role' || subcommand === 'remove-role') {
            const messageId = interaction.options.getString('message_id');
            const roleToAddRemove = interaction.options.getRole('role');

            const menuData = Sdb.getRoleMenu(messageId);

            if (!menuData || menuData.guildId !== guildId) {
                return await interaction.editReply({ content: getReply('rm_invalid_id', loc) });
            }

            if (!roleToAddRemove.editable) {
                return await interaction.editReply({ content: getReply('rm_role_no_edit', loc) });
            }
            if (roleToAddRemove.managed) {
                return await interaction.editReply({ content: getReply('rm_managed_role', loc) });
            }

            let updatedRoles = [...menuData.roles];
            let confirmationMessage = '';

            if (subcommand === 'add-role') {
                if (updatedRoles.length >= 25) {
                    return await interaction.editReply({ content: getReply('rm_max_roles', loc) });
                }

                const label = interaction.options.getString('label') || roleToAddRemove.name;
                const description = interaction.options.getString('description') || null;
                const emojiInput = interaction.options.getString('emoji');
                const emoji = parseEmoji(emojiInput);

                if (emojiInput && !emoji) {
                    return await interaction.editReply({ content: getReply('rm_invalid_emoji', loc) });
                }

                if (updatedRoles.some(r => r.id === roleToAddRemove.id)) {
                    return await interaction.editReply({ content: getReply('rm_role_exists', loc, { roleName: roleToAddRemove.name }) });
                }

                updatedRoles.push({
                    id: roleToAddRemove.id,
                    label: label,
                    description: description,
                    emoji: emoji
                });
                confirmationMessage = getReply('rm_role_added_wait', loc, { roleName: roleToAddRemove.name });

            } else {
                const initialLength = updatedRoles.length;
                updatedRoles = updatedRoles.filter(r => r.id !== roleToAddRemove.id);

                if (updatedRoles.length === initialLength) {
                    return await interaction.editReply({ content: getReply('rm_role_not_found', loc, { roleName: roleToAddRemove.name }) });
                }
                confirmationMessage = getReply('rm_role_removed_wait', loc, { roleName: roleToAddRemove.name });
            }

            if (confirmationMessage) {
                await interaction.editReply({ content: confirmationMessage });
            }

            try {
                const channel = interaction.guild.channels.cache.get(String(menuData.channelId));
                if (!channel || !channel.isTextBased()) {
                    Sdb.deleteRoleMenu(messageId);
                    return await interaction.followUp({ content: getReply('rm_msg_deleted_channel', loc) });
                }
                const message = await channel.messages.fetch(messageId).catch(() => null);
                if (!message) {
                    Sdb.deleteRoleMenu(messageId);
                    return await interaction.followUp({ content: getReply('rm_msg_deleted_not_found', loc) });
                }

                const oldEmbedData = message.embeds[0];
                const updatedEmbed = new EmbedBuilder()
                    .setColor(oldEmbedData.color || 'Blue')
                    .setTitle(oldEmbedData.title)
                    .setFooter({ text: `${getReply('rm_last_update', loc)}: ${new Date().toLocaleString()}` });

                const baseDescriptionMatch = (oldEmbedData.description || '').match(new RegExp(`(.*?)(?:\n\n\\*\\*${getReply('rm_available_roles', loc)}\\*\\*|$)`, 's'));
                const baseDescription = baseDescriptionMatch ? baseDescriptionMatch[1].trim() : (oldEmbedData.description || '');

                if (updatedRoles.length > 0) {
                    const rolesList = updatedRoles.map(r => {
                        const roleMention = `<@&${r.id}>`;
                        return `${roleMention} ${r.description ? `*(${r.description})*` : ''}`;
                    }).join('\n');
                    updatedEmbed.setDescription(`${baseDescription}\n\n**${getReply('rm_available_roles', loc)}**\n${rolesList}`);
                } else {
                    updatedEmbed.setDescription(`${baseDescription}\n\n**${getReply('rm_available_roles', loc)}**\n${getReply('rm_no_roles_in_menu', loc)}`);
                }

                if (oldEmbedData.fields && oldEmbedData.fields.length > 0) {
                    updatedEmbed.addFields(oldEmbedData.fields.map(field => ({
                        name: field.name,
                        value: field.value,
                        inline: field.inline
                    })));
                }

                let components = [];

                if (menuData.type === 'select') {
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('role_select_menu')
                        .setPlaceholder(menuData.placeholder || getReply('rm_placeholder', loc))
                        .setMinValues(0)
                        .setMaxValues(updatedRoles.length > 0 ? updatedRoles.length : 1);

                    if (updatedRoles.length === 0) {
                        selectMenu.addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(getReply('rm_no_roles_yet', loc))
                                .setValue('no_roles_yet')
                                .setDescription(getReply('rm_add_hint', loc))
                        );
                        selectMenu.setDisabled(true);
                    } else {
                        updatedRoles.forEach(role => {
                            const option = new StringSelectMenuOptionBuilder()
                                .setLabel(role.label)
                                .setValue(role.id);
                            if (role.description) option.setDescription(role.description);
                            if (role.emoji) option.setEmoji(role.emoji);
                            selectMenu.addOptions(option);
                        });
                        selectMenu.setDisabled(false);
                    }
                    components.push(new ActionRowBuilder().addComponents(selectMenu));

                } else if (menuData.type === 'buttons') {
                    const actionRows = [];
                    let currentRow = new ActionRowBuilder();
                    let buttonCountInRow = 0;

                    if (updatedRoles.length === 0) {
                        currentRow.addComponents(
                            new ButtonBuilder()
                                .setCustomId('no_roles_button')
                                .setLabel(getReply('rm_no_roles_yet', loc))
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        );
                        actionRows.push(currentRow);
                    } else {
                        updatedRoles.forEach((role, index) => {
                            const button = new ButtonBuilder()
                                .setCustomId(`role_button_${role.id}`)
                                .setLabel(role.label)
                                .setStyle(ButtonStyle.Primary);

                            if (role.emoji) {
                                button.setEmoji(role.emoji);
                            }

                            currentRow.addComponents(button);
                            buttonCountInRow++;

                            if (buttonCountInRow === 5 || index === updatedRoles.length - 1) {
                                actionRows.push(currentRow);
                                currentRow = new ActionRowBuilder();
                                buttonCountInRow = 0;
                            }
                        });
                    }
                    components = actionRows;
                }

                await message.edit({ embeds: [updatedEmbed], components: components });

                Sdb.addRoleMenu(messageId, guildId, String(menuData.channelId), menuData.type, updatedRoles, menuData.placeholder);
                await interaction.editReply({ content: getReply('rm_update_success', loc) });

            } catch (error) {
                console.error('Ошибка при обновлении сообщения ролевого меню:', error);
                let errorMessage = getReply('rm_update_error', loc);
                if (error.code === 50001) {
                    errorMessage += getReply('rm_edit_perms_error', loc);
                } else if (error.code === 10008) {
                    errorMessage += getReply('rm_msg_deleted2', loc);
                    Sdb.deleteRoleMenu(messageId);
                }
                await interaction.followUp({ content: errorMessage });
            }

        } else if (subcommand === 'delete') {
            const messageId = interaction.options.getString('message_id');
            const menuData = Sdb.getRoleMenu(messageId);

            if (!menuData || menuData.guildId !== guildId) {
                return await interaction.editReply({ content: getReply('rm_invalid_id', loc) });
            }

            try {
                const channel = interaction.guild.channels.cache.get(String(menuData.channelId));
                if (!channel || !channel.isTextBased()) {
                    Sdb.deleteRoleMenu(messageId);
                    return await interaction.editReply({ content: getReply('rm_msg_deleted_channel', loc) });
                }

                const message = await channel.messages.fetch(messageId).catch(error => {
                    console.warn(`[Удаление RoleMenu] Ошибка при получении сообщения ${messageId} (возможно, уже удалено):`, error.code);
                    return null;
                });

                if (message) {
                    await message.delete();
                } else {
                    console.warn(`[Удаление RoleMenu] Сообщение с ID ${messageId} не найдено или недоступно. Удаляем только данные из БД.`);
                }

                Sdb.deleteRoleMenu(messageId);
                await interaction.editReply({ content: getReply('rm_delete_success', loc) });
            } catch (error) {
                console.error('Ошибка при удалении сообщения ролевого меню:', error);
                let errorMessage = getReply('rm_delete_error', loc);
                if (error.code === 50001) {
                    errorMessage += getReply('rm_delete_perms_error', loc);
                }
                await interaction.editReply({ content: errorMessage });
            }
        }
    },
};