const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            switch (interaction.customId) {
                case "eval_botinfo_guilds": {
                    const guilds = await interaction.client.guilds.fetch();
                    await interaction.deferUpdate();
                    const guildsEmbed = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle("Сервера, на которых находится бот")
                    .setDescription("Название(айди). Является владельцем: bool")

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                          .setCustomId(`eval_botinfo_back`)
                          .setLabel('Назад')
                          .setStyle(ButtonStyle.Primary)
                      );

                    guilds.each(guild => {
                        guildsEmbed.setDescription(guildsEmbed.data.description += `\n\`${guild.name}\`(${guild.id}). Бот является владельцем: ${guild.owner}`)
                    })
                    return await interaction.editReply({
                        embeds: [guildsEmbed],
                        components: [row]
                    })
                }
                case "eval_botinfo_back": {
                    await interaction.deferUpdate();
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                          .setCustomId(`eval_botinfo_guilds`)
                          .setLabel('Сервера')
                          .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                          .setLabel('ъ')
                          .setURL("https://samiker.xyz")
                          .setStyle(ButtonStyle.Link)
                      );
    
                    const embed = new EmbedBuilder()
                    .setTitle("Информация о текущем клиенте бота")
                    .setColor('Random')
                    .setDescription(
                        "`Сервера` - на каких серверах находится этот бот\n"+
                        "Здесь могла быть ваша реклама https://samiker.xyz"
                    )

                    return await interaction.editReply({
                        embeds: [embed],
                        flags: MessageFlags.Ephemeral,
                        components: [row]
                    });
                }

            
                default:
                    break;
            }
        }
    },
};