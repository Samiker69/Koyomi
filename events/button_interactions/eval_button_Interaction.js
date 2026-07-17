const { Events, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../database/repositories');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.guildLocale) {
            const cfg = await DatabaseService.getSettings(interaction.guild?.id);
            Object.defineProperty(interaction, 'guildLocale', {
                value: cfg?.language || 'ru',
                writable: false,
                configurable: true
            });
        }
        const lang = interaction.guildLocale;

        if (interaction.isButton()) {
            switch (interaction.customId) {
                case "eval_botinfo_guilds": {
                    const guilds = await interaction.client.guilds.fetch();
                    await interaction.deferUpdate();
                    const guildsEmbed = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle(localeManager.get('forFunOnly.eval.messages.guilds_title', lang))
                    .setDescription(localeManager.get('forFunOnly.eval.messages.guilds_header', lang))

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                          .setCustomId(`eval_botinfo_back`)
                          .setLabel(localeManager.get('forFunOnly.eval.messages.buttons.back', lang))
                          .setStyle(ButtonStyle.Primary)
                      );

                    guilds.each(guild => {
                        guildsEmbed.setDescription(guildsEmbed.data.description += `\n\`${guild.name}\`(${guild.id}). ${localeManager.get('forFunOnly.eval.messages.guild_owner_label', lang)}${guild.owner}`)
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
                          .setLabel(localeManager.get('forFunOnly.eval.messages.buttons.guilds', lang))
                          .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                          .setLabel('ъ')
                          .setURL("https://samiker.xyz")
                          .setStyle(ButtonStyle.Link)
                      );
    
                    const embed = new EmbedBuilder()
                    .setTitle(localeManager.get('forFunOnly.eval.messages.botinfo_title', lang))
                    .setColor('Random')
                    .setDescription(localeManager.get('forFunOnly.eval.messages.botinfo_description', lang))
 
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