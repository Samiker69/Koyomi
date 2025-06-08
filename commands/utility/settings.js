const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js'); // Добавил EmbedBuilder
const settings = require('../../functions/db/settings');
const { bot_log_channel } = require('../../config.json');

const Sdb = new settings('./database/settings.db');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Изменить настройки бота')
        .addSubcommand(subcommand =>
            subcommand.setName('welcomechannel')
                .setDescription('Канал для уведомления о новых участниках')
                .addChannelOption(option => option.setName('channel').setDescription('Канал').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName('invite-logger-channel')
                .setDescription('Канал для логирования ссылок приглашений')
                .addChannelOption(option => option.setName('channel').setDescription('Канал').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName('allowlogging')
                .setDescription('Отправлять сообщения об использованной ссылке?')
                .addBooleanOption(option => option.setName('bool').setDescription('включить/выключить').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName('allow-membersadd-logging')
                .setDescription('Отправлять сообщения о новых/ушедших участниках')
                .addBooleanOption(option => option.setName('bool').setDescription('включить/выключить').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName('set-voice-category')
                .setDescription('Установить категорию для новых войс-каналов')
                .addChannelOption(option => option.setName('category').setDescription('Категория').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName('set-main-voice')
                .setDescription('Установить основной голосовой канал для создания комнат')
                .addChannelOption(option => option.setName('channel').setDescription('Основной войс').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName("support-channel")
                .setDescription('Задаёт канал поддержки')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription("Канал/форум поддержки")
                        .setRequired(true)
                )
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        // --- НОВАЯ ПОДКОМАНДА ДЛЯ ЛОГИРОВАНИЯ ВЕБХУКОВ ---
        .addSubcommandGroup(group =>
            group.setName('logging-webhook')
                .setDescription('Настройки вебхука для логов удаления/изменения сообщений')
                .addSubcommand(subcommand =>
                    subcommand.setName('set-channel')
                        .setDescription('Установить канал для вебхука логирования.')
                        .addChannelOption(option =>
                            option.setName('channel')
                                .setDescription('Текстовый канал для вебхука')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand.setName('toggle-enabled')
                        .setDescription('Включить/выключить использование вебхука для логирования.')
                        .addBooleanOption(option =>
                            option.setName('enabled')
                                .setDescription('Включить (True) или выключить (False) вебхук')
                                .setRequired(true)
                        )
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        // --- КОНЕЦ НОВОЙ ПОДКОМАНДЫ ---

        .addSubcommand(subcommand =>
            subcommand.setName('to-default')
                .setDescription('Безвозвратно сбрасывает настройки сервера')
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        if (!(interaction.memberPermissions.has('ManageGuild') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const subcommandGroup = interaction.options.getSubcommandGroup();
        const channel = interaction.options.getChannel('channel');
        const category = interaction.options.getChannel('category');
        const bool = interaction.options.getBoolean('bool');
        const enabled = interaction.options.getBoolean('enabled'); // Для новой опции вебхука

        // Функция для отправки ошибки (чтобы избежать дублирования кода)
        const sendErrorEmbed = async (error) => {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(`Произошла ошибка при обработке команды`)
                .addFields(
                    { name: `Команда`, value: `${interaction.commandName}` },
                    { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                )
                .setTimestamp(new Date());
            console.error(error);
            try {
                const logChannel = await interaction.client.channels.fetch(bot_log_channel);
                await logChannel.send({ embeds: [errorEmbed] });
            } catch (logError) {
                console.error("Не удалось отправить ошибку в канал логов бота:", logError);
            }
            await interaction.reply({ content: 'Не удалось изменить параметр.', ephemeral: true });
        };


        if (subcommandGroup === 'logging-webhook') {
            try {
                const data = Sdb.getSettings(interaction.guild.id);
                switch (subcommand) {
                    case 'set-channel':
                        if (!channel.isTextBased()) {
                            await interaction.reply({ content: 'Канал вебхука должен быть текстовым!', ephemeral: true });
                            return;
                        }
                        // Проверяем, есть ли у бота права создавать вебхуки в этом канале
                        if (!channel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.ManageWebhooks)) {
                            await interaction.reply({ content: `У меня нет прав на создание вебхуков в канале ${channel}! Пожалуйста, выдайте мне разрешение "Управление вебхуками".`, ephemeral: true });
                            return;
                        }
                        // Если уже есть вебхук для этого бота в этом канале, обновляем его
                        const existingWebhooks = await channel.fetchWebhooks();
                        let botWebhook = existingWebhooks.find(wh => wh.owner.id === interaction.client.user.id);

                        if (!botWebhook) {
                            // Создаем новый вебхук, если его нет
                            botWebhook = await channel.createWebhook({
                                name: `${interaction.client.user.username} Log Webhook`,
                                avatar: interaction.client.user.displayAvatarURL(),
                                reason: 'Вебхук для логирования удаленных/измененных сообщений'
                            });
                        } else {
                            await botWebhook.edit({ channel: channel.id, reason: 'Обновление канала вебхука логирования' });
                        }

                        Sdb.updateSetting(interaction.guild.id, 'webhookLogId', botWebhook.id);
                        Sdb.updateSetting(interaction.guild.id, 'webhookLogToken', botWebhook.token);
                        Sdb.updateSetting(interaction.guild.id, 'webhookLogChannelId', channel.id);
                        await interaction.reply(`Вебхук для логирования установлен в канал ${channel}.`);
                        break;

                    case 'toggle-enabled':
                        if (data.webhookLogId && data.webhookLogToken) {
                            if (data.enableWebhookLogging === enabled) {
                                return await interaction.reply({ content: 'Этот параметр уже установлен на ' + enabled, ephemeral: true });
                            }
                            Sdb.updateSetting(interaction.guild.id, 'enableWebhookLogging', enabled);
                            await interaction.reply(`Использование вебхука для логирования: **${enabled ? 'Включено' : 'Выключено'}**.`);
                        } else {
                            await interaction.reply({ content: 'Сначала нужно настроить канал для вебхука с помощью `/settings logging-webhook set-channel`!', ephemeral: true });
                        }
                        break;
                }
            } catch (error) {
                await sendErrorEmbed(error);
            }
            return;
        }

        switch (subcommand) {
            case "welcomechannel":
                try {
                    Sdb.updateSetting(interaction.guild.id, 'newMemberChannelId', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания участников`);
                } catch (error) {
                    await sendErrorEmbed(error);
                }
                break;

            case 'invite-logger-channel':
                try {
                    Sdb.updateSetting(interaction.guild.id, 'inviteLoggerChannel', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как канал для отслеживания приглашений`);
                } catch (error) {
                    await sendErrorEmbed(error);
                }
                break;

            case 'allowlogging':
                try {
                    const data = Sdb.getSettings(interaction.guild.id)
                    if (data.allowInviteLogging === bool) return await interaction.reply({ content: 'Этот параметр уже установлен на ' + bool, ephemeral: true });
                    let answerLog;
                    Sdb.updateSetting(interaction.guild.id, 'allowInviteLogging', bool);
                    if (bool) { answerLog = 'Теперь бот будет уведомлять об использованной ссылке-приглашения'; }
                    else { answerLog = 'Теперь бот не будет уведомлять об использованной ссылке-приглашения'; }
                    await interaction.reply(answerLog);
                } catch (error) {
                    await sendErrorEmbed(error);
                }
                break;

            case 'allow-membersadd-logging':
                try {
                    const data = Sdb.getSettings(interaction.guild.id)
                    if (data.allowLogingMembersAdd === bool) return await interaction.reply({ content: 'Этот параметр уже установлен на ' + bool, ephemeral: true });
                    const answerMemberLog = bool ? "Теперь бот будет уведомлять о новых/ушедших участниках" : 'Теперь бот не будет уведомлять о новых/ушедших участниках'
                    Sdb.updateSetting(interaction.guild.id, 'allowLogingMembersAdd', bool);
                    await interaction.reply(answerMemberLog);
                } catch (error) {
                    await sendErrorEmbed(error);
                }
                break;

            case 'set-voice-category':
                try {
                    if (category.type !== 4) return await interaction.reply({ content: 'Выберите именно категорию!', ephemeral: true });
                    Sdb.updateSetting(interaction.guild.id, 'voiceCategoryId', category.id);
                    await interaction.reply(`Теперь ${category} выбрана как категория для новых войс-каналов`);
                } catch (error) {
                    await sendErrorEmbed(error);
                }
                break;

            case 'set-main-voice':
                try {
                    if (channel.type !== 2) return await interaction.reply({ content: 'Выберите именно голосовой канал!', ephemeral: true });
                    Sdb.updateSetting(interaction.guild.id, 'mainVoiceChannelId', channel.id);
                    await interaction.reply(`Теперь ${channel} выбран как основной голосовой канал для создания комнат`);
                } catch (error) {
                    await sendErrorEmbed(error);
                }
                break;
            case "to-default": {
                //todo: должно вылезти подтверждение выполнения действия
                const Promise = Sdb.removeServer(interaction.guild.id)
                if (Promise) {
                    Sdb.addServer(interaction.guild.id)
                    await interaction.reply('Настройки сервера были сброшены!')
                } else {
                    await interaction.reply('Ничего не произошло, возможно, вашего сервера ещё не было в бд.')
                }
                break;
            }
            case "support-channel": {
                Sdb.updateSetting(interaction.guild.id, "supportChannelId", channel.id)
                await interaction.reply(`Канал поддержки изменён на ${channel}`);
                break;
            }

            default:
                await interaction.reply({ content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral })
                break;
        }
    }
};