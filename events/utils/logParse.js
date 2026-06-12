const { Events, EmbedBuilder } = require('discord.js');
const { extractLogInfo, extractCrashInfo } = require('../../utils/LogParser');
const DatabaseService = require('../../services/DatabaseService');
const LogAnalyzerService = require('../../services/LogAnalyzerService');
const localeManager = require('../../locales/localeManager');

async function getModLink(modName) {
    try {
        const modrinthResponse = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(modName)}&facets=[["project_type:mod"]]`, {
            headers: {
                'User-Agent': 'KoyomiBot/1.0 (https://github.com/Samiker69/Koyomi)'
            }
        });
        const modrinthData = await modrinthResponse.json();

        if (modrinthData.hits && modrinthData.hits.length > 0) {
            const bestMatch = modrinthData.hits.find(hit =>
                hit.title.toLowerCase() === modName.toLowerCase() ||
                hit.slug.toLowerCase() === modName.toLowerCase()
            ) || modrinthData.hits[0];

            if (bestMatch) {
                return `https://modrinth.com/mod/${bestMatch.slug}`;
            }
        }
    } catch (error) {
        console.error(`Ошибка при поиске ссылки для мода ${modName} на Modrinth:`, error);
    }
    return null;
}

async function handleBannedMod(message, bannedMod, reason, lang = 'ru') {
    const thread = message.channel;
    const originalName = thread.name
        .replace(/^\[Закрыто:[^\]]+\]\s*/i, '')
        .replace(/^\[Предупреждение:[^\]]+\]\s*/i, '')
        .replace(/^\[Closed:[^\]]+\]\s*/i, '')
        .replace(/^\[Warning:[^\]]+\]\s*/i, '')
        .replace(/^\[Закрито:[^\]]+\]\s*/i, '')
        .replace(/^\[Попередження:[^\]]+\]\s*/i, '')
        .replace(/^[🔒⚠️]\s*/, '');

    const prefix = localeManager.get('parser.messages.prefix_closed', lang, { bannedMod });
    const newName = `${prefix} ${originalName}`.slice(0, 100);
    await thread.setName(newName).catch(() => { });

    // Выдача роли за бан-лист мод при наличии настройки
    const guildSettings = await DatabaseService.getSettings(message.guildId);
    if (guildSettings && guildSettings.parserBannedRoleId) {
        const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);
        if (member) {
            await member.roles.add(guildSettings.parserBannedRoleId).catch(err => {
                console.error(`[LogParser] Не удалось выдать роль за бан-лист мод пользователю ${member.user.tag}:`, err.message);
            });
        }
    }

    await message.reply({
        content: localeManager.get('parser.messages.ticket_closed', lang, { reason })
    });

    await thread.setArchived(true, reason).catch(() => { });
}

async function handleUnsupportedMods(message, unsupportedMods, lang = 'ru') {
    const thread = message.channel;
    const modNames = unsupportedMods.map(m => m.name).join(', ');
    const reasons = unsupportedMods.map(m => `**${m.name}**: ${m.reason}`).join('\n');

    const originalName = thread.name
        .replace(/^\[Закрыто:[^\]]+\]\s*/i, '')
        .replace(/^\[Предупреждение:[^\]]+\]\s*/i, '')
        .replace(/^\[Closed:[^\]]+\]\s*/i, '')
        .replace(/^\[Warning:[^\]]+\]\s*/i, '')
        .replace(/^\[Закрито:[^\]]+\]\s*/i, '')
        .replace(/^\[Попередження:[^\]]+\]\s*/i, '')
        .replace(/^[🔒⚠️]\s*/, '');

    const prefix = localeManager.get('parser.messages.prefix_warning', lang, { modNames });
    const newName = `${prefix} ${originalName}`.slice(0, 100);
    await thread.setName(newName).catch(() => { });

    await message.reply({
        content: localeManager.get('parser.messages.unsupported_mods', lang, { modNames, reasons })
    });
}

