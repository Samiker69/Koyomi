const { SlashCommandBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const SettingsDB = require('../../functions/db/settings');

const Sdb = new SettingsDB();

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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create-select')
                .setDescription('Создать новое сообщение с Select Menu выбора ролей.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Канал, куда будет отправлено сообщение с меню ролей.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Заголовок для эмбеда сообщения с меню ролей.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Описание для эмбеда сообщения с меню ролей.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('placeholder')
                        .setDescription('Текст-заглушка для Select Menu (по умолчанию: "Выберите ваши роли...").')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('create-buttons')
                .setDescription('Создать новое сообщение с кнопками для выдачи ролей.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Канал, куда будет отправлено сообщение с кнопками.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Заголовок для эмбеда сообщения с кнопками.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Описание для эмбеда сообщения с кнопками.')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-role')
                .setDescription('Добавить роль в существующее меню (кнопки или Select Menu).')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('ID сообщения с меню выбора ролей.')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Роль, которую нужно добавить.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('label')
                        .setDescription('Отображаемое имя роли в меню/на кнопке (по умолчанию: название роли).')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Описание роли в Select Menu (не используется для кнопок).')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji для отображения рядом с ролью в меню/на кнопке. Формат: <:name:id> или стандартный.')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-role')
                .setDescription('Удалить роль из существующего меню (кнопки или Select Menu).')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('ID сообщения с меню выбора ролей.')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Роль, которую нужно удалить.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Удалить сообщение с меню выбора ролей и его данные.')
                .addStringOption(option =>
                    option.setName('message_id')
                        .setDescription('ID сообщения с меню выбора ролей, которое нужно удалить.')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch (e) {
            console.error(`[Команда RoleMenu] Не удалось отложить ответ для /${subcommand}:`, e);
            return;
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await interaction.editReply({ content: 'У вас нет разрешения "Управление ролями" для использования этой команды.' });
        }

        if (subcommand === 'create-select') {
            const channel = interaction.options.getChannel('channel');
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description') || 'Выберите роли, которые вы хотите получить или убрать.';
            const placeholder = interaction.options.getString('placeholder') || 'Выберите ваши роли...';

            if (!channel || !channel.isTextBased()) {
                return await interaction.editReply({ content: 'Вы должны указать текстовый канал!' });
            }

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle(title)
                .setDescription(description + '\n\n**Доступные роли:**\nНет ролей в меню.')
                .setFooter({ text: 'Используйте меню ниже для выбора ролей.' })
                .setTimestamp();

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('role_select_menu')
                .setPlaceholder(placeholder)
                .setMinValues(0)
                .setMaxValues(1);

            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Пока нет доступных ролей')
                    .setValue('no_roles_yet')
                    .setDescription('Используйте команду /rolemenu add-role, чтобы добавить роли.')
            );
            selectMenu.setDisabled(true);


            const row = new ActionRowBuilder().addComponents(selectMenu);

            try {
                const targetChannel = interaction.guild.channels.cache.get(channel.id);
                if (!targetChannel || !targetChannel.isTextBased()) {
                    return await interaction.editReply({ content: 'Указанный канал не является текстовым каналом или недоступен.' });
                }

                const message = await targetChannel.send({ embeds: [embed], components: [row] });
                Sdb.addRoleMenu(message.id, guildId, channel.id, 'select', [], placeholder);
                await interaction.editReply({ content: `Сообщение с **Select Menu** выбора ролей успешно создано в ${channel}! Его ID: \`${message.id}\`. Теперь используйте \`/rolemenu add-role\` для добавления ролей.` });
            } catch (error) {
                console.error('Ошибка при создании Select Menu ролей:', error);
                let errorMessage = 'Произошла ошибка при создании сообщения с Select Menu. Проверьте права бота.';
                if (error.code === 50001) {
                    errorMessage += ' У меня нет достаточных прав для отправки сообщений в этом канале.';
                }
                await interaction.editReply({ content: errorMessage });
            }

        } else if (subcommand === 'create-buttons') {
            const channel = interaction.options.getChannel('channel');
            const title = interaction.options.getString('title');
            const interactionDescription = interaction.options.getString('description') || 'Нажмите кнопку, чтобы получить/убрать роль.';

            if (!channel || !channel.isTextBased()) {
                return await interaction.editReply({ content: 'Вы должны указать текстовый канал!' });
            }

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle(title)
                .setDescription(interactionDescription + '\n\n**Доступные роли:**\nНет ролей в меню.')
                .setFooter({ text: 'Нажмите на кнопку, чтобы управлять ролью.' })
                .setTimestamp();

            try {
                const targetChannel = interaction.guild.channels.cache.get(channel.id);
                if (!targetChannel || !targetChannel.isTextBased()) {
                    return await interaction.editReply({ content: 'Указанный канал не является текстовым каналом или недоступен.' });
                }

                const message = await targetChannel.send({ embeds: [embed], components: [] });
                Sdb.addRoleMenu(message.id, guildId, channel.id, 'buttons', [], null);
                await interaction.editReply({ content: `Сообщение с **кнопками** для ролей успешно создано в ${channel}! Его ID: \`${message.id}\`. Теперь используйте \`/rolemenu add-role\` для добавления ролей (до 25 кнопок).` });
            } catch (error) {
                console.error('Ошибка при создании меню кнопок ролей:', error);
                let errorMessage = 'Произошла ошибка при создании сообщения с кнопками ролей. Проверьте права бота.';
                if (error.code === 50001) {
                    errorMessage += ' У меня нет достаточных прав для отправки сообщений в этом канале.';
                }
                await interaction.editReply({ content: errorMessage });
            }

        } else if (subcommand === 'add-role' || subcommand === 'remove-role') {
            const messageId = interaction.options.getString('message_id');
            const roleToAddRemove = interaction.options.getRole('role');

            const menuData = Sdb.getRoleMenu(messageId);

            if (!menuData || menuData.guildId !== guildId) {
                return await interaction.editReply({ content: 'Указанный ID сообщения не является действительным ID сообщения с меню ролей на этом сервере.' });
            }

            if (!roleToAddRemove.editable) {
                return await interaction.editReply({ content: 'Я не могу управлять этой ролью (возможно, она выше моей в иерархии или является встроенной).' });
            }
            if (roleToAddRemove.managed) {
                return await interaction.editReply({ content: 'Я не могу добавить управляемые роли (например, роли ботов или интеграций).' });
            }

            let updatedRoles = [...menuData.roles];
            let confirmationMessage = '';

            if (subcommand === 'add-role') {
                if (updatedRoles.length >= 25) {
                    return await interaction.editReply({ content: 'Вы достигли максимального количества ролей (25) для этого меню.' });
                }

                const label = interaction.options.getString('label') || roleToAddRemove.name;
                const description = interaction.options.getString('description') || null;
                const emojiInput = interaction.options.getString('emoji');
                const emoji = parseEmoji(emojiInput);

                if (emojiInput && !emoji) {
                    return await interaction.editReply({ content: 'Неверный формат эмодзи. Используйте стандартный эмодзи или кастомный эмодзи в формате `<:name:id>` (для анимированных `<a:name:id>`).' });
                }

                if (updatedRoles.some(r => r.id === roleToAddRemove.id)) {
                    return await interaction.editReply({ content: `Роль **${roleToAddRemove.name}** уже есть в этом меню.` });
                }

                updatedRoles.push({
                    id: roleToAddRemove.id,
                    label: label,
                    description: description,
                    emoji: emoji
                });
                confirmationMessage = `Роль **${roleToAddRemove.name}** добавлена в меню. Обновляю сообщение...`;

            } else {
                const initialLength = updatedRoles.length;
                updatedRoles = updatedRoles.filter(r => r.id !== roleToAddRemove.id);

                if (updatedRoles.length === initialLength) {
                    return await interaction.editReply({ content: `Роль **${roleToAddRemove.name}** не найдена в этом меню.` });
                }
                confirmationMessage = `Роль **${roleToAddRemove.name}** удалена из меню. Обновляю сообщение...`;
            }

            if (confirmationMessage) {
                await interaction.editReply({ content: confirmationMessage });
            }

            try {
                const channel = interaction.guild.channels.cache.get(String(menuData.channelId));
                if (!channel || !channel.isTextBased()) {
                    Sdb.deleteRoleMenu(messageId);
                    return await interaction.followUp({ content: 'Канал для этого меню не найден или не является текстовым. Данные меню были удалены.' });
                }
                const message = await channel.messages.fetch(messageId).catch(() => null);
                if (!message) {
                    Sdb.deleteRoleMenu(messageId);
                    return await interaction.followUp({ content: 'Сообщение для этого меню не найдено. Данные меню были удалены.' });
                }

                const oldEmbedData = message.embeds[0];
                const updatedEmbed = new EmbedBuilder()
                    .setColor(oldEmbedData.color || 'Blue')
                    .setTitle(oldEmbedData.title)
                    .setFooter({ text: `Последнее обновление: ${new Date().toLocaleString()}` });

                const baseDescriptionMatch = (oldEmbedData.description || '').match(/(.*?)(?:\n\n\*\*Доступные роли:\*\*|$)/s);
                const baseDescription = baseDescriptionMatch ? baseDescriptionMatch[1].trim() : (oldEmbedData.description || '');

                if (updatedRoles.length > 0) {
                    const rolesList = updatedRoles.map(r => {
                        const roleMention = `<@&${r.id}>`;
                        return `${roleMention} ${r.description ? `*(${r.description})*` : ''}`;
                    }).join('\n');
                    updatedEmbed.setDescription(`${baseDescription}\n\n**Доступные роли:**\n${rolesList}`);
                } else {
                    updatedEmbed.setDescription(`${baseDescription}\n\n**Доступные роли:**\nНет ролей в меню.`);
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
                        .setPlaceholder(menuData.placeholder || 'Выберите ваши роли...')
                        .setMinValues(0)
                        .setMaxValues(updatedRoles.length > 0 ? updatedRoles.length : 1);

                    if (updatedRoles.length === 0) {
                        selectMenu.addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel('Пока нет доступных ролей')
                                .setValue('no_roles_yet')
                                .setDescription('Используйте команду /rolemenu add-role, чтобы добавить роли.')
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
                                .setLabel('Нет доступных ролей')
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
                await interaction.editReply({ content: 'Сообщение с меню ролей успешно обновлено!' });

            } catch (error) {
                console.error('Ошибка при обновлении сообщения ролевого меню:', error);
                let errorMessage = 'Произошла ошибка при обновлении сообщения с меню ролей. Проверьте права бота.';
                if (error.code === 50001) {
                    errorMessage += ' У меня нет достаточных прав для редактирования этого сообщения или оно было удалено.';
                } else if (error.code === 10008) {
                    errorMessage += ' Сообщение не найдено или было удалено. Данные меню были удалены.';
                    Sdb.deleteRoleMenu(messageId);
                }
                await interaction.followUp({ content: errorMessage });
            }

        } else if (subcommand === 'delete') {
            const messageId = interaction.options.getString('message_id');
            const menuData = Sdb.getRoleMenu(messageId);

            if (!menuData || menuData.guildId !== guildId) {
                return await interaction.editReply({ content: 'Указанный ID сообщения не является действительным ID сообщения с меню ролей на этом сервере.' });
            }

            try {
                const channel = interaction.guild.channels.cache.get(String(menuData.channelId));
                if (!channel || !channel.isTextBased()) {
                    Sdb.deleteRoleMenu(messageId);
                    return await interaction.editReply({ content: 'Канал для этого меню не найден или не является текстовым. Данные меню были удалены.' });
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
                await interaction.editReply({ content: 'Сообщение с меню ролей и его данные успешно удалены.' });
            } catch (error) {
                console.error('Ошибка при удалении сообщения ролевого меню:', error);
                let errorMessage = 'Произошла ошибка при удалении сообщения с меню ролей.';
                if (error.code === 50001) {
                    errorMessage += ' У меня нет достаточных прав для удаления этого сообщения. Проверьте разрешения "Управление сообщениями".';
                }
                await interaction.editReply({ content: errorMessage });
            }
        }
    },
};