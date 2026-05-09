const { Events, EmbedBuilder } = require('discord.js');
const settings = require('../../functions/db/settings');
const localeManager = require('../../locales/localeManager');

const Sdb = new settings()

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const data = Sdb.getSettings(member.guild.id);
        const lang = data.language || member.guild.preferredLocale || 'ru';
            
        const clientMe = member.guild.members.me;
        
        if (data.allowLogingMembersAdd === true) {
            const channel = await member.guild.channels.fetch(data.newMemberChannelId);
            if (!channel) {
                console.error('[ERROR]: newMemberChannelId пуст либо указан неверно для данного сервера! отключаем функцию...')
                Sdb.updateSetting(member.guild.id, 'allowLogingMembersAdd', false)
            }

            const embed = new EmbedBuilder()
            .setAuthor({name: `${clientMe.user.tag}`, iconURL: `${clientMe.user.avatarURL()}`})
            .setColor(0x9B59B6)
            .setTitle(localeManager.get('events.member_add.title', lang))
            .setThumbnail(member.user.avatarURL())
            .setDescription(localeManager.get('events.member_add.description', lang, {
                displayName: member.displayName,
                id: member.id,
                username: member.user.username,
                joinedTimestamp: Math.round(member.joinedTimestamp / 1000),
                createdTimestamp: Math.round(member.user.createdTimestamp / 1000)
            }))
            .setTimestamp()
            
            await channel.send({ content: null, embeds: [embed], allowedMentions: { parse: [] } });
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
                await logChannel.send({
                    content: localeManager.get('events.member_add.invite_used', lang, {
                        member: member.toString(),
                        code: inviteUsed.code,
                        uses: inviteUsed.uses
                    }),
                    allowedMentions: { parse: [] }
                });
            } else {
                await logChannel.send({
                    content: localeManager.get('events.member_add.invite_unknown', lang, {
                        member: member.toString()
                    }),
                    allowedMentions: { parse: [] }
                });
            }
        }
    },
};