async function sendAnalyzedLog(message, logText, lang = 'ru') {
    const result = await LogAnalyzerService.analyze(logText, lang);

    // 1. Проверка на читы (бан-лист)
    if (result.isDenied && result.isBannedMod) {
        await handleBannedMod(message, result.bannedMod, result.denyReason, lang);
        return;
    }

    // 2. Проверка на сторонний лаунчер
    if (result.isDenied) {
        await message.reply({ content: result.denyReason });
        return;
    }

    // 3. Проверка на неподдерживаемые моды
    if (result.mods?.unsupported?.length > 0) {
        await handleUnsupportedMods(message, result.mods.unsupported, lang);
    }

    // 4. Обычный вывод анализа лога
    const logInfo = extractLogInfo(logText, lang);
    const crashLogInfo = extractCrashInfo(logText, lang);

    const embed = new EmbedBuilder()
        .setTitle(localeManager.get('parser.embed.title', lang))
        .setColor(0x9B59B6);

    const systemInfoMap = {
        'Launcher version': 'parser.labels.launcher_version',
        'Architecture': 'parser.labels.architecture',
        'Device model': 'parser.labels.device_model',
        'API version': 'parser.labels.api_version',
        'Selected Minecraft version': 'parser.labels.mc_version',
        'Custom Java arguments': 'parser.labels.java_args',
        'RAM allocated': 'parser.labels.ram',
        'Graphics device': 'parser.labels.graphics',
        'MOJO_RENDERER': 'parser.labels.mojo',
        'JAVA_HOME': 'parser.labels.java_home'
    };

    for (const key in systemInfoMap) {
        if (logInfo[key]) {
            embed.addFields({ name: localeManager.get(systemInfoMap[key], lang), value: String(logInfo[key]), inline: true });
        }
    }

    if (crashLogInfo) {
        if (crashLogInfo.description) embed.addFields({ name: localeManager.get('parser.embed.crash_desc', lang), value: `\`\`\`${crashLogInfo.description}\`\`\`` });
        if (crashLogInfo.mainException) embed.addFields({ name: localeManager.get('parser.embed.exception', lang), value: `\`\`\`${crashLogInfo.mainException}\`\`\`` });
        if (crashLogInfo.causedByException) embed.addFields({ name: localeManager.get('parser.embed.reason', lang), value: `\`\`\`${crashLogInfo.causedByException}\`\`\`` });
    }

    const solutions = [];
    let counter = 1;

    const installModRegex = /Install ([\w-]+),/gi;
    const matches = [...logText.matchAll(installModRegex)];

    const installPromises = matches.map(async (match) => {
        const modName = match[1];
        const modLink = await getModLink(modName);
        return localeManager.get('parser.solutions.install_mod', lang, {
            modName: modName,
            modLink: modLink || localeManager.get('parser.solutions.link_not_found', lang)
        });
    });

    const installSolutions = await Promise.all(installPromises);
    installSolutions.forEach(sol => solutions.push(`${counter++}. ${sol}`));

    const replaceRegex = /\s-\sReplace mod '(?<name>[^']+)' \((?<id>[\w-]+)\) .+? with (?<condition>.+?)(?=\.$|:|\n|$)/gi;
    const replaceMatches = [...logText.matchAll(replaceRegex)];
    const replacePromises = replaceMatches.map(async (match) => {
        const { name, id, condition } = match.groups;
        const link = (await getModLink(id)) || (await getModLink(name));
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
    });

    const replaceSolutions = await Promise.all(replacePromises);
    replaceSolutions.forEach(sol => solutions.push(`${counter++}. ${sol}`));

    if (logText.includes("The game failed to start because the currently active LWJGL version is not compatible.")) {
        solutions.push(`${counter++}. ${localeManager.get('parser.solutions.lwjgl_fix', lang)}`);
    }

    const { extractPotentialSolutions } = require('../../utils/LogParser');
    const otherSolutions = extractPotentialSolutions(logText, lang);
    if (otherSolutions?.length > 0) {
        otherSolutions.forEach(sol => solutions.push(`${counter++}. ${sol}`));
    }

    if (solutions.length > 0) {
        embed.addFields({ name: localeManager.get('parser.embed.solutions', lang), value: solutions.join('\n') });
    }

    await message.reply({ embeds: [embed] });
}

async function sendInstruction(channel, lang = 'ru') {
    const instructionEmbed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setDescription(localeManager.get('parser.messages.instruction_desc', lang))
        .setImage("https://media.discordapp.net/attachments/962263128253546517/1365054081877409904/87_20250425005645.png")
        .setFooter({ text: localeManager.get('parser.messages.instruction_footer', lang) })
        .setTimestamp();

    await channel.send({
        content: localeManager.get('parser.messages.instruction_content', lang),
        embeds: [instructionEmbed],
    });
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        try {
            const channel = message.channel;
            if (!channel.isThread()) return;

            const guildSettings = await DatabaseService.getSettings(message.guildId);
            if (!guildSettings || channel.parentId !== guildSettings.supportChannelId) return;

            const lang = guildSettings.language || message.guild.preferredLocale || 'ru';

            const logFile = message.attachments.find(att =>
                /(latestlog|crash|log)/i.test(att.name) &&
                (att.name.endsWith('.txt') || att.contentType?.startsWith('text/plain'))
            );

            if (logFile) {
                const logText = await LogAnalyzerService.FindTxtInMessage(message, '(latestlog|crash|log)');
                if (!logText) {
                    await message.reply({ content: localeManager.get('parser.messages.error_read', lang) });
                    return;
                }

                await sendAnalyzedLog(message, logText, lang);
                return;
            }

            const messages = await channel.messages.fetch({ limit: 5 });
            const userMessages = messages.filter(m => !m.author.bot);

            if (userMessages.size === 1 && userMessages.first().id === message.id) {
                await sendInstruction(channel, lang);
            }

        } catch (error) {
            console.error('Error in unified log parser:', error);
        }
    }
};