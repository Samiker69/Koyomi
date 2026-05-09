const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const MojoTestService = require('../../services/MojoTestService');
const localeManager = require('../../locales/localeManager');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('iqtest')
        .setDescription(localeManager.get('moderation.iqtest.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('moderation.iqtest.description'))
        .addUserOption(option => 
            option.setName('target')
                .setDescription(localeManager.get('moderation.iqtest.options.target.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('moderation.iqtest.options.target.description'))
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const lang = interaction.guildLocale;
        await interaction.deferReply({ fetchReply: true });

        const targetUser = interaction.options.getUser('target');
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            return await interaction.editReply({ content: localeManager.get('moderation.iqtest.messages.not_found', lang) });
        }

        if (targetUser.bot) {
            return await interaction.editReply({ content: localeManager.get('moderation.iqtest.messages.no_bots', lang) });
        }

        // Передаём управление в сервис
        await MojoTestService.startTest(interaction, targetMember);
    }
};
