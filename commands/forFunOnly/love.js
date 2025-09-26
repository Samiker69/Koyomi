const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(localeManager.getString('commands.love.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.love.name'))
        .setDescription(localeManager.getString('commands.love.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.love.description'))
        
        .addUserOption(opt =>
            opt
            .setName(localeManager.getString('commands.love.options.user1.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.love.options.user1.name'))
            .setDescription(localeManager.getString('commands.love.options.user1.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.love.options.user1.description'))
            
            .setRequired(true)
        )
        .addUserOption(opt =>
            opt
            .setName(localeManager.getString('commands.love.options.user2.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.love.options.user2.name'))
            .setDescription(localeManager.getString('commands.love.options.user2.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.love.options.user2.description'))
            
            .setRequired(true)
        ),

    async execute(interaction) {
        const u1 = interaction.options.getUser('user1');
        const u2 = interaction.options.getUser('user2');

        const [a, b] = [u1.id, u2.id].sort();
        const seed = BigInt(a) ^ BigInt(b);

        const lcg = (seed * 9301n + 49297n) % 233280n;
        const percentage = Math.floor(Number(lcg) / 233280 * 100);

        const totalBlocks = 10;
        const filled = Math.round(percentage / 10);
        const bar = '❤️'.repeat(filled) + '🖤'.repeat(totalBlocks - filled);

        const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle(localeManager.getString('commands.love.embed_title'))
            .setDescription(localeManager.getString('commands.love.embed_description', { user1: u1.toString(), user2: u2.toString() }))
            .addFields(
                { name: localeManager.getString('commands.love.compatibility_field'), value: `**${percentage}%**`, inline: true },
                { name: localeManager.getString('commands.love.indicator_field'),     value: bar,               inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    }
};
