const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const Settings = require('../../functions/db/settings');

const Sdb = new Settings();

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    console.log('[INFO] VoiceStateUpdate', {
      from: oldState.channelId,
      to:   newState.channelId
    });

    const cfg = Sdb.getSettings(newState.guild.id);
    const mainVoiceChannelId = cfg.mainVoiceChannelId;
    const categoryId        = cfg.voiceCategoryId;

    if (!mainVoiceChannelId || !categoryId) {
      console.log('[WARN] mainVoiceChannelId или voiceCategoryId не настроены');
      return;
    }

    // Когда пользователь заходит в «главный» канал — создаём новую комнату
    if (newState.channelId === mainVoiceChannelId && oldState.channelId !== mainVoiceChannelId) {
      const member = newState.member;
      const channelName = `Комната ${member.displayName}`;

      try {
        const newChannel = await newState.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: categoryId,
          permissionOverwrites: [
            // по умолчанию все видят и подключаются
            {
              id: newState.guild.id,
              allow: [ PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel ]
            },
            // А вошедший пользователь получает ещё и право управлять каналом
            {
              id: member.id,
              allow: [
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ManageChannels
              ]
            }
          ],
          userLimit: cfg.maxUsers || 0
        });

        console.log(`[SUCCESS] Создан канал ${newChannel.name} (${newChannel.id})`);
        await member.voice.setChannel(newChannel);
        console.log(`[SUCCESS] Перемещён ${member.user.tag} в ${newChannel.name}`);
      } catch (error) {
        console.error('[ERROR] Не удалось создать или переместить в канал:', error);
      }
    }

    // Удаляем пустую динамическую комнату
    const oldChannel = oldState.channel;
    if (
      oldChannel &&
      oldChannel.parentId === categoryId &&
      oldChannel.id !== mainVoiceChannelId &&
      oldChannel.members.size === 0
    ) {
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
