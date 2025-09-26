const { locales } = require("./locales");

class LocaleManager {
    defaultLocale = "en";

    constructor() {}

    getString(key, locale = this.defaultLocale) {
        try {
            console.log(`Fetching key: ${key} for locale: ${locale}`, this.parseLocaleString(key));
            return this.parseLocaleString(key);
        } catch (e) {
            console.error(`Error fetching key: ${key} for locale: ${locale}`, e);
            return key;
        }
    }

    //парсит locales и localesString, возвращая значение
    parseLocaleString(key) {
        const parts = key.split('.');
        let current = locales[this.defaultLocale]; // Начинаем с дефолтного языка
        for (const part of parts) {
            if (current && part in current) {
                current = current[part];
            } else {
                return null; // Ключ не найден
            }
        }
        return current;
    }

    getAllCommandLocalizations(commandName, key) {
        const localizations = {};
        for (const locale of Object.keys(locales)) {
            localizations[locale] = this.getString(`commands.${commandName}.${key}`, locale);
        }
        return localizations;
    }

    getCommandLocalization(commandName, locale = this.defaultLocale) {
        const prefix = `commands.${commandName}`;
        return {
            name: this.getString(`${prefix}.name`, locale),
            description: this.getString(`${prefix}.description`, locale),
            options: this.getCommandOptions(commandName, locale)
        };
    }

    getCommandOptions(commandName, locale) {
        const prefix = `commands.${commandName}.options`;
        const options = locales[locale][prefix];
        return options || {};
    }
}

module.exports = LocaleManager;