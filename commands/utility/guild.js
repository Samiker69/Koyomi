const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const { bot_log_channel } = require('../../config.json');
const localeManager = require('../../locales/localeManager');

const data = new SlashCommandBuilder()
    .setName('guild')
    .setDescription(localeManager.get('utility.guild.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.description'))
    .addSubcommand(subcommand =>
        subcommand.setName('invites')
            .setDescription(localeManager.get('utility.guild.options.invites.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.invites.description'))
            .addBooleanOption(option =>
                option.setName('value')
                    .setDescription(localeManager.get('utility.guild.options.invites.options.value.description'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.invites.options.value.description'))
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('banner')
            .setDescription(localeManager.get('utility.guild.options.banner.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.banner.description'))
            .addAttachmentOption(option =>
                option.setName('image')
                    .setDescription(localeManager.get('utility.guild.options.banner.options.image.description'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.banner.options.image.description'))
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('icon')
            .setDescription(localeManager.get('utility.guild.options.icon.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.icon.description'))
            .addAttachmentOption(option =>
                option.setName('image')
                    .setDescription(localeManager.get('utility.guild.options.icon.options.image.description'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.icon.options.image.description'))
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('contentfilterlevel')
            .setDescription(localeManager.get('utility.guild.options.contentfilterlevel.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.contentfilterlevel.description'))
            .addStringOption(option =>
                option.setName('value')
                    .setDescription(localeManager.get('utility.guild.options.contentfilterlevel.options.value.description'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.contentfilterlevel.options.value.description'))
                    .addChoices(
                        { name: localeManager.get('utility.guild.options.contentfilterlevel.options.value.choices.disabled'), value: '0' },
                        { name: localeManager.get('utility.guild.options.contentfilterlevel.options.value.choices.no_role'), value: '1' },
                        { name: localeManager.get('utility.guild.options.contentfilterlevel.options.value.choices.all'), value: '2' },
                    )
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('name')
            .setDescription(localeManager.get('utility.guild.options.name.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.name.description'))
            .addStringOption(option =>
                option.setName('text')
                    .setDescription(localeManager.get('utility.guild.options.name.options.text.description'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.name.options.text.description'))
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('rulechannel')
            .setDescription(localeManager.get('utility.guild.options.rulechannel.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.rulechannel.description'))
            .addChannelOption(option =>
                option.setName('input')
                    .setDescription(localeManager.get('utility.guild.options.rulechannel.options.input.description'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.rulechannel.options.input.description'))
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('safetyalerts')
            .setDescription(localeManager.get('utility.guild.options.safetyalerts.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.safetyalerts.description'))
            .addChannelOption(option =>
                option.setName('input')
                    .setDescription(localeManager.get('utility.guild.options.safetyalerts.options.input.description'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.safetyalerts.options.input.description'))
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('systemchannel')
            .setDescription(localeManager.get('utility.guild.options.systemchannel.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.systemchannel.description'))
            .addChannelOption(option =>
                option.setName('input')
                    .setDescription(localeManager.get('utility.guild.options.systemchannel.options.input.description'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.systemchannel.options.input.description'))
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('verificationlevel')
            .setDescription(localeManager.get('utility.guild.options.verificationlevel.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.verificationlevel.description'))
            .addNumberOption(option =>
                option.setName('input')
                    .setDescription(localeManager.get('utility.guild.options.verificationlevel.options.input.description'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('utility.guild.options.verificationlevel.options.input.description'))
                    .setMaxValue(4)
                    .setMinValue(0)
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

module.exports = {
    cooldown: 5,
    data,
    async execute(interaction) {
        const lang = interaction.guildLocale || 'ru';
        if (!await interaction.guild.members.me.permissions.has('ManageGuild', true)) {
            return await interaction.reply({ content: localeManager.get('utility.guild.messages.me_no_perms', lang), flags: MessageFlags.Ephemeral });
        }
        switch (interaction.options.getSubcommand()) {
            case "invites": {
                if (!await interaction.member.permissions.has('ManageGuild', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.guild.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                const invite = interaction.options.getBoolean('value');

                try {
                    await interaction.guild.disableInvites(invite);
                    const msg = invite 
                        ? localeManager.get('utility.guild.messages.invites_paused', lang) 
                        : localeManager.get('utility.guild.messages.invites_resumed', lang);
                    await interaction.reply(msg);
                } catch (error) {
                    await interaction.reply({ content: localeManager.get('utility.guild.messages.error_occurred', lang, { error: error.message }), flags: MessageFlags.Ephemeral });
                    const errorEmbed = EmbedService.createBaseEmbed(interaction)
                        .setColor('Red')
                        .setTitle(localeManager.get('utility.room.messages.error', lang)) // Using room error title as generic
                        .addFields(
                            { name: localeManager.get('utility.help.messages.no_name', lang).split(' ')[0], value: `${interaction.commandName}` }, // Hacky command label
                            { name: localeManager.get('utility.guild.messages.error_occurred', lang, { error: '' }).split(' ')[0], value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                        );
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    if (logChannel) await logChannel.send({ embeds: [errorEmbed] });
                }
                break;
            }
            case "banner": {
                if (!await interaction.member.permissions.has('Administrator', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.guild.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                if (interaction.guild.premiumTier >= 2) {
                    const attachment = interaction.options.getAttachment('image');
                    const image = attachment.url;

                    try {
                        await interaction.guild.setBanner(image);
                        await interaction.reply(localeManager.get('utility.guild.messages.banner_changed', lang));
                    } catch (error) {
                        await interaction.reply({ content: localeManager.get('utility.guild.messages.error_occurred', lang, { error: error.message }), flags: MessageFlags.Ephemeral });
                    }
                } else {
                    await interaction.reply(localeManager.get('utility.guild.messages.banner_low_level', lang));
                }
                break;
            }
            case "icon": {
                if (!await interaction.member.permissions.has('Administrator', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.guild.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                const attachment = interaction.options.getAttachment('image');
                const image = attachment.url;

                try {
                    await interaction.guild.setIcon(image);
                    await interaction.reply(localeManager.get('utility.guild.messages.icon_changed', lang));
                } catch (error) {
                    await interaction.reply({ content: localeManager.get('utility.guild.messages.error_occurred', lang, { error: error.message }), flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case "contentfilterlevel": {
                if (!await interaction.member.permissions.has('ManageGuild', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.guild.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                const contentfilterlevel = interaction.options.getString('value');
                try {
                    if (interaction.guild.features.includes("COMMUNITY") && contentfilterlevel < "2") {
                        return await interaction.reply(localeManager.get('utility.guild.messages.community_filter_error', lang));
                    }
                    await interaction.guild.setExplicitContentFilter(contentfilterlevel);
                    let msg = '';
                    if (contentfilterlevel === '0') msg = localeManager.get('utility.guild.messages.filter_disabled', lang);
                    else if (contentfilterlevel === '1') msg = localeManager.get('utility.guild.messages.filter_no_role', lang);
                    else if (contentfilterlevel === '2') msg = localeManager.get('utility.guild.messages.filter_all', lang);
                    await interaction.reply(msg);
                } catch (error) {
                    await interaction.reply({ content: localeManager.get('utility.guild.messages.error_occurred', lang, { error: error.message }), flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case "name": {
                if (!await interaction.member.permissions.has('Administrator', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.guild.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                const name = interaction.options.getString('text');

                try {
                    await interaction.guild.setName(name);
                    await interaction.reply(localeManager.get('utility.guild.messages.name_changed', lang, { name }));
                } catch (error) {
                    await interaction.reply({ content: localeManager.get('utility.guild.messages.error_occurred', lang, { error: error.message }), flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case "rulechannel": {
                if (!await interaction.member.permissions.has('Administrator', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.guild.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                if (!interaction.guild.features.includes("COMMUNITY")) {
                    return await interaction.reply(localeManager.get('utility.guild.messages.rule_channel_error', lang));
                }
                const channel = interaction.options.getChannel('input');

                try {
                    await interaction.guild.setRulesChannel(channel);
                    await interaction.reply(localeManager.get('utility.guild.messages.rule_channel_set', lang, { channel: channel.toString() }));
                } catch (error) {
                    await interaction.reply({ content: localeManager.get('utility.guild.messages.error_occurred', lang, { error: error.message }), flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case "safetyalerts": {
                if (!await interaction.member.permissions.has('Administrator', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.guild.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                if (!interaction.guild.features.includes("COMMUNITY")) {
                    return await interaction.reply(localeManager.get('utility.guild.messages.safety_alerts_error', lang));
                }
                const channel = interaction.options.getChannel('input');

                try {
                    await interaction.guild.setSafetyAlertsChannel(channel);
                    await interaction.reply(localeManager.get('utility.guild.messages.safety_alerts_set', lang, { channel: channel.toString() }));
                } catch (error) {
                    await interaction.reply({ content: localeManager.get('utility.guild.messages.error_occurred', lang, { error: error.message }), flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case "verificationlevel": {
                if (!await interaction.member.permissions.has('Administrator', true)) {
                    return await interaction.reply({ content: localeManager.get('utility.guild.messages.no_perms', lang), flags: MessageFlags.Ephemeral });
                }
                const level = interaction.options.getNumber('input');

                if (level < 0 || level > 4) {
                    return await interaction.reply(localeManager.get('utility.guild.messages.verification_level_error', lang));
                }

                try {
                    await interaction.guild.setVerificationLevel(level);
                    await interaction.reply(localeManager.get('utility.guild.messages.verification_level_set', lang, { level: level.toString() }));
                } catch (error) {
                    await interaction.reply({ content: localeManager.get('utility.guild.messages.error_occurred', lang, { error: error.message }), flags: MessageFlags.Ephemeral });
                }
                break;
            }

            default:
                await interaction.reply({ content: localeManager.get('utility.guild.messages.unknown_sub', lang), flags: MessageFlags.Ephemeral });
                break;
        }
    }
};