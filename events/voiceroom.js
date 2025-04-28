const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const settings = require('../functions/db/settings')

const Sdb = new settings('./database/settings.db')

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    console.log('[INFO] VoiceStateUpdate сработало', {
      oldChannel: oldState.channelId,
      newChannel: newState.channelId
    });

    const data = Sdb.getSettings(newState.guild.id)
    const mainVoiceChannelId = data.mainVoiceChannelId;
    const categoryId = data.voiceCategoryId;

    if (!mainVoiceChannelId || !categoryId) {
      console.log('[WARN] Не заданы mainVoiceChannelId или voiceCategoryId в settings.json');
      return;
    }

    if (newState.channelId === mainVoiceChannelId && oldState.channelId !== mainVoiceChannelId) {
      console.log(`[INFO] ${newState.member.user.tag} вошёл в основной канал`);

      const channelName = `Комната ${newState.member.displayName}`;
      try {
        const newChannel = await newState.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: categoryId,
          permissionOverwrites: [
            {
              id: newState.guild.id,
              allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
            },
          ],
        });

        console.log(`[SUCCESS] Создан канал ${newChannel.name} (${newChannel.id})`);
        await newState.member.voice.setChannel(newChannel);
        console.log(`[SUCCESS] Переместили ${newState.member.user.tag} в ${newChannel.name}`);
      } catch (error) {
        console.error('[ERROR] Не удалось создать или переместить в канал:', error);
      }
    }

    const oldChannel = oldState.channel;
    if (oldChannel && oldChannel.parentId === categoryId && oldChannel.members.size === 0 && oldChannel.id !== mainVoiceChannelId) {
      console.log(`[INFO] Канал ${oldChannel.name} пуст, удаляем...`);
      try {
        await oldChannel.delete();
        console.log(`[SUCCESS] Канал ${oldChannel.name} удалён`);
      } catch (error) {
        console.error('[ERROR] Не удалось удалить канал:', error);
      }
    }
  },
};
