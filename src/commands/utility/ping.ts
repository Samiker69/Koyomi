import { SlashCommandBuilder } from "discord.js";
import type { ISlashCommand } from "../../core/interfaces/command";

export const pingCommand: ISlashCommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Returns pong'),

    execute: async (interaction) => {
        await interaction.reply(`Pong!\nЗадержка: ${new Date().getTime() - interaction.createdTimestamp}ms`);
    }
};