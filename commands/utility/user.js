const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField, MessageFlags } = require('discord.js');
const localeManager = require('../../locales/localeManager');

const data = new SlashCommandBuilder()
        .setName('user')
        .setNameLocalizations(localeManager.getLocalizations('utility.user.name'))
        .setDescription(localeManager.get('utility.user.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.description'))
        .addSubcommand(subcommand=>
            subcommand.setName('voice')
            .setNameLocalizations(localeManager.getLocalizations('utility.user.options.voice.name'))
            .setDescription(localeManager.get('utility.user.options.voice.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.voice.description'))
            .addUserOption(option => 
                option.setName('target')
                .setNameLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.target.name'))
                .setDescription(localeManager.get('utility.user.options.voice.options.target.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.target.description'))
            )
            .addChannelOption(option => 
                option.setName('channel')
                .setNameLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.channel.name'))
                .setDescription(localeManager.get('utility.user.options.voice.options.channel.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.channel.description'))
            )
            .addBooleanOption(option => 
                option.setName('deaf')
                .setNameLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.deaf.name'))
                .setDescription(localeManager.get('utility.user.options.voice.options.deaf.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.deaf.description'))
            )
            .addBooleanOption(option => 
                option.setName('mute')
                .setNameLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.mute.name'))
                .setDescription(localeManager.get('utility.user.options.voice.options.mute.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.mute.description'))
            )
            .addBooleanOption(option => 
                option.setName('kick')
                .setNameLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.kick.name'))
                .setDescription(localeManager.get('utility.user.options.voice.options.kick.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.voice.options.kick.description'))
            )
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        .addSubcommand(subcommand=>
            subcommand.setName('addrole')
            .setNameLocalizations(localeManager.getLocalizations('utility.user.options.addrole.name'))
            .setDescription(localeManager.get('utility.user.options.addrole.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.addrole.description'))
            .addUserOption(option => 
                option.setName('target')
                .setNameLocalizations(localeManager.getLocalizations('utility.user.options.addrole.options.target.name'))
                .setDescription(localeManager.get('utility.user.options.addrole.options.target.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.addrole.options.target.description'))
                .setRequired(true)
            )
            .addRoleOption(option => 
                option.setName('role')
                .setNameLocalizations(localeManager.getLocalizations('utility.user.options.addrole.options.role.name'))
                .setDescription(localeManager.get('utility.user.options.addrole.options.role.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.addrole.options.role.description'))
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand=>
            subcommand.setName('removerole')
            .setNameLocalizations(localeManager.getLocalizations('utility.user.options.removerole.name'))
            .setDescription(localeManager.get('utility.user.options.removerole.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.removerole.description'))
            .addUserOption(option => 
                option.setName('target')
                .setNameLocalizations(localeManager.getLocalizations('utility.user.options.removerole.options.target.name'))
                .setDescription(localeManager.get('utility.user.options.removerole.options.target.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.removerole.options.target.description'))
                .setRequired(true)
            )
            .addRoleOption(option => 
                option.setName('role')
                .setNameLocalizations(localeManager.getLocalizations('utility.user.options.removerole.options.role.name'))
                .setDescription(localeManager.get('utility.user.options.removerole.options.role.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('utility.user.options.removerole.options.role.description'))
                .setRequired(true)
            )
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)


        module.exports = {
            data,
            cooldown: 5,
            async execute(interaction) {
                const lang = interaction.guildLocale || 'ru';
                if (!(interaction.memberPermissions.has('ManageMembers') || interaction.memberPermissions.has('Administrator'))) {
                    await interaction.reply({ content: localeManager.get('utility.user.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                    return;
                }
                switch (interaction.options.getSubcommand()) {
                    case "voice": {
                        const member = interaction.options.getMember("target");
                        const channel = interaction.options.getChannel("channel");
                        const deaf = interaction.options.getBoolean("deaf") | member.voice.selfDeaf;
                        const mute = interaction.options.getBoolean("mute") | member.voice.selfMute;
                        const kick = interaction.options.getBoolean("kick") | null;

                        if (!await interaction.member.permissions.has([PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers])) {
                            return await interaction.reply({ content: localeManager.get('utility.user.messages.no_perms_short', lang), flags: MessageFlags.Ephemeral });
                        }

                        if (!member.voice.channel) {
                            return await interaction.reply({ content: localeManager.get('utility.user.messages.not_in_voice', lang), flags: MessageFlags.Ephemeral });
                        }

                        if (!channel && kick) {
                            let text = localeManager.get('utility.user.messages.voice_kicked', lang, { member: member.toString(), channel: member.voice.channel.toString() });
                            if (deaf) text += `\n${localeManager.get('utility.user.messages.sound_off', lang)}`;
                            if (mute) text += `\n${localeManager.get('utility.user.messages.mic_off', lang)}`;
                            await interaction.guild.members.edit(member, { channel: channel, deaf: deaf, mute: mute });
                            await interaction.reply({ content: text });

                        } else if (channel && !kick) {
                            let text = localeManager.get('utility.user.messages.voice_moved', lang, { 
                                member: member.toString(), 
                                old: member.voice.channel.toString(), 
                                new: channel.toString() 
                            });
                            if (deaf) text += `\n${localeManager.get('utility.user.messages.sound_off', lang)}`;
                            if (mute) text += `\n${localeManager.get('utility.user.messages.mic_off', lang)}`;
                            await interaction.guild.members.edit(member, { channel: channel, deaf: deaf, mute: mute });
                            await interaction.reply({ content: text });

                        } else if (!channel && !kick && (deaf || mute)) {
                            let text = localeManager.get('utility.user.messages.voice_changed', lang, { member: member.toString() });
                            if (deaf) text += `\n${localeManager.get('utility.user.messages.sound_off', lang)}`; else text += `\n${localeManager.get('utility.user.messages.sound_on', lang)}`;
                            if (mute) text += `\n${localeManager.get('utility.user.messages.mic_off', lang)}`; else text += `\n${localeManager.get('utility.user.messages.mic_on', lang)}`;
                            await interaction.guild.members.edit(member, { deaf: deaf, mute: mute });
                            await interaction.reply({ content: text });

                        } else {
                            await interaction.reply({
                                content: localeManager.get('utility.user.messages.nothing_happened', lang), 
                                flags: MessageFlags.Ephemeral
                            });
                        }
                        break;
                    }
                    
                    case "addrole": {
                        const member = interaction.options.getMember("target");
                        const role = interaction.options.getRole("role");
        
                        if (!member) return await interaction.reply({ content: localeManager.get('utility.user.messages.invalid_member', lang), flags: MessageFlags.Ephemeral });
                        
                        if (await interaction.guild.roles.comparePositions(role, await interaction.guild.members.me.roles.highest) >= 0) {
                            return await interaction.reply({ content: localeManager.get('utility.user.messages.role_pos_low_me', lang), flags: MessageFlags.Ephemeral });
                        }
                        if (await interaction.guild.roles.comparePositions(await interaction.member.roles.highest, role) < 0) {
                            return await interaction.reply({ content: localeManager.get('utility.user.messages.role_pos_low_you', lang), flags: MessageFlags.Ephemeral });
                        }
        
                        await member.roles.add(role);
                        await interaction.reply(localeManager.get('utility.user.messages.role_added', lang, { 
                            role: role.name, 
                            member: `${member} (${member.user.username})` 
                        }));
                        break;
                    }
                
                    case "removerole": {
                        const member = interaction.options.getMember("target");
                        const role = interaction.options.getRole("role");
        
                        if (!member) return await interaction.reply({ content: localeManager.get('utility.user.messages.invalid_member', lang), flags: MessageFlags.Ephemeral });
                        
                        if (await interaction.guild.roles.comparePositions(role, await interaction.guild.members.me.roles.highest) >= 0) {
                            return await interaction.reply({ content: localeManager.get('utility.user.messages.role_pos_low_me', lang), flags: MessageFlags.Ephemeral });
                        }
                        if (await interaction.guild.roles.comparePositions(await interaction.member.roles.highest, role) < 0) {
                            return await interaction.reply({ content: localeManager.get('utility.user.messages.role_pos_low_you', lang), flags: MessageFlags.Ephemeral });
                        }
        
                        await member.roles.remove(role);
                        await interaction.reply(localeManager.get('utility.user.messages.role_removed', lang, { 
                            role: role.name, 
                            member: `${member} (${member.user.username})` 
                        }));
                        break;
                    }
                    default:
                        await interaction.reply({ content: localeManager.get('utility.user.messages.unknown_sub', lang), flags: MessageFlags.Ephemeral });
                        break;
                }
        }
    }