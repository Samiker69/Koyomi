const { Events, MessageFlags } = require('discord.js');
const SettingsDB = require('../../functions/db/settings'); 

const Sdb = new SettingsDB();

async function safeReply(interaction, content) { 
    const flags = MessageFlags.Ephemeral; 
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content, flags });
        } else {
            await interaction.reply({ content, flags });
        }
    } catch (e) {
        console.error(`[SafeReply Error] Не удалось ответить/продолжить взаимодействие. Содержимое: "${content}". Ошибка:`, e);
    }
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) {
            return;
        }

        const customId = interaction.customId;
        if (!customId.startsWith('role_button_') && customId !== 'no_roles_button' && customId !== 'role_select_menu') {
            return;
        }

        try {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate({ flags: MessageFlags.Ephemeral }); 
            }
        } catch (e) {
            console.error(`[Button/SelectMenuInteraction] Ошибка при откладывании обновления для ${interaction.type} (${interaction.customId}):`, e);
            return; 
        }

        const guildId = interaction.guild?.id;
        const member = interaction.member;

        if (interaction.isButton()) {
            switch (true) {
                case customId.startsWith('role_button_'): {
                    const roleId = customId.replace('role_button_', '');
                    try {
                        const menuData = Sdb.getRoleMenu(interaction.message.id); 

                        if (!menuData || menuData.guildId !== guildId || menuData.type !== 'buttons') {
                            return await safeReply(interaction, 'Ошибка: Не удалось найти данные для этого меню кнопок или оно не является меню ролей.');
                        }

                        const roleInMenu = menuData.roles.find(r => r.id === roleId);
                        if (!roleInMenu) {
                            return await safeReply(interaction, 'Эта роль больше не доступна в этом меню.');
                        }

                        const role = interaction.guild.roles.cache.get(roleId);

                        if (!role) {
                            return await safeReply(interaction, 'Ошибка: Роль не найдена на сервере.');
                        }
                        if (role.position >= interaction.guild.members.me.roles.highest.position) {
                            return await safeReply(interaction, 'Ошибка: Я не могу управлять этой ролью, так как она находится на той же или более высокой позиции, чем моя высшая роль.');
                        }
                        if (role.managed) {
                            return await safeReply(interaction, 'Ошибка: Я не могу управлять этой ролью, так как она является управляемой (например, роль бота).');
                        }

                        if (member.roles.cache.has(roleId)) {
                            await member.roles.remove(role, 'RoleMenu: User clicked button to remove role');
                            await safeReply(interaction, `Роль **${role.name}** убрана.`);
                        } else {
                            await member.roles.add(role, 'RoleMenu: User clicked button to add role');
                            await safeReply(interaction, `Роль **${role.name}** выдана!`);
                        }
                    } catch (error) {
                        console.error(`[RoleButton] Ошибка при изменении роли для ${member.user.tag} (ID: ${roleId}):`, error);
                        let errorMessage = 'Произошла непредвиденная ошибка при обновлении ваших ролей. Пожалуйста, попробуйте снова.';
                        if (error.code === 50013) {
                             errorMessage = 'У меня нет достаточных прав для выдачи/снятия этой роли. Убедитесь, что моя роль находится выше роли, которую вы пытаетесь выдать/снять.';
                        }
                        await safeReply(interaction, errorMessage);
                    }
                    break;
                }
                case 'no_roles_button': {
                    await safeReply(interaction, 'Пока нет ролей для выбора.');
                    break;
                }
                default:
                    return; 
            }
        } 
        else if (interaction.isStringSelectMenu()) {
            const selectedValues = interaction.values;

            switch (customId) {
                case 'role_select_menu': {
                    try {
                        if (selectedValues.includes('no_roles_yet')) {
                            await safeReply(interaction, 'Пока нет ролей для выбора.');
                            return;
                        }

                        const menuData = Sdb.getRoleMenu(interaction.message.id); 

                        if (!menuData || menuData.guildId !== guildId || menuData.type !== 'select') {
                            return await safeReply(interaction, 'Ошибка: Не удалось найти данные для этого Select Menu или оно не является меню ролей.');
                        }

                        const availableRoleIds = menuData.roles.map(r => r.id);
                        const userCurrentRolesInMenu = member.roles.cache.filter(role => availableRoleIds.includes(role.id)).map(role => role.id);

                        const rolesToAdd = [];
                        const rolesToRemove = [];
                        const messages = [];

                        for (const selectedRoleId of selectedValues) {
                            if (availableRoleIds.includes(selectedRoleId) && !userCurrentRolesInMenu.includes(selectedRoleId)) {
                                rolesToAdd.push(selectedRoleId);
                            }
                        }

                        for (const currentRoleId of userCurrentRolesInMenu) {
                            if (!selectedValues.includes(currentRoleId)) {
                                rolesToRemove.push(currentRoleId);
                            }
                        }

                        for (const roleId of rolesToAdd) {
                            const role = interaction.guild.roles.cache.get(roleId);
                            if (role && role.position < interaction.guild.members.me.roles.highest.position && !role.managed) {
                                await member.roles.add(role, 'RoleMenu: User added role via Select Menu');
                                messages.push(`Выдана: **${role.name}**`);
                            } else {
                                messages.push(`Ошибка при выдаче: **${menuData.roles.find(r => r.id === roleId)?.label || roleId}** (проверьте права бота/роль).`);
                                console.error(`[RoleSelectMenu] Не удалось выдать роль ${roleId} пользователю ${member.user.tag}.`);
                            }
                        }

                        for (const roleId of rolesToRemove) {
                            const role = interaction.guild.roles.cache.get(roleId);
                            if (role && role.position < interaction.guild.members.me.roles.highest.position && !role.managed) {
                                await member.roles.remove(role, 'RoleMenu: User removed role via Select Menu');
                                messages.push(`Убрана: **${role.name}**`);
                            } else {
                                messages.push(`Ошибка при убирании: **${menuData.roles.find(r => r.id === roleId)?.label || roleId}** (проверьте права бота/роль).`);
                                console.error(`[RoleSelectMenu] Не удалось убрать роль ${roleId} у пользователя ${member.user.tag}.`);
                            }
                        }

                        let responseContent = 'Ваши роли обновлены.';
                        if (messages.length > 0) {
                            responseContent += '\n' + messages.join('\n');
                        } else if (rolesToAdd.length === 0 && rolesToRemove.length === 0) {
                            responseContent = 'Ваши роли не изменились.';
                        }

                        await safeReply(interaction, responseContent);

                    } catch (error) {
                        console.error(`[RoleSelectMenu] Ошибка при обработке Select Menu для ${member.user.tag} (Custom ID: ${customId}):`, error);
                        let errorMessage = 'Произошла непредвиденная ошибка при обработке вашего выбора роли. Пожалуйста, попробуйте снова.';
                        if (error.code === 50013) {
                             errorMessage = 'У меня нет достаточных прав для выдачи/снятия этой роли. Убедитесь, что моя роль находится выше роли, которую вы пытаетесь выдать/снять.';
                        }
                        await safeReply(interaction, errorMessage);
                    }
                    break;
                }
                default:
                    return; 
            }
        }
    },
};