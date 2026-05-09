const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetchDoujin } = require('../../functions/fetchDoujin');
const localeManager = require('../../locales/localeManager');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            const [command_name, action, ownerId, galleryId, pageStr] = interaction.customId.split('_');
            if (command_name !== "nhentai") return;
            const page = parseInt(pageStr, 10);

            const lang = interaction.guildLocale || 'ru';
            if (interaction.user.id !== ownerId) {
                return await interaction.reply({ content: localeManager.get('nsfw.nhentai.messages.not_author', lang), flags: MessageFlags.Ephemeral });
            }

            let newPage = page;
            if (action === 'next') newPage++;
            else if (action === 'prev') newPage--;
            else return;

            await interaction.deferUpdate();

            const result = await fetchDoujin(galleryId, newPage);
            if (!result) {
                return await interaction.followUp({ content: localeManager.get('nsfw.nhentai.messages.page_load_error', lang), flags: MessageFlags.Ephemeral });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`nhentai_prev_${ownerId}_${galleryId}_${newPage}`)
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(newPage === 1),
                new ButtonBuilder()
                    .setCustomId(`nhentai_next_${ownerId}_${galleryId}_${newPage}`)
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