import type { BaseBot } from "../BaseBot";
import type { ISlashCommand } from "../interfaces/command";
import { getAllFiles } from "../utils/fileloader";
import path from "path";

export class CommandHandler {
    static async load(client: BaseBot, dirToSearch: string) {
        const commandFiles = getAllFiles(dirToSearch);
        let loaded = 0;

        for (const file of commandFiles) {
            const importedFile = await import(path.resolve(file));
            const command: ISlashCommand = importedFile.default || Object.values(importedFile)[0];

            if (command?.data?.name) {
                client.commands.set(command.data.name, command);
                loaded++;
            } else {
                console.warn(`[WARNING] Файл ${file} не содержит валидной команды.`);
            }
        }
        console.log(`[INFO] Загружено команд: ${loaded}`);
    }
}