const { locales } = require("./locales");

class LocaleManager {
    defaultLocale = "en-US";
    langs = ["ru", "en-US", "uk"];

    constructor() {}

    getString(key, locale = this.defaultLocale) {
        try {
            //console.log(`Fetching key: ${key} for locale: ${locale}`, this.parseLocaleString(key));
            return this.parseLocaleString(key, locale);
        } catch (e) {
            console.error(`Error fetching key: ${key} for locale: ${locale}`, e);
            return key;
        }
    }

    //парсит locales и localesString, возвращая значение
    parseLocaleString(key, locale = this.defaultLocale) {
        const parts = key.split('.');
        let current = locales[locale];
        for (const part of parts) {
            if (current && part in current) {
                current = current[part];
            } else {
                return null; // Ключ не найден
            }
        }
        return current;
    }

getAllCommandLocalizations(key) {
    const localizations = {};
    for (const lang of this.langs) {
        const translation = this.getString(key, lang);
        
        if (translation) {
            localizations[lang] = translation;
        } else {
            console.error(`локализация не найдена для ${key} в языке ${lang}`)
        }
    }
    return localizations;
}
}

module.exports = LocaleManager;