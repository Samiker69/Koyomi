const { Events, EmbedBuilder } = require('discord.js');
const starDB = require('../functions/db/starboard');
const db = new starDB('./database/starboard.db')

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
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

        const settings = db.getSettings(guild.id)
        if (settings.starboardChannelId === reaction.message.channel.id) return;
        console.log(settings)
        if (!settings.enabled) return;
        if (db.isMessageOnStarboard(guild.id, messageId)) return;

        const boardChannel = await reaction.message.guild.channels.fetch(settings.starboardChannelId)
        if (!boardChannel) return;

        if (reaction.count >= settings.minReactions) {
            let image = null
            if (reaction.message.attachments.find(i => i !== null)) image = reaction.message.attachments.find(i => i !== null).url;
            const board = new EmbedBuilder()
            .setAuthor({ name: `${user.globalName || user.username}`, iconURL: user.avatarURL({extension: 'png'}) })
            .setColor("Gold")
            .setTitle("Source")
            .setDescription(`${reaction.message.content || null}`)
            .setImage(image)
            .setURL(reaction.message.url || null)
            .setFooter({text: `⭐ | ${messageId}`})
            .setTimestamp(new Date())

            const response = await boardChannel.send({content: `⭐${reaction.count || "?"}`, embeds: [board], withResponse: true });
            db.addStarboardEntry(guild.id, messageId, response.id);
        }
    },
};