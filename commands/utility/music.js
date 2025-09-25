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
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

module.exports = {
    data: new SlashCommandBuilder()
        .setName(localeManager.getString('commands.play.name'))
        .setDescription(localeManager.getString('commands.play.description'))
        .addStringOption(option =>
            option.setName(localeManager.getString('commands.play.options.url.name'))
                .setDescription(localeManager.getString('commands.play.options.url.description'))
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName(localeManager.getString('commands.play.options.attachment.name'))
                .setDescription(localeManager.getString('commands.play.options.attachment.description'))
                .setRequired(false)),

    async execute(interaction) {
        const urlQuery = interaction.options.getString('url');
        const attachment = interaction.options.getAttachment('attachment');
        const voiceChannel = interaction.member.voice.channel;
        const client = interaction.client;

        if (!urlQuery && !attachment) {
            return interaction.reply({ content: 'Вы должны указать прямую ссылку или загрузить файл!', flags: MessageFlags.Ephemeral });
        }
        if (urlQuery && attachment) {
            return interaction.reply({ content: 'Пожалуйста, укажите либо ссылку, либо загрузите файл, но не оба сразу.', flags: MessageFlags.Ephemeral });
        }

        if (!voiceChannel) {
            return interaction.reply({ content: 'Вы должны находиться в голосовом канале, чтобы использовать эту команду!', flags: MessageFlags.Ephemeral });
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply({ content: 'Мне нужны права для подключения и разговора в вашем голосовом канале!', flags: MessageFlags.Ephemeral });
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
                 await interaction.editReply('Неподдерживаемый тип файла. Пожалуйста, используйте mp3, ogg, wav, flac, m4a или opus.');
                 return;
            }
        } else if (urlQuery) {
            const directLinkRegex = /\.(mp3|ogg|wav|flac|m4a|opus)(\?.*)?$/i;
            if (!directLinkRegex.test(urlQuery)) {
                await interaction.editReply('Указана невалидная прямая ссылка на аудиофайл. Убедитесь, что ссылка заканчивается на поддерживаемое расширение.');
                return;
            }
            audioSourceUrl = urlQuery;
            try {
                songTitle = urlQuery.split("/").at(-1).replace("."+urlQuery.split("/").at(-1).split('.').pop(), "" );
            } catch (e) {
                songTitle = "Неизвестно?"; // Запасной вариант
            }
        }

        const song = {
            title: songTitle,
            url: audioSourceUrl, // Этот URL будет использоваться для получения потока каждый раз
            duration: 'Неизвестно', // Длительность сложно определить без анализа потока/файла
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
                return interaction.editReply('Не удалось подключиться к голосовому каналу.');
            }
        } else {
            serverQueue.songs.push(song);
            const queueEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Трек добавлен в очередь')
                .setDescription(`**${song.title}**`)
                .addFields({ name: 'Запросил', value: song.requestedBy, inline: true })
                .setTimestamp();
            if (serverQueue.songs.length > 1) {
                 queueEmbed.addFields({ name: 'Позиция в очереди', value: (serverQueue.songs.length -1).toString() });
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

    if (!songToPlay) {
        serverQueue.timeoutId = setTimeout(() => {
            if (serverQueue.connection && serverQueue.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                serverQueue.connection.destroy();
            }
            client.queues.delete(guildId);
            // serverQueue.textChannel.send('Очередь пуста. Отключаюсь.').catch(console.error);
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
            errTextChannel.send(`Не удалось загрузить трек: ${songToPlay.title}. Пропускаю.`).catch(console.error);
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
        .setTitle('Сейчас играет')
        .setDescription(`**[${songToPlay.title}](${songToPlay.url})**`)
        .addFields(
            { name: 'Запросил', value: songToPlay.requestedBy, inline: true }
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
            replyChannel.send(`Ошибка при воспроизведении: ${songToPlay.title}. Пропускаю.`).catch(console.error);
        }
        serverQueue.songs.shift();
        playNextSong(guildId, client);
    });
}