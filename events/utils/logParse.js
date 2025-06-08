const { Events, EmbedBuilder } = require('discord.js');
const { FindTxtInMessage, extractLogInfo, extractCrashInfo, extractPotentialSolutions } = require('../../functions/parse');
const settings = require('../../functions/db/settings')

const Sdb = new settings('./database/settings.db')

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

async function sendAnalyzedLog(message, logText) {
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
        
        solutions.push(`${solutionCounter++}. Установите данный мод: [${modName}](${modLink ? modLink : 'ссылка не найдена'})`);
    }

    const lwjglErrorString = "The game failed to start because the currently active LWJGL version is not compatible.";
    if (logText.includes(lwjglErrorString)) {
        solutions.push(`${solutionCounter++}. 'Найдено решение\nВставьте аргумент \`-Dsodium.checks.issue2561=false\``);
    }

    const otherSolutions = extractPotentialSolutions(logText);
    if (otherSolutions?.length > 0) solutions.push(otherSolutions.join(','))

    if (solutions.length > 0) {
        embed.addFields({ name: 'Решения', value: solutions.join('\n') });
    }

    await message.reply({ embeds: [embed] });                
}

async function sendInstruction (thread) {
    const instructionEmbed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setDescription("Инструкция: прикрепите файл `latestlog.txt`. Ниже изображение, где его можно найти.")
      .setImage("https://media.discordapp.net/attachments/962263128253546517/1365054081877409904/87_20250425005645.png?ex=680be92e&is=680a97ae&hm=889a1b2f44728452267938d2333a6c26d6e9ebed3c5e5f20e78877b975b5b434&=&format=webp&quality=lossless&width=363&height=670")
      .setFooter({ text: "Прикрепление файла поможет быстрее решить проблему." })
      .setTimestamp();

    await thread.send({
      content: "Пожалуйста, прикрепите файл `latestlog.txt` для ускорения решения вашей проблемы.",
      embeds: [instructionEmbed],
    });
};

module.exports = {
    name: Events.ThreadCreate,
    async execute(thread) {
        try {
            const guildSettings = Sdb.getSettings(thread.guildId);
            if (thread.parentId !== guildSettings.supportChannelId) return;
            const message = await thread.fetchStarterMessage();
            if (message.author.bot) return;

            const logText = await FindTxtInMessage(message, "latestlog");
            if (!logText) {
                await sendInstruction(thread)
                const collector = thread.createMessageCollector();
                collector.on('collect', async (msg) => {
                    const attachment = msg.attachments.find(att => /latestlog/i.test(att.name));
                    if (attachment) {
                        await sendAnalyzedLog(msg, await FindTxtInMessage(msg, "latestlog"));
                        collector.stop("Файл найден");
                    }
                });

                collector.on('end', async (_, reason) => {
                    if (reason !== "Файл найден") {
                        await thread.send("Коллектор завершил работу. Если хотите отправить лог-файл, создайте новый тред.");
                    }
                });                
            } else {
                await sendAnalyzedLog(message, logText);
            }
        } catch (error) {
            if (error?.code === 10003) return;
            console.error('Ошибка при обработке лога:', error);
            await thread.send('Произошла ошибка при анализе лога. Пожалуйста, попробуйте еще раз или свяжитесь с администратором.');
        }
    }
};