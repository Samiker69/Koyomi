const { SlashCommandBuilder } = require('discord.js');
const { calc } = require('../../functions/calc');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(localeManager.getString('commands.calc.name'))
        .setDescription(localeManager.getString('commands.calc.description'))
        .addStringOption(opt => 
            opt.setName(localeManager.getString('commands.calc.options.expression.name'))
            .setDescription(localeManager.getString('commands.calc.options.expression.description'))
            .setRequired(true)
        ),

    async execute(interaction) {
        const expression = interaction.options.getString("expression");
        const result = calc(expression);
        const reply = typeof result !== "number" ? localeManager.getString('commands.calc.invalid_expression', { error: result }) : localeManager.getString('commands.calc.result', { expression: expression, result: result });

        await interaction.reply(reply);
    }
};
