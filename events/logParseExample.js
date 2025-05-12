const { Events, EmbedBuilder } = require('discord.js');
const { FindTxtInMessage, extractLogInfo, extractCrashInfo } = require('../functions/parse');

async function getModLink(modName) {
    try {
        const modrinthResponse = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(modName)}&facets=[["project_type:mod"]]`);
        const modrinthData = await modrinthResponse.json();
        
        if (modrinthData.hits && modrinthData.hits.length > 0) {
            const exactMatch = modrinthData.hits.find(hit => hit.title.toLowerCase() === modName.toLowerCase());
            if (exactMatch) {
                return `https://modrinth.com/mod/${exactMatch.slug}`;
            }
        }
    } catch (error) {
        console.error(`Ошибка при поиске ссылки для мода ${modName} на Modrinth:`, error);
    }

    return null;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            if (message.author.bot) return;

            const logText = await FindTxtInMessage(message, "latestlog.txt");
            if (!logText) return;

            const logInfo = extractLogInfo(logText);
            const crashLogInfo = extractCrashInfo(logText);

            const embed = new EmbedBuilder()
                .setTitle('Информация о логе Minecraft')
                .setColor(0x9B59B6);

            const systemInfoMap = {
                'Launcher version': 'Версия лаунчера',
                'Architecture': 'Архитектура',
                'Device model': 'Модель устройства',
                'API version': 'Версия API',
                'Selected Minecraft version': 'Версия Minecraft',
                'Custom Java arguments': 'Аргументы Java',
                'RAM allocated': 'Выделено RAM',
                'Graphics device': 'Графическое устройство',
                'MOJO_RENDERER': 'MOJO_RENDERER',
                'JAVA_HOME': 'JAVA_HOME'
            };

            const systemFields = [];
            for (const key in systemInfoMap) {
                if (logInfo[key]) {
                    systemFields.push(`**${systemInfoMap[key]}:** ${logInfo[key]}`);
                }
            }
            if (systemFields.length > 0) {
                embed.addFields({ name: 'Информация о системе', value: systemFields.join('\n') });
            }

            if (crashLogInfo) {
                if (crashLogInfo.description) {
                    embed.addFields({ name: 'Описание краша', value: `\`\`\`${crashLogInfo.description}\`\`\`` });
                }
                if (crashLogInfo.mainException) {
                    embed.addFields({ name: 'Исключение', value: `\`\`\`${crashLogInfo.mainException}\`\`\`` });
                }
                if (crashLogInfo.causedByException) {
                    embed.addFields({ name: 'Причина', value: `\`\`\`${crashLogInfo.causedByException}\`\`\`` });
                }
            }

            const solutions = [];
            let solutionCounter = 1;

            const installModRegex = /Install ([\w-]+), any version between/gi;
            const matches = [...logText.matchAll(installModRegex)];
            for (const match of matches) {
                const modName = match[1];
                const modLink = await getModLink(modName);

                if (modLink) {
                    solutions.push(`${solutionCounter++}. Установите данный мод: [${modName}](${modLink})`);
                } else {
                    solutions.push(`${solutionCounter++}. Установите данный мод: \`${modName}\` (ссылка не найдена)`);
                }
            }

            const lwjglErrorString = "The game failed to start because the currently active LWJGL version is not compatible.";
            if (logText.includes(lwjglErrorString)) {
                solutions.push(`${solutionCounter++}. 'Найдено решение\nВставьте аргумент \`-Dsodium.checks.issue2561=false\``);
            }

            if (solutions.length > 0) {
                embed.addFields({ name: 'Решения', value: solutions.join('\n') });
            }

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Ошибка при обработке лога:', error);
            await message.reply('Произошла ошибка при анализе лога. Пожалуйста, попробуйте еще раз или свяжитесь с администратором.');
        }
    }
};