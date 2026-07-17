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
    match(customId) {
        return customId.startsWith('role_button_') || customId === 'no_roles_button';
    },
    async execute(interaction) {
        const customId = interaction.customId;
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
        if (customId === 'no_roles_button') {
            await safeReply(interaction, 'events.role_menu.no_roles', lang);
            return;
        }
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
            console.error(error);
            let errorKey = 'events.errors.unexpected';
            if (error.code === 50013) {
                 errorKey = 'events.role_menu.insufficient_permissions_hierarchy';
            }
            await safeReply(interaction, errorKey, lang);
        }
    }
};