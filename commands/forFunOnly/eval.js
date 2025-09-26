const { SlashCommandBuilder, MessageFlags, PresenceUpdateStatus, ActivityType, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { privateAccess, bot_log_channel } = require('../../config.json');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

/*const { default: axios } = require('axios');
const path = require('path');
const fs = require('fs').promises*/

const data = new SlashCommandBuilder()
    .setName(localeManager.getString('commands.eval.name'))
    .setDescription(localeManager.getString('commands.eval.description'))
        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.eval.options.presence.name'))
            .setDescription(localeManager.getString('commands.eval.options.presence.description'))
            .addStringOption(option => 
                option.setName(localeManager.getString('commands.eval.options.presence.options.nameactivity.name'))
                .setDescription(localeManager.getString('commands.eval.options.presence.options.nameactivity.description'))
                
            )
            .addStringOption(option => 
                option.setName(localeManager.getString('commands.eval.options.presence.options.status.name'))
                .setDescription(localeManager.getString('commands.eval.options.presence.options.status.description'))
                
                .addChoices(
                    {name: localeManager.getString('commands.eval.options.presence.options.status.choices.online'), value: PresenceUpdateStatus.Online},
                    {name: localeManager.getString('commands.eval.options.presence.options.status.choices.idle'), value: PresenceUpdateStatus.Idle},
                    {name: localeManager.getString('commands.eval.options.presence.options.status.choices.dnd'), value: PresenceUpdateStatus.DoNotDisturb},
                    {name: localeManager.getString('commands.eval.options.presence.options.status.choices.invisible'), value: PresenceUpdateStatus.Invisible}
                )
            )
            .addIntegerOption(option =>
                option.setName(localeManager.getString('commands.eval.options.presence.options.activity.name'))
                .setDescription(localeManager.getString('commands.eval.options.presence.options.activity.description'))
                
                .addChoices(
                    {name: localeManager.getString('commands.eval.options.presence.options.activity.choices.watching'), value: ActivityType.Watching }, 
                    {name: localeManager.getString('commands.eval.options.presence.options.activity.choices.listening'), value: ActivityType.Listening },
                    {name: localeManager.getString('commands.eval.options.presence.options.activity.choices.competing'), value: ActivityType.Competing },
                    {name: localeManager.getString('commands.eval.options.presence.options.activity.choices.playing'), value: ActivityType.Playing },
                    {name: localeManager.getString('commands.eval.options.presence.options.activity.choices.streaming'), value: ActivityType.Streaming },
                    {name: localeManager.getString('commands.eval.options.presence.options.activity.choices.custom'), value: ActivityType.Custom },
                )
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.eval.options.avatar.name'))
            .setDescription(localeManager.getString('commands.eval.options.avatar.description'))
            .addAttachmentOption(option =>
                option.setName(localeManager.getString('commands.eval.options.avatar.options.file.name'))
                .setDescription(localeManager.getString('commands.eval.options.avatar.options.file.description'))
                
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.eval.options.banner.name'))
            .setDescription(localeManager.getString('commands.eval.options.banner.description'))
            .addAttachmentOption(option =>
                option.setName(localeManager.getString('commands.eval.options.banner.options.file.name'))
                .setDescription(localeManager.getString('commands.eval.options.banner.options.file.description'))
                
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName(localeManager.getString('commands.eval.options.botinfo.name'))
            .setDescription(localeManager.getString('commands.eval.options.botinfo.description'))
        )

module.exports = {
    cooldown: 5,
    data,
    async execute(interaction) {
        if (!privateAccess.includes(interaction.user.id)) return await interaction.reply({ content: localeManager.getString('commands.eval.no_permissions'), flags: MessageFlags.Ephemeral})

        switch (interaction.options.getSubcommand()) {
            case "presence": {
                const presence = interaction.options.getString('status') || interaction.client.user.presence.status;
                const activity = interaction.options.getInteger('activity') || interaction.client.user.presence.status
                const nameactivity = interaction.options.getString('name-activity') || interaction.client.user.presence.name || '';
                
                try {
                    await interaction.client.user.setPresence({ activities: [{ name: nameactivity }], status: presence });
                    await interaction.client.user.setActivity(nameactivity, { type: activity })
                    await interaction.reply({content: localeManager.getString('commands.eval.presence.status_changed', { presence: presence, nameActivity: nameactivity, activity: activity }), flags: MessageFlags.Ephemeral });
                } catch (error) {
                    await interaction.reply({content: localeManager.getString('commands.eval.presence.status_change_failed'), flags: MessageFlags.Ephemeral });
                    const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(localeManager.getString('commands.eval.error_processing_command'))
                    .addFields(
                        { name: localeManager.getString('commands.eval.command_field'), value: `${interaction.commandName}` },
                        { name: localeManager.getString('commands.eval.error_field'), value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
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
                    await interaction.editReply({content: localeManager.getString('commands.eval.avatar.changed'), flags: MessageFlags.Ephemeral});
                } catch (error) {
                    await interaction.editReply({content: localeManager.getString('commands.eval.avatar.change_failed'), flags: MessageFlags.Ephemeral});
                    const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(localeManager.getString('commands.eval.error_processing_command'))
                    .addFields(
                        { name: localeManager.getString('commands.eval.command_field'), value: `${interaction.commandName}` },
                        { name: localeManager.getString('commands.eval.error_field'), value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
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
                    await interaction.editReply({content: localeManager.getString('commands.eval.banner.changed'), flags: MessageFlags.Ephemeral});
                } catch (error) {
                    await interaction.editReply({content: localeManager.getString('commands.eval.banner.change_failed'), flags: MessageFlags.Ephemeral});
                    const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(localeManager.getString('commands.eval.error_processing_command'))
                    .addFields(
                        { name: localeManager.getString('commands.eval.command_field'), value: `${interaction.commandName}` },
                        { name: localeManager.getString('commands.eval.error_field'), value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
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
                      .setLabel(localeManager.getString('commands.eval.botinfo.guilds_button'))
                      .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                      .setLabel('ъ')
                      .setURL("https://samiker.xyz")
                      .setStyle(ButtonStyle.Link)
                  );

                const embed = new EmbedBuilder()
                .setTitle(localeManager.getString('commands.eval.botinfo.embed_title'))
                .setColor('Random')
                .setDescription(
                    localeManager.getString('commands.eval.botinfo.embed_description')
                )

                return await interaction.editReply({
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral,
                    components: [row]
                })
            }
        
            default:
                await interaction.reply({content: localeManager.getString('commands.eval.subcommand_not_found'), flags: MessageFlags.Ephemeral})
                break;
        }
    }
}
