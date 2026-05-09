const { SlashCommandBuilder, MessageFlags, PresenceUpdateStatus, ActivityType, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const { privateAccess, bot_log_channel } = require('../../config.json');
const localeManager = require('../../locales/localeManager');

const data = new SlashCommandBuilder()
    .setName('eval')
    .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.name'))
    .setDescription(localeManager.get('forFunOnly.eval.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.description'))
        .addSubcommand(subcommand =>
            subcommand.setName('presence')
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.presence.name'))
            .setDescription(localeManager.get('forFunOnly.eval.options.presence.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.presence.description'))
            .addStringOption(option => 
                option.setName('name-activity')
                .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.presence.options.name-activity.name'))
                .setDescription(localeManager.get('forFunOnly.eval.options.presence.options.name-activity.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.presence.options.name-activity.description'))
            )
            .addStringOption(option => 
                option.setName('status')
                .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.presence.options.status.name'))
                .setDescription(localeManager.get('forFunOnly.eval.options.presence.options.status.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.presence.options.status.description'))
                .addChoices(
                    {name: 'online', value: PresenceUpdateStatus.Online},
                    {name: 'idle', value: PresenceUpdateStatus.Idle},
                    {name: 'dnd', value: PresenceUpdateStatus.DoNotDisturb},
                    {name: 'invisible', value: PresenceUpdateStatus.Invisible}
                )
            )
            .addIntegerOption(option =>
                option.setName('activity')
                .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.presence.options.activity.name'))
                .setDescription(localeManager.get('forFunOnly.eval.options.presence.options.activity.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.presence.options.activity.description'))
                .addChoices(
                    {name: 'Wathing', value: ActivityType.Watching }, 
                    {name: 'Listening', value: ActivityType.Listening },
                    {name: 'Competing', value: ActivityType.Competing },
                    {name: 'Playing', value: ActivityType.Playing },
                    {name: 'Streaming', value: ActivityType.Streaming },
                    {name: 'Custom', value: ActivityType.Custom },
                )
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('avatar')
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.avatar.name'))
            .setDescription(localeManager.get('forFunOnly.eval.options.avatar.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.avatar.description'))
            .addAttachmentOption(option =>
                option.setName('file')
                .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.avatar.options.file.name'))
                .setDescription(localeManager.get('forFunOnly.eval.options.avatar.options.file.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.avatar.options.file.description'))
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('banner')
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.banner.name'))
            .setDescription(localeManager.get('forFunOnly.eval.options.banner.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.banner.description'))
            .addAttachmentOption(option =>
                option.setName('file')
                .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.banner.options.file.name'))
                .setDescription(localeManager.get('forFunOnly.eval.options.banner.options.file.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.banner.options.file.description'))
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('botinfo')
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.botinfo.name'))
            .setDescription(localeManager.get('forFunOnly.eval.options.botinfo.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.eval.options.botinfo.description'))
        )

module.exports = {
    cooldown: 5,
    data,
    async execute(interaction) {
        const lang = interaction.guildLocale || 'ru';
        if (!privateAccess.includes(interaction.user.id)) return await interaction.reply({ content: localeManager.get('forFunOnly.eval.messages.no_access', lang), flags: MessageFlags.Ephemeral})

        switch (interaction.options.getSubcommand()) {
            case "presence": {
                const presence = interaction.options.getString('status') || interaction.client.user.presence.status;
                const activity = interaction.options.getInteger('activity') || interaction.client.user.presence.status
                const nameactivity = interaction.options.getString('name-activity') || interaction.client.user.presence.name || '';
                
                try {
                    await interaction.client.user.setPresence({ activities: [{ name: nameactivity }], status: presence });
                    await interaction.client.user.setActivity(nameactivity, { type: activity })
                    await interaction.reply({content: localeManager.get('forFunOnly.eval.messages.presence_updated', lang, { presence, name: nameactivity, type: activity }), flags: MessageFlags.Ephemeral });
                } catch (error) {
                    await interaction.reply({content: localeManager.get('forFunOnly.eval.messages.presence_error', lang), flags: MessageFlags.Ephemeral });
                    const errorEmbed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(`Произошла ошибка при обработке команды`)
                    .addFields(
                        { name: `Команда`, value: `${interaction.commandName}` },
                        { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    await logChannel.send({ embeds: [errorEmbed] });
                }
                break;
            }

            case "avatar": {
                await interaction.deferReply()
                const attachment = await interaction.options.getAttachment('file');
                const image = await attachment.url;

                try {
                    //const file = await axios.get(await interaction.client.user.avatarURL({extension: 'png', size: 1024}))
                    //await fs.writeFile('images/avatar.png', file.data)

                    await interaction.client.user.setAvatar(image);
                    await interaction.editReply({content: localeManager.get('forFunOnly.eval.messages.avatar_updated', lang), flags: MessageFlags.Ephemeral});
                } catch (error) {
                    await interaction.editReply({content: localeManager.get('forFunOnly.eval.messages.avatar_error', lang), flags: MessageFlags.Ephemeral});
                    const errorEmbed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(`Произошла ошибка при обработке команды`)
                    .addFields(
                        { name: `Команда`, value: `${interaction.commandName}` },
                        { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    await logChannel.send({ embeds: [errorEmbed] });
                }
                break;
            }
            case "banner": {
                await interaction.deferReply()
                const attachment = interaction.options.getAttachment('file');
                const image = await attachment.url;

                try {
                    //const file = await axios.get(await interaction.client.user.bannerURL({extension: 'png', size: 1024}), )
                    //await fs.writeFile('images/banner.png', file.data)

                    await interaction.client.user.setBanner(image);
                    await interaction.editReply({content: localeManager.get('forFunOnly.eval.messages.banner_updated', lang), flags: MessageFlags.Ephemeral});
                } catch (error) {
                    await interaction.editReply({content: localeManager.get('forFunOnly.eval.messages.banner_error', lang), flags: MessageFlags.Ephemeral});
                    const errorEmbed = EmbedService.createBaseEmbed(interaction)
                    .setTitle(`Произошла ошибка при обработке команды`)
                    .addFields(
                        { name: `Команда`, value: `${interaction.commandName}` },
                        { name: 'Ошибка', value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
                    )
                    .setTimestamp(new Date())
                    console.error(error);
                    const logChannel = await interaction.client.channels.fetch(bot_log_channel)
                    await logChannel.send({ embeds: [errorEmbed] });
                }
                break;
            }
            case "botinfo": {
                await interaction.deferReply({flags: MessageFlags.Ephemeral})
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId(`eval_botinfo_guilds`)
                      .setLabel(localeManager.get('forFunOnly.eval.messages.buttons.guilds', lang))
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setLabel('ъ')
                      .setURL("https://samiker.xyz")
                      .setStyle(ButtonStyle.Link)
                  );

                const embed = EmbedService.createBaseEmbed(interaction)
                .setTitle(localeManager.get('forFunOnly.eval.messages.botinfo_title', lang))
                .setDescription(localeManager.get('forFunOnly.eval.messages.botinfo_description', lang))

                return await interaction.editReply({
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral,
                    components: [row]
                })
            }
        
            default:
                await interaction.reply({content: localeManager.get('forFunOnly.eval.messages.unknown_sub', lang), flags: MessageFlags.Ephemeral})
                break;
        }
    }
}
