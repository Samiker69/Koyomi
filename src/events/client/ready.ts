import { Events } from "discord.js";
import type { IEvent } from "../../core/interfaces/events";

export const event: IEvent<Events.ClientReady> = {
    name: Events.ClientReady,
    once: true,
    
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    }
};