const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField, MessageFlags } = require('discord.js');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

const data = new SlashCommandBuilder()
        .setName(localeManager.getString('commands.user.name'))
        .setDescription(localeManager.getString('commands.user.description'))
        .addSubcommand(subcommand=>
            subcommand.setName(localeManager.getString('commands.user.voice.name'))
            .setDescription(localeManager.getString('commands.user.voice.description'))
            .addUserOption(option => option.setName(localeManager.getString('commands.user.voice.target.name')).setDescription(localeManager.getString('commands.user.voice.target.description')))
            .addChannelOption(option => option.setName(localeManager.getString('commands.user.voice.channel.name')).setDescription(localeManager.getString('commands.user.voice.channel.description')))
            .addBooleanOption(option => option.setName(localeManager.getString('commands.user.voice.deaf.name')).setDescription(localeManager.getString('commands.user.voice.deaf.description')))
            .addBooleanOption(option => option.setName(localeManager.getString('commands.user.voice.mute.name')).setDescription(localeManager.getString('commands.user.voice.mute.description')))
            .addBooleanOption(option => 
                option.setName(localeManager.getString('commands.user.voice.kick.name'))
                .setDescription(localeManager.getString('commands.user.voice.kick.description'))
            )
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        .addSubcommand(subcommand=>subcommand.setName(localeManager.getString('commands.user.addrole.name')).setDescription(localeManager.getString('commands.user.addrole.description'))
            .addUserOption(option => option.setName(localeManager.getString('commands.user.addrole.target.name')).setDescription(localeManager.getString('commands.user.addrole.target.description')).setRequired(true))
            .addRoleOption(option => option.setName(localeManager.getString('commands.user.addrole.role.name')).setDescription(localeManager.getString('commands.user.addrole.role.description')).setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand=>subcommand.setName(localeManager.getString('commands.user.removerole.name')).setDescription(localeManager.getString('commands.user.removerole.description'))
            .addUserOption(option => option.setName(localeManager.getString('commands.user.removerole.target.name')).setDescription(localeManager.getString('commands.user.removerole.target.description')).setRequired(true))
            .addRoleOption(option => option.setName(localeManager.getString('commands.user.removerole.role.name')).setDescription(localeManager.getString('commands.user.removerole.role.description')).setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)


        module.exports = {
            data,
            cooldown: 5,
            async execute(interaction) {
                if (!(interaction.memberPermissions.has('ManageMembers') || interaction.memberPermissions.has('Administrator'))) {
                    await interaction.reply({ content: localeManager.getString('commands.user.no_permissions'), flags: MessageFlags.Ephemeral });
                    return;
                }
                switch (interaction.options.getSubcommand()) {
                    case "voice": {
                        const member = interaction.options.getMember("target");
                        const channel = interaction.options.getChannel("channel");
                        const deaf = interaction.options.getBoolean("deaf") | member.voice.selfDeaf;
                        const mute = interaction.options.getBoolean("mute") | member.voice.selfMute;
                        const kick = interaction.options.getBoolean("kick") | null;

                        if (!await interaction.member.permissions.has([PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers])) return await interaction.reply({content: localeManager.getString('commands.user.voice.not_enough_permissions'), flags: MessageFlags.Ephemeral});  

                        if (!member.voice.channel) return await interaction.reply({ content: localeManager.getString('commands.user.voice.not_in_voice_channel'), flags: MessageFlags.Ephemeral });

                        if (!channel && kick) {
                            let text = localeManager.getString('commands.user.voice.kicked_from_voice', { member: member.toString(), channel: member.voice.channel.toString() });
                            if (deaf) text += localeManager.getString('commands.user.voice.deafened');
                            if (mute) text += localeManager.getString('commands.user.voice.muted');
                            await interaction.guild.members.edit(member, {channel: channel, deaf: deaf, mute: mute});
                            await interaction.reply({content: text});

                        } else if (channel && !kick) {
                            let text = localeManager.getString('commands.user.voice.moved_to_channel', { member: member.toString(), oldChannel: member.voice.channel.toString(), newChannel: channel.toString() });
                            if (deaf) text += localeManager.getString('commands.user.voice.deafened');
                            if (mute) text += localeManager.getString('commands.user.voice.muted');
                            await interaction.guild.members.edit(member, {channel: channel, deaf: deaf, mute: mute});
                            await interaction.reply({content: text});

                        } else if (!channel && !kick && (deaf || mute)) {
                            let text = localeManager.getString('commands.user.voice.changed_member', { member: member.toString() });
                            if (deaf) text += localeManager.getString('commands.user.voice.deafened'); else text += localeManager.getString('commands.user.voice.undeafened');
                            if (mute) text += localeManager.getString('commands.user.voice.muted'); else text += localeManager.getString('commands.user.voice.unmuted');
                            await interaction.guild.members.edit(member, { deaf: deaf, mute: mute });
                            await interaction.reply({content: text});

                        } else {
                            await interaction.reply({
                                content: localeManager.getString('commands.user.voice.nothing_happened_debug', {
                                    channel: channel,
                                    kick: kick,
                                    member: member.toString(),
                                    deaf: deaf,
                                    mute: mute,
                                    voiceChannel: member.voice.channel.toString()
                                }), 
                                flags: MessageFlags.Ephemeral});
                        }



                        break;
                    }
                    
                    case "addrole": {
                        const member = interaction.options.getMember("target");
                        const role = interaction.options.getRole("role");
        
                        if (!member) return await interaction.reply({content: localeManager.getString('commands.user.invalid_member'), flags: MessageFlags.Ephemeral})
                        //check role pos
                        if (await interaction.guild.roles.comparePositions(role, await interaction.guild.members.me.roles.highest) >= 0) return await interaction.reply({content: localeManager.getString('commands.user.role_position_too_low_bot'), flags: MessageFlags.Ephemeral});
                        if (await interaction.guild.roles.comparePositions(await interaction.member.roles.highest, role) < 0) return await interaction.reply({content: localeManager.getString('commands.user.role_position_too_low_user'), flags: MessageFlags.Ephemeral});
        
                        await member.roles.add(role);
                        await interaction.reply(localeManager.getString('commands.user.role_added', { roleName: role.name, member: member.toString(), username: member.user.username }));
                        break;
                    }
                
                    case "removerole": {
                        const member = interaction.options.getMember("target");
                        const role = interaction.options.getRole("role");
        
                        if (!member) return await interaction.reply({content: localeManager.getString('commands.user.invalid_member'), flags: MessageFlags.Ephemeral})
                        //check role pos
                        if (await interaction.guild.roles.comparePositions(role, await interaction.guild.members.me.roles.highest) >= 0) return await interaction.reply({content: localeManager.getString('commands.user.role_position_too_low_bot'), flags: MessageFlags.Ephemeral});
                        if (await interaction.guild.roles.comparePositions(await interaction.member.roles.highest, role) < 0) return await interaction.reply({content: localeManager.getString('commands.user.role_position_too_low_user'), flags: MessageFlags.Ephemeral});
        
                        await member.roles.remove(role);
                        await interaction.reply(localeManager.getString('commands.user.role_removed', { roleName: role.name, member: member.toString(), username: member.user.username }));
                        break;
                    }
                    default:
                        await interaction.reply({content: localeManager.getString('commands.user.subcommand_not_found'), flags: MessageFlags.Ephemeral})
                        break;
                }
        }
    }