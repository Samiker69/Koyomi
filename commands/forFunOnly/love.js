const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly')

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('love')
        .setDescription(forFunOnly.love.description.ru)
        .setDescriptionLocalizations(forFunOnly.love.description)
        .addUserOption(opt =>
            opt
            .setName('user1')
            .setDescription(forFunOnly.love.options.user1.description.ru)
            .setDescriptionLocalizations(forFunOnly.love.options.user1.description)
            .setRequired(true)
        )
        .addUserOption(opt =>
            opt
            .setName('user2')
            .setDescription(forFunOnly.love.options.user2.description.ru)
            .setDescriptionLocalizations(forFunOnly.love.options.user2.description)
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
            .setTitle('💕 Love Calculator')
            .setDescription(`${u1} и ${u2}`)
            .addFields(
                { name: 'Совместимость', value: `**${percentage}%**`, inline: true },
                { name: 'Индикатор',     value: bar,               inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    }
};
