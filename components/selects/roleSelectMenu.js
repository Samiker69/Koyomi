const { MessageFlags } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../database/repositories');
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
        console.error(e);
    }
}
module.exports = {
    id: 'role_select_menu',
    async execute(interaction) {
        const guildId = interaction.guild?.id;
        const member = interaction.member;
        const settings = interaction.guild ? (await DatabaseService.getSettings(interaction.guild.id) || {}) : {};
        const lang = settings.language || interaction.guildLocale || 'ru';
        try {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate({ flags: MessageFlags.Ephemeral });
            }
        } catch (e) {
            return;
        }
        const selectedValues = interaction.values;
        if (selectedValues.includes('no_roles_yet')) {
            await safeReply(interaction, 'events.role_menu.no_roles', lang);
            return;
        }
        try {
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
            console.error(error);
            let errorKey = 'events.errors.unexpected';
            if (error.code === 50013) {
                 errorKey = 'events.role_menu.insufficient_permissions_hierarchy';
            }
            await safeReply(interaction, errorKey, lang);
        }
    }
};