// Пример команды в discord.js v14
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { SlashCommandBuilder, MessageFlags, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const { Readable } = require('stream');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say-tts')
        .setDescription('Бот озвучит ваш текст в голосовом чате или отправит в чат.')
        .addBooleanOption(option =>
            option.setName('voice-channel')
                .setDescription('При true бот подключится к вашему войс каналу, а при false отправит аудио в чат.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Текст для озвучивания')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('lang')
                .setDescription('Язык генерации. Он должен совпадать с языком текста!')
        )
        .addNumberOption(option =>
            option.setName('speed')
                .setDescription('Скорость речи (от 0.1 до 2)')
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
                    return interaction.editReply({ content: 'Вы должны быть в голосовом канале, чтобы использовать эту команду!', flags: MessageFlags.Ephemeral });
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
                await interaction.editReply({ content: `Время генерации аудио: ${readyTime}\nВаша фраза "${text}" озвучивается!`, flags: MessageFlags.Ephemeral });

                // Обработчики завершения и ошибок
                player.on('idle', () => {
                    console.log('Воспроизведение завершено.');
                    connection.destroy();
                });

                player.on('error', error => {
                    console.error('Ошибка при воспроизведении:', error);
                    interaction.editReply({ content: 'Произошла ошибка при воспроизведении аудио.', flags: MessageFlags.Ephemeral });
                });

            } else {
                // Если voice-channel = false, отправляем аудио в чат
                const attachment = new AttachmentBuilder(audioBuffer, { name: 'tts-output.wav' });
                await interaction.editReply({ content: `Время генерации аудио: ${readyTime}\nВот ваш сгенерированный файл:`, files: [attachment] });
            }

        } catch (error) {
            console.error('Ошибка в TTS-функции бота:', error);
            await interaction.editReply({ content: 'Произошла ошибка при озвучивании текста.', flags: MessageFlags.Ephemeral });
        }
    },
};