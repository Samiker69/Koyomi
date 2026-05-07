class PermissionService {
    /**
     * Checks if the author has permission to moderate the target user.
     * @param {Object} interaction - The Discord interaction object.
     * @param {Object} targetUser - The Discord user object to moderate.
     * @param {string} action - The action type: 'ban', 'kick', 'mute', 'warn', 'unmute', 'unwarn'.
     * @returns {Promise<{allowed: boolean, reason?: string, member?: Object}>}
     */
    static async checkModerationTarget(interaction, targetUser, action) {
        if (targetUser.id === interaction.user.id) {
            return { allowed: false, reason: "Ты не можешь применить это действие к самому себе!" };
        }

        if (targetUser.id === interaction.guild.ownerId) {
            return { allowed: false, reason: "Ты не можешь применить это действие к владельцу сервера!" };
        }

        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!member) {
            return { allowed: false, reason: "Участник не найден на сервере." };
        }

        if (!interaction.memberPermissions.has('Administrator') && 
            interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            return { allowed: false, reason: "Позиция вашей роли ниже или равна роли выбранного участника." };
        }

        if (action === 'ban' && !member.bannable) {
            return { allowed: false, reason: "Я не могу забанить этого участника (моя роль ниже)." };
        }
        if (action === 'kick' && !member.kickable) {
            return { allowed: false, reason: "Я не могу кикнуть этого участника (моя роль ниже)." };
        }
        if (['mute', 'unmute', 'warn', 'unwarn'].includes(action) && !member.moderatable) {
            return { allowed: false, reason: "Я не могу управлять этим участником (моя роль ниже)." };
        }

        return { allowed: true, member };
    }
}

module.exports = PermissionService;
