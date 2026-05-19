const path = require('path');
const FileLoader = require('../utils/fileLoader');

class EventHandler {
    static load(client, dirToSearch) {
        const eventFiles = FileLoader.getAllFiles(dirToSearch);
        let loaded = 0;

        for (const file of eventFiles) {
            const event = require(path.resolve(file));
            
            if (event.name && event.execute) {
                client.eventsCount++;
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
                loaded++;
            } else {
                console.warn(`[WARNING] Файл ${file} не содержит валидного ивента.`);
            }
        }
        console.log(`[INFO] Загружено ивентов: ${loaded}`);
    }
}

module.exports = EventHandler;