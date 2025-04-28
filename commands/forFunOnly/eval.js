const { SlashCommandBuilder, MessageFlags, PresenceUpdateStatus } = require('discord.js');
const { privateAccess } = require('../../config.json');

const data = new SlashCommandBuilder()
		.setName('eval')
		.setDescription('developer only')
            .addSubcommand(subcommand =>
                subcommand.setName('status')
                .setDescription('set status')
                .addStringOption(option => 
                    option.setName('nameactivity')
                    .setDescription('set name for actiity').setRequired(true)
                )
                .addStringOption(option => 
                    option.setName('presence')
                    .setDescription('select action')
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
                        {name: 'listening', value: 'setlistening'},   мне крайне лень реализовывать это. см 55-56 строки
                        {name: 'competing', value: 'setcompeting'}
                    )
                )*/
            )

            .addSubcommand(subcommand =>
                subcommand.setName('avatar')
                .setDescription('set avatar')
                .addAttachmentOption(option =>
                    option.setName('file')
                    .setDescription('select file')
                    .setRequired(true)
                )
            )

            module.exports = {
                data,
                async execute(interaction) {
                    if (!privateAccess.includes(interaction.user.id)) return await interaction.reply({ content: `Вы не можете использовать эту команду`, flags: MessageFlags.Ephemeral})

                    switch (interaction.options.getSubcommand()) {
                        case "status": {
                            const presence = interaction.options.getString('presence');
                            const nameactivity = interaction.options.getString('nameactivity');
                            
                            try {
                                //вот тут можно выбрать только статус(не в сети/в сети/итд) и текст активности, но нельзя выбрать активность(наблюдает, слушает итд)
                                //поэтому пока что так. потом надо тут сделать либо доп сабкоманду как было раньше, но сделать так, чтобы текст активности не сбрасывался
                                await interaction.client.user.setPresence({ activities: [{ name: nameactivity }], status: presence });
                                await interaction.reply({content: `статус изменён. ${presence}, ${nameactivity}`, flags: MessageFlags.Ephemeral });
                            } catch (error) {
                                await interaction.reply({content: `Не удалось изменить статус`, flags: MessageFlags.Ephemeral });
                                console.log(error);
                            }
                            break;
                        }

                        case "avatar": {
                            const attachment = interaction.options.getAttachment('file');
                            const image = (attachment.url);
    
                            await interaction.client.user.setAvatar(image);
                            await interaction.reply({content: `Аватар изменён`, flags: MessageFlags.Ephemeral});
                            break;
                        }
                    
                        default:
                            await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                            break;
                    }
                }
            }
