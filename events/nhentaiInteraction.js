const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetchDoujin } = require('../functions/fetchDoujin');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            const [action, ownerId, galleryId, pageStr] = interaction.customId.split('_');
            if (!galleryId) return;
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
                return await interaction.followUp({ content: 'Не удалось загрузить страницу.', flags: MessageFlags.Ephemeral });
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

            return await interaction.editReply({
                embeds:     [result.embed],
                files:      [result.attachment],
                components: [row]
            });
        }
    },
};