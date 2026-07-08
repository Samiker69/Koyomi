const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const LogAnalyzerService = require('../../services/LogAnalyzerService');
const localeManager = require('../../locales/localeManager');
const EmbedService = require('../../services/EmbedService');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('parse')
        .setDescription(localeManager.get('parser.commands.parse.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.parse.description'))
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription(localeManager.get('parser.commands.parse.file.description', 'en-US'))
                .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.parse.file.description'))
                .setRequired(true)
        ),
    async execute(interaction) {
        const lang = interaction.guildLocale || 'ru';
        const file = interaction.options.getAttachment('file');

        if (!file.name.endsWith('.txt') && !file.name.endsWith('.log') && !file.contentType?.startsWith('text/')) {
            return await interaction.reply({
                content: localeManager.get('parser.messages.invalid_format', lang),
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply();

        try {
            const response = await fetch(file.url);
            const logText = await response.text();

            if (!logText) {
                return await interaction.editReply(localeManager.get('parser.messages.empty_file', lang));
            }

            const result = await LogAnalyzerService.analyze(logText, lang);

            if (result.isDenied) {
                return await interaction.editReply({ content: result.denyReason });
            }

            const embed = EmbedService.createBaseEmbed(interaction)
                .setTitle(localeManager.get('parser.embed.title', lang))
                .setColor(0x9B59B6);

            if (result.system) {
                const systemInfoMap = {
                    'Launcher version': 'parser.labels.launcher_version',
                    'Selected Minecraft version': 'parser.labels.mc_version',
                    'RAM allocated': 'parser.labels.ram',
                };
                for (const [key, labelKey] of Object.entries(systemInfoMap)) {
                    if (result.system[key]) {
                        embed.addFields({ name: localeManager.get(labelKey, lang), value: String(result.system[key]), inline: true });
                    }
                }
            }

            if (result.crash) {
                if (result.crash.mainException) {
                    embed.addFields({ name: localeManager.get('parser.embed.exception', lang), value: `\`\`\`${result.crash.mainException.substring(0, 500)}\`\`\`` });
                }
            }

            if (result.solutions && result.solutions.length > 0) {
                const solText = result.solutions.map((s, i) => `${i + 1}. ${s}`).join('\n');
                embed.addFields({ name: localeManager.get('parser.embed.solutions', lang), value: solText.substring(0, 1024) });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[Command /parse Error]:', error);
            await interaction.editReply(localeManager.get('parser.messages.error', lang));
        }
    }
};