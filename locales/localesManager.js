const { locales } = require("../locales");

class LocaleManager {
    static instance;
    defaultLocale = "en";

    constructor() {}

    static getInstance() {
        if (!LocaleManager.instance) {
            LocaleManager.instance = new LocaleManager();
        }
        return LocaleManager.instance;
    }

    getString(key, locale = this.defaultLocale) {
        try {
            return locales[locale][key] || locales[this.defaultLocale][key];
        } catch (e) {
            return key;
        }
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

module.exports = { LocaleManager };