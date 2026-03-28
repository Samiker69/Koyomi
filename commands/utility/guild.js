const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const { bot_log_channel } = require('../../config.json')
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
    .setName('guild')
    .setDescription('guild admin command')
    .setDescriptionLocalizations(utility.guild.description)
    .addSubcommand(subcommand =>
        subcommand.setName('invites')
            .setDescription('Disable or enable invites for the guild')
            .setDescriptionLocalizations(utility.guild.subcommands.invites.description)
            .addBooleanOption(option =>
                option.setName('value')
                    .setDescription('true - disable, false - enable')
                    .setDescriptionLocalizations(utility.guild.options.value_invites.description)
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    .addSubcommand(subcommand =>
        subcommand.setName('banner')
            .setDescription('Change the server banner')
            .setDescriptionLocalizations(utility.guild.subcommands.banner.description)
            .addAttachmentOption(option =>
                option.setName('image')
                    .setDescription('Image for server banner (server must be level 2)')
                    .setDescriptionLocalizations(utility.guild.options.image.description)
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(subcommand =>
        subcommand.setName('icon')
            .setDescription('Change the server icon')
            .setDescriptionLocalizations(utility.guild.subcommands.icon.description)
            .addAttachmentOption(option =>
                option.setName('image')
                    .setDescription('Image for server icon')
                    .setDescriptionLocalizations(utility.guild.options.image.description)
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(subcommand =>
        subcommand.setName('contentfilterlevel')
            .setDescription('Change the server Content Filter Level')
            .setDescriptionLocalizations(utility.guild.subcommands.contentfilterlevel.description)
            .addStringOption(option =>
                option.setName('value')
                    .setDescription('Content Filter Level')
                    .setDescriptionLocalizations(utility.guild.options.value_cfl.description)
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
            .setDescription('Change the server name')
            .setDescriptionLocalizations(utility.guild.subcommands.name.description)
            .addStringOption(option =>
                option.setName('text')
                    .setDescription('Name for the server')
                    .setDescriptionLocalizations(utility.guild.options.text.description)
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(subcommand =>
        subcommand.setName('rulechannel')
            .setDescription('Change the server rule channel')
            .setDescriptionLocalizations(utility.guild.subcommands.rulechannel.description)
            .addChannelOption(option =>
                option.setName('input')
                    .setDescription('Channel for rules')
                    .setDescriptionLocalizations(utility.guild.options.input_channel.description)
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(subcommand =>
        subcommand.setName('safetyalerts')
            .setDescription('Change the server safety alerts channel')
            .setDescriptionLocalizations(utility.guild.subcommands.safetyalerts.description)
            .addChannelOption(option =>
                option.setName('input')
                    .setDescription('Channel for safety alerts')
                    .setDescriptionLocalizations(utility.guild.options.input_channel.description)
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(subcommand =>
        subcommand.setName('systemchannel')
            .setDescription('Change the server system channel')
            .setDescriptionLocalizations(utility.guild.subcommands.systemchannel.description)
            .addChannelOption(option =>
                option.setName('input')
                    .setDescription('Channel for system messages')
                    .setDescriptionLocalizations(utility.guild.options.input_channel.description)
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(subcommand =>
        subcommand.setName('verificationlevel')
            .setDescription('Change the server verification level')
            .setDescriptionLocalizations(utility.guild.subcommands.verificationlevel.description)
            .addNumberOption(option =>
                option.setName('input')
                    .setDescription('Level from 0 to 4')
                    .setDescriptionLocalizations(utility.guild.options.input_level.description)
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
        const loc = interaction.locale;
        if (!await interaction.guild.members.me.permissions.has('ManageGuild', true)) return await interaction.reply({ content: getReply('bot_no_permission', loc), flags: MessageFlags.Ephemeral });
        switch (interaction.options.getSubcommand()) {
            case "invites": {
                if (!await interaction.member.permissions.has('ManageGuild', true)) return await interaction.reply({ content: getReply('no_permission', loc), flags: MessageFlags.Ephemeral });
                const invite = interaction.options.getBoolean('value');

                try {
                    await interaction.guild.disableInvites(invite);
                    if (invite) {
                        await interaction.reply(getReply('guild_invites_paused', loc));
                    } else if (!invite) {
                        await interaction.reply(getReply('guild_invites_resumed', loc));
                    }
                } catch (error) {
                    await interaction.reply({ content: getReply('something_went_wrong', loc, { error: error.message }), flags: MessageFlags.Ephemeral });
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
                if (!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({ content: getReply('no_permission', loc), flags: MessageFlags.Ephemeral });
                if (interaction.guild.premiumTier >= 2) {
                    const attachment = interaction.options.getAttachment('image');
                    const image = await attachment.url;

                    try {
                        await interaction.guild.setBanner(image);
                        await interaction.reply(getReply('guild_banner_changed', loc));
                    } catch (error) {
                        await interaction.reply({ content: getReply('something_went_wrong', loc, { error: error.message }), flags: MessageFlags.Ephemeral });
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
                    await interaction.reply(getReply('guild_banner_level_fail', loc));
                }
                break;
            }
            case "icon": {
                if (!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({ content: getReply('no_permission', loc), flags: MessageFlags.Ephemeral });
                const attachment = interaction.options.getAttachment('image');
                const image = await attachment.url;

                try {
                    await interaction.guild.setIcon(image);
                    await interaction.reply(getReply('guild_icon_changed', loc));
                } catch (error) {
                    await interaction.reply({ content: getReply('something_went_wrong', loc, { error: error.message }), flags: MessageFlags.Ephemeral });
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
                if (!await interaction.member.permissions.has('ManageGuild', true)) return await interaction.reply({ content: getReply('no_permission', loc), flags: MessageFlags.Ephemeral });
                const contentfilterlevel = interaction.options.getString('value');
                try {
                    if (interaction.guild.features.includes("COMMUNITY") && contentfilterlevel < "2") return await interaction.reply(getReply('guild_cfl_comm_fail', loc))
                    if (contentfilterlevel === '0') {
                        await interaction.guild.setExplicitContentFilter(contentfilterlevel);
                        await interaction.reply(getReply('guild_cfl_disabled', loc));
                    } else if (contentfilterlevel === '1') {
                        await interaction.guild.setExplicitContentFilter(contentfilterlevel);
                        await interaction.reply(getReply('guild_cfl_no_role', loc));
                    } else if (contentfilterlevel === '2') {
                        await interaction.guild.setExplicitContentFilter(contentfilterlevel);
                        await interaction.reply(getReply('guild_cfl_all_members', loc));
                    }
                } catch (error) {
                    await interaction.reply({ content: getReply('something_went_wrong', loc, { error: error.message }), flags: MessageFlags.Ephemeral });
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
                if (!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({ content: getReply('no_permission', loc), flags: MessageFlags.Ephemeral });
                const name = interaction.options.getString('text');

                try {
                    await interaction.guild.setName(name);
                    await interaction.reply(getReply('guild_name_changed', loc, { name }));
                } catch (error) {
                    await interaction.reply({ content: getReply('something_went_wrong', loc, { error: error.message }), flags: MessageFlags.Ephemeral });
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
                if (!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({ content: getReply('no_permission', loc), flags: MessageFlags.Ephemeral });
                if (!interaction.guild.features.includes("COMMUNITY")) return await interaction.reply(getReply('guild_rule_comm_fail', loc))
                const channel = interaction.options.getChannel('input');

                try {
                    await interaction.guild.setRulesChannel(channel);
                    await interaction.reply(getReply('guild_rule_changed', loc, { channel }));
                } catch (error) {
                    await interaction.reply({ content: getReply('something_went_wrong', loc, { error: error.message }), flags: MessageFlags.Ephemeral });
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
                if (!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({ content: getReply('no_permission', loc), flags: MessageFlags.Ephemeral });
                if (!interaction.guild.features.includes("COMMUNITY")) return await interaction.reply(getReply('guild_safety_comm_fail', loc));
                const channel = interaction.options.getChannel('input');

                try {
                    await interaction.guild.setSafetyAlertsChannel(channel);
                    await interaction.reply(getReply('guild_safety_changed', loc, { channel }));
                } catch (error) {
                    await interaction.reply({ content: getReply('something_went_wrong', loc, { error: error.message }), flags: MessageFlags.Ephemeral });
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
            case "systemchannel": {
                if (!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({ content: getReply('no_permission', loc), flags: MessageFlags.Ephemeral });
                const channel = interaction.options.getChannel('input');

                try {
                    await interaction.guild.setSystemChannel(channel);
                    await interaction.reply(getReply('guild_system_changed', loc, { channel }));
                } catch (error) {
                    await interaction.reply({ content: getReply('something_went_wrong', loc, { error: error.message }), flags: MessageFlags.Ephemeral });
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
                if (!await interaction.member.permissions.has('Administrator', true)) return await interaction.reply({ content: getReply('no_permission', loc), flags: MessageFlags.Ephemeral });
                const level = interaction.options.getNumber('input');

                if (level < '0' || level > '4') return await interaction.reply(getReply('guild_verification_level_fail', loc))

                try {
                    await interaction.guild.setVerificationLevel(level);
                    await interaction.reply(getReply('guild_verification_changed', loc, { level }));
                } catch (error) {
                    await interaction.reply({ content: getReply('something_went_wrong', loc, { error: error.message }), flags: MessageFlags.Ephemeral });
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
                await interaction.reply({ content: getReply('unknown_subcommand', loc), flags: MessageFlags.Ephemeral })
                break;
        }
    }
}