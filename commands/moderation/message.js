const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

const data = new SlashCommandBuilder()
    .setName(localeManager.getString('commands.message.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.name'))
    .setDescription(localeManager.getString('commands.message.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.description'))

    .addSubcommand(subcommand =>
        subcommand.setName(localeManager.getString('commands.message.options.clear.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.clear.name'))
        .setDescription(localeManager.getString('commands.message.options.clear.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.clear.description'))
        .addIntegerOption(option => 
            option.setName(localeManager.getString('commands.message.options.clear.options.amount.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.clear.options.amount.name'))
                .setDescription(localeManager.getString('commands.message.options.clear.options.amount.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.clear.options.amount.description'))
                
                .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

    .addSubcommand(subcommand =>
        subcommand.setName(localeManager.getString('commands.message.options.pin.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.pin.name'))
        .setDescription(localeManager.getString('commands.message.options.pin.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.pin.description'))
        .addStringOption(option => 
            option.setName(localeManager.getString('commands.message.options.pin.options.id.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.pin.options.id.name'))
            .setDescription(localeManager.getString('commands.message.options.pin.options.id.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.pin.options.id.description'))
            
            .setRequired(true)))

    .addSubcommand(subcommand =>
        subcommand.setName(localeManager.getString('commands.message.options.unpin.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.unpin.name'))
        .setDescription(localeManager.getString('commands.message.options.unpin.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.unpin.description'))
        .addStringOption(option =>
            option.setName(localeManager.getString('commands.message.options.unpin.options.id.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.unpin.options.id.name'))
            .setDescription(localeManager.getString('commands.message.options.unpin.options.id.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.unpin.options.id.description'))
            
            .setRequired(true)))

    .addSubcommand(subcommand => 
        subcommand.setName(localeManager.getString('commands.message.options.purge.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.purge.name'))
        .setDescription(localeManager.getString('commands.message.options.purge.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.purge.description'))
        .addUserOption(option =>
          option.setName(localeManager.getString('commands.message.options.purge.options.target.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.purge.options.target.name'))
            .setDescription(localeManager.getString('commands.message.options.purge.options.target.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.purge.options.target.description'))
            
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName(localeManager.getString('commands.message.options.purge.options.amount.name')).setNameLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.purge.options.amount.name'))
            .setDescription(localeManager.getString('commands.message.options.purge.options.amount.description')).setDescriptionLocalizations(localeManager.getAllCommandLocalizations('commands.message.options.purge.options.amount.description'))
            
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    ).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

    module.exports = {
        cooldown: 3,
        data,
        async execute(interaction) {
            if (!(interaction.memberPermissions.has('ManageMessages') || interaction.memberPermissions.has('Administrator'))) {
                await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                return;
            }
            switch (interaction.options.getSubcommand()) {
                case "clear": {
                    const amount = interaction.options.getInteger('amount');

                    if (amount < 1 || amount > 100) {
                        return await interaction.reply({ content: 'Укажи количество сообщений от 1 до 100.', flags: MessageFlags.Ephemeral });
                    }
            
                    const channel = interaction.channel;
            
                    try {
                        const messages = await channel.messages.fetch({ limit: amount });
                        const userMessages = messages.filter(msg => !msg.author.bot);
            
                        if (userMessages.size === 0) {
                            return await interaction.reply({ content: 'Нет сообщений для удаления.', flags: MessageFlags.Ephemeral });
                        }
            
                        await channel.bulkDelete(userMessages, true);
            
                        const reply = await interaction.reply({ content: `Удалено ${userMessages.size} сообщений.`, flags: MessageFlags.Ephemeral });
            
                        setTimeout(async () => {
                            await reply.delete().catch(() => {});
                        }, 5000);
                    } catch (error) {
                        console.error(`[ERROR] Clear command: ${error}`);
                        await interaction.reply({ content: 'Произошла ошибка при удалении сообщений.', flags: MessageFlags.Ephemeral });
                    }
                    break;
                }

                case "pin": {
                    if(!interaction.member.permissions.has("ManageMessages", true)) return await interaction.reply({content: 'Недостаточно прав для действия', flags: MessageFlags.Ephemeral});
                    const message = interaction.options.getString('id');
                    if (isNaN(Number(message))) return await interaction.reply({content: '\`id\` не является числом!', flags: MessageFlags.Ephemeral});

                    //надо это поправить
                    //if (!await interaction.channel.messages.fetch(message)) return await interaction.reply({content: 'Сообщение не найдено!', flags: MessageFlags.Ephemeral});
                    await interaction.channel.messages.pin(message);
                    await interaction.reply(`Сообщение было закрепленно ||вы потратили ~3 секунды просто так!!1||`);
                    break;
                }

                case "unpin": {
                    if(!await interaction.member.permissions.has("ManageMessages", true)) return await interaction.reply({content: 'Недостаточно прав для действия', flags: MessageFlags.Ephemeral});
                    const message = interaction.options.getString('id');
                    if (isNaN(Number(message))) return await interaction.reply({content: '\`id\` не является числом!', flags: MessageFlags.Ephemeral});

                    //надо это поправить
                    //if (!await interaction.channel.messages.fetch(message)) return await interaction.reply({content: 'Сообщение не найдено!', flags: MessageFlags.Ephemeral});
                    await interaction.channel.messages.unpin(message);
                    await interaction.reply(`Сообщение было открепленно ||вы потратили ~3 секунды просто так!!1||`);
                    break;
                }

                case "purge": {
                    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) return await interaction.reply({content: 'Недостаточно прав для действия', flags: MessageFlags.Ephemeral});
                  
                      const target = interaction.options.getUser('target', true);
                      const amount = interaction.options.getInteger('amount', true);
                      const channel = interaction.channel;
                  
                      try {
                        // Получаем последние 100 сообщений в канале
                        const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                        // Фильтруем сообщения, оставляем только от указанного пользователя
                        const targetMessages = fetchedMessages.filter(msg => msg.author.id === target.id);
                        const messagesToDelete = targetMessages.first(amount);
                  
                        if (!messagesToDelete || messagesToDelete.length === 0) {
                          await interaction.reply({
                            content: `Не найдено сообщений от ${target} среди последних 100 сообщений.`,
                            flags: MessageFlags.Ephemeral
                          });
                          return;
                        }
                  
                        await channel.bulkDelete(messagesToDelete, true);
                        
                        const embed = new EmbedBuilder()
                          .setColor(0xFF0000)
                          .setTitle("Очистка сообщений")
                          .addFields(
                            { name: "Модератор", value: `<@${interaction.user.id}>`, inline: true },
                            { name: "Пользователь", value: `<@${target.id}>`, inline: true },
                            { name: "Канал", value: `<#${channel.id}>`, inline: true },
                            { name: "Удалено сообщений", value: `${messagesToDelete.length}`, inline: true }
                          )
                          .setFooter({ text: "Очистка завершена", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                          .setTimestamp();
                  
                        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                      } catch (error) {
                        console.error('Ошибка при очистке сообщений:', error);
                        await interaction.reply({ content: "Произошла ошибка при попытке удалить сообщения.", flags: MessageFlags.Ephemeral });
                      }
                    break;
                }
                    
                default:
                    await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                    break;
            }
        }
    }
