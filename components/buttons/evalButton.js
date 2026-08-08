const { MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../database/repositories');
module.exports = {
    prefix: 'eval_botinfo_',
    async execute(interaction) {
        const customId = interaction.customId;
        const cfg = await DatabaseService.getSettings(interaction.guild?.id);
        const lang = cfg?.language || interaction.guildLocale || 'ru';
        if (customId === 'eval_botinfo_guilds') {
            const guilds = await interaction.client.guilds.fetch();
            await interaction.deferUpdate();
            const guildsEmbed = new EmbedBuilder()
                .setColor('Random')
                .setTitle(localeManager.get('forFunOnly.eval.messages.guilds_title', lang))
                .setDescription(localeManager.get('forFunOnly.eval.messages.guilds_header', lang));
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('eval_botinfo_back')
                    .setLabel(localeManager.get('forFunOnly.eval.messages.buttons.back', lang))
                    .setStyle(ButtonStyle.Primary)
            );
            guilds.each(guild => {
                guildsEmbed.setDescription(guildsEmbed.data.description += `\n\`${guild.name}\`(${guild.id}). ${localeManager.get('forFunOnly.eval.messages.guild_owner_label', lang)}${guild.owner}`);
            });
            await interaction.editReply({
                embeds: [guildsEmbed],
                components: [row]
            });
        } else if (customId === 'eval_botinfo_back') {
            await interaction.deferUpdate();
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('eval_botinfo_guilds')
                    .setLabel(localeManager.get('forFunOnly.eval.messages.buttons.guilds', lang))
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel('ъ')
                    .setURL('https://samiker.xyz')
                    .setStyle(ButtonStyle.Link)
            );
            const embed = new EmbedBuilder()
                .setTitle(localeManager.get('forFunOnly.eval.messages.botinfo_title', lang))
                .setColor('Random')
                .setDescription(localeManager.get('forFunOnly.eval.messages.botinfo_description', lang));
            await interaction.editReply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
                components: [row]
            });
        }
    }
};