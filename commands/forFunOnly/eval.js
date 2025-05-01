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
                    .setRequired(true)
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
                            const presence = interaction.options.getString('presence');
                            const nameactivity = interaction.options.getString('nameactivity');
                            
                            try {
                                //вот тут можно выбрать только статус(не в сети/в сети/итд) и текст активности, но нельзя выбрать активность(наблюдает, слушает итд)
                                //поэтому пока что так. потом надо тут сделать либо доп сабкоманду как было раньше, но сделать так, чтобы текст активности не сбрасывался
                                await interaction.client.user.setPresence({ activities: [{ name: nameactivity }], status: presence });
                                await await interaction.reply({content: `статус изменён. ${presence}, ${nameactivity}`, flags: MessageFlags.Ephemeral });
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
