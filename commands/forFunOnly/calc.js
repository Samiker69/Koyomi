const { SlashCommandBuilder } = require('discord.js');
const { calc } = require('../../functions/calc');
const localeMamager = require('../../locales/localesManager');
const lm = new localeMamager();

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("calc")
        .setDescription("Калькулятор бесплатна!!!")
        .addStringOption(opt => 
            opt.setName("expression")
            .setDescription("Выражение. Например: 2+9*23/2^2")
            .setRequired(true)
        ),

    async execute(interaction) {
        const expression = interaction.options.getString("expression");
        const result = calc(expression);
        const reply = typeof result !== "number" ? `Неверное выражение: ${result}` : `Пример: \`${expression}\`\nОтвет: ${result}`;

        await interaction.reply(reply);
    }
};
