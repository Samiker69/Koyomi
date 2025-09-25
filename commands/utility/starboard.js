const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const starboardDB = require('../../functions/db/starboard');
const LocaleManager = require('../../locales/localesManager');

const db = new starboardDB();
const localeManager = new LocaleManager();

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName(localeManager.getString('commands.starboard.name'))
		.setDescription(localeManager.getString('commands.starboard.description'))
        .addSubcommand(sub => 
            sub.setName(localeManager.getString('commands.starboard.settings.name'))
            .setDescription(localeManager.getString('commands.starboard.settings.description'))
            .addChannelOption(opt =>
                opt.setName(localeManager.getString('commands.starboard.settings.options.starboard-channel.name'))
                .setDescription(localeManager.getString('commands.starboard.settings.options.starboard-channel.description'))
            )
            .addBooleanOption(opt =>
                opt.setName(localeManager.getString('commands.starboard.settings.options.enabled.name'))
                .setDescription(localeManager.getString('commands.starboard.settings.options.enabled.description'))
            )
            .addIntegerOption(opt =>
                opt.setName(localeManager.getString('commands.starboard.settings.options.min-reactions.name'))
                .setDescription(localeManager.getString('commands.starboard.settings.options.min-reactions.description'))
                .setMinValue(1)
            )
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
,

    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case "settings": {
                const channel = interaction.options.getChannel("starboard-channel") || undefined;
                const changes = {
                    starboardChannelId: channel ? channel.id : channel,
                    enabled: interaction.options.getBoolean("enabled"),
                    minReactions: interaction.options.getInteger("min-reactions") || undefined,
                }
                if (changes.enabled === undefined && changes.starboardChannelId === undefined && changes.minReactions === undefined) return await interaction.reply({content: "Все поля пустые!", flags: MessageFlags.Ephemeral})

                db.updateSettings(interaction.guild.id, changes);
                await interaction.reply("Настройки доски звёзд обновлены")
                break;
            }
            
                
        
            default:
                await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                break;
        }
    }
}
