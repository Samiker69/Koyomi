// Пример команды в discord.js v14
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { SlashCommandBuilder, MessageFlags, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const { Readable } = require('stream');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

module.exports = {
    data: new SlashCommandBuilder()
        .setName(localeManager.getString('commands.say-tts.name'))
        .setDescription(localeManager.getString('commands.say-tts.description'))
        .addBooleanOption(option =>
            option.setName(localeManager.getString('commands.say-tts.options.voice-channel.name'))
                .setDescription(localeManager.getString('commands.say-tts.options.voice-channel.description'))
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName(localeManager.getString('commands.say-tts.options.text.name'))
                .setDescription(localeManager.getString('commands.say-tts.options.text.description'))
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName(localeManager.getString('commands.say-tts.options.lang.name'))
                .setDescription(localeManager.getString('commands.say-tts.options.lang.description'))
        )
        .addNumberOption(option =>
            option.setName(localeManager.getString('commands.say-tts.options.speed.name'))
                .setDescription(localeManager.getString('commands.say-tts.options.speed.description'))
                .setMinValue(0.1)
                .setMaxValue(2)
        ),

    async execute(interaction) {
        const text = interaction.options.getString('text');
        const lang = interaction.options.getString('lang') || 'en'; // Язык по умолчанию - английский
        const speed = interaction.options.getNumber('speed') || 1.0; // Скорость по умолчанию - 1.0
        const useVoiceChannel = interaction.options.getBoolean('voice-channel');
        const member = interaction.member;
        const guild = interaction.guild;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Отправляем отложенный ответ

        try {
            // 1. Отправляем текст на TTS-сервер
            const genTime = Date.now()
            const ttsServerUrl = 'http://localhost:5000/api/tts/xtts';
            const response = await axios.post(ttsServerUrl, { text: text, lang: lang, speed: speed }, {
                responseType: 'arraybuffer',
            });

            const audioBuffer = Buffer.from(response.data);
            let readyTimeMs = Math.floor((Date.now() - genTime) / 1000);
            readyTimeMs %= 3600;
            let minutes = Math.floor(readyTimeMs / 60);
            let seconds = Math.floor(readyTimeMs % 60);
            const readyTime = `${minutes}мин ${seconds}сек`;

            if (useVoiceChannel) {
                // Если передан флаг voice-channel = true
                const voiceChannel = member.voice.channel;

                if (!voiceChannel) {
                    return interaction.editReply({ content: localeManager.getString('commands.say-tts.not_in_voice-channel'), flags: MessageFlags.Ephemeral });
                }

                // Подключаемся к голосовому каналу
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                });

                // Ждем, пока соединение установится
                await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

                // Воспроизводим аудио
                const player = createAudioPlayer();
                // Создаем поток из буфера
                const audioStream = new Readable();
                audioStream.push(audioBuffer);
                audioStream.push(null); // Завершаем поток

                // Создаем аудио ресурс
                const resource = createAudioResource(audioStream, {
                    inputType: 'arbitrary',
                });
                setTimeout(() => {
                    player.play(resource);
                }, 1000);
                

                connection.subscribe(player);

                // Отвечаем пользователю после начала воспроизведения
                await interaction.editReply({ content: localeManager.getString('commands.say-tts.audio_generation_time_playing', { readyTime: readyTime, text: text }), flags: MessageFlags.Ephemeral });

                // Обработчики завершения и ошибок
                player.on('idle', () => {
                    console.log('Воспроизведение завершено.');
                    connection.destroy();
                });

                player.on('error', error => {
                    console.error('Ошибка при воспроизведении:', error);
                    interaction.editReply({ content: localeManager.getString('commands.say-tts.playback_error'), flags: MessageFlags.Ephemeral });
                });

            } else {
                // Если voice-channel = false, отправляем аудио в чат
                const attachment = new AttachmentBuilder(audioBuffer, { name: 'tts-output.wav' });
                await interaction.editReply({ content: localeManager.getString('commands.say-tts.audio_generation_time_file', { readyTime: readyTime }), files: [attachment] });
            }

        } catch (error) {
            console.error('Ошибка в TTS-функции бота:', error);
            await interaction.editReply({ content: localeManager.getString('commands.say-tts.error_speaking_text'), flags: MessageFlags.Ephemeral });
        }
    },
};