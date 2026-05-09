class PermissionService {
    /**
     * Checks if the author has permission to moderate the target user.
     * @param {Object} interaction - The Discord interaction object.
     * @param {Object} targetUser - The Discord user object to moderate.
     * @param {string} action - The action type: 'ban', 'kick', 'mute', 'warn', 'unmute', 'unwarn'.
     * @returns {Promise<{allowed: boolean, reasonKey?: string, member?: Object}>}
     */
    static async checkModerationTarget(interaction, targetUser, action) {
        if (targetUser.id === interaction.user.id) {
            return { allowed: false, reasonKey: 'moderation.moderation.messages.self_mod' };
        }

        if (targetUser.id === interaction.guild.ownerId) {
            return { allowed: false, reasonKey: 'moderation.moderation.messages.owner_mod' };
        }

        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!member) {
            return { allowed: false, reasonKey: 'moderation.moderation.messages.user_not_found' };
        }

        if (!interaction.memberPermissions.has('Administrator') && 
            interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            return { allowed: false, reasonKey: 'moderation.moderation.messages.hierarchy_error' };
        }

        if (action === 'ban' && !member.bannable) {
            return { allowed: false, reasonKey: 'moderation.moderation.messages.bot_hierarchy_ban' };
        }
        if (action === 'kick' && !member.kickable) {
            return { allowed: false, reasonKey: 'moderation.moderation.messages.bot_hierarchy_kick' };
        }
        if (['mute', 'unmute', 'warn', 'unwarn'].includes(action) && !member.moderatable) {
            return { allowed: false, reasonKey: 'moderation.moderation.messages.bot_hierarchy_mod' };
        }

        return { allowed: true, member };
    }
}

module.exports = PermissionService;
