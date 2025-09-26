const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { privateAccess, bot_log_channel } = require('../../config.json');
const axios = require('axios');
const ApikeyManager = require('../../lib/ApikeyManager/ApikeyManager')


const { GoogleGenAI } = require('@google/genai');
const GeminiDB = require('../../functions/db/gemini_settings');
const geminiCrashHadler = require('../../functions/gemini_crash_handler');
const LocaleManager = require('../../locales/localesManager');

const db = new GeminiDB()
const localeManager = new LocaleManager();

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName(localeManager.getString('commands.ai.name'))
    .setDescription(localeManager.getString('commands.ai.description'))
    .setContexts(0,1,2)
    .addSubcommand(sub => 
        sub.setName(localeManager.getString('commands.ai.options.ask.name'))
        .setDescription(localeManager.getString('commands.ai.options.ask.description'))
        .addStringOption(opt => 
            opt.setName(localeManager.getString('commands.ai.options.ask.options.text.name'))
            .setDescription(localeManager.getString('commands.ai.options.ask.options.text.description'))
            .setRequired(true)
        )
        .addAttachmentOption(opt => 
            opt.setName(localeManager.getString('commands.ai.options.ask.options.image.name')) 
                .setDescription(localeManager.getString('commands.ai.options.ask.options.image.description'))
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.ask.options.invisible.name'))
            .setDescription(localeManager.getString('commands.ai.options.ask.options.invisible.description'))
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.ai.options.add_user.name'))
        .setDescription(localeManager.getString('commands.ai.options.add_user.description'))
        .addUserOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.add_user.options.user.name'))
            .setDescription(localeManager.getString('commands.ai.options.add_user.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.ai.options.remove_user.name'))
        .setDescription(localeManager.getString('commands.ai.options.remove_user.description'))
        .addUserOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.remove_user.options.user.name'))
            .setDescription(localeManager.getString('commands.ai.options.remove_user.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.ai.options.settings.name'))
        .setDescription(localeManager.getString('commands.ai.options.settings.description'))
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.ai.options.edit.name'))
        .setDescription(localeManager.getString('commands.ai.options.edit.description'))
        .addStringOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.edit.options.model.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit.options.model.description'))
        )
        .addStringOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.edit.options.system_instructions.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit.options.system_instructions.description'))
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.edit.options.max_output_tokens.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit.options.max_output_tokens.description'))
            .setMaxValue(65536)
            .setMinValue(1)
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.edit.options.temperature.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit.options.temperature.description'))
            .setMaxValue(2)
            .setMinValue(0.1)
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.edit.options.top_p.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit.options.top_p.description'))
            .setMaxValue(1)
            .setMinValue(-1)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.edit.options.top_k.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit.options.top_k.description'))
            .setMaxValue(100)
            .setMinValue(-1)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.edit.options.history_limit.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit.options.history_limit.description'))
            .setMaxValue(500)
            .setMinValue(0)
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.ai.options.edit_safety.name'))
        .setDescription(localeManager.getString('commands.ai.options.edit_safety.description'))
        .addStringOption(opt => 
            opt.setName(localeManager.getString('commands.ai.options.edit_safety.options.s_category.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit_safety.options.s_category.description'))
            .setChoices(
                { name: localeManager.getString('commands.ai.options.edit_safety.options.s_category.choices.harassment'), value: 'HARASSMENT' },
                { name: localeManager.getString('commands.ai.options.edit_safety.options.s_category.choices.hate_speech'), value: 'HATE_SPEECH' },
                { name: localeManager.getString('commands.ai.options.edit_safety.options.s_category.choices.sexually_explicit'), value: 'SEXUALLY_EXPLICIT' },
                { name: localeManager.getString('commands.ai.options.edit_safety.options.s_category.choices.dangerous_content'), value: 'DANGEROUS_CONTENT' }
            )
            .setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName(localeManager.getString('commands.ai.options.edit_safety.options.s_value.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit_safety.options.s_value.description'))
            .setChoices(
                { name: localeManager.getString('commands.ai.options.edit_safety.options.s_value.choices.block_none'), value: 'BLOCK_NONE' },
                { name: localeManager.getString('commands.ai.options.edit_safety.options.s_value.choices.block_high_and_above'), value: 'BLOCK_HIGH_AND_ABOVE' },
                { name: localeManager.getString('commands.ai.options.edit_safety.options.s_value.choices.block_medium_and_above'), value: 'BLOCK_MEDIUM_AND_ABOVE' },
                { name: localeManager.getString('commands.ai.options.edit_safety.options.s_value.choices.block_low_and_above'), value: 'BLOCK_LOW_AND_ABOVE' },
                { name: localeManager.getString('commands.ai.options.edit_safety.options.s_value.choices.harm_block_threshold_unspecified'), value: 'HARM_BLOCK_THRESHOLD_UNSPECIFIED' }
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.ai.options.add-apikey.name'))
        .setDescription(localeManager.getString('commands.ai.options.add-apikey.description'))
        .addStringOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.add-apikey.options.apikey.name'))
            .setDescription(localeManager.getString('commands.ai.options.add-apikey.options.apikey.description'))
            .setRequired(true)
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.add-apikey.options.for-public-use.name'))
            .setDescription(localeManager.getString('commands.ai.options.add-apikey.options.for-public-use.description'))
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.ai.options.delete-apikey.name'))
        .setDescription(localeManager.getString('commands.ai.options.delete-apikey.description'))
        .addStringOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.delete-apikey.options.apikey.name'))
            .setDescription(localeManager.getString('commands.ai.options.delete-apikey.options.apikey.description'))
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.delete-apikey.options.delete-all.name'))
            .setDescription(localeManager.getString('commands.ai.options.delete-apikey.options.delete-all.description'))
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.ai.options.edit-apikey.name'))
        .setDescription(localeManager.getString('commands.ai.options.edit-apikey.description'))
        .addStringOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.edit-apikey.options.apikey.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit-apikey.options.apikey.description'))
            .setRequired(true)
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.ai.options.edit-apikey.options.for-public-use.name'))
            .setDescription(localeManager.getString('commands.ai.options.edit-apikey.options.for-public-use.description'))
        )
    )
    .addSubcommand(sub =>
        sub.setName(localeManager.getString('commands.ai.options.model-info.name'))
        .setDescription(localeManager.getString('commands.ai.options.model-info.description'))
        .addStringOption(opt => 
            opt.setName(localeManager.getString('commands.ai.options.model-info.options.model.name'))
            .setDescription(localeManager.getString('commands.ai.options.model-info.options.model.description'))
        )
    )
,
    async execute(interaction) {
        const userId = interaction.user.id;

        const config = db.getUserConfig(userId);
        const SS = db.getSafetySettings(userId);

        switch (interaction.options.getSubcommand()) {
            case "ask": {
                if (!config) return await interaction.reply({ content: localeManager.getString('commands.ai.ask.not_in_db'), flags: MessageFlags.Ephemeral });
                const invisible = interaction.options.getBoolean('invisible');
                await interaction.deferReply(invisible ? { flags: MessageFlags.Ephemeral } : {});

                try {
                    const keys = [];
                    const allKeys =  db.getAllUserTokens(userId);
                    if (!allKeys[0] && !privateAccess.includes(userId)) {
                        return await interaction.editReply(localeManager.getString('commands.ai.ask.no_api_key'))
                    } else if (allKeys[0] && !privateAccess.includes(userId)){
                        allKeys[0].forEach(key => {
                            keys.push({key, timeoutDuration: 60_000});
                        })                        
                    }


                    const promt = interaction.options.getString('text');
                    const attachment = interaction.options.getAttachment('image');
                    let image = null;

                    if (attachment) {
                        if (!attachment.contentType.startsWith('image/')) {
                            const text = localeManager.getString('commands.ai.ask.not_an_image');
                            await interaction.editReply(invisible === true ? {
                                content: text,
                                flags: MessageFlags.Ephemeral 
                            } : text);
                        } else if (attachment.size >= 20971500) {
                            const text = localeManager.getString('commands.ai.ask.image_too_large');
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
                            maxOutputTokens: privateAccess ? await interaction.client.keyManager.call(getMaxOutputTokens) : await getMaxOutputTokens(keys[0]),
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
                        const keyManager = new ApikeyManager(keys);
                        response = await keyManager.call(callGemini);
                    } else {
                        if (!interaction.client.keyManager) {
                            return await interaction.editReply({
                                content: localeManager.getString('commands.ai.ask.ai_unavailable'),
                                flags: MessageFlags.Ephemeral
                            });
                        }
                        response = await interaction.client.keyManager.call(callGemini);
                    }

                    if (!response) return await interaction.editReply(invisible === true ? {
                        content: localeManager.getString('commands.ai.ask.no_ai_response'),
                        flags: MessageFlags.Ephemeral
                    } : localeManager.getString('commands.ai.ask.no_ai_response'));

                    const _end = Date.now()
                    const reply = response?.text || response?.candidates?.[0]?.content || localeManager.getString('commands.ai.ask.no_ai_response_reason', { finishReason: response.candidates[0].finishReason });
                    const stringReply = String(reply);
                    const timeText = localeManager.getString('commands.ai.ask.response_time_length', { time: Math.floor((_end - interaction.createdTimestamp) / 1000 ), length: String(reply).length })
                
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
                            content: localeManager.getString('commands.ai.ask.response_too_long'),
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
                                db.deleteToken(userId, key);
                                const stats = db.getUserStats(userId);
                                if (stats.tokens < 1) db.deleteUserConfig(userId);
                                return { text: localeManager.getString('commands.ai.ask.invalid_api_key_deleting') };
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
                            db.deleteToken(userId, key);
                            const stats = db.getUserStats(userId);
                            if (stats.tokens < 1) db.deleteUserConfig(userId);
                            return { text: localeManager.getString('commands.ai.ask.invalid_api_key_deleting') };
                        }
                        try {
                            const info = await ai.models.get({model: config.model});
                            if (info.outputTokenLimit < config.max_output_tokens) return info.outputTokenLimit;
                            else return config.max_output_tokens;
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
                    const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(localeManager.getString('commands.ai.error_processing_command'))
                    .addFields(
                        { name: localeManager.getString('commands.ai.command_field'), value: `${interaction.commandName}` },
                        { name: localeManager.getString('commands.ai.error_field'), value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel);
                    await logChannel.send({ embeds: [errorEmbed] });
                }
                break;
            }

            case "add_user": {
                const user = interaction.options.getUser('user')
                try {
                    db.addUserConfig(user.id)
                    await interaction.reply({ content: localeManager.getString('commands.ai.add_user.success', { user: user.toString() }), flags: MessageFlags.Ephemeral })
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(localeManager.getString('commands.ai.error_processing_command'))
                    .addFields(
                        { name: localeManager.getString('commands.ai.command_field'), value: `${interaction.commandName}` },
                        { name: localeManager.getString('commands.ai.error_field'), value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    await logChannel.send({ embeds: [errorEmbed] });
                    await interaction.reply({ content: localeManager.getString('commands.ai.add_user.failed', { error: error.message }), flags: MessageFlags.Ephemeral })
                }
                break;
            }

            case "remove_user": {
                const user = interaction.options.getMember('user');
                try {
                    const promise = db.deleteUserConfig(user.id)
                    await interaction.reply({ content: localeManager.getString('commands.ai.remove_user.result', { user: user.toString(), deleted: promise }), flags: MessageFlags.Ephemeral })
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(localeManager.getString('commands.ai.error_processing_command'))
                    .addFields(
                        { name: localeManager.getString('commands.ai.command_field'), value: `${interaction.commandName}` },
                        { name: localeManager.getString('commands.ai.error_field'), value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    await logChannel.send({ embeds: [errorEmbed] });
                    await interaction.reply({ content: localeManager.getString('commands.ai.remove_user.failed', { error: error.message }), flags: MessageFlags.Ephemeral })
                }
                break;
            }

            case "settings": {
                if (!config) return await interaction.reply({ content: localeManager.getString('commands.ai.settings.not_in_db'), flags: MessageFlags.Ephemeral });
                const stats = db.getUserStats(userId);

                const embed = new EmbedBuilder()
                .setAuthor({ iconURL: interaction.user.displayAvatarURL({extension: "png"}), name: interaction.user.displayName })
                .setColor("Random")
                .setTitle(localeManager.getString('commands.ai.settings.embed_title'))
                .setDescription(
                    localeManager.getString('commands.ai.settings.system_instructions', { instructions: config.system_instructions || localeManager.getString('commands.ai.settings.empty') })+'\n\n'+
                    localeManager.getString('commands.ai.settings.safety_settings')+'\n\`\`\`json\n'+JSON.stringify(SS, null, 2)+'\`\`\`\n\n'+
                    localeManager.getString('commands.ai.settings.tip_reset_top_k_p')+'\n'+
                    localeManager.getString('commands.ai.settings.tip_reset_system_instructions')
                )
                .setFields(
                    { name: localeManager.getString('commands.ai.settings.model_field'), value: config.model, inline: true },
                    { name: localeManager.getString('commands.ai.settings.max_output_tokens_field'), value: `${config.max_output_tokens}`, inline: true },
                    { name: localeManager.getString('commands.ai.settings.temperature_field'), value: `${config.temperature}`, inline: true },
                    { name: localeManager.getString('commands.ai.settings.top_k_field'), value: `${config.top_k}`, inline: true },
                    { name: localeManager.getString('commands.ai.settings.top_p_field'), value: `${config.top_p}`, inline: true },
                    { name: localeManager.getString('commands.ai.settings.history_limit_field'), value: `${config.history_limit}`, inline: true },
                    { name: localeManager.getString('commands.ai.settings.total_tokens_field'), value: `${stats.tokens}`, inline: true },
                    { name: localeManager.getString('commands.ai.settings.uses_field'), value: `${stats.uses}`, inline: true },
                )
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
                break;
            }
            case "edit": {
                if (!config) return await interaction.reply({ content: localeManager.getString('commands.ai.edit.not_in_db'), flags: MessageFlags.Ephemeral });

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
                const reply = result.changes > 0 ? localeManager.getString('commands.ai.edit.settings_updated') : localeManager.getString('commands.ai.edit.settings_not_changed')
                await interaction.reply({ content: reply, flags: MessageFlags.Ephemeral })
                break;
            }
            case "edit_safety": {
                let result = 0,
                s_value = interaction.options.getString('s_value'),
                s_category = interaction.options.getString('s_category'),
                nothingСhanged = localeManager.getString('commands.ai.edit_safety.nothing_changed'),
                change = localeManager.getString('commands.ai.edit_safety.category_changed', { category: s_category, value: s_value });

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
                        await interaction.reply({content: localeManager.getString('commands.ai.edit_safety.unknown_category'), flags: MessageFlags.Ephemeral});
                        break;
                }
                break;
            }

            case 'add-apikey': {
                const apikey = interaction.options.getString('apikey');
                const public = interaction.options.getBoolean('for-public-use') || false;
                await interaction.deferReply({flags: MessageFlags.Ephemeral});

                if (!await checkApiKey(apikey)) return await interaction.editReply({ content: localeManager.getString('commands.ai.add-apikey.invalid_apikey'), flags: MessageFlags.Ephemeral });
                const result = db.addToken(userId, apikey, public);
                db.addUserConfig(userId);
                await interaction.editReply({ content: result.changes > 0 ? localeManager.getString('commands.ai.add-apikey.success') : result.message || localeManager.getString('commands.ai.add-apikey.nothing_changed'), flags: MessageFlags.Ephemeral });
                break;
            }
            case 'delete-apikey': {
                const apikey = interaction.options.getString('apikey');
                const all = interaction.options.getBoolean('delete-all') || false;
                await interaction.deferReply({flags: MessageFlags.Ephemeral});

                if (!apikey && !all) return await interaction.editReply({ content: localeManager.getString('commands.ai.delete-apikey.apikey_empty_error'), flags: MessageFlags.Ephemeral });

                if (all) {
                    const result = db.deleteAllByUser(userId);
                    db.deleteUserConfig(userId);
                    await interaction.editReply({ content: localeManager.getString('commands.ai.delete-apikey.all_keys_deleted', { count: result.changes }), flags: MessageFlags.Ephemeral });
                } else {
                    const result = db.deleteToken(userId, apikey);
                    const stats = db.getUserStats(userId);
                    if (stats.tokens < 1) db.deleteUserConfig(userId);
                    await interaction.editReply({ content: result.changes > 0 ? localeManager.getString('commands.ai.delete-apikey.key_deleted', { apikey: apikey }) : result.message || localeManager.getString('commands.ai.delete-apikey.nothing_changed'), flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case 'edit-apikey': {
                const apikey = interaction.options.getString('apikey');
                const public = interaction.options.getBoolean('for-public-use') || false;
                await interaction.deferReply({flags: MessageFlags.Ephemeral});

                const result = db.updateTokenSettings(userId, apikey, { public_use: public });
                await interaction.editReply({ content: result.changes > 0 ? localeManager.getString('commands.ai.edit-apikey.settings_updated') : localeManager.getString('commands.ai.edit-apikey.nothing_changed'), flags: MessageFlags.Ephemeral });
                break;
            }
            case "model-info": {
                const model = interaction.options.getString('model') || config.model;

                let info;
                if (!privateAccess.includes(userId)) {
                    const keys = [];
                    const allKeys =  db.getAllUserTokens(userId);
                    if (!allKeys[0]) return await interaction.editReply(localeManager.getString('commands.ai.model-info.no_api_key'))
                    allKeys[0].forEach(key => {
                        keys.push({key, timeoutDuration: 60_000});
                    })
                    const keyManager = new ApikeyManager(keys);
                    info = await keyManager.call(getModelInfo);
                } else {
                    if (!interaction.client.keyManager) {
                        return await interaction.editReply({
                            content: localeManager.getString('commands.ai.model-info.ai_unavailable'),
                            flags: MessageFlags.Ephemeral
                        });
                    }
                    info = await interaction.client.keyManager.call(getModelInfo);
                }

                if (info.err) return await interaction.reply({ content: info.text, flags: MessageFlags.Ephemeral });

                const embed = createGeminiModelEmbed(info);
                await interaction.reply({embeds: [embed]});

                async function getModelInfo(key) {
                    const ai = new GoogleGenAI({ apiKey: key });
                    if (!checkApiKey(key)) {
                        db.deleteToken(userId, key);
                        const stats = db.getUserStats(userId);
                        if (stats.tokens < 1) db.deleteUserConfig(userId);
                        return { text: localeManager.getString('commands.ai.model-info.invalid_api_key_deleting') };
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
                await interaction.reply({content: localeManager.getString('commands.ai.subcommand_not_found'), flags: MessageFlags.Ephemeral})
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

/**
 * Карта кратких описаний для поддерживаемых действий Gemini API.
 * Можно расширять по мере необходимости.
 */
const actionDescriptions = {
    generateContent: localeManager.getString('gemini_actions.generateContent'),
    countTokens: localeManager.getString('gemini_actions.countTokens'),
    createCachedContent: localeManager.getString('gemini_actions.createCachedContent'),
    batchGenerateContent: localeManager.getString('gemini_actions.batchGenerateContent'),
    streamGenerateContent: localeManager.getString('gemini_actions.streamGenerateContent'),
    functionCalling: localeManager.getString('gemini_actions.functionCalling'),
    codeExecution: localeManager.getString('gemini_actions.codeExecution'),
    structuredOutputs: localeManager.getString('gemini_actions.structuredOutputs'),
    multimodalUnderstanding: localeManager.getString('gemini_actions.multimodalUnderstanding'),
    liveApi: localeManager.getString('gemini_actions.liveApi'),
    fineTuning: localeManager.getString('gemini_actions.fineTuning'),
    embeddings: localeManager.getString('gemini_actions.embeddings'),
};

/**
 * Создает Discord Embed из информации о модели Gemini.
 *
 * @param {GeminiModelInfo} info Объект с информацией о модели Gemini.
 * @returns {EmbedBuilder} Объект EmbedBuilder для Discord.js.
 */
function createGeminiModelEmbed(info) {
    const supportedActionsText = info.supportedActions
        .map(action => {
            const description = actionDescriptions[action] || localeManager.getString('gemini_actions.unknown_action', { action: action });
            return `• **${action}**: ${description}`;
        })
        .join('\n');

    const embed = new EmbedBuilder()
        .setColor("DarkButNotBlack") // Или любой другой цвет, например, 0x0099FF
        .setTitle(info.displayName || localeManager.getString('gemini_actions.unknown_model'))
        .setDescription(localeManager.getString('gemini_actions.description_prefix', { description: info.description || localeManager.getString('gemini_actions.no_description') }))
        .addFields(
            { name: localeManager.getString('gemini_actions.model_id_field'), value: `\`${info.name}\``, inline: true },
            { name: localeManager.getString('gemini_actions.version_field'), value: `\`${info.version}\``, inline: true },
            { name: localeManager.getString('gemini_actions.input_token_limit_field'), value: localeManager.getString('gemini_actions.tokens_value', { count: info.inputTokenLimit.toLocaleString() }), inline: true },
            { name: localeManager.getString('gemini_actions.output_token_limit_field'), value: localeManager.getString('gemini_actions.tokens_value', { count: info.outputTokenLimit.toLocaleString() }), inline: true },
            { name: localeManager.getString('gemini_actions.supported_actions_field'), value: supportedActionsText || localeManager.getString('gemini_actions.no_actions_specified') }
        );

    return embed;
}