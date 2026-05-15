const LogParser = require('../functions/LogParser');
const DatabaseService = require('./DatabaseService');
const localeManager = require('../locales/localeManager');

class LogAnalyzerService {
    constructor() {
        // Здесь можно передавать инстанс подключения к БД в будущем
        // constructor(dbClient) { this.db = dbClient; }
    }

    // ==========================================
    // ИНТЕГРАЦИЯ С БАЗОЙ ДАННЫХ
    // ==========================================

    async getUnsupportedMods() {
        return DatabaseService.getUnsupportedMods();
    }

    async getBannedMods() {
        return DatabaseService.getBannedMods();
    }

    async getModsMapping() {
        return DatabaseService.getModsMapping();
    }

    async getAllowedLaunchers() {
        return DatabaseService.getAllowedLaunchers();
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
     * @param {string} lang - Язык
     * @returns {Object} Результат анализа
     */
    async analyze(rawLogText, lang = 'ru') {
        // 1. Прогоняем через парсер
        const parser = new LogParser(rawLogText, lang);
        const parsed = parser.parse();

        // 2. Проверка на "Свой" лаунчер
        const allowedLaunchers = await this.getAllowedLaunchers();
        const launcherVer = (parsed.system['Launcher version'] || '').toLowerCase();
        const hasMojoEnv = !!parsed.system['MOJO_RENDERER'] || rawLogText.includes('git.artdeell');
        
        const isAllowedLauncher = allowedLaunchers.some(keyword => launcherVer.includes(keyword)) || hasMojoEnv;

        if (!isAllowedLauncher) {
            return {
                isDenied: true,
                denyReason: localeManager.get('parser.analyzer.denied_launcher', lang)
            };
        }

        // 3. Проверка на читы (отказ в поддержке)
        const bannedMods = await this.getBannedMods();
        const foundBannedMod = parsed.mods.find(mod => bannedMods.includes(mod.toLowerCase()));
        
        if (foundBannedMod) {
            return {
                isDenied: true,
                denyReason: localeManager.get('parser.analyzer.denied_banned_mod', lang, { mod: foundBannedMod })
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
        const dynamicSolutions = await this._extractDynamicSolutions(rawLogText, lang);

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
    async _extractDynamicSolutions(rawText, lang = 'ru') {
        const solutions = [];
        const promises = []; // Для параллельных запросов к API

        // Ищем паттерн: "Install fabric-api,"
        const installRegex = /Install ([\w-]+),/gi;
        const installMatches = [...rawText.matchAll(installRegex)];

        for (const match of installMatches) {
            const modName = match[1];
            promises.push(
                this.getModLink(modName).then(link => {
                    return link 
                        ? localeManager.get('parser.analyzer.install_modrinth', lang, { modName, link })
                        : localeManager.get('parser.analyzer.install_modrinth_no_link', lang, { modName });
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
                    const versionMatch = condition.match(/version ([\w.+-]+)/);
                    
                    if (versionMatch) {
                        return link 
                            ? localeManager.get('parser.analyzer.update_modrinth_version', lang, { name, version: versionMatch[1], link })
                            : localeManager.get('parser.analyzer.update_modrinth_version_no_link', lang, { name, version: versionMatch[1] });
                    } else {
                        return link 
                            ? localeManager.get('parser.analyzer.update_modrinth_compat', lang, { name, link })
                            : localeManager.get('parser.analyzer.update_modrinth_compat_no_link', lang, { name });
                    }
                })
            );
        }

        // Ждем выполнения всех запросов к Modrinth
        const resolvedSolutions = await Promise.all(promises);
        solutions.push(...resolvedSolutions);

        return solutions;
    }

    // ==========================================
    // УТИЛИТЫ ДЛЯ DISCORD
    // ==========================================

    async FindTxtInMessage(message, fileNamePattern) {
        const attachment = message.attachments.find(att => new RegExp(fileNamePattern, 'i').test(att.name));
        if (!attachment) return null;
        try {
            const response = await fetch(attachment.url);
            return await response.text();
        } catch (err) {
            console.error('Error in FindTxtInMessage:', err);
            return null;
        }
    }
}

module.exports = new LogAnalyzerService();