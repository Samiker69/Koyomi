const DatabaseService = require('../../database/repositories');
const localeManager = require('../../locales/localeManager');
module.exports = async (interaction, next) => {
    const guildId = interaction.guild?.id;
    let lang = 'ru';
    if (guildId) {
        const settings = await DatabaseService.getSettings(guildId);
        if (settings && settings.language) {
            lang = settings.language;
        }
    } else {
        lang = interaction.locale || interaction.guildLocale || 'ru';
    }
    Object.defineProperty(interaction, 'guildLocale', {
        value: lang,
        writable: true,
        configurable: true
    });
    interaction.t = (key, variables = {}) => {
        return localeManager.get(key, lang, variables);
    };
    await next();
};