const { Collection, MessageFlags } = require('discord.js');
module.exports = async (interaction, next) => {
    const { privateAccess } = require('../../config.json');
    const isDev = privateAccess && privateAccess.includes(interaction.user.id);
    if (isDev) {
        await next();
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        await next();
        return;
    }
    const { cooldowns } = interaction.client;
    const commandName = command.data.name;
    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(commandName);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;
    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            const responseContent = interaction.t('events.errors.cooldown', {
                commandName: commandName,
                timestamp: expiredTimestamp
            });
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: responseContent, flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: responseContent, flags: MessageFlags.Ephemeral });
            }
            return;
        }
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    await next();
};