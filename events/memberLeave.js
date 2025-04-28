const { Events, EmbedBuilder } = require('discord.js');
const settings = require('../functions/db/settings')

const Sdb = new settings('./database/settings.db')

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const data = Sdb.getSettings(member.guild.id)
        const client = await member.guild.members.me;
        if (member.id === client.user.id) return;

        const channel = await member.guild.channels.fetch(data.newMemberChannelId);
        if (!channel) {
            console.error('[ERROR]: newMemberChannelId пуст либо указан неверно для данного сервера! отключаем функцию...')
            Sdb.updateSetting(member.guild.id, 'allowLogingMembersAdd', false)
        }

        if (data.allowLogingMembersAdd === true) {
            const embed = new EmbedBuilder()
            .setAuthor({name: `${client.user.tag}`, iconURL: `${client.user.avatarURL()}`})
            .setColor(0x9B59B6)
            .setTitle(`Участник покинул сервер`)
            .setThumbnail(await member.user.avatarURL())
            .setDescription('Пользователь: '+await member.displayName+' (id: `'+await member.id+'`)\nusername: `'+await member.user.username+'`'+`\nПрисоединился к серверу <t:${Math.round(await member.joinedTimestamp / 1000)}:F>\nЗарегистрировался <t:${Math.round(await member.user.createdTimestamp / 1000)}:F>\n Покинул сервер <t:${Math.round(Date.now() / 1000)}:F>`)
            .setTimestamp()
            
            await channel.send({ content: null, embeds: [embed] })
        }
    },
};