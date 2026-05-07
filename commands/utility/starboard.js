const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const starboardDB = require('../../functions/db/starboard');

const db = new starboardDB();

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('starboard')
		.setDescription('Изменить настройки бота')
        .addSubcommand(sub => 
            sub.setName('settings')
            .setDescription('Настройки для доски звёзд')
            .addChannelOption(opt =>
                opt.setName('starboard-channel')
                .setDescription("Канал для доски звёзд")
            )
            .addBooleanOption(opt =>
                opt.setName('enabled')
                .setDescription("Использовать доску звёзд?")
            )
            .addIntegerOption(opt =>
                opt.setName('min-reactions')
                .setDescription("Минимальное кол-во звёзд для доски звёзд")
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
