const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly')
const { privateAccess, bot_log_channel } = require('../../config.json');

const GeminiDB = require('../../functions/db/gemini_settings')
const db = new GeminiDB('./database/geminiDB.db')

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Действия с ai')
    .addSubcommand(sub => 
        sub.setName('ask')
        .setDescription('Спросить gemini о чём-либо')
        .addStringOption(opt => 
            opt.setName('promt')
            .setDescription('Запрос к gemini')
            .setMaxLength(2000)
            .setRequired(true)
        )
    ).setContexts(0,1,2)
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
            .setMinValue(0.0)
        )
        .addIntegerOption(opt =>
            opt.setName('top_k')
            .setDescription('"Словарный запас" при генерации токена. 1-5 - маленький, 50+ - разнообразный')
            .setMaxValue(100)
            .setMinValue(1)
        )
        .addIntegerOption(opt =>
            opt.setName('history_limit')
            .setDescription('Лимит сохранения истории. 0 - без сохранения')
            .setMaxValue(500)
            .setMinValue(0)
        )
    )
,
    async execute(interaction) {
        if (!privateAccess.includes(interaction.user.id)) return await interaction.reply({ content: `Вы не можете использовать эту команду`, flags: MessageFlags.Ephemeral});
        if (!interaction.client.gemini) {
            return await interaction.reply({
                content: 'Функционал ИИ недоступен, так как client.gemini пуст.',
                flags: MessageFlags.Ephemeral
            });
        }

        const promt = interaction.options.getString('promt');
        const config = db.getUserConfig(interaction.user.id)
        const SS = db.getSafetySettings(interaction.user.id)

        switch (interaction.options.getSubcommand()) {
            case "ask": {
                if (!config) return await interaction.reply({ content: "Кажется, вас ещё нет в базе данных.", flags: MessageFlags.Ephemeral });
                await interaction.deferReply();
                try {
                    console.log(config)
                    const response = await interaction.client.gemini.models.generateContent({
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
                    })
                    if (interaction.guild) await interaction.channel.sendTyping()
                   
                    const reply = response.text || response.candidates[0].content || `Кажется... ai не ответила. Причина: [${response.candidates[0].finishReason}](<https://google.com/search?q=ai+returned+a+${response.candidates[0].finishReason}+response.+what+to+do>)`;
                
                    if (String(reply).length >= 1990) {
                        const splited = splitStringByLength(String(reply), 1990);
                        await interaction.editReply(part);
                        for (const part of splited) {
                            await interaction.followUp(part);
                            await new Promise(resolve => setTimeout(resolve, 300)); 
                        }
                    }

                    await interaction.editReply(reply);
                } catch (error) {
                    await interaction.editReply(`ъ\n\`\`\`txt\n${error}\`\`\``)  
                    const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Произошла ошибка при обработке команды`)
            .addFields(
                { name: `Команда`, value: `${interaction.commandName}` },
                { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack ? error.stack.substring(0, 500) : ''}\`\`\`` }
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
                { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack ? error.stack.substring(0, 500) : ''}\`\`\`` }
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
                { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack ? error.stack.substring(0, 500) : ''}\`\`\`` }
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
                const embed = new EmbedBuilder()
                .setAuthor({ iconURL: interaction.user.displayAvatarURL({extension: "png"}), name: interaction.user.displayName })
                .setColor("Random")
                .setTitle('Ваши настройки gemini')
                .setDescription(`Системные инструкции(system_instructions): ${config.system_instructions || "Пусто"}\n\nНастройки безопасности:\n\`\`\`json\n${JSON.stringify(SS, null, 2)}\`\`\`\n`)
                .setFields(
                    { name: "Модель(model)", value: config.model, inline: true },
                    { name: "Максимум токенов на ответ(max_output_tokens)", value: `${config.max_output_tokens}`, inline: true },
                    { name: "Температура ответов(temperature)", value: `${config.temperature}`, inline: true },
                    { name: "top_k", value: `${config.top_k}`, inline: true },
                    { name: "top_p", value: `${config.top_p}`, inline: true },
                    { name: "Лимит сохранения истории(history_limit)", value: `${config.history_limit}`, inline: true }
                )
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
                break;
            }
            case "edit": {
                if (!config) return await interaction.reply({ content: "Кажется, вас ещё нет в базе данных.", flags: MessageFlags.Ephemeral });
                let changes = {
                    model: interaction.options.getString('model') || config.model,
                    system_instructions: interaction.options.getString('system_instructions') || config.system_instructions,
                    max_output_tokens: interaction.options.getInteger('max_output_tokens') || config.max_output_tokens,
                    temperature: interaction.options.getNumber('temperature') || config.temperature,
                    top_p: interaction.options.getNumber('top_p') || config.top_p,
                    top_k: interaction.options.getInteger('top_k') || config.top_k,
                    history_limit: interaction.options.getString('history_limit') || config.history_limit
                }
                const result = db.updateUserConfig(interaction.user.id, changes);
                const reply = result.changes > 0 ? "Настройки были обновленны." : "Настройки не изменились"
                await interaction.reply({ content: reply, flags: MessageFlags.Ephemeral })
                break;
            }
        
            default:
                await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                break;
        }
    }  
}

function splitStringByLength(str, maxLength) {
    const parts = [];
    if (!str) {
      return parts;
    }
    for (let i = 0; i < str.length; i += maxLength) {
      parts.push(str.substring(i, i + maxLength));
    }
    return parts;
  }