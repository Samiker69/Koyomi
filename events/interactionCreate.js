const { Events, MessageFlags, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetchDoujin } = require('../functions/fetchDoujin');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            const [action, ownerId, galleryId, pageStr] = interaction.customId.split('_');
            const page = parseInt(pageStr, 10);

            if (interaction.user.id !== ownerId) {
                return interaction.reply({ content: 'Это не ваша галерея!', flags: MessageFlags.Ephemeral });
            }

            let newPage = page;
            if (action === 'next') newPage++;
            else if (action === 'prev') newPage--;
            else return;

            await interaction.deferUpdate();

            const result = await fetchDoujin(galleryId, newPage);
            if (!result) {
                return interaction.followUp({ content: 'Не удалось загрузить страницу.', flags: MessageFlags.Ephemeral });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`prev_${ownerId}_${galleryId}_${newPage}`)
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(newPage === 1),
                new ButtonBuilder()
                    .setCustomId(`next_${ownerId}_${galleryId}_${newPage}`)
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(newPage === result.totalPages)
            );

            return interaction.editReply({
                embeds:     [result.embed],
                files:      [result.attachment],
                components: [row]
            });
        }

        if (!interaction.isChatInputCommand()) return;
        
        const command = interaction.client.commands.get(interaction.commandName);
        
        if (!command) {
            console.error(`Команда ${interaction.commandName} не найдена.`);
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
                return interaction.reply({
                    content: `Не так быстро! вы слишком часто использовали \`${command.data.name}\`. Ты снова сможешь использовать её <t:${expiredTimestamp}:R>.`,
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
    },
};