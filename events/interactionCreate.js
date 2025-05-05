const { Events, MessageFlags, Collection } = require('discord.js');
const { isCommandDisabled } = require('./restrictions');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`Команда ${interaction.commandName} не найдена.`);
                return;
            }

            if (interaction.guild && isCommandDisabled(interaction.guild.id, interaction.commandName)) {
                await interaction.reply({
                    content: `Команда \`${interaction.commandName}\` запрещена на этом сервере.`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const { cooldowns } = interaction.client;

            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return await interaction.reply({
                        content: `Не так быстро! Вы слишком часто использовали \`${command.data.name}\`. Ты снова сможешь использовать её <t:${expiredTimestamp}:R>.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Произошла ошибка при обработке команды!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: 'Произошла ошибка при обработке команды!', flags: MessageFlags.Ephemeral });
                }
            }

        }
    },
};