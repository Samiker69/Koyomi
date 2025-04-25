const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
		.setName('message')
		.setDescription('message mod command')

        .addSubcommand(subcommand =>
            subcommand.setName('clear')
            .setDescription('Удаляет указанное количество сообщений от пользователей')
            .addIntegerOption(option => 
                option.setName('amount')
                    .setDescription('Количество сообщений для удаления (1-100)')
                    .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addSubcommand(subcommand =>
            subcommand.setName('pin')
            .setDescription('Pin the message')
            .addIntegerOption(option => 
                option.setName('id')
                .setDescription('Message id')
                .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addSubcommand(subcommand =>
            subcommand.setName('unpin')
            .setDescription('unpin the message')
            .addIntegerOption(option =>
                option.setName('id')
                .setDescription('Message id')
                .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addSubcommand(subcommand =>
            subcommand.setName('react')
            .setDescription('Adds a reaction to the message')
            .addIntegerOption(option => 
                option.setName('id')
                .setDescription('Message id')
                .setRequired(true))
            .addStringOption(option => 
                option.setName('emoji')
                .setDescription('emoji')
                .setRequired(true)))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    
            module.exports = {
                cooldown: 5,
                data,
                async execute(interaction) {
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
    
                            await interaction.channel.messages.pin(message);
                            await interaction.reply(`Сообщение было закрепленно ||вы потратили ~3 секунды просто так!!1||`);
                            break;
                        }

                        case "unpin": {
                            if(!await interaction.member.permissions.has("ManageMessages", true)) return await interaction.reply({content: 'Недостаточно прав для действия', flags: MessageFlags.Ephemeral});
                            const message = interaction.options.getString('id');
    
                            await interaction.channel.messages.unpin(message);
                            await interaction.reply(`Сообщение было открепленно ||вы потратили ~3 секунды просто так!!1||`);
                            break;
                        }
                            
                        default:
                            await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})

                            break;
                    }
                }
            }
