const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { bot_log_channel } = require('../../config.json');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

const data = new SlashCommandBuilder()
		.setName(localeManager.getString('commands.guild.name'))
		.setDescription(localeManager.getString('commands.guild.description'))
        
        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.guild.options.invites.name'))
            .setDescription(localeManager.getString('commands.guild.options.invites.description'))
            
            .addBooleanOption(option =>
                option.setName(localeManager.getString('commands.guild.options.invites.options.value.name'))
                .setDescription(localeManager.getString('commands.guild.options.invites.options.value.description'))
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.guild.options.banner.name'))
            .setDescription(localeManager.getString('commands.guild.options.banner.description'))
            
            .addAttachmentOption(option =>
                option.setName(localeManager.getString('commands.guild.options.banner.options.image.name'))
                .setDescription(localeManager.getString('commands.guild.options.banner.options.image.description'))
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.guild.options.icon.name'))
            .setDescription(localeManager.getString('commands.guild.options.icon.description'))
            
            .addAttachmentOption(option =>
                option.setName(localeManager.getString('commands.guild.options.icon.options.image.name'))
                .setDescription(localeManager.getString('commands.guild.options.icon.options.image.description'))
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.guild.options.contentfilterlevel.name'))
            .setDescription(localeManager.getString('commands.guild.options.contentfilterlevel.description'))
            
            .addStringOption(option =>
                option.setName(localeManager.getString('commands.guild.options.contentfilterlevel.options.value.name'))
                .setDescription(localeManager.getString('commands.guild.options.contentfilterlevel.options.value.description'))
                .addChoices(
                    { name: localeManager.getString('commands.guild.options.contentfilterlevel.options.value.choices.disabled'), value: '0' },
                    { name: localeManager.getString('commands.guild.options.contentfilterlevel.options.value.choices.noroleuser'), value: '1' },
                    { name: localeManager.getString('commands.guild.options.contentfilterlevel.options.value.choices.allmember'), value: '2' },
                )
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.guild.options.name.name'))
            .setDescription(localeManager.getString('commands.guild.options.name.description'))
            
            .addStringOption(option =>
                option.setName(localeManager.getString('commands.guild.options.name.options.text.name'))
                .setDescription(localeManager.getString('commands.guild.options.name.options.text.description'))
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.guild.options.rulechannel.name'))
            .setDescription(localeManager.getString('commands.guild.options.rulechannel.description'))
            
            .addChannelOption(option =>
                option.setName(localeManager.getString('commands.guild.options.rulechannel.options.input.name'))
                .setDescription(localeManager.getString('commands.guild.options.rulechannel.options.input.description'))
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.guild.options.safetyalerts.name'))
            .setDescription(localeManager.getString('commands.guild.options.safetyalerts.description'))
            
            .addChannelOption(option =>
                option.setName(localeManager.getString('commands.guild.options.safetyalerts.options.input.name'))
                .setDescription(localeManager.getString('commands.guild.options.safetyalerts.options.input.description'))
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.guild.options.systemchannel.name'))
            .setDescription(localeManager.getString('commands.guild.options.systemchannel.description'))
            
            .addChannelOption(option =>
                option.setName(localeManager.getString('commands.guild.options.systemchannel.options.input.name'))
                .setDescription(localeManager.getString('commands.guild.options.systemchannel.options.input.description'))
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.guild.options.verificationlevel.name'))
            .setDescription(localeManager.getString('commands.guild.options.verificationlevel.description'))
            
            .addNumberOption(option =>
                option.setName(localeManager.getString('commands.guild.options.verificationlevel.options.input.name'))
                .setDescription(localeManager.getString('commands.guild.options.verificationlevel.options.input.description'))
                .setMaxValue(4)
                .setMinValue(0)
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        module.exports = {
            cooldown: 5,
            data,
            async execute(interaction) {
                if(!await interaction.guild.members.me.permissions.has('ManageGuild', true)) return await interaction.reply({content: 'У меня недостаточно прав для использования этой команды', flags: MessageFlags.Ephemeral});
                switch (interaction.options.getSubcommand()) {
                    case "invites": {
                        if(!await interaction.member.permissions.has('ManageGuild', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                        const invite = interaction.options.getBoolean('value');

                        try {
                            await interaction.guild.disableInvites(invite);
                            if (invite) {
                                await interaction.reply(`Приглашения на этот сервер приостановлены`);
                            } else if (invite) {
                                await interaction.reply(`Приглашения на этот сервер возобновлены`);
                            }
                        } catch (error) {
                            await interaction.reply({ content: `Что-то пошло не так. ошибка:\n${error.message}`, flags: MessageFlags.Ephemeral });
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
            await logChannel.send({ embeds: [errorEmbed] });;
                        }
                        break;
                    }
                    case "banner": {
                        if(!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                        if (interaction.guild.premiumTier >= 2) {
                            const attachment = interaction.options.getAttachment('image');
                            const image = await attachment.url;
        
                            try {
                                await interaction.guild.setBanner(image);
                                await interaction.reply(`Баннер сервера изменён`);
                            } catch (error) {
                                await interaction.reply({ content: `Что-то пошло не так. ошибка:\n${error.message}`, flags: MessageFlags.Ephemeral });
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
            await logChannel.send({ embeds: [errorEmbed] });;
                            }
                        } else {
                            await interaction.reply('Баннер не изменён, потому что сервер не достиг 2 уровня');
                        }
                        break;
                    }
                    case "icon": {
                        if(!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                        const attachment = interaction.options.getAttachment('image');
                        const image = await attachment.url;
    
                        try {
                            await interaction.guild.setIcon(image);
                            await interaction.reply(`Аватар сервера изменён`);
                        } catch (error) {
                            await interaction.reply({ content: `Что-то пошло не так. ошибка:\n${error.message}`, flags: MessageFlags.Ephemeral });
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
            await logChannel.send({ embeds: [errorEmbed] });;
                        }
                        break;
                    }
                    case "contentfilterlevel": {
                        if(!await interaction.member.permissions.has('ManageGuild', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                        const contentfilterlevel = interaction.options.getString('value');
                        try {
                            if (interaction.guild.features.includes("COMMUNITY") && contentfilterlevel < "2") return await interaction.reply('На серверах сообществах нельзя изменить уровень фильтрации!') 
                        if (contentfilterlevel === '0') {
                            await interaction.guild.setExplicitContentFilter(contentfilterlevel);
                            await interaction.reply('Уровень проверки на откровенный контент отключен');
                        } else if (contentfilterlevel === '1') {
                            await interaction.guild.setExplicitContentFilter(contentfilterlevel);
                            await interaction.reply('Уровень проверки на откровенный контент включен только для участников без ролей');
                        } else if (contentfilterlevel === '2') {
                            await interaction.guild.setExplicitContentFilter(contentfilterlevel);
                            await interaction.reply('Уровень проверки на откровенный контент включен для всех участников');
                        }
                    } catch (error) {
                        await interaction.reply({ content: `Что-то пошло не так. ошибка:\n${error.message}`, flags: MessageFlags.Ephemeral });
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
            await logChannel.send({ embeds: [errorEmbed] });;
                    }
                        break;
                    }
                    case "name": {
                        if(!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                        const name = interaction.options.getString('text');

                        try {
                            await interaction.guild.setName(name);
                            await interaction.reply(`Название сервера изменено на \`${name}\``);
                        } catch (error) {
                            await interaction.reply({ content: `Что-то пошло не так. ошибка:\n${error.message}`, flags: MessageFlags.Ephemeral });
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
            await logChannel.send({ embeds: [errorEmbed] });;
                        }
                        break;
                    }
                    case "rulechannel": {
                        if(!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                        if (!interaction.guild.features.includes("COMMUNITY")) return await interaction.reply('На серверах не являющихся сообществом нельзя изменить канал для правил!')
                        const channel = interaction.options.getChannel('input');

                        try {
                            await interaction.guild.setRulesChannel(channel);
                            await interaction.reply(`${channel} выбран как канал для правил`);
                        } catch (error) {
                            await interaction.reply({ content: `Что-то пошло не так. ошибка:\n${error.message}`, flags: MessageFlags.Ephemeral });
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
            await logChannel.send({ embeds: [errorEmbed] });;
                        }
                        break;
                    }
                    case "safetyalerts": {
                        if(!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                        if (!interaction.guild.features.includes("COMMUNITY")) return await interaction.reply('На серверах не являющихся сообществом нельзя изменить канал для оповещений безопастности!')
                        const channel = interaction.options.getChannel('input');

                        try {
                            await interaction.guild.setSafetyAlertsChannel(channel);
                            await interaction.reply(`${channel} выбран как канал для оповещений безопасности`);
                        } catch (error) {
                            await interaction.reply({ content: `Что-то пошло не так. ошибка:\n${error.message}`, flags: MessageFlags.Ephemeral });
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
            await logChannel.send({ embeds: [errorEmbed] });;
                        }
                        break;
                    }
                    case "verificationlevel": {
                        if(!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({content: 'У вас недостаточно прав для данного действия', flags: MessageFlags.Ephemeral});
                        const level = interaction.options.getNumber('input');

                        if (level < '0' || level > '4') return await interaction.reply('Неверное значение!')
    
                        try {
                            await interaction.guild.setVerificationLevel(level);
                            await interaction.reply(`Уровень верификации пользователя установлен на ${level}`);
                        } catch (error) {
                            await interaction.reply({ content: `Что-то пошло не так. ошибка:\n${error.message}`, flags: MessageFlags.Ephemeral });
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
            await logChannel.send({ embeds: [errorEmbed] });;
                        }
                        break;
                    }

                    default:
                        await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                        break;
                }
        }
    }