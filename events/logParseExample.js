const { Events, EmbedBuilder } = require('discord.js');
const { FindTxtInMessage, extractLogInfo, extractCrashInfo } = require('../functions/parse');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            if (message.author.bot) return;

            const logText = await FindTxtInMessage(message, "latestlog");
            if (!logText) return;

            const logInfo = extractLogInfo(logText);
            const crashLogInfo = extractCrashInfo(logText);

            const embed = new EmbedBuilder()
                .setTitle('Информация о логе Minecraft')
                .setColor(0x9B59B6);

            const systemFields = [];
            if (logInfo['Launcher version'])         systemFields.push(`**Launcher version:** ${logInfo['Launcher version']}`);
            if (logInfo['Architecture'])            systemFields.push(`**Architecture:** ${logInfo['Architecture']}`);
            if (logInfo['Device model'])            systemFields.push(`**Device model:** ${logInfo['Device model']}`);
            if (logInfo['API version'])             systemFields.push(`**API version:** ${logInfo['API version']}`);
            if (logInfo['Selected Minecraft version']) systemFields.push(`**Minecraft version:** ${logInfo['Selected Minecraft version']}`);
            if (logInfo['Custom Java arguments'])   systemFields.push(`**Java args:** ${logInfo['Custom Java arguments']}`);
            if (logInfo['RAM allocated'])           systemFields.push(`**RAM allocated:** ${logInfo['RAM allocated']}`);
            if (logInfo['Graphics device'])         systemFields.push(`**Graphics device:** ${logInfo['Graphics device']}`);
            if (logInfo['MOJO_RENDERER'])           systemFields.push(`**MOJO_RENDERER:** ${logInfo['MOJO_RENDERER']}`);
            if (logInfo['JAVA_HOME'])               systemFields.push(`**JAVA_HOME:** ${logInfo['JAVA_HOME']}`);
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

            const installModRegex = /Install ([\w-]+), any version between/gi;
            const matches = [...logText.matchAll(installModRegex)];
            matches.forEach(match => {
                const modName = match[1];
                solutions.push(`Установите данный мод: ${modName}`);
            });

            const lwjglErrorString = "The game failed to start because the currently active LWJGL version is not compatible.";
            if (logText.includes(lwjglErrorString)) {
                solutions.push('Найдено решение\nВставьте аргумент `-Dsodium.checks.issue2561=false`');
            }

            if (solutions.length > 0) {
                embed.addFields({ name: 'Решения', value: solutions.join('\n') });
            }

            await message.reply({ embeds: [embed] });
        } catch (error) {
            await message.reply(`error: \n\`\`\`txt\n${JSON.stringify(error, null, 2)}\`\`\``);
        }
    }
};
// TODO: Переделать позже ещё мне не совсем нравиться как оно сделано 