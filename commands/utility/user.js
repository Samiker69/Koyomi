const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField, MessageFlags } = require('discord.js');
const replies = require('../../locales/answers/replies');
const { utility } = require('../../locales/descriptions/utility');

const getReply = (key, locale, vars = {}) => {
    let text = replies[key]?.[locale] || replies[key]?.['ru'] || key;
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
    }
    return text;
};


const data = new SlashCommandBuilder()
    .setName('user')
    .setDescription('info about target')
    .setDescriptionLocalizations(utility.user.description)
    .addSubcommand(subcommand =>
        subcommand.setName('voice')
            .setDescription('edit a user in the voice channel')
            .setDescriptionLocalizations(utility.user.subcommands.voice.description)
            .addUserOption(option => option.setName('target').setDescription('select a user').setDescriptionLocalizations(utility.user.options.target.description))
            .addChannelOption(option => option.setName('channel').setDescription('Moves the member to a different channel').setDescriptionLocalizations(utility.user.options.channel.description))
            .addBooleanOption(option => option.setName('deaf').setDescription('Deafens/undeafens the member of this voice state.').setDescriptionLocalizations(utility.user.options.deaf.description))
            .addBooleanOption(option => option.setName('mute').setDescription('Mutes/unmutes the member of this voice state.').setDescriptionLocalizations(utility.user.options.mute.description))
            .addBooleanOption(option =>
                option.setName('kick')
                    .setDescription('Кикает участника из войса')
                    .setDescriptionLocalizations(utility.user.options.kick.description)
            )
    ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

    .addSubcommand(subcommand => subcommand.setName('addrole').setDescription('Adds a role (or multiple roles) to the member.').setDescriptionLocalizations(utility.user.subcommands.addrole.description)
        .addUserOption(option => option.setName('target').setDescription('select a user').setDescriptionLocalizations(utility.user.options.target.description).setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('select a role').setDescriptionLocalizations(utility.user.options.role.description).setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand => subcommand.setName('removerole').setDescription('remove a role (or multiple roles) to the member.').setDescriptionLocalizations(utility.user.subcommands.removerole.description)
        .addUserOption(option => option.setName('target').setDescription('select a user').setDescriptionLocalizations(utility.user.options.target.description).setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('select a role').setDescriptionLocalizations(utility.user.options.role.description).setRequired(true))).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)


module.exports = {
    data,
    cooldown: 5,
    async execute(interaction) {
        const loc = interaction.locale;
        if (!(interaction.memberPermissions.has('ManageMembers') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ content: getReply('user_no_perms', loc), flags: MessageFlags.Ephemeral });
            return;
        }
        switch (interaction.options.getSubcommand()) {
            case "voice": {
                const member = interaction.options.getMember("target");
                const channel = interaction.options.getChannel("channel");
                const deaf = interaction.options.getBoolean("deaf") ?? member.voice.serverDeaf;
                const mute = interaction.options.getBoolean("mute") ?? member.voice.serverMute;
                const kick = interaction.options.getBoolean("kick") ?? null;

                if (!await interaction.member.permissions.has([PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers])) return await interaction.reply({ content: getReply('user_no_perms', loc), flags: MessageFlags.Ephemeral });

                if (!member.voice.channel) return await interaction.reply({ content: getReply('user_not_in_voice', loc), flags: MessageFlags.Ephemeral });

                if (!channel && kick) {
                    let text = getReply('user_kicked_from_voice', loc, { member: Object.assign({}, member, { toString: () => `<@${member.id}>` }), channel: member.voice.channel });
                    if (deaf) text += getReply('user_voice_deafened', loc);
                    if (mute) text += getReply('user_voice_muted', loc);

                    try {
                        await member.voice.disconnect();
                    } catch (error) {
                        console.error('Failed to disconnect member', error);
                    }
                    await interaction.reply({ content: text });

                } else if (channel && !kick) {
                    let text = getReply('user_moved', loc, { member: Object.assign({}, member, { toString: () => `<@${member.id}>` }), oldChannel: member.voice.channel, newChannel: channel });
                    if (deaf) text += getReply('user_voice_deafened', loc);
                    if (mute) text += getReply('user_voice_muted', loc);

                    try {
                        await interaction.guild.members.edit(member, { channel: channel, deaf: deaf, mute: mute });
                    } catch (error) {
                        console.error('Failed to edit member voice state', error);
                    }
                    await interaction.reply({ content: text });

                } else if (!channel && !kick && (deaf !== member.voice.serverDeaf || mute !== member.voice.serverMute)) {
                    let text = getReply('user_voice_changed', loc, { member: Object.assign({}, member, { toString: () => `<@${member.id}>` }) });
                    if (deaf) text += getReply('user_voice_deafened', loc); else if (deaf === false) text += getReply('user_voice_undeafened', loc);
                    if (mute) text += getReply('user_voice_muted', loc); else if (mute === false) text += getReply('user_voice_unmuted', loc);

                    try {
                        await interaction.guild.members.edit(member, { deaf: deaf, mute: mute });
                    } catch (error) {
                        console.error('Failed to edit member voice state', error);
                    }
                    await interaction.reply({ content: text });

                } else {
                    await interaction.reply({
                        content: getReply('user_voice_debug', loc, {
                            channel: channel,
                            kick: kick,
                            deaf: deaf,
                            mute: mute,
                            member: Object.assign({}, member, { toString: () => `<@${member.id}>` }),
                            oldChannel: member.voice?.channel
                        }),
                        flags: MessageFlags.Ephemeral
                    });
                }



                break;
            }

            case "addrole": {
                const member = interaction.options.getMember("target");
                const role = interaction.options.getRole("role");

                if (!member) return await interaction.reply({ content: getReply('user_invalid', loc), flags: MessageFlags.Ephemeral })
                //check role pos
                if (await interaction.guild.roles.comparePositions(role, await interaction.guild.members.me.roles.highest) >= 0) return await interaction.reply({ content: getReply('user_bot_role_lower', loc), flags: MessageFlags.Ephemeral });
                if (await interaction.guild.roles.comparePositions(await interaction.member.roles.highest, role) < 0) return await interaction.reply({ content: getReply('role_pos_lower', loc), flags: MessageFlags.Ephemeral });

                await member.roles.add(role);
                await interaction.reply(getReply('user_role_added', loc, { roleName: role.name, member: Object.assign({}, member, { toString: () => `<@${member.id}>` }), username: member.user.username }));
                break;
            }

            case "removerole": {
                const member = interaction.options.getMember("target");
                const role = interaction.options.getRole("role");

                if (!member) return await interaction.reply({ content: getReply('user_invalid', loc), flags: MessageFlags.Ephemeral })
                //check role pos
                if (await interaction.guild.roles.comparePositions(role, await interaction.guild.members.me.roles.highest) >= 0) return await interaction.reply({ content: getReply('user_bot_role_lower', loc), flags: MessageFlags.Ephemeral });
                if (await interaction.guild.roles.comparePositions(await interaction.member.roles.highest, role) < 0) return await interaction.reply({ content: getReply('role_pos_lower', loc), flags: MessageFlags.Ephemeral });

                await member.roles.remove(role);
                await interaction.reply(getReply('user_role_removed', loc, { roleName: role.name, member: Object.assign({}, member, { toString: () => `<@${member.id}>` }), username: member.user.username }));
                break;
            }
            default:
                await interaction.reply({ content: getReply('unknown_subcommand', loc), flags: MessageFlags.Ephemeral })
                break;
        }
    }
}