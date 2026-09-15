const path = require('path');
const FileLoader = require('../utils/fileLoader');

class CommandHandler {
    static load(client, dirToSearch) {
        const commandFiles = FileLoader.getAllFiles(dirToSearch);
        let loaded = 0;

        for (const file of commandFiles) {
            const command = require(path.resolve(file));

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                client.commandsCount++;
                loaded++;
            } else {
                console.warn(`[WARNING] Файл ${file} не содержит валидной команды (отсутствует data или execute).`);
            }
        }
        console.log(`[INFO] Загружено команд: ${loaded}`);
    }
}

module.exports = CommandHandler;