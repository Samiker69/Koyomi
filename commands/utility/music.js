const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType
} = require('@discordjs/voice');
const axios = require('axios'); // Для получения потоков по HTTP(S)
const path = require('node:path'); // Для извлечения имени файла из URL
const replies = require('../../locales/answers/replies');
const { utility } = require('../../locales/descriptions/utility');

const getReply = (key, locale, vars = {}) => {
    let text = replies[key]?.[locale] || replies[key]?.['ru'] || key;
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
    }
    return text;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Воспроизводит аудио по прямой ссылке или из загруженного файла.')
        .setDescriptionLocalizations(utility.play.description)
        .addStringOption(option =>
            option.setName('url')
                .setDescription('Прямая ссылка на аудиофайл (mp3, ogg, wav, flac, m4a, opus).')
                .setDescriptionLocalizations(utility.play.options.url.description)
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('attachment')
                .setDescription('Загрузите аудиофайл (mp3, ogg, wav, flac, m4a, opus).')
                .setDescriptionLocalizations(utility.play.options.attachment.description)
                .setRequired(false)),

    async execute(interaction) {
        const loc = interaction.locale;
        const urlQuery = interaction.options.getString('url');
        const attachment = interaction.options.getAttachment('attachment');
        const voiceChannel = interaction.member.voice.channel;
        const client = interaction.client;

        if (!urlQuery && !attachment) {
            return interaction.reply({ content: getReply('music_need_source', loc), flags: MessageFlags.Ephemeral });
        }
        if (urlQuery && attachment) {
            return interaction.reply({ content: getReply('music_too_many_sources', loc), flags: MessageFlags.Ephemeral });
        }

        if (!voiceChannel) {
            return interaction.reply({ content: getReply('music_not_in_vc', loc), flags: MessageFlags.Ephemeral });
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply({ content: getReply('music_no_vc_perms', loc), flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply();

        let serverQueue = client.queues.get(interaction.guildId);

        let audioSourceUrl;
        let songTitle;

        // Определение источника и названия
        if (attachment) {
            audioSourceUrl = attachment.url;
            songTitle = attachment.name;
            const allowedExtensions = ['.mp3', '.ogg', '.wav', '.flac', '.m4a', '.opus'];
            if (!allowedExtensions.some(ext => songTitle.toLowerCase().endsWith(ext))) {
                await interaction.editReply(getReply('music_unsupported_file', loc));
                return;
            }
        } else if (urlQuery) {
            const directLinkRegex = /\.(mp3|ogg|wav|flac|m4a|opus)(\?.*)?$/i;
            if (!directLinkRegex.test(urlQuery)) {
                await interaction.editReply(getReply('music_invalid_url', loc));
                return;
            }
            audioSourceUrl = urlQuery;
            try {
                songTitle = urlQuery.split("/").at(-1).replace("." + urlQuery.split("/").at(-1).split('.').pop(), "");
            } catch (e) {
                songTitle = "Неизвестно?"; // Запасной вариант
            }
        }

        const song = {
            title: songTitle,
            url: audioSourceUrl, // Этот URL будет использоваться для получения потока каждый раз
            duration: getReply('music_unknown_duration', loc), // Длительность сложно определить без анализа потока/файла
            requestedBy: interaction.user.tag,
        };

        if (!serverQueue) {
            const queueConstruct = {
                textChannel: interaction.channel,
                voiceChannel: voiceChannel,
                connection: null,
                player: createAudioPlayer(),
                songs: [],
                volume: 5,
                playing: true,
                loop: false,
                timeoutId: null
            };

            client.queues.set(interaction.guildId, queueConstruct);
            queueConstruct.songs.push(song);

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                queueConstruct.connection = connection;

                connection.on(VoiceConnectionStatus.Disconnected, async () => {
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                        ]);
                    } catch (error) {
                        console.log(`Bot disconnected from ${interaction.guild.name}, cleaning up queue.`);
                        if (connection.state.status !== VoiceConnectionStatus.Destroyed) connection.destroy();
                        client.queues.delete(interaction.guildId);
                    }
                });
                connection.on(VoiceConnectionStatus.Destroyed, () => {
                    console.log(`Connection destroyed in ${interaction.guild.name}, cleaning up queue.`);
                    client.queues.delete(interaction.guildId);
                });

                connection.subscribe(queueConstruct.player);
                // Передаем interaction для корректной отправки первого сообщения "Сейчас играет"
                await playNextSong(interaction.guildId, client, interaction);
            } catch (err) {
                console.error(err);
                client.queues.delete(interaction.guildId);
                return interaction.editReply(getReply('music_connect_fail', loc));
            }
        } else {
            serverQueue.songs.push(song);
            const queueEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(getReply('music_added_to_queue', loc))
                .setDescription(`**${song.title}**`)
                .addFields({ name: getReply('music_requested_by', loc), value: song.requestedBy, inline: true })
                .setTimestamp();
            if (serverQueue.songs.length > 1) {
                queueEmbed.addFields({ name: getReply('music_queue_pos', loc), value: (serverQueue.songs.length - 1).toString() });
            }

            return interaction.editReply({ embeds: [queueEmbed] });
        }
    },
};

