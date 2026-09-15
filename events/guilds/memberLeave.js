const { Events, EmbedBuilder } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../database/repositories');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const data = await DatabaseService.getSettings(member.guild.id);
        const lang = data.language || member.guild.preferredLocale || 'ru';
        const clientMe = member.guild.members.me;
        if (member.id === clientMe.user.id) return;

        const channel = await member.guild.channels.fetch(data.newMemberChannelId);
        if (!channel) {
            console.error('[ERROR]: newMemberChannelId пуст либо указан неверно для данного сервера! отключаем функцию...')
            await DatabaseService.updateSetting(member.guild.id, 'allowLogingMembersAdd', false)
        }

        if (data.allowLogingMembersAdd === true) {
            const embed = new EmbedBuilder()
            .setAuthor({name: `${clientMe.user.tag}`, iconURL: `${clientMe.user.avatarURL()}`})
            .setColor(0x9B59B6)
            .setTitle(localeManager.get('events.member_leave.title', lang))
            .setThumbnail(member.user.avatarURL())
            .setDescription(localeManager.get('events.member_leave.description', lang, {
                displayName: member.displayName,
                id: member.id,
                username: member.user.username,
                joinedTimestamp: Math.round(member.joinedTimestamp / 1000),
                createdTimestamp: Math.round(member.user.createdTimestamp / 1000),
                timestamp: Math.round(Date.now() / 1000)
            }))
            .setTimestamp()
            
            await channel.send({ content: null, embeds: [embed], allowedMentions: { parse: [] } })
        }
    },
};