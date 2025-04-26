const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
		.setName('guild')
		.setDescription('guild admin command')
        .addSubcommand(subcommand =>
            subcommand.setName('invites')
            .setDescription('on/off invites')
            .addBooleanOption(option =>
                option.setName('value')
                .setDescription('true - off | false - on')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName('banner')
            .setDescription('set server banner')
            .addAttachmentOption(option =>
                option.setName('image')
                .setDescription('set image for server banner')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName('icon')
            .setDescription('set server icon')
            .addAttachmentOption(option =>
                option.setName('image')
                .setDescription('set image for server icon')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName('contentfilterlevel')
            .setDescription('set Content Filter Level')
            .addStringOption(option =>
                option.setName('value')
                .setDescription('choice Content Filter Level')
                .addChoices(
                    { name: 'Disabled', value: '0' },
                    { name: 'No role user', value: '1' },
                    { name: 'All member', value: '2' },
                )
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand.setName('name')
            .setDescription('set server name')
            .addStringOption(option =>
                option.setName('text')
                .setDescription('set server name')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName('rulechannel')
            .setDescription('set rule channel')
            .addChannelOption(option =>
                option.setName('input')
                .setDescription('Choice channel for rule')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName('safetyalerts')
            .setDescription('set safety alerts channel')
            .addChannelOption(option =>
                option.setName('input')
                .setDescription('set channel')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName('systemchannel')
            .setDescription('set system channel')
            .addChannelOption(option =>
                option.setName('input')
                .setDescription('set channel')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand.setName('verificationlevel')
            .setDescription('Edits the verification level of the guild.')
            .addNumberOption(option =>
                option.setName('input')
                .setDescription('set level. 0 - none, 4 - very high')
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
                            if (invite === true) {
                                await interaction.reply(`Приглашения на этот сервер приостановлены`);
                            } else if (invite === false) {
                                await interaction.reply(`Приглашения на этот сервер возобновлены`);
                            }
                        } catch (error) {
                            await interaction.reply({ content: `Что-то пошло не так. ошибка:\n${error.message}`, flags: MessageFlags.Ephemeral });
                            console.error(error);
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
                                console.log(error);
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
                            console.log(error);
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
                        console.log(error);
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
                            console.log(error);
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
                            console.log(error);
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
                            console.log(error);
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
                            console.log(error);
                        }
                        break;
                    }

                    default:
                        await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                        break;
                }
        }
    }