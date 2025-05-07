const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly')
const { privateAccess } = require('../../config.json');

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
                    await interaction.editReply(response.text)                    
                } catch (error) {
                    await interaction.editReply(`ъ\n\`\`\`txt\n${error}\`\`\``)  
                    console.log(error)
                }
                break;
            }

            case "add-user": {
                const user = interaction.options.getUser('user')
                try {
                    db.addUserConfig(user.id)
                    await interaction.reply({ content: `${user} был добавлен в базу данных`, flags: MessageFlags.Ephemeral })
                } catch (error) {
                    console.error(error)
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
                    console.error(error)
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
                .setDescription(`Системные инструкции: ${config.system_instructions || "Пусто"}\n\nНастройки безопасности:\n\`\`\`json\n${JSON.stringify(SS, null, 2)}\`\`\``)
                .setFields(
                    { name: "Модель", value: config.model, inline: true },
                    { name: "Максимум токенов на выходе", value: `${config.max_output_tokens}`, inline: true },
                    { name: "Температура ответов", value: `${config.temperature}`, inline: true },
                    { name: "topK", value: `${config.top_k}`, inline: true },
                    { name: "topP", value: `${config.top_p}`, inline: true }
                )
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
                break;
            }
        
            default:
                await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                break;
        }
    }  
}