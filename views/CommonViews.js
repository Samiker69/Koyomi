const { EmbedBuilder } = require('discord.js');

class CommonViews {
    static error(messageText, lang = 'ru') {
        return {
            embeds: [
                new EmbedBuilder()
                    .setColor(0xFF4757)
                    .setTitle(lang === 'ru' ? 'Ошибка' : 'Error')
                    .setDescription(messageText)
            ],
            ephemeral: true
        };
    }

    static success(messageText, lang = 'ru') {
        return {
            embeds: [
                new EmbedBuilder()
                    .setColor(0x2ED573)
                    .setTitle(lang === 'ru' ? 'Успешно' : 'Success')
                    .setDescription(messageText)
            ]
        };
    }
}

module.exports = CommonViews;