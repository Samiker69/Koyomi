const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { fetchDoujin } = require('../../utils/fetchDoujin');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../database/repositories');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            const [command_name, action, ownerId, galleryId, pageStr] = interaction.customId.split('_');
            if (command_name !== "nhentai") return;
            const page = parseInt(pageStr, 10);

            const settings = interaction.guild ? (await DatabaseService.getSettings(interaction.guild.id) || {}) : {};
            const preferredLang = settings.language || interaction.guildLocale || 'ru';

            Object.defineProperty(interaction, 'guildLocale', {
                get: () => preferredLang,
                configurable: true
            });

            const lang = preferredLang;
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