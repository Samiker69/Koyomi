import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, ChatInputCommandInteraction, Message } from "discord.js";

export interface ISlashCommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface IPrefixCommand {
    name: string;
    aliases?: string[];
    execute(message: Message, args: string[]): Promise<void>;
}

export type Command = ISlashCommand | IPrefixCommand | (ISlashCommand & IPrefixCommand);