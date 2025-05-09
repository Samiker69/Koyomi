const { Events } = require('discord.js');
const starDB = require('../functions/db/starboard');
const db = new starDB('./database/starboard.db')

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }

        if (!reaction.emoji.name === '⭐') return;
        const guild = reaction.message.guild;
        const messageId = reaction.message.id;

        const settings = db.getSettings(guild.id);
        if (!settings.enabled) return;
        if (!db.isMessageOnStarboard(guild.id, messageId)) return;

        const starMessageId = db.getStarboardMessageId(guild.id, messageId);
        if (!starMessageId) return;

        const starboardChannel = await guild.channels.fetch(settings.starboardChannelId);
        const starMessage = await starboardChannel.messages.fetch(starMessageId);
        if (!starMessage) return //db.updateSettings(guild.id, { enabled: false})

        if (reaction.count < settings.minReactions) {
            db.deleteStarboardEntry(guild.id, messageId)
            await starMessage.delete()
        }
    },
};