const { Events, EmbedBuilder } = require('discord.js');
const settings = require('../functions/db/settings')

const Sdb = new settings('./database/settings.db')

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const data = Sdb.getSettings(member.guild.id)
            
        const client = await member.guild.members.me;
        
        if (data.allowLogingMembersAdd === true) {
            const channel = await member.guild.channels.fetch(data.newMemberChannelId);
            if (!channel) {
                console.error('[ERROR]: newMemberChannelId пуст либо указан неверно для данного сервера! отключаем функцию...')
                Sdb.updateSetting(member.guild.id, 'allowLogingMembersAdd', false)
            }

            const embed = new EmbedBuilder()
            .setAuthor({name: `${client.user.tag}`, iconURL: `${client.user.avatarURL()}`})
            .setColor(0x9B59B6)
            .setTitle(`Новый участник!`)
            .setThumbnail(member.user.avatarURL())
            .setDescription('Пользователь: '+member.displayName+' (id: `'+member.id+'`)\nusername: `'+member.user.username+'`'+`\nПрисоединился к серверу <t:${Math.round(member.joinedTimestamp / 1000)}:F>\nЗарегистрировался <t:${Math.round(member.user.createdTimestamp / 1000)}:F>`)
            .setTimestamp()
            
            await channel.send({ content: null, embeds: [embed] });
        }

        if (data.allowInviteLogging === true) {
            const invites = await member.guild.invites.fetch();

            let inviteUsed;
            for (const invite of invites.values()) {
                if (invite.uses > 0) {
                    
                    inviteUsed = invite;
                    break;
                }
            }
            
            const logChannel = await member.guild.channels.fetch(data.inviteLoggerChannel);
            if (!logChannel) {
                console.error('[ERROR]: inviteLoggerChannel пуст либо указан неверно для данного сервера! отключаем функцию...')
                Sdb.updateSetting(member.guild.id, 'allowInviteLogging', false)
            }

            if (inviteUsed) {
                await logChannel.send(`${member} был приглашён по ссылке ${inviteUsed.code}. Общее использование ссылки: **${inviteUsed.uses}**`);
            } else {
                await logChannel.send(`${member} был приглашён по неизвестной ссылке. Возможно, его кто-то пригласил`)
            }
        }
    },
};