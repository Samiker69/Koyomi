const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
        .setName('user')
        .setDescription('info about target')
        .addSubcommand(subcommand=>
            subcommand.setName('voice')
            .setDescription('edit a user in the voice channel')
            .addUserOption(option => option.setName('target').setDescription('select a user'))
            .addChannelOption(option => option.setName('channel').setDescription('Moves the member to a different channel'))
            .addBooleanOption(option => option.setName('deaf').setDescription('Deafens/undeafens the member of this voice state.'))
            .addBooleanOption(option => option.setName('mute').setDescription('Mutes/unmutes the member of this voice state.'))
            .addBooleanOption(option => 
                option.setName('kick')
                .setDescription('Кикает участника из войса')
            )
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        .addSubcommand(subcommand=>subcommand.setName('addrole').setDescription('Adds a role (or multiple roles) to the member.')
            .addUserOption(option => option.setName('target').setDescription('select a user').setRequired(true))
            .addRoleOption(option => option.setName('role').setDescription('select a role').setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand=>subcommand.setName('removerole').setDescription('remove a role (or multiple roles) to the member.')
            .addUserOption(option => option.setName('target').setDescription('select a user').setRequired(true))
            .addRoleOption(option => option.setName('role').setDescription('select a role').setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)


        module.exports = {
            data,
            cooldown: 5,
            async execute(interaction) {
                if (!(interaction.memberPermissions.has('ManageMembers') || interaction.memberPermissions.has('Administrator'))) {
                    await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                    return;
                }
                switch (interaction.options.getSubcommand()) {
                    case "voice": {
                        const member = interaction.options.getMember("target");
                        const channel = interaction.options.getChannel("channel");
                        const deaf = interaction.options.getBoolean("deaf") | member.voice.selfDeaf;
                        const mute = interaction.options.getBoolean("mute") | member.voice.selfMute;
                        const kick = interaction.options.getBoolean("kick") | null;

                        if (!await interaction.member.permissions.has([PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers])) return await interaction.reply({content: 'У вас недостаточно прав', flags: MessageFlags.Ephemeral});  

                        if (!member.voice.channel) return await interaction.reply({ content: 'Участник не находится в голосовом канале!', flags: MessageFlags.Ephemeral });

                        if (!channel && kick) {
                            let text = `${member} кикнут из ${member.voice.channel}.`
                            if (deaf) text += `\n+ Выключен звук`;
                            if (mute) text += `\n+ Выключен микрофон`;
                            await interaction.guild.members.edit(member, {channel: channel, deaf: deaf, mute: mute});
                            await interaction.reply({content: text});

                        } else if (channel && !kick) {
                            let text = `${member} перемещён из ${member.voice.channel} в ${channel}.`
                            if (deaf) text += `\n+ Выключен звук`;
                            if (mute) text += `\n+ Выключен микрофон`;
                            await interaction.guild.members.edit(member, {channel: channel, deaf: deaf, mute: mute});
                            await interaction.reply({content: text});

                        } else if (!channel && !kick && (deaf || mute)) {
                            let text = `${member} изменён`
                            if (deaf) text += `\n+ Выключен звук`; else text += '\n +Включен звук';
                            if (mute) text += `\n+ Выключен микрофон`; else text += '\n +Включен микрофон';
                            await interaction.guild.members.edit(member, { deaf: deaf, mute: mute });
                            await interaction.reply({content: text});

                        } else {
                            await interaction.reply({
                                content: `Ничего не произошло. Доп информация:\n`
                                +`канал не выбран и \`kick=true\`?: ${channel} ${kick}. ожидаемое действие, если оба true: исключение ${member}.\n`
                                +`канал выбран и \`kick=false\`?: ${channel} ${kick}. ожидаемое действие, если оба true: перемещение из ${member.voice.channel} в ${channel}.\n`
                                +`канал не выбран и \`kick=false\`, \`deaf\` или \`mute\`= true?: ${channel} ${kick} ${deaf} ${mute}. ожидаемое действие, если хотя бы три = true: мут/размут, выключение/включение звука.\n`
                                +`Если вы ничего не понимаете, сделайте скриншот этого сообщения и отправьте куда-нибудь бог знает куда`, 
                                flags: MessageFlags.Ephemeral});
                        }



                        break;
                    }
                    
                    case "addrole": {
                        const member = interaction.options.getMember("target");
                        const role = interaction.options.getRole("role");
        
                        if (!member) return await interaction.reply({content: 'Неверный участник!', flags: MessageFlags.Ephemeral})
                        //check role pos
                        if (await interaction.guild.roles.comparePositions(role, await interaction.guild.members.me.roles.highest) >= 0) return await interaction.reply({content: 'Моя позиция роли ниже выбранной роли', flags: MessageFlags.Ephemeral});
                        if (await interaction.guild.roles.comparePositions(await interaction.member.roles.highest, role) < 0) return await interaction.reply({content: 'Ваша позиция роли ниже выбранной', flags: MessageFlags.Ephemeral});
        
                        await member.roles.add(role);
                        await interaction.reply(`Роль ${role.name} выдана ${member}(${member.user.username})`);
                        break;
                    }
                
                    case "removerole": {
                        const member = interaction.options.getMember("target");
                        const role = interaction.options.getRole("role");
        
                        if (!member) return await interaction.reply({content: 'Неверный участник!', flags: MessageFlags.Ephemeral})
                        //check role pos
                        if (await interaction.guild.roles.comparePositions(role, await interaction.guild.members.me.roles.highest) >= 0) return await interaction.reply({content: 'Моя позиция роли ниже выбранной роли', flags: MessageFlags.Ephemeral});
                        if (await interaction.guild.roles.comparePositions(await interaction.member.roles.highest, role) < 0) return await interaction.reply({content: 'Ваша позиция роли ниже выбранной', flags: MessageFlags.Ephemeral});
        
                        await member.roles.remove(role);
                        await interaction.reply(`Роль ${role.name} убрана у ${member}(${member.user.username})`);
                        break;
                    }
                    default:
                        await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                        break;
                }
        }
    }