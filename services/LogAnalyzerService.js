const LogParser = require('../functions/LogParser');

class LogAnalyzerService {
    constructor() {
        // Здесь можно передавать инстанс подключения к БД в будущем
        // constructor(dbClient) { this.db = dbClient; }
    }

    // ==========================================
    // ЗАГЛУШКИ ДЛЯ БАЗЫ ДАННЫХ (Mock DB methods)
    // ==========================================

    /**
     * Возвращает список модов, которые просто не поддерживаются 
     * (бот выведет предупреждение, но не откажет в поддержке)
     */
    async getUnsupportedMods() {
        // Формат: { "mod_id": "Причина" }
        return {
            "optifine": "Используйте Sodium/Rubidium для лучшей производительности на мобильных устройствах.",
            "betterfps": "Мод устарел и часто ломает рендер.",
            // Сюда будете тянуть из БД
        };
    }

    /**
     * Возвращает список модов/читов, при нахождении которых поддержка АВТОМАТИЧЕСКИ отказывается
     */
    async getBannedMods() {
        return[
            "meteor-client",
            "wurst",
            "bleachhack",
            // Сюда будете тянуть читы из БД
        ];
    }

    async getModsMapping() {
        return {
            "yet_another_config_lib_v3": "yacl"
        }
    }

    /**
     * Возвращает разрешенные ключевые слова для версии лаунчера
     */
    async getAllowedLaunchers() {
        return ["hebe"];
    }

    // ==========================================
    // ВНЕШНИЕ API (Modrinth)
    // ==========================================

    async getModLink(modName) {
        try {
            const response = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(modName)}&facets=[["project_type:mod"]]`);
            if (!response.ok) return null;
            
            const data = await response.json();
            
            if (data.hits && data.hits.length > 0) {
                const exactMatch = data.hits.find(hit => hit.title.toLowerCase() === modName.toLowerCase());
                return exactMatch 
                    ? `https://modrinth.com/mod/${exactMatch.slug}` 
                    : `https://modrinth.com/mod/${data.hits[0].slug}`;
            }
        } catch (error) {
            console.error(`Modrinth API error for ${modName}:`, error.message);
        }
        return null;
    }

    // ==========================================
    // ОСНОВНАЯ ЛОГИКА АНАЛИЗА
    // ==========================================

    /**
     * Парсит лог, извлекает решения из текста и сверяет с БД
     * @param {string} rawLogText - Сырой текст лога
     * @returns {Object} Результат анализа
     */
    async analyze(rawLogText) {
        // 1. Прогоняем через парсер
        const parser = new LogParser(rawLogText);
        const parsed = parser.parse();

        // 2. Проверка на "Свой" лаунчер
        const allowedLaunchers = await this.getAllowedLaunchers();
        const launcherVer = (parsed.system['Launcher version'] || '').toLowerCase();
        const hasMojoEnv = !!parsed.system['MOJO_RENDERER'] || rawLogText.includes('git.artdeell');
        
        const isAllowedLauncher = allowedLaunchers.some(keyword => launcherVer.includes(keyword)) || hasMojoEnv;

        if (!isAllowedLauncher) {
            return {
                isDenied: true,
                denyReason: "Обнаружен сторонний лаунчер. Поддержка оказывается только для официальных сборок лаунчера (hebe)."
            };
        }

        // 3. Проверка на читы (отказ в поддержке)
        const bannedMods = await this.getBannedMods();
        const foundBannedMod = parsed.mods.find(mod => bannedMods.includes(mod.toLowerCase()));
        
        if (foundBannedMod) {
            return {
                isDenied: true,
                denyReason: `В сборке обнаружен запрещенный мод/чит: ${foundBannedMod}. Использование подобных модификаций лишает вас поддержки.`
            };
        }

        // 4. Сбор неподдерживаемых модов
        const unsupportedRules = await this.getUnsupportedMods();
        const unsupportedFound =[];
        for (const mod of parsed.mods) {
            const modLower = mod.toLowerCase();
            if (unsupportedRules[modLower]) {
                unsupportedFound.push({ name: mod, reason: unsupportedRules[modLower] });
            }
        }

        // 5. Динамический парсинг решений (ошибки недостающих модов из крашей Форджа/Фабрика)
        const dynamicSolutions = await this._extractDynamicSolutions(rawLogText);

        // 6. Объединяем решения (от парсера + из текста + Modrinth)
        const allSolutions = [...(parsed.solutions || []), ...dynamicSolutions];

        // 7. Формируем итоговый объект для Телеграм-бота
        return {
            isDenied: false,
            system: parsed.system,
            crash: parsed.crash,
            nativeCrash: parsed.nativeCrash,
            loader: parsed.loader,
            mods: {
                total: parsed.mods.length,
                list: parsed.mods,
                unsupported: unsupportedFound
            },
            solutions: allSolutions.length > 0 ? allSolutions : null
        };
    }

    /**
     * Ищет в тексте ошибки зависимостей и генерирует решения со ссылками на Modrinth
     */
    async _extractDynamicSolutions(rawText) {
        const solutions = [];
        const promises =[]; // Для параллельных запросов к API

        // Ищем паттерн: "Install fabric-api,"
        const installRegex = /Install ([\w-]+),/gi;
        const installMatches =[...rawText.matchAll(installRegex)];
        
        for (const match of installMatches) {
            const modName = match[1];
            promises.push(
                this.getModLink(modName).then(link => {
                    return `Установите мод ${modName}` + (link ? `: [Скачать с Modrinth](<${link}>)` : '');
                })
            );
        }

        // Ищем паттерн: "- Replace mod 'Sodium' (sodium) ... with version 0.5.0."
        const replaceRegex = /\s-\sReplace mod '(?<name>[^']+)' \((?<id>[\w-]+)\) .+? with (?<condition>.+?)(?=\.$|:|\n|$)/gi;
        const replaceMatches =[...rawText.matchAll(replaceRegex)];

        for (const match of replaceMatches) {
            const { name, id, condition } = match.groups;
            promises.push(
                Promise.all([this.getModLink(id), this.getModLink(name)]).then(([linkById, linkByName]) => {
                    const link = linkById || linkByName;
                    let msg = `Обновите/Замените мод ${name}`;
                    const versionMatch = condition.match(/version ([\w.+-]+)/);
                    
                    if (versionMatch) msg += ` до версии ${versionMatch[1]} (или новее)`;
                    else msg += ` до версии, совместимой с вашей сборкой`;
                    
                    return msg + (link ? `: [Скачать с Modrinth](<${link}>)` : '');
                })
            );
        }

        // Ждем выполнения всех запросов к Modrinth
        const resolvedSolutions = await Promise.all(promises);
        solutions.push(...resolvedSolutions);

        return solutions;
    }
}

module.exports = new LogAnalyzerService();