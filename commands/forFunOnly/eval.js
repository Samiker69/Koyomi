const { SlashCommandBuilder, MessageFlags, PresenceUpdateStatus, ActivityType, EmbedBuilder } = require('discord.js');
const { privateAccess } = require('../../config.json');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly');
/*const { default: axios } = require('axios');
const path = require('path');
const fs = require('fs').promises*/

const data = new SlashCommandBuilder()
    .setName('eval')
    .setDescription(forFunOnly.eval.description.ru)
        .addSubcommand(subcommand =>
            subcommand.setName('presence')
            .setDescription("Устанавливает статус бота")
            //.setDescriptionLocalizations(forFunOnly.eval.description)
            .addStringOption(option => 
                option.setName('name-activity')
                .setDescription(forFunOnly.eval.options.activity.description.ru)
                .setDescriptionLocalizations(forFunOnly.eval.options.activity.description)
            )
            .addStringOption(option => 
                option.setName('status')
                .setDescription(forFunOnly.eval.options.activity.description.ru)
                .setDescriptionLocalizations(forFunOnly.eval.options.activity.description)
                .addChoices(
                    {name: 'online', value: PresenceUpdateStatus.Online},
                    {name: 'idle', value: PresenceUpdateStatus.Idle},
                    {name: 'dnd', value: PresenceUpdateStatus.DoNotDisturb},
                    {name: 'invisible', value: PresenceUpdateStatus.Invisible}
                )
            )
            .addIntegerOption(option =>
                option.setName('activity')
                .setDescription(forFunOnly.eval.options.activity.description.ru)
                .setDescriptionLocalizations(forFunOnly.eval.options.activity.description)
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
            .setDescription("Сменить аватар бота")
            .addAttachmentOption(option =>
                option.setName('file')
                .setDescription(forFunOnly.eval.options.avatar.description.ru)
                .setDescriptionLocalizations(forFunOnly.eval.options.avatar.description)
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('banner')
            .setDescription("Сменить баннер бота")
            .addAttachmentOption(option =>
                option.setName('file')
                .setDescription(forFunOnly.eval.options.avatar.description.ru)
                .setDescriptionLocalizations(forFunOnly.eval.options.avatar.description)
                .setRequired(true)
            )
        )

module.exports = {
    cooldown: 5,
    data,
    async execute(interaction) {
        if (!privateAccess.includes(interaction.user.id)) return await await interaction.reply({ content: `Вы не можете использовать эту команду`, flags: MessageFlags.Ephemeral})

        switch (interaction.options.getSubcommand()) {
            case "presence": {
                const presence = interaction.options.getString('status') || interaction.client.user.presence.status;
                const activity = interaction.options.getInteger('activity') || interaction.client.user.presence.status
                const nameactivity = interaction.options.getString('name-activity') || interaction.client.user.presence.name || '';
                
                try {
                    await interaction.client.user.setPresence({ activities: [{ name: nameactivity }], status: presence });
                    await interaction.client.user.setActivity(nameactivity, { type: activity })
                    await await interaction.reply({content: `Cтатус изменён. ${presence}, ${nameactivity}, ${activity}`, flags: MessageFlags.Ephemeral });
                } catch (error) {
                    await await interaction.reply({content: `Не удалось изменить статус`, flags: MessageFlags.Ephemeral });
                    console.error(error)
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
                    await interaction.editReply({content: `Аватар изменён`, flags: MessageFlags.Ephemeral});
                } catch (error) {
                    await interaction.editReply({content: `Не удалось изменить аватар`, flags: MessageFlags.Ephemeral});
                    console.error(error)
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
                    await interaction.editReply({content: `Баннер изменён`, flags: MessageFlags.Ephemeral});
                } catch (error) {
                    await interaction.editReply({content: `Не удалось изменить баннер`, flags: MessageFlags.Ephemeral});
                    console.error(error)
                }
                break;
            }
        
            default:
                await await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                break;
        }
    }
}
