const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly')
const { privateAccess, bot_log_channel } = require('../../config.json');
const axios = require('axios');
const ApikeyManager = require('../../lib/ApikeyManager/ApikeyManager')


const { GoogleGenAI } = require('@google/genai');
const GeminiDB = require('../../functions/db/gemini_settings');
const geminiCrashHadler = require('../../functions/gemini_crash_handler');
const db = new GeminiDB()

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Действия с ai')
    .setContexts(0,1,2)
    .addSubcommand(sub => 
        sub.setName('ask')
        .setDescription('Спросить gemini о чём-либо')
        .addStringOption(opt => 
            opt.setName('text')
            .setDescription('Запрос к gemini')
            .setRequired(true)
        )
        .addBooleanOption(opt =>
            opt.setName("invisible")
            .setDescription("Делает ответ ai невидимым")
        )
    )
    .addSubcommand(sub =>
        sub.setName('add-user')
        .setDescription('Добавляет пользователя в бд, позволяя ему пользоваться командой /ai')
        .addUserOption(opt =>
            opt.setName('user')
            .setDescription('Пользователь')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('remove-user')
        .setDescription('Удаляет пользователя из бд.')
        .addUserOption(opt =>
            opt.setName('user')
            .setDescription('Пользователь')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName("settings")
        .setDescription("Показывает ваши текущие настройки AI")
    )
    .addSubcommand(sub =>
        sub.setName('edit')
        .setDescription('Сменить настройки ai')
        .addStringOption(opt =>
            opt.setName('model')
            .setDescription('Модель для генерации')
        )
        .addStringOption(opt =>
            opt.setName('system_instructions')
            .setDescription('Системные инструкции.')
        )
        .addIntegerOption(opt =>
            opt.setName('max_output_tokens')
            .setDescription('Максимум токенов, которыми AI ответит. Если максимум меньше, чем ответила AI, то ответ обрежется!')
            .setMaxValue(8196)
            .setMinValue(1)
        )
        .addNumberOption(opt =>
            opt.setName('temperature')
            .setDescription('Регулирует случайность(креатичность ответа). 0.1 - предсказуемые, 1-2 - очень хаотичные')
            .setMaxValue(2)
            .setMinValue(0.1)
        )
        .addNumberOption(opt =>
            opt.setName('top_p')
            .setDescription('Вероятность использования токена. 0.0 - ожидаемый токен, 1 - использует все токены')
            .setMaxValue(1)
            .setMinValue(-1)
        )
        .addIntegerOption(opt =>
            opt.setName('top_k')
            .setDescription('"Словарный запас" при генерации токена. 1-5 - маленький, 50+ - разнообразный')
            .setMaxValue(100)
            .setMinValue(-1)
        )
        .addIntegerOption(opt =>
            opt.setName('history_limit')
            .setDescription('Лимит сохранения истории. 0 - без сохранения')
            .setMaxValue(500)
            .setMinValue(0)
        )
    )
    .addSubcommand(sub =>
        sub.setName('edit_safety')
        .setDescription('Изменение настроек безопасности модели')
        .addStringOption(opt => 
            opt.setName('s_category')
            .setDescription("Название опции")
            .setChoices(
                { name: 'Травля', value: 'HARASSMENT' },
                { name: 'HateSpeech', value: 'HATE_SPEECH' },
                { name: 'Откровенный_контент', value: 'SEXUALLY_EXPLICIT' },
                { name: 'Опасный_контент', value: 'DANGEROUS_CONTENT' }
            )
            .setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName('s_value')
            .setDescription("Режимы безопастности")
            .setChoices(
                { name: 'Игнорировать', value: 'BLOCK_NONE' },
                { name: 'Мягкий', value: 'BLOCK_HIGH_AND_ABOVE' },
                { name: 'Средний', value: 'BLOCK_MEDIUM_AND_ABOVE' },
                { name: 'Строгий', value: 'BLOCK_LOW_AND_ABOVE' },
                { name: 'По_умолчанию', value: 'HARM_BLOCK_THRESHOLD_UNSPECIFIED' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('add-apikey')
        .setDescription('Добавить апи ключ. Позволяет получить доступ к функционалу AI')
        .addStringOption(opt =>
            opt.setName('apikey')
            .setDescription('Апи ключ. найти можно в https://aistudio.google.com/apikey')
            .setRequired(true)
        )
        .addBooleanOption(opt =>
            opt.setName('for-public-use')
            .setDescription('Позволить нам использовать ваш ключ?')
        )
    )
    .addSubcommand(sub =>
        sub.setName('delete-apikey')
        .setDescription('Удалить апи-ключ из бота')
        .addStringOption(opt =>
            opt.setName('apikey')
            .setDescription('Апи ключ. найти можно в https://aistudio.google.com/apikey')
        )
        .addBooleanOption(opt =>
            opt.setName('delete-all')
            .setDescription('Удалить все ваши ключи?')
        )
    )
    .addSubcommand(sub =>
        sub.setName('edit-apikey')
        .setDescription('Изменить настройки для текущего ключа')
        .addStringOption(opt =>
            opt.setName('apikey')
            .setDescription('Апи ключ. найти можно в https://aistudio.google.com/apikey')
            .setRequired(true)
        )
        .addBooleanOption(opt =>
            opt.setName('for-public-use')
            .setDescription('Позволить нам использовать ваш ключ?')
        )
    )
,
    async execute(interaction) {
        const userId = interaction.user.id;

        const config = db.getUserConfig(userId);
        const SS = db.getSafetySettings(userId);

        switch (interaction.options.getSubcommand()) {
            case "ask": {
                if (!config) return await interaction.reply({ content: "Кажется, вас ещё нет в базе данных.", flags: MessageFlags.Ephemeral });
                const invisible = interaction.options.getBoolean('invisible');
                await interaction.deferReply(invisible ? { flags: MessageFlags.Ephemeral } : {});

                try {
                    const promt = interaction.options.getString('text');

                    const ai_request_options = {
                        model: config.model,
                        contents: promt,
                        config: {
                            systemInstruction: config.system_instructions,
                            maxOutputTokens: config.max_output_tokens,
                            temperature: config.temperature,
                            topK: config.top_k,
                            topP: config.top_p,
                            safetySettings: [
                                { "category": "HARM_CATEGORY_HARASSMENT", "threshold": SS.HARM_CATEGORY_HARASSMENT },
                                { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": SS.HARM_CATEGORY_HATE_SPEECH },
                                { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": SS.HARM_CATEGORY_SEXUALLY_EXPLICIT },
                                { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": SS.HARM_CATEGORY_DANGEROUS_CONTENT }
                            ]
                        }
                    }

                    let response; 
                    if (!privateAccess.includes(userId)) {
                        const keys = [];
                        const allKeys =  db.getAllUserTokens(userId);
                        if (!allKeys[0]) return await interaction.editReply("У вас нет ни одного апи ключа для использования этой команды.")
                        allKeys[0].forEach(key => {
                            keys.push({key, timeoutDuration: 60_000});
                        })
                        const keyManager = new ApikeyManager(keys);
                        response = await keyManager.call(callGemini);
                    } else {
                        if (!interaction.client.keyManager) {
                            return await interaction.editReply({
                                content: 'Функционал ИИ недоступен, так как client.keyManager пуст.',
                                flags: MessageFlags.Ephemeral
                            });
                        }
                        response = await interaction.client.keyManager.call(callGemini);
                    }

                    const _end = Date.now()
                    const reply = response.text || response.candidates[0].content || `Кажется... ai не ответила. Причина: [${response.candidates[0].finishReason}](<https://google.com/search?q=gemini+returned+a+${response.candidates[0].finishReason}+response.+what+to+do>)`;
                    const stringReply = String(reply);
                    const timeText = `Время ожидания ${Math.floor((_end - interaction.createdTimestamp) / 1000 )} секунд, длина ${String(reply).length}`
                
                    if (stringReply.length >= 1990 && stringReply.length < 9900) {
                        await interaction.editReply(invisible ? { content: timeText, flags: MessageFlags.Ephemeral } : timeText);
                        const splited = splitTextSmartly(stringReply, 1980);
                        for (const part of splited) {
                            await interaction.followUp(invisible ? { content: part, flags: MessageFlags.Ephemeral } : part);
                            await new Promise(resolve => setTimeout(resolve, 300)); 
                        }
                    } else if (stringReply.length >= 9900) {
                        const textBuffer = Buffer.from(reply, 'utf-8');
                        await interaction.followUp({
                            content: 'AI ответила слишком длинным текстом, поэтому её ответ находится в файле.',
                            files: [{
                                attachment: textBuffer,
                                name: 'ai_reply.md'
                            }],
                            flags: invisible ? MessageFlags.Ephemeral : {},
                        });
                    } else {
                        await interaction.editReply(invisible ? { content: reply, flags: MessageFlags.Ephemeral } : reply);
                    }

                    async function callGemini(key) {
                        const ai = new GoogleGenAI({ apiKey: key });
                    
                        try {
                            if (!checkApiKey(key)) {
                                db.deleteToken(userId, key);
                                const stats = db.getUserStats(userId);
                                if (stats.tokens < 1) db.deleteUserConfig(userId);
                                return { text: "Неверный апи ключ. Удаление ключа из бд..." };
                            }
                            const response = await ai.models.generateContent(ai_request_options);
                            return response;
                        } catch (error) {
                            if (error.status === 429) {
                                const err = new Error("Rate limit exceeded");
                                err.rateLimited = true;
                                throw err;
                            }
                        }
                    }
                } catch (error) {
                    const gemini_error = geminiCrashHadler(error);
                    if (gemini_error) {
                        return await interaction.editReply(invisible ? { content: gemini_error, flags: MessageFlags.Ephemeral } : gemini_error);
                    }
                    await interaction.editReply(`\n\`\`\`txt\n${error}\`\`\``)  
                    const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(`Произошла ошибка при обработке команды`)
                    .addFields(
                        { name: `Команда`, value: `${interaction.commandName}` },
                        { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel);
                    await logChannel.send({ embeds: [errorEmbed] });
                }
                break;
            }

            case "add-user": {
                const user = interaction.options.getUser('user')
                try {
                    db.addUserConfig(user.id)
                    await interaction.reply({ content: `${user} был добавлен в базу данных`, flags: MessageFlags.Ephemeral })
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(`Произошла ошибка при обработке команды`)
                    .addFields(
                        { name: `Команда`, value: `${interaction.commandName}` },
                        { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    await logChannel.send({ embeds: [errorEmbed] });
                    await interaction.reply({ content: `Не удалось добавить пользователя в базу данных. err: ${error.message}`, flags: MessageFlags.Ephemeral })
                }
                break;
            }

            case "remove-user": {
                const user = interaction.options.getMember('user');
                try {
                    const promise = db.deleteUserConfig(user.id)
                    await interaction.reply({ content: `${user} ${promise ? 'был удалён из базы данных.' : "не был удалён из базы данных. Возможно, его в ней не было"}`, flags: MessageFlags.Ephemeral })
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(`Произошла ошибка при обработке команды`)
                    .addFields(
                        { name: `Команда`, value: `${interaction.commandName}` },
                        { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    await logChannel.send({ embeds: [errorEmbed] });
                    await interaction.reply({ content: `Не удалось удалить пользователя из базы данных. err: ${error.message}`, flags: MessageFlags.Ephemeral })
                }
                break;
            }

            case "settings": {
                if (!config) return await interaction.reply({ content: "Кажется, вас ещё нет в базе данных.", flags: MessageFlags.Ephemeral });
                const stats = db.getUserStats(userId);

                const embed = new EmbedBuilder()
                .setAuthor({ iconURL: interaction.user.displayAvatarURL({extension: "png"}), name: interaction.user.displayName })
                .setColor("Random")
                .setTitle('Ваши настройки gemini')
                .setDescription(
                    `Системные инструкции (system_instructions): ${config.system_instructions || "Пусто"}\n\n`+
                    `Настройки безопасности:\n\`\`\`json\n${JSON.stringify(SS, null, 2)}\`\`\`\n\n`+
                    'Совет: чтобы сбросить настройки `top_k` и `top_p`, укажите им отрицательное значение: `/ai edit top_k:-1`.\n'+
                    'Чтобы сбросить настройки `system_instructions`, используйте команду `/ai edit system_instructions:{NULL}`'
                )
                .setFields(
                    { name: "Модель (model)", value: config.model, inline: true },
                    { name: "Максимум токенов на ответ (max_output_tokens)", value: `${config.max_output_tokens}`, inline: true },
                    { name: "Температура ответов (temperature)", value: `${config.temperature}`, inline: true },
                    { name: "top_k", value: `${config.top_k}`, inline: true },
                    { name: "top_p", value: `${config.top_p}`, inline: true },
                    { name: "Лимит сохранения истории (history_limit)", value: `${config.history_limit}`, inline: true },
                    { name: "Всего токенов", value: `${stats.tokens}`, inline: true },
                    { name: "Сколько раз ваш токен был использован нами", value: `${stats.uses}`, inline: true },
                )
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
                break;
            }
            case "edit": {
                if (!config) return await interaction.reply({ content: "Кажется, вас ещё нет в базе данных.", flags: MessageFlags.Ephemeral });

                let top_k = interaction.options.getInteger('top_k') || config.top_k,
                top_p = interaction.options.getNumber('top_p') || config.top_p,
                s_i = interaction.options.getString('system_instructions') || config.system_instructions;

                if (top_k < 0) top_k = null;
                if (top_p < 0) top_p = null;
                if (s_i?.startsWith("{NULL}")) s_i = null;

                let changes = {
                    model: interaction.options.getString('model') || config.model,
                    system_instructions: s_i,
                    max_output_tokens: interaction.options.getInteger('max_output_tokens') || config.max_output_tokens,
                    temperature: interaction.options.getNumber('temperature') || config.temperature,
                    top_p: top_p,
                    top_k: top_k,
                    history_limit: interaction.options.getString('history_limit') || config.history_limit
                }

                const result = db.updateUserConfig(userId, changes);
                const reply = result.changes > 0 ? "Настройки были обновленны." : "Настройки не изменились"
                await interaction.reply({ content: reply, flags: MessageFlags.Ephemeral })
                break;
            }
            case "edit_safety": {
                let result = 0,
                s_value = interaction.options.getString('s_value'),
                s_category = interaction.options.getString('s_category'),
                nothingСhanged = 'Ничего не изменилось. Вероятно, эта опция уже была установлена на это значение',
                change = `Значение категории \`${s_category}\` было изменено на \`${s_value}\``;

                switch (s_category) {
                    case "HARASSMENT":
                        result = db.updateSafetySettings(userId, { HARM_CATEGORY_HARASSMENT: s_value });
                        await interaction.reply({content: result.changes > 0 ? change : nothingСhanged, flags: MessageFlags.Ephemeral});
                        break;

                    case "HATE_SPEECH":
                        result = db.updateSafetySettings(userId, { HARM_CATEGORY_HATE_SPEECH: s_value });
                        await interaction.reply({content: result.changes > 0 ? change : nothingСhanged, flags: MessageFlags.Ephemeral});
                        break;
                    
                    case "SEXUALLY_EXPLICIT":
                        result = db.updateSafetySettings(userId, { HARM_CATEGORY_SEXUALLY_EXPLICIT: s_value });
                        await interaction.reply({content: result.changes > 0 ? change : nothingСhanged, flags: MessageFlags.Ephemeral});
                        break;

                    case "DANGEROUS_CONTENT":
                        result = db.updateSafetySettings(userId, { HARM_CATEGORY_DANGEROUS_CONTENT: s_value });
                        await interaction.reply({content: result.changes > 0 ? change : nothingСhanged, flags: MessageFlags.Ephemeral});
                        break;   
                    
                    default:
                        await interaction.reply({content: 'Незвестная категория!', flags: MessageFlags.Ephemeral});
                        break;
                }
                break;
            }

            case 'add-apikey': {
                const apikey = interaction.options.getString('apikey');
                const public = interaction.options.getBoolean('for-public-use') || false;
                await interaction.deferReply({flags: MessageFlags.Ephemeral});

                if (!await checkApiKey(apikey)) return await interaction.editReply({ content: "Неверный `apikey`! Скопируйте ключ из https://aistudio.google.com/apikey и вставьте его сюда", flags: MessageFlags.Ephemeral });
                const result = db.addToken(userId, apikey, public);
                db.addUserConfig(userId);
                await interaction.editReply({ content: result.changes > 0 ? `Ваш ключ успешно добавлен! Можете пользоваться функционалом AI.`: result.message || 'Ничего не изменилось.', flags: MessageFlags.Ephemeral });
                break;
            }
            case 'delete-apikey': {
                const apikey = interaction.options.getString('apikey');
                const all = interaction.options.getBoolean('delete-all') || false;
                await interaction.deferReply({flags: MessageFlags.Ephemeral});

                if (!apikey && !all) return await interaction.editReply({ content: "`apikey` не может быть пустым, если вы не удаляете все токены!", flags: MessageFlags.Ephemeral });

                if (all) {
                    const result = db.deleteAllByUser(userId);
                    db.deleteUserConfig(userId);
                    await interaction.editReply({ content: `\`${result.changes}\` ключей было удалено.`, flags: MessageFlags.Ephemeral });
                } else {
                    const result = db.deleteToken(userId, apikey);
                    const stats = db.getUserStats(userId);
                    if (stats.tokens < 1) db.deleteUserConfig(userId);
                    await interaction.editReply({ content: result.changes > 0 ? `\`${apikey}\` был удалён.` : result.message || 'Ничего не изменилось.', flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case 'edit-apikey': {
                const apikey = interaction.options.getString('apikey');
                const public = interaction.options.getBoolean('for-public-use') || false;
                await interaction.deferReply({flags: MessageFlags.Ephemeral});

                const result = db.updateTokenSettings(userId, apikey, { public_use: public });
                await interaction.editReply({ content: result.changes > 0 ? `Настройки были обновлены.` : 'Ничего не изменилось.', flags: MessageFlags.Ephemeral });
                break;
            }

            default:
                await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                break;
        }
    }  
}

function splitTextSmartly(text, maxLength) {
    if (!text) {
        return [];
    }
    if (maxLength <= 0) {
        const trimmedText = text.trim();
        return trimmedText ? [trimmedText] : [];
    }

    const parts = [];
    let currentPosition = 0;

    while (currentPosition < text.length) {
        while (currentPosition < text.length && (text[currentPosition] === ' ' || text[currentPosition] === '\n')) {
            currentPosition++;
        }
        if (currentPosition >= text.length) {
            break;
        }
        let endPosition = currentPosition + maxLength;

        // 3. Если предполагаемый конец выходит за пределы текста или оставшаяся часть меньше maxLength
        if (endPosition >= text.length) {
            const part = text.substring(currentPosition).trim();
            if (part.length > 0) {
                parts.push(part);
            }
            break; // Это последний фрагмент
        } else {
            let cutAt = -1;
            for (let i = endPosition - 1; i >= currentPosition; i--) {
                if (text[i] === ' ' || text[i] === '\n') {
                    cutAt = i;
                    break;
                }
            }

            let part;
            if (cutAt > currentPosition) {
                part = text.substring(currentPosition, cutAt).trim();
                currentPosition = cutAt + 1; // Начинаем следующий фрагмент после разделителя
            } else {
                part = text.substring(currentPosition, endPosition).trim();
                currentPosition = endPosition;
            }
            
            if (part.length > 0) {
                parts.push(part);
            }
        }
    }

    return parts;
}

async function checkApiKey(apikey) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apikey}`;
        const response = await axios.get(url);

        if (response.status === 200) {
            return true
        }
    } catch (error) {
        if (error.response) {
            return false;
        } else {
            console.error('❌ Произошла непредвиденная ошибка:', error.message);
            return false;
        }
    }
}
