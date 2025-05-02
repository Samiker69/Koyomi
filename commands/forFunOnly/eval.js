const { SlashCommandBuilder, MessageFlags, PresenceUpdateStatus } = require('discord.js');
const { privateAccess } = require('../../config.json');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly')

const data = new SlashCommandBuilder()
		.setName('eval')
		.setDescription(forFunOnly.eval.description.ru)
            .addSubcommand(subcommand =>
                subcommand.setName('status')
                .setDescription("ъ")
                //.setDescriptionLocalizations(forFunOnly.eval.description)
                .addStringOption(option => 
                    option.setName('name-activity')
                    .setDescription(forFunOnly.eval.options.activity.description.ru)
                    .setDescriptionLocalizations(forFunOnly.eval.options.activity.description)
                )
                .addStringOption(option => 
                    option.setName('presence')
                    .setDescription(forFunOnly.eval.options.activity.description.ru)
                    .setDescriptionLocalizations(forFunOnly.eval.options.activity.description)
                    .addChoices(
                        {name: 'online', value: PresenceUpdateStatus.Online},
                        {name: 'idle', value: PresenceUpdateStatus.Idle},
                        {name: 'dnd', value: PresenceUpdateStatus.DoNotDisturb},
                        {name: 'invisible', value: PresenceUpdateStatus.Invisible}
                    ))
                /*.addStringOption(option =>
                    option.setName('activity')
                    .setDescription('select action')
                    .addChoices(
                        {name: 'wathing', value: 'setwathing'}, 
                        {name: 'listening', value: 'setlistening'},
                        {name: 'competing', value: 'setcompeting'}
                    )
                )*/
            )

            .addSubcommand(subcommand =>
                subcommand.setName('avatar')
                .setDescription("Change bot avatar")
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
                        case "status": {
                            const presence = interaction.options.getString('presence')  || interaction.client.user.presence.status;
                            const nameactivity = interaction.options.getString('name-activity')  || interaction.client.user.presence.name;
                            
                            try {
                                await interaction.client.user.setPresence({ activities: [{ name: nameactivity }], status: presence });
                                await await interaction.reply({content: `Cтатус изменён. ${presence}, ${nameactivity}`, flags: MessageFlags.Ephemeral });
                            } catch (error) {
                                await await interaction.reply({content: `Не удалось изменить статус`, flags: MessageFlags.Ephemeral });
                                console.log(error);
                            }
                            break;
                        }

                        case "avatar": {
                            const attachment = interaction.options.getAttachment('file');
                            const image = (attachment.url);
    
                            await interaction.client.user.setAvatar(image);
                            await await interaction.reply({content: `Аватар изменён`, flags: MessageFlags.Ephemeral});
                            break;
                        }
                    
                        default:
                            await await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                            break;
                    }
                }
            }
