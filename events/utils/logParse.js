const { Events, EmbedBuilder } = require('discord.js');
const { FindTxtInMessage, extractLogInfo, extractCrashInfo, extractPotentialSolutions } = require('../../functions/LogParser');
const DatabaseService = require('../../services/DatabaseService');
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

async function sendAnalyzedLog(message, logText, lang = 'ru') {
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

    const installModRegex = /Install ([\w-]+), any version between/gi;
    const matches = [...logText.matchAll(installModRegex)];
    for (const match of matches) {
        const modName = match[1];
        const modLink = await getModLink(modName);
        solutions.push(`${counter++}. ${localeManager.get('parser.solutions.install_mod', lang, { modName: modName, modLink: modLink || localeManager.get('parser.solutions.link_not_found', lang) })}`);
    }

    if (logText.includes("The game failed to start because the currently active LWJGL version is not compatible.")) {
        solutions.push(`${counter++}. ${localeManager.get('parser.solutions.lwjgl_fix', lang)}`);
    }

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

            const guildSettings = DatabaseService.getSettings(message.guildId);
            if (!guildSettings || channel.parentId !== guildSettings.supportChannelId) return;

            const lang = guildSettings.language || message.guild.preferredLocale || 'ru';

            // Ищем лог в текущем сообщении
            const logFile = message.attachments.find(att => 
                /(latestlog|crash|log)/i.test(att.name) && 
                (att.name.endsWith('.txt') || att.contentType?.startsWith('text/plain'))
            );

            if (logFile) {
                const logText = await FindTxtInMessage(message, "(latestlog|crash|log)");
                if (logText) {
                    await sendAnalyzedLog(message, logText, lang);
                    return;
                }
            }

            // Если лога нет, проверяем, нужно ли отправить инструкцию.
            // Инструкция отправляется только если это первое сообщение пользователя в треде.
            const messages = await channel.messages.fetch({ limit: 5 });
            const userMessages = messages.filter(m => !m.author.bot);
            
            // Если это самое первое сообщение в треде (Starter Message или первое после него)
            // и в нем не было лога (мы это уже проверили выше)
            if (userMessages.size === 1 && userMessages.first().id === message.id) {
                await sendInstruction(channel, lang);
            }
            
        } catch (error) {
            console.error('Error in unified log parser:', error);
        }
    }
};