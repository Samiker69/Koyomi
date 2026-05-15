const { Events } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const Settings = require('../../utils/db/settings');
const localeManager = require('../../locales/localeManager');

const Sdb = new Settings();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Пропускаем ботов и DM
        if (message.author.bot) return;
        if (!message.guild) return;

        const cfg = Sdb.getSettings(message.guild.id);

        // Проверяем, что Honeypot включён и сообщение пришло в канал-ловушку
        if (!cfg || !cfg.honeypotEnabled || !cfg.honeypotChannelId) return;
        if (message.channelId !== cfg.honeypotChannelId) return;

        const { guild, author, channel } = message;
        const contentPreview = message.content?.substring(0, 200) || '*[без текста]*';

        // 1. Удаляем сообщение
        await message.delete().catch(() => {});
        
        // Отправляем уведомление в ЛС перед баном
        const lang = cfg.language || guild.preferredLocale || 'ru';
        try {
            await author.send({
                content: localeManager.get('events.honeypot.labels.dm_message', lang, {
                    guildName: guild.name,
                    channelName: channel.name
                })
            });
        } catch (err) {
            // Игнорируем ошибку, если ЛС закрыты
        }

        // 2. Выполняем софтбан (бан + немедленный разбан) для удаления сообщений и кика
        let actionSuccess = false;
        try {
            const reason = `Honeypot: wrote in trap channel ${channel.name}`;
            // Баним с удалением сообщений за 10 минут
            await guild.members.ban(author.id, {
                deleteMessageSeconds: 10 * 60, // 10 минут
                reason: reason
            });
            // Сразу разбаниваем (софтбан)
            await guild.members.unban(author.id, reason);
            actionSuccess = true;
        } catch (err) {
            console.error(`[HONEYPOT] Failed to softban ${author.tag} (${author.id}):`, err.message);
        }

        // 3. Отправляем лог-уведомление, если задан лог-канал
        if (!cfg.honeypotLogChannelId) return;

        const logChannel = await guild.channels.fetch(cfg.honeypotLogChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        // const lang = cfg.language || guild.preferredLocale || 'ru'; // Already declared above
        const logEmbed = EmbedService.createBaseEmbed()
            .setColor(0xFF4757)
            .setTitle(localeManager.get('events.honeypot.title', lang))
            .setThumbnail(author.displayAvatarURL({ dynamic: true, size: 64 }))
            .addFields(
                { name: localeManager.get('events.honeypot.labels.target', lang), value: `${author} (${author.tag})`, inline: true },
                { name: 'ID', value: `\`${author.id}\``, inline: true },
                { name: localeManager.get('events.honeypot.labels.result', lang), value: actionSuccess ? localeManager.get('events.honeypot.labels.banned', lang) : localeManager.get('events.honeypot.labels.ban_failed', lang), inline: true },
                { name: localeManager.get('events.honeypot.labels.channel', lang), value: `<#${cfg.honeypotChannelId}>`, inline: true },
                { name: localeManager.get('events.honeypot.labels.created', lang), value: `<t:${Math.floor(author.createdTimestamp / 1000)}:R>`, inline: true },
                { name: localeManager.get('events.honeypot.labels.message', lang), value: `\`\`\`${contentPreview}\`\`\`` }
            )
            .setFooter({ text: `${localeManager.get('events.honeypot.labels.guild', lang)}: ${guild.name}` });

        await logChannel.send({ embeds: [logEmbed] }).catch(err => {
            console.error('[HONEYPOT] Failed to send log:', err.message);
        });
    }
};
