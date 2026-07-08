const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const EmbedService = require('../../services/EmbedService');
const { privateAccess, bot_log_channel } = require('../../config.json');
const axios = require('axios');
const KeyRotator = require('../../lib/KeyRotator/KeyRotator');
const { GoogleGenAI } = require('@google/genai');
const DatabaseService = require('../../services/DatabaseService');
const geminiCrashHadler = require('../../utils/gemini_crash_handler');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Interact with Gemini AI')
    .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.description'))
    .setContexts(0, 1, 2)
    .addSubcommand(sub =>
        sub.setName('ask')
        .setDescription('Ask AI a question')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.ask.description'))
        .addStringOption(opt =>
            opt.setName('text')
            .setDescription('Question text')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.ask.options.text.description'))
            .setRequired(true)
        )
        .addAttachmentOption(opt =>
            opt.setName('image')
            .setDescription('Image for analysis')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.ask.options.image.description'))
        )
        .addBooleanOption(opt =>
            opt.setName('invisible')
            .setDescription('Ephemeral response')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.ask.options.invisible.description'))
        )
    )
    .addSubcommand(sub =>
        sub.setName('add-user')
        .setDescription('Add user to AI DB')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.add-user.description'))
        .addUserOption(opt =>
            opt.setName('user')
            .setDescription('User to add')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.add-user.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('remove-user')
        .setDescription('Remove user from AI DB')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.remove-user.description'))
        .addUserOption(opt =>
            opt.setName('user')
            .setDescription('User to remove')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.remove-user.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName('settings')
        .setDescription('Show your AI settings')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.settings.description'))
    )
    .addSubcommand(sub =>
        sub.setName('edit')
        .setDescription('Edit AI settings')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit.description'))
        .addStringOption(opt =>
            opt.setName('model')
            .setDescription('Model name')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit.options.model.description'))
        )
        .addStringOption(opt =>
            opt.setName('system_instructions')
            .setDescription('System prompt')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit.options.system_instructions.description'))
        )
        .addIntegerOption(opt =>
            opt.setName('max_output_tokens')
            .setDescription('Max tokens')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit.options.max_output_tokens.description'))
            .setMaxValue(65536)
            .setMinValue(1)
        )
        .addNumberOption(opt =>
            opt.setName('temperature')
            .setDescription('Temperature')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit.options.temperature.description'))
            .setMaxValue(2)
            .setMinValue(0.1)
        )
        .addNumberOption(opt =>
            opt.setName('top_p')
            .setDescription('Top-P')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit.options.top_p.description'))
            .setMaxValue(1)
            .setMinValue(-1)
        )
        .addIntegerOption(opt =>
            opt.setName('top_k')
            .setDescription('Top-K')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit.options.top_k.description'))
            .setMaxValue(100)
            .setMinValue(-1)
        )
        .addIntegerOption(opt =>
            opt.setName('history_limit')
            .setDescription('History limit')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit.options.history_limit.description'))
            .setMaxValue(500)
            .setMinValue(0)
        )
    )
    .addSubcommand(sub =>
        sub.setName('edit-safety')
        .setDescription('Edit safety settings')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit_safety.description'))
        .addStringOption(opt =>
            opt.setName('s_category')
            .setDescription('Category')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit_safety.options.s_category.description'))
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
            .setDescription('Threshold')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit_safety.options.s_value.description'))
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
        .setDescription('Add Gemini API key')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.add-apikey.description'))
        .addStringOption(opt =>
            opt.setName('apikey')
            .setDescription('API key')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.add-apikey.options.apikey.description'))
            .setRequired(true)
        )
        .addBooleanOption(opt =>
            opt.setName('for-public-use')
            .setDescription('Allow public use')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.add-apikey.options.for-public-use.description'))
        )
    )
    .addSubcommand(sub =>
        sub.setName('delete-apikey')
        .setDescription('Delete Gemini API key')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.delete-apikey.description'))
        .addStringOption(opt =>
            opt.setName('apikey')
            .setDescription('API key to delete')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.delete-apikey.options.apikey.description'))
        )
        .addBooleanOption(opt =>
            opt.setName('delete-all')
            .setDescription('Delete all keys')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.delete-apikey.options.delete-all.description'))
        )
    )
    .addSubcommand(sub =>
        sub.setName('edit-apikey')
        .setDescription('Edit Gemini API key')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit-apikey.description'))
        .addStringOption(opt =>
            opt.setName('apikey')
            .setDescription('API key')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit-apikey.options.apikey.description'))
            .setRequired(true)
        )
        .addBooleanOption(opt =>
            opt.setName('for-public-use')
            .setDescription('Allow public use')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.edit-apikey.options.for-public-use.description'))
        )
    )
    .addSubcommand(sub =>
        sub.setName('model-info')
        .setDescription('Get Gemini model info')
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.model-info.description'))
        .addStringOption(opt =>
            opt.setName('model')
            .setDescription('Model name')
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.ai.options.model-info.options.model.description'))
        )
    ),
    async execute(interaction) {
        const lang = interaction.guildLocale || 'ru';
        const userId = interaction.user.id;
        const config = await DatabaseService.getUserGeminiConfig(userId);
        const SS = await DatabaseService.getSafetySettings(userId);
        switch (interaction.options.getSubcommand()) {
            case "ask": {
                if (!config) return await interaction.reply({ content: localeManager.get('forFunOnly.ai.messages.not_in_db', lang), flags: MessageFlags.Ephemeral });
                const invisible = interaction.options.getBoolean('invisible');
                await interaction.deferReply(invisible ? { flags: MessageFlags.Ephemeral } : {});
                try {
                    const allKeys = await DatabaseService.getAllUserTokens(userId);
                    if ((!allKeys || !allKeys[0] || allKeys[0].length === 0) && !privateAccess.includes(userId)) {
                        return await interaction.editReply(localeManager.get('forFunOnly.ai.messages.no_api_keys', lang))
                    }
                    const promt = interaction.options.getString('text');
                    const attachment = interaction.options.getAttachment('image');
                    let image = null;
                    if (attachment) {
                        if (!attachment.contentType.startsWith('image/')) {
                            const text = localeManager.get('forFunOnly.ai.messages.not_image', lang);
                            await interaction.editReply(invisible === true ? {
                                content: text,
                                flags: MessageFlags.Ephemeral
                            } : text);
                        } else if (attachment.size >= 20971500) {
                            const text = localeManager.get('forFunOnly.ai.messages.image_too_large', lang);
                            await interaction.editReply(invisible === true ? {
                                content: text,
                                flags: MessageFlags.Ephemeral
                            } : text);
                        }
                        const img = await fetch(attachment.url);
                        image = Buffer.from(await img.arrayBuffer()).toString('base64');
                    }
                    const contents = image !== null ? [
                        {
                          inlineData: {
                            mimeType: attachment.contentType,
                            data: image,
                          },
                        },
                        { text: promt },
                    ] : promt;
                    const ai_request_options = {
                        model: config.model,
                        contents: contents,
                        config: {
                            systemInstruction: config.system_instructions,
                            maxOutputTokens: privateAccess.includes(userId) ? await interaction.client.keyManager.call(getMaxOutputTokens) : await getMaxOutputTokens(allKeys[0][0]),
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
                        const keyRotator = new KeyRotator(allKeys[0]);
                        response = await keyRotator.call(callGemini);
                    } else {
                        if (!interaction.client.keyManager) {
                            return await interaction.editReply({
                                content: localeManager.get('forFunOnly.ai.messages.ai_unavailable', lang),
                                flags: MessageFlags.Ephemeral
                            });
                        }
                        response = await interaction.client.keyManager.call(callGemini);
                    }
                    if (!response) return await interaction.editReply(invisible === true ? {
                        content: localeManager.get('forFunOnly.ai.messages.ai_no_reply', lang),
                        flags: MessageFlags.Ephemeral
                    } : localeManager.get('forFunOnly.ai.messages.ai_no_reply', lang));
                    const _end = Date.now()
                    const reply = response?.text || response?.candidates?.[0]?.content || localeManager.get('forFunOnly.ai.messages.ai_no_reply_reason', lang, { reason: `[${response.candidates[0].finishReason}](<https://google.com/search?q=gemini+returned+a+${response.candidates[0].finishReason}+response.+what+to+do>)` });
                    const stringReply = String(reply);
                    const timeText = localeManager.get('forFunOnly.ai.messages.wait_time', lang, { sec: Math.floor((_end - interaction.createdTimestamp) / 1000 ), length: String(reply).length });
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
                            content: localeManager.get('forFunOnly.ai.messages.reply_too_long', lang),
                            files: [{
                                attachment: textBuffer,
                                name: 'ai_reply.md'
                            }],
                            flags: invisible ? MessageFlags.Ephemeral : undefined,
                        });
                    } else {
                        await interaction.editReply(invisible ? { content: stringReply, flags: MessageFlags.Ephemeral } : reply);
                    }
                    async function callGemini(key) {
                        const ai = new GoogleGenAI({ apiKey: key });
                        try {
                            if (!checkApiKey(key)) {
                                await DatabaseService.deleteToken(userId, key);
                                const stats = await DatabaseService.getUserStats(userId);
                                if (stats.tokens < 1) await DatabaseService.deleteUserConfig(userId);
                                return { text: localeManager.get('forFunOnly.ai.messages.invalid_apikey', lang) };
                            }
                            const response = await ai.models.generateContent(ai_request_options);
                            return response;
                        } catch (error) {
                            if (error.status === 429) {
                                const err = new Error("Rate limit exceeded");
                                err.rateLimited = true;
                                throw err;
                            } else {
                                console.error(error);
                            }
                        }
                    }
                    async function getMaxOutputTokens(key) {
                        const ai = new GoogleGenAI({ apiKey: key });
                        if (!checkApiKey(key)) {
                            await DatabaseService.deleteToken(userId, key);
                            const stats = await DatabaseService.getUserStats(userId);
                            if (stats.tokens < 1) await DatabaseService.deleteUserConfig(userId);
                            return { text: localeManager.get('forFunOnly.ai.messages.invalid_apikey', lang) };
                        }
                        try {
                            const info = await ai.models.get({model: config.model});
                            if (info.outputTokenLimit < config.maxOutputTokens) return info.outputTokenLimit;
                            else return config.maxOutputTokens;
                        } catch (error) {
                            return 1024;
                        }
                    }
                } catch (error) {
                    const gemini_error = geminiCrashHadler(error);
                    if (gemini_error) {
                        return await interaction.editReply(invisible ? { content: gemini_error, flags: MessageFlags.Ephemeral } : gemini_error);
                    }
                    await interaction.editReply(`\n\`\`\`txt\n${error}\`\`\``)
                    const errorEmbed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(`Произошла ошибка при обработке команды`)
                    .addFields(
                        { name: `Команда`, value: `${interaction.commandName}` },
                        { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel);
                    await logChannel.send({ embeds: [errorEmbed], allowedMentions: { parse: [] } });
                }
                break;
            }
            case "add-user": {
                const user = interaction.options.getUser('user')
                try {
                    await DatabaseService.addUserConfig(user.id)
                    await interaction.reply({ content: localeManager.get('forFunOnly.ai.messages.user_added', lang, { user: user.toString() }), flags: MessageFlags.Ephemeral })
                } catch (error) {
                    const errorEmbed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(localeManager.get('events.errors.command_error', lang))
                    .addFields(
                        { name: `Команда`, value: `${interaction.commandName}` },
                        { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    await logChannel.send({ embeds: [errorEmbed], allowedMentions: { parse: [] } });
                    await interaction.reply({ content: `Не удалось добавить пользователя в базу данных. err: ${error.message}`, flags: MessageFlags.Ephemeral })
                }
                break;
            }
            case "remove-user": {
                const user = interaction.options.getMember('user');
                try {
                    const promise = await DatabaseService.deleteUserConfig(user.id)
                    await interaction.reply({ content: promise ? localeManager.get('forFunOnly.ai.messages.user_removed', lang, { user: user.toString() }) : localeManager.get('forFunOnly.ai.messages.not_in_db', lang), flags: MessageFlags.Ephemeral })
                } catch (error) {
                    const errorEmbed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(localeManager.get('events.errors.command_error', lang))
                    .addFields(
                        { name: `Команда`, value: `${interaction.commandName}` },
                        { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    await logChannel.send({ embeds: [errorEmbed], allowedMentions: { parse: [] } });
                    await interaction.reply({ content: `Не удалось удалить пользователя из базы данных. err: ${error.message}`, flags: MessageFlags.Ephemeral })
                }
                break;
            }
            case "settings": {
                if (!config) return await interaction.reply({ content: localeManager.get('forFunOnly.ai.messages.not_in_db', lang), flags: MessageFlags.Ephemeral });
                const stats = await DatabaseService.getUserStats(userId);
                const embed = EmbedService.createBaseEmbed(interaction)
                .setAuthor({ iconURL: interaction.user.displayAvatarURL({extension: "png"}), name: interaction.user.displayName })
                .setTitle(localeManager.get('forFunOnly.ai.messages.settings_title', lang))
                .setDescription(
                    localeManager.get('forFunOnly.ai.messages.settings_description', lang, {
                        si: config.system_instructions || (lang === 'ru' ? "Пусто" : (lang === 'uk' ? "Порожньо" : "Empty")),
                        ss: JSON.stringify(SS, null, 2)
                    })
                )
                .setFields(
                    { name: localeManager.get('forFunOnly.ai.messages.label_model', lang), value: config.model, inline: true },
                    { name: localeManager.get('forFunOnly.ai.messages.label_max_tokens', lang), value: `${config.max_output_tokens}`, inline: true },
                    { name: localeManager.get('forFunOnly.ai.messages.label_temperature', lang), value: `${config.temperature}`, inline: true },
                    { name: "top_k", value: `${config.top_k}`, inline: true },
                    { name: "top_p", value: `${config.top_p}`, inline: true },
                    { name: localeManager.get('forFunOnly.ai.messages.label_history_limit', lang), value: `${config.history_limit}`, inline: true },
                    { name: localeManager.get('forFunOnly.ai.messages.label_total_tokens', lang), value: `${stats.tokens}`, inline: true },
                    { name: localeManager.get('forFunOnly.ai.messages.label_token_uses', lang), value: `${stats.uses}`, inline: true },
                )
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
                break;
            }
            case "edit": {
                if (!config) return await interaction.reply({ content: localeManager.get('forFunOnly.ai.messages.not_in_db', lang), flags: MessageFlags.Ephemeral });
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
                const result = await DatabaseService.updateUserGeminiConfig(userId, changes);
                const reply = result.changes > 0 ? localeManager.get('forFunOnly.ai.messages.settings_updated', lang) : localeManager.get('forFunOnly.ai.messages.settings_not_changed', lang);
                await interaction.reply({ content: reply, flags: MessageFlags.Ephemeral })
                break;
            }
            case "edit-safety": {
                let result = 0,
                s_value = interaction.options.getString('s_value'),
                s_category = interaction.options.getString('s_category'),
                nothingСhanged = localeManager.get('forFunOnly.ai.messages.settings_not_changed', lang),
                change = localeManager.get('forFunOnly.ai.messages.safety_category_changed', lang, { category: s_category, value: s_value });
                switch (s_category) {
                    case "HARASSMENT":
                        result = await DatabaseService.updateSafetySettings(userId, { HARM_CATEGORY_HARASSMENT: s_value });
                        await interaction.reply({content: result.changes > 0 ? change : nothingСhanged, flags: MessageFlags.Ephemeral});
                        break;
                    case "HATE_SPEECH":
                        result = await DatabaseService.updateSafetySettings(userId, { HARM_CATEGORY_HATE_SPEECH: s_value });
                        await interaction.reply({content: result.changes > 0 ? change : nothingСhanged, flags: MessageFlags.Ephemeral});
                        break;
                    case "SEXUALLY_EXPLICIT":
                        result = await DatabaseService.updateSafetySettings(userId, { HARM_CATEGORY_SEXUALLY_EXPLICIT: s_value });
                        await interaction.reply({content: result.changes > 0 ? change : nothingСhanged, flags: MessageFlags.Ephemeral});
                        break;
                    case "DANGEROUS_CONTENT":
                        result = await DatabaseService.updateSafetySettings(userId, { HARM_CATEGORY_DANGEROUS_CONTENT: s_value });
                        await interaction.reply({content: result.changes > 0 ? change : nothingСhanged, flags: MessageFlags.Ephemeral});
                        break;
                    default:
                        await interaction.reply({content: localeManager.get('forFunOnly.ai.messages.unknown_category', lang), flags: MessageFlags.Ephemeral});
                        break;
                }
                break;
            }
            case 'add-apikey': {
                const apikey = interaction.options.getString('apikey');
                const public = interaction.options.getBoolean('for-public-use') || false;
                await interaction.deferReply({flags: MessageFlags.Ephemeral});
                if (!await checkApiKey(apikey)) return await interaction.editReply({ content: localeManager.get('forFunOnly.ai.messages.invalid_apikey', lang), flags: MessageFlags.Ephemeral });
                const result = await DatabaseService.addToken(userId, apikey, public);
                await DatabaseService.addUserConfig(userId);
                await interaction.editReply({ content: result.changes > 0 ? localeManager.get('forFunOnly.ai.messages.apikey_added', lang): result.message || localeManager.get('forFunOnly.ai.messages.settings_not_changed', lang), flags: MessageFlags.Ephemeral });
                break;
            }
            case 'delete-apikey': {
                const apikey = interaction.options.getString('apikey');
                const all = interaction.options.getBoolean('delete-all') || false;
                await interaction.deferReply({flags: MessageFlags.Ephemeral});
                if (!apikey && !all) return await interaction.editReply({ content: localeManager.get('forFunOnly.ai.messages.apikey_required_non_all', lang), flags: MessageFlags.Ephemeral });
                if (all) {
                    const result = await DatabaseService.deleteAllTokensByUser(userId);
                    await DatabaseService.deleteUserConfig(userId);
                    await interaction.editReply({ content: localeManager.get('forFunOnly.ai.messages.keys_deleted_count', lang, { count: result.changes }), flags: MessageFlags.Ephemeral });
                } else {
                    const result = await DatabaseService.deleteToken(userId, apikey);
                    const stats = await DatabaseService.getUserStats(userId);
                    if (stats.tokens < 1) await DatabaseService.deleteUserConfig(userId);
                    await interaction.editReply({ content: result.changes > 0 ? localeManager.get('forFunOnly.ai.messages.apikey_deleted', lang, { apikey: apikey }) : result.message || localeManager.get('forFunOnly.ai.messages.settings_not_changed', lang), flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case 'edit-apikey': {
                const apikey = interaction.options.getString('apikey');
                const public = interaction.options.getBoolean('for-public-use') || false;
                await interaction.deferReply({flags: MessageFlags.Ephemeral});
                const result = await DatabaseService.updateTokenSettings(userId, apikey, { public_use: public });
                await interaction.editReply({ content: result.changes > 0 ? localeManager.get('forFunOnly.ai.messages.settings_updated', lang) : localeManager.get('forFunOnly.ai.messages.settings_not_changed', lang), flags: MessageFlags.Ephemeral });
                break;
            }
            case "model-info": {
                const model = interaction.options.getString('model') || config.model;
                let info;
                if (!privateAccess.includes(userId)) {
                    const keys = [];
                    const allKeys =  await DatabaseService.getAllUserTokens(userId);
                    if (!allKeys[0]) return await interaction.editReply(localeManager.get('forFunOnly.ai.messages.model_info_no_keys', lang))
                    allKeys[0].forEach(key => {
                        keys.push({key, timeoutDuration: 60_000});
                    })
                    const keyRotator = new KeyRotator(allKeys[0]);
                    info = await keyRotator.call(getModelInfo);
                } else {
                    if (!interaction.client.keyManager) {
                        return await interaction.editReply({
                            content: localeManager.get('forFunOnly.ai.messages.ai_unavailable', lang),
                            flags: MessageFlags.Ephemeral
                        });
                    }
                    info = await interaction.client.keyManager.call(getModelInfo);
                }
                if (info.err) return await interaction.reply({ content: info.text, flags: MessageFlags.Ephemeral });
                const embed = createGeminiModelEmbed(info, interaction);
                await interaction.reply({embeds: [embed]});
                async function getModelInfo(key) {
                    const ai = new GoogleGenAI({ apiKey: key });
                    if (!checkApiKey(key)) {
                        await DatabaseService.deleteToken(userId, key);
                        const stats = await DatabaseService.getUserStats(userId);
                        if (stats.tokens < 1) await DatabaseService.deleteUserConfig(userId);
                        return { text: localeManager.get('forFunOnly.ai.messages.invalid_apikey', lang) };
                    }
                    try {
                        return await ai.models.get({model: model});
                    } catch (error) {
                        return {err: true, text: geminiCrashHadler(error)}
                    }
                }
                break;
            }
            default:
                await interaction.reply({content: localeManager.get('forFunOnly.ai.messages.unknown_subcommand', lang), flags: MessageFlags.Ephemeral})
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
        if (endPosition >= text.length) {
            const part = text.substring(currentPosition).trim();
            if (part.length > 0) {
                parts.push(part);
            }
            break;
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
                currentPosition = cutAt + 1;
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

const actionDescriptions = {
    generateContent: "Генерация текста, изображений и другого контента",
    countTokens: "Подсчет токенов во вводе",
    createCachedContent: "Кэширование данных для повторного использования",
    batchGenerateContent: "Массовая асинхронная генерация контента",
    streamGenerateContent: "Потоковая генерация ответов",
    functionCalling: "Вызов внешних функций/инструментов",
    codeExecution: "Выполнение кода (Python)",
    structuredOutputs: "Генерация структурированных данных (JSON)",
    multimodalUnderstanding: "Понимание мультимодальных данных (изображения, аудио, видео)",
    liveApi: "Интерактивное голосовое/видео взаимодействие",
    fineTuning: "Тонкая настройка модели",
    embeddings: "Генерация встраиваний (векторов)",
};

function createGeminiModelEmbed(info, interaction) {
    const supportedActionsText = info.supportedActions
        .map(action => {
            const description = actionDescriptions[action] || `Неизвестное действие: ${action}`;
            return `• **${action}**: ${description}`;
        })
        .join('\n');
    const embed = EmbedService.createBaseEmbed(interaction)
        .setTitle(info.displayName || "Неизвестная модель Gemini")
        .setDescription(`**Описание:** ${info.description || "Описание отсутствует."}`)
        .addFields(
            { name: "Идентификатор модели", value: `\`${info.name}\``, inline: true },
            { name: "Версия", value: `\`${info.version}\``, inline: true },
            { name: "Лимит входных токенов", value: `${info.inputTokenLimit.toLocaleString()} токенов`, inline: true },
            { name: "Лимит выходных токенов", value: `${info.outputTokenLimit.toLocaleString()} токенов`, inline: true },
            { name: "Поддерживаемые действия", value: supportedActionsText || "Действия не указаны." }
        );
    return embed;
}