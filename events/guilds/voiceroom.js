const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const Settings = require('../../functions/db/settings');

const Sdb = new Settings();
const creatingChannels = new Set();

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    if (oldState.channelId === newState.channelId) {
      return;
    }

    const cfg = Sdb.getSettings(newState.guild.id);
    const mainVoiceChannelId = cfg.mainVoiceChannelId;
    const categoryId = cfg.voiceCategoryId;

    if (!mainVoiceChannelId || !categoryId) {
      if (!cfg._error) {
        console.error(`[CONFIG ERROR] Guild ${newState.guild.id}: mainVoiceChannelId или voiceCategoryId не настроены.`);
      }
      return;
    }

    const member = newState.member;
    const guild = newState.guild;

    if (
      newState.channelId === mainVoiceChannelId &&
      !creatingChannels.has(member.id)
    ) {
      creatingChannels.add(member.id); 

      try {
        const channelName = `Комната ${member.displayName}`;
        
        const newChannel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: categoryId,
          permissionOverwrites: [
            {
              id: guild.id, 
              allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel]
            },
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

        if (newState.member.voice.channel?.id === mainVoiceChannelId) {
          await member.voice.setChannel(newChannel);
        }

      } catch (error) {
        console.error(`[ERROR] Не удалось создать канал для ${member.user.tag}:`, error);
      } finally {
        creatingChannels.delete(member.id);
      }
    }

    // --- 2. Логика УДАЛЕНИЯ канала ---
    const oldChannel = oldState.channel;
    if (
      oldChannel &&
      oldChannel.parentId === categoryId &&
      oldChannel.id !== mainVoiceChannelId &&
      oldChannel.members.size === 0
    ) {
      try {
        await oldChannel.delete('Динамический канал опустел');
      } catch (error) {
        if (error.code !== 10003) { 
          console.error(`[ERROR] Не удалось удалить канал ${oldChannel.name}:`, error);
        }
      }
    }
  },
};