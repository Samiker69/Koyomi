import type { ClientEvents } from "discord.js";
import type { BaseBot } from "../BaseBot";
import type { IEvent } from "../interfaces/events";
import { getAllFiles } from "../utils/fileloader";
import path from "path";

export class EventHandler {
    static async load(client: BaseBot, dirToSearch: string) {
        const eventFiles = getAllFiles(dirToSearch);
        let loaded = 0;

        for (const file of eventFiles) {
            const importedFile = await import(path.resolve(file));
            const event: IEvent<keyof ClientEvents> = importedFile.default || Object.values(importedFile)[0];

            if (event?.name && event?.execute) {
                if (event.once) {
                    client.once(event.name, (...args: []) => event.execute(...args));
                } else {
                    client.on(event.name, (...args: []) => event.execute(...args));
                }
                loaded++;
            } else {
                console.warn(`[WARNING] Файл ${file} не содержит валидного ивента.`);
            }
        }
        console.log(`[INFO] Загружено ивентов: ${loaded}`);
    }
}