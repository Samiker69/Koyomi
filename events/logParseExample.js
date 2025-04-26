const { Events } = require('discord.js');
const { FindTxtInMessage, extractLogInfo, extractCrashInfo } = require('../functions/parse');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            if (message.author.bot) return;
            const logText = await FindTxtInMessage(message)
            if (!logText) return;
            
            const logInfo = extractLogInfo(logText)
            const crashLogInfo = extractCrashInfo(logText)
            
            await message.reply(JSON.stringify(logInfo, null, 2))
            if (crashLogInfo) await message.reply(JSON.stringify(crashLogInfo, null, 2));
            
            const lwjglErrorString = "The game failed to start because the currently active LWJGL version is not compatible.";
            if (logText.includes(lwjglErrorString)) await message.reply('Найдено решение\nВставьте аргумент \`-Dsodium.checks.issue2561=false\`')
        } catch (error) {
            await message.reply(`error: \n\`\`\`txt\n${JSON.stringify(error, null, 2)}\`\`\``)
        }
    }
}