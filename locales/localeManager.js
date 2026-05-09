const fs = require('node:fs');
const path = require('node:path');

class LocaleManager {
    constructor() {
        this.locales = {};
        this.defaultLocale = 'ru';
        this.langs = ['ru', 'en-US', 'uk'];
        this._loadLocales();
    }

    _loadLocales() {
        const descriptionsPath = path.join(__dirname, 'descriptions');
        if (!fs.existsSync(descriptionsPath)) return;

        const files = fs.readdirSync(descriptionsPath).filter(f => f.endsWith('.js'));

        for (const file of files) {
            try {
                const filePath = path.join(descriptionsPath, file);
                delete require.cache[require.resolve(filePath)];
                const content = require(filePath);
                const category = path.basename(file, '.js');

                // ИСПРАВЛЕНИЕ: Проверяем, не обернуты ли данные в ключ с именем категории
                if (content && typeof content === 'object' && content[category]) {
                    // Если внутри файла есть ключ 'moderation', берем данные из него
                    this.locales[category] = content[category];
                } else {
                    // Если нет — берем весь контент файла целиком
                    this.locales[category] = content;
                }
            } catch (error) {
                console.error(`[LocaleManager] Error loading ${file}:`, error);
            }
        }
    }

    get(pathStr, locale = this.defaultLocale, variables = {}) {
        const value = this._getValueByPath(pathStr);

        if (!value) {
            // Чтобы Discord не падал при ошибке в .setName()
            if (pathStr.endsWith('.name')) {
                const parts = pathStr.split('.');
                return parts[parts.length - 2] || 'command';
            }
            return pathStr; // Возвращает сам путь, если перевода нет
        }

        let text = '';
        if (typeof value === 'object') {
            // Выбор языка с фоллбеком
            text = value[locale] || value[this.defaultLocale] || Object.values(value)[0];
        } else {
            text = value;
        }

        if (typeof text !== 'string') return pathStr;

        // Вставка переменных {user}
        return text.replace(/{(\w+)}/g, (match, key) => {
            return variables[key] !== undefined ? String(variables[key]) : match;
        });
    }

    getLocalizations(pathStr) {
        const value = this._getValueByPath(pathStr);
        if (!value || typeof value !== 'object') return {};

        const result = {};
        for (const lang of this.langs) {
            if (value[lang]) {
                let val = value[lang];
                // Валидация имен для Discord (только строчные буквы)
                if (pathStr.endsWith('.name')) {
                    val = val.toLowerCase().replace(/\s+/g, '-');
                }
                result[lang] = val;
            }
        }
        return result;
    }

    _getValueByPath(pathStr) {
        if (!pathStr || typeof pathStr !== 'string') return null;
        return pathStr.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : null, this.locales);
    }
}

module.exports = new LocaleManager();