async function playNextSong(guildId, client, interactionForFirstReply = null) {
    const serverQueue = client.queues.get(guildId);
    if (!serverQueue) return;

    if (serverQueue.timeoutId) {
        clearTimeout(serverQueue.timeoutId);
        serverQueue.timeoutId = null;
    }

    const songToPlay = serverQueue.songs[0];

    const loc = interactionForFirstReply ? interactionForFirstReply.locale : 'ru'; // fallback to ru if no interaction

    if (!songToPlay) {
        serverQueue.timeoutId = setTimeout(() => {
            if (serverQueue.connection && serverQueue.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                serverQueue.connection.destroy();
            }
            client.queues.delete(guildId);
            // serverQueue.textChannel.send(getReply('music_queue_empty', loc)).catch(console.error);
        }, 120000); // 2 минуты
        return;
    }

    let audioStream;
    try {
        const response = await axios({
            method: 'get',
            url: songToPlay.url,
            responseType: 'stream',
        });
        audioStream = response.data;
    } catch (error) {
        console.error(`Ошибка получения потока для ${songToPlay.title}:`, error.message);
        const errTextChannel = interactionForFirstReply ? interactionForFirstReply.channel : serverQueue.textChannel;
        if (errTextChannel) {
            errTextChannel.send(getReply('music_load_fail', loc, { title: songToPlay.title })).catch(console.error);
        }
        serverQueue.songs.shift();
        playNextSong(guildId, client); // Пытаемся сыграть следующий
        return;
    }

    // Пытаемся определить тип потока по расширению. FFMPEG обычно справляется с Arbitrary.
    let streamType = StreamType.Arbitrary;
    const extension = path.extname(songToPlay.url.split('?')[0]).toLowerCase();
    if (extension === '.ogg') streamType = StreamType.OggOpus;
    else if (extension === '.webm') streamType = StreamType.WebmOpus;

    const audioResource = createAudioResource(audioStream, { inputType: streamType });
    serverQueue.player.play(audioResource);
    serverQueue.playing = true;

    const playingEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(getReply('music_now_playing', loc))
        .setDescription(`**[${songToPlay.title}](${songToPlay.url})**`)
        .addFields(
            { name: getReply('music_requested_by', loc), value: songToPlay.requestedBy, inline: true }
        )
        .setTimestamp();

    const replyChannel = interactionForFirstReply ? interactionForFirstReply.channel : serverQueue.textChannel;

    if (replyChannel) {
        try {
            // Если это первый трек и мы отвечаем на interaction
            if (interactionForFirstReply) {
                if (interactionForFirstReply.replied || interactionForFirstReply.deferred) {
                    await interactionForFirstReply.editReply({ embeds: [playingEmbed] });
                } else {
                    // Этого не должно быть из-за deferReply, но на всякий случай
                    await interactionForFirstReply.reply({ embeds: [playingEmbed] });
                }
            } else { // Если это следующий трек в очереди
                await replyChannel.send({ embeds: [playingEmbed] });
            }
        } catch (error) {
            console.error("Ошибка отправки сообщения 'Сейчас играет':", error);
        }
    }


    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
        serverQueue.playing = false;
        if (audioStream && typeof audioStream.destroy === 'function') { // Убедимся, что поток можно уничтожить
            audioStream.destroy(); // Закрываем предыдущий поток
        }
        const oldSong = serverQueue.songs.shift();
        if (serverQueue.loop && oldSong) {
            serverQueue.songs.push(oldSong);
        }
        playNextSong(guildId, client); // Рекурсивный вызов для следующей песни
    });

    serverQueue.player.on('error', error => {
        console.error(`Ошибка плеера для ${songToPlay.title}: ${error.message}`);
        if (audioStream && typeof audioStream.destroy === 'function') {
            audioStream.destroy();
        }
        if (replyChannel) {
            replyChannel.send(getReply('music_play_error', loc, { title: songToPlay.title })).catch(console.error);
        }
        serverQueue.songs.shift();
        playNextSong(guildId, client);
    });
}