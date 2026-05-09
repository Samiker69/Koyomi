const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('report')
        .setNameLocalizations(localeManager.getLocalizations('moderation.report.name'))
        .setDescription(localeManager.get('moderation.report.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.report.description'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option.setName('faq_link')
                .setNameLocalizations(localeManager.getLocalizations('moderation.report.options.faq_link.name'))
                .setDescription(localeManager.get('moderation.report.options.faq_link.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.report.options.faq_link.description'))
                .setRequired(false)),

    async execute(interaction) {
        const lang = interaction.guildLocale || 'ru';
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const faqLink = interaction.options.getString('faq_link');

            const reportEmbed = EmbedService.createBaseEmbed(interaction)
                .setTitle(localeManager.get('moderation.report.messages.panel_title', lang))
                .setDescription(localeManager.get('moderation.report.messages.panel_desc', lang))
                .addFields(
                    {
                        name: localeManager.get('moderation.report.messages.how_to_title', lang),
                        value: localeManager.get('moderation.report.messages.how_to_desc', lang)
                    },
                    {
                        name: localeManager.get('moderation.report.messages.important_title', lang),
                        value: localeManager.get('moderation.report.messages.important_desc', lang)
                    }
                )
                .setThumbnail(interaction.guild.iconURL() || interaction.client.user.displayAvatarURL())
                .setFooter({
                    text: localeManager.get('moderation.report.messages.footer', lang),
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            const reportButtonsRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('report_user')
                        .setLabel(localeManager.get('moderation.report.messages.btn_user', lang))
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('report_message')
                        .setLabel(localeManager.get('moderation.report.messages.btn_message', lang))
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('report_moderator')
                        .setLabel(localeManager.get('moderation.report.messages.btn_moderator', lang))
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('report_other')
                        .setLabel(localeManager.get('moderation.report.messages.btn_other', lang))
                        .setStyle(ButtonStyle.Secondary)
                );
            
            const componentsToSend = [reportButtonsRow];

            if (faqLink) {
                const faqButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel(localeManager.get('moderation.report.messages.btn_faq', lang))
                            .setStyle(ButtonStyle.Link)
                            .setURL(faqLink)
                    );
                componentsToSend.push(faqButtonRow);
            }

            await interaction.channel.send({
                embeds: [reportEmbed],
                components: componentsToSend
            });

            await interaction.editReply({
                content: localeManager.get('moderation.report.messages.success', lang, { id: interaction.channel.id }),
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error('Ошибка при размещении панели жалоб:', error);
            await interaction.editReply({
                content: localeManager.get('moderation.report.messages.error', lang),
                flags: MessageFlags.Ephemeral
            });
        }
    },
};