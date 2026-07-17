const { LogParser } = require('../utils/LogParser');
const LogAnalyzerRepository = require('../database/repositories/LogAnalyzerRepository');
const localeManager = require('../locales/localeManager');

class LogAnalyzerService {
    async getUnsupportedMods() {
        return await LogAnalyzerRepository.getUnsupportedMods();
    }

    async getBannedMods() {
        return await LogAnalyzerRepository.getBannedMods();
    }

    async getModsMapping() {
        return await LogAnalyzerRepository.getModsMapping();
    }

    async getAllowedLaunchers() {
        return await LogAnalyzerRepository.getAllowedLaunchers();
    }

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

    async analyze(rawLogText, lang = 'ru') {
        const parser = new LogParser(rawLogText, lang);
        const parsed = parser.parse();
        const allowedLaunchers = await this.getAllowedLaunchers();
        const launcherVer = (parsed.system['Launcher version'] || '').toLowerCase();
        const hasMojoEnv = !!parsed.system['MOJO_RENDERER'] || rawLogText.includes('git.artdeell');
        const isAllowedLauncher = allowedLaunchers.some(keyword => launcherVer.includes(keyword)) || hasMojoEnv;
        if (!isAllowedLauncher) {
            return {
                isDenied: true,
                isBannedLauncher: true,
                denyReason: localeManager.get('parser.analyzer.denied_launcher', lang)
            };
        }
        const bannedMods = await this.getBannedMods();
        let foundBannedMod = parsed.mods.find(mod => bannedMods.includes(mod.toLowerCase()));
        if (!foundBannedMod) {
            foundBannedMod = bannedMods.find(mod => rawLogText.toLowerCase().includes(mod.toLowerCase()));
        }
        if (foundBannedMod) {
            return {
                isDenied: true,
                isBannedMod: true,
                bannedMod: foundBannedMod,
                denyReason: localeManager.get('parser.analyzer.denied_banned_mod', lang, { mod: foundBannedMod })
            };
        }
        const unsupportedRules = await this.getUnsupportedMods();
        const unsupportedFound = [];
        for (const mod of parsed.mods) {
            const modLower = mod.toLowerCase();
            if (unsupportedRules[modLower]) {
                unsupportedFound.push({ name: mod, reason: unsupportedRules[modLower] });
            }
        }
        const dynamicSolutions = await this._extractDynamicSolutions(rawLogText, lang);
        const allSolutions = [...(parsed.solutions || []), ...dynamicSolutions];
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

    async _extractDynamicSolutions(rawText, lang = 'ru') {
        const solutions = [];
        const promises = [];
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
        const replaceRegex = /\s-\sReplace mod '(?<name>[^']+)' \((?<id>[\w-]+)\) .+? with (?<condition>.+?)(?=\.$|:|\n|$)/gi;
        const replaceMatches = [...rawText.matchAll(replaceRegex)];
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
        const resolvedSolutions = await Promise.all(promises);
        solutions.push(...resolvedSolutions);
        return solutions;
    }

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