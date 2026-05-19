const { Events, MessageFlags } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../services/DatabaseService');

async function safeReply(interaction, key, lang, variables = {}) { 
    const flags = MessageFlags.Ephemeral; 
    const content = localeManager.get(key, lang, variables);
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content, flags });
        } else {
            await interaction.reply({ content, flags });
        }
    } catch (e) {
        console.error(`[SafeReply Error] Не удалось ответить/продолжить взаимодействие. Ключ: "${key}". Ошибка:`, e);
    }
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) {
            return;
        }

        const settings = interaction.guild ? (await DatabaseService.getSettings(interaction.guild.id) || {}) : {};
        const preferredLang = settings.language || interaction.guildLocale || 'ru';

        Object.defineProperty(interaction, 'guildLocale', {
            get: () => preferredLang,
            configurable: true
        });

        const lang = preferredLang;
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
                        const menuData = await DatabaseService.getRoleMenu(interaction.message.id); 

                        if (!menuData || menuData.guildId !== guildId || menuData.type !== 'buttons') {
                            return await safeReply(interaction, 'events.role_menu.error_not_found', lang);
                        }

                        const roleInMenu = menuData.roles.find(r => r.id === roleId);
                        if (!roleInMenu) {
                            return await safeReply(interaction, 'events.role_menu.role_not_available', lang);
                        }

                        const role = interaction.guild.roles.cache.get(roleId);

                        if (!role) {
                            return await safeReply(interaction, 'events.role_menu.role_not_found', lang);
                        }
                        if (role.position >= interaction.guild.members.me.roles.highest.position) {
                            return await safeReply(interaction, 'events.role_menu.role_too_high', lang);
                        }
                        if (role.managed) {
                            return await safeReply(interaction, 'events.role_menu.role_managed', lang);
                        }

                        if (member.roles.cache.has(roleId)) {
                            await member.roles.remove(role, 'RoleMenu: User clicked button to remove role');
                            await safeReply(interaction, 'events.role_menu.role_removed', lang, { roleName: role.name });
                        } else {
                            await member.roles.add(role, 'RoleMenu: User clicked button to add role');
                            await safeReply(interaction, 'events.role_menu.role_added', lang, { roleName: role.name });
                        }
                    } catch (error) {
                        console.error(`[RoleButton] Ошибка при изменении роли для ${member.user.tag} (ID: ${roleId}):`, error);
                        let errorKey = 'events.errors.unexpected';
                        if (error.code === 50013) {
                             errorKey = 'events.role_menu.insufficient_permissions_hierarchy';
                        }
                        await safeReply(interaction, errorKey, lang);
                    }
                    break;
                }
                case 'no_roles_button': {
                    await safeReply(interaction, 'events.role_menu.no_roles', lang);
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
                            await safeReply(interaction, 'events.role_menu.no_roles', lang);
                            return;
                        }

                        const menuData = await DatabaseService.getRoleMenu(interaction.message.id); 

                        if (!menuData || menuData.guildId !== guildId || menuData.type !== 'select') {
                            return await safeReply(interaction, 'events.role_menu.error_not_found', lang);
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
                                messages.push(localeManager.get('events.role_menu.role_add_success', lang, { roleName: role.name }));
                            } else {
                                const roleLabel = menuData.roles.find(r => r.id === roleId)?.label || roleId;
                                messages.push(localeManager.get('events.role_menu.role_add_error', lang, { roleName: roleLabel }));
                                console.error(`[RoleSelectMenu] Не удалось выдать роль ${roleId} пользователю ${member.user.tag}.`);
                            }
                        }

                        for (const roleId of rolesToRemove) {
                            const role = interaction.guild.roles.cache.get(roleId);
                            if (role && role.position < interaction.guild.members.me.roles.highest.position && !role.managed) {
                                await member.roles.remove(role, 'RoleMenu: User removed role via Select Menu');
                                messages.push(localeManager.get('events.role_menu.role_remove_success', lang, { roleName: role.name }));
                            } else {
                                const roleLabel = menuData.roles.find(r => r.id === roleId)?.label || roleId;
                                messages.push(localeManager.get('events.role_menu.role_remove_error', lang, { roleName: roleLabel }));
                                console.error(`[RoleSelectMenu] Не удалось убрать роль ${roleId} у пользователя ${member.user.tag}.`);
                            }
                        }

                        let responseContent = localeManager.get('events.role_menu.roles_updated', lang);
                        if (messages.length > 0) {
                            responseContent += '\n' + messages.join('\n');
                        } else if (rolesToAdd.length === 0 && rolesToRemove.length === 0) {
                            responseContent = localeManager.get('events.role_menu.roles_no_change', lang);
                        }

                        await safeReply(interaction, responseContent);

                    } catch (error) {
                        console.error(`[RoleSelectMenu] Ошибка при обработке Select Menu для ${member.user.tag} (Custom ID: ${customId}):`, error);
                        let errorKey = 'events.errors.unexpected';
                        if (error.code === 50013) {
                             errorKey = 'events.role_menu.insufficient_permissions_hierarchy';
                        }
                        await safeReply(interaction, errorKey, lang);
                    }
                    break;
                }
                default:
                    return; 
            }
        }
    },
};