const DatabaseService = require('../../database/repositories');
const { privateAccess } = require('../../config.json');
const { MessageFlags } = require('discord.js');
module.exports = async (interaction, next) => {
    const isDev = privateAccess && privateAccess.includes(interaction.user.id);
    if (isDev) {
        const originalPermissions = interaction.memberPermissions;
        Object.defineProperty(interaction, 'memberPermissions', {
            get: () => {
                if (!originalPermissions) return { has: () => true };
                return new Proxy(originalPermissions, {
                    get(target, prop) {
                        if (prop === 'has') {
                            return () => true;
                        }
                        return Reflect.get(target, prop);
                    }
                });
            },
            configurable: true
        });
        if (interaction.member && interaction.member.permissions) {
            const originalMemberPermissions = interaction.member.permissions;
            Object.defineProperty(interaction.member, 'permissions', {
                get: () => {
                    return new Proxy(originalMemberPermissions, {
                        get(target, prop) {
                            if (prop === 'has') {
                                return () => true;
                            }
                            return Reflect.get(target, prop);
                        }
                    });
                },
                configurable: true
            });
        }
    }
    if (interaction.guild && !isDev) {
        const isDisabled = await DatabaseService.isDisabled(interaction.guild.id, interaction.commandName, interaction.user.id);
        if (isDisabled) {
            const responseContent = interaction.t('events.errors.command_disabled', { commandName: interaction.commandName });
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: responseContent, flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: responseContent, flags: MessageFlags.Ephemeral });
            }
            return;
        }
    }
    await next();
};