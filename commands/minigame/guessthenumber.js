const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ComponentType,
    MessageFlags
} = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');

const activeGames = new Set();

module.exports = {
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('guessthenumber')
        .setDescription('Guess the number game')
        .setDescriptionLocalizations(localeManager.getLocalizations('minigame.guessthenumber.description')),

    async execute(interaction) {
        const channelId = interaction.channelId;
        if (activeGames.has(channelId)) {
            return interaction.reply({ content: localeManager.get('minigame.guessthenumber.messages.already_active', interaction.guildLocale || 'ru'), flags: MessageFlags.Ephemeral });
        }
        activeGames.add(channelId);

        let low = 1;
        let high = 100;
        const target = Math.floor(Math.random() * (high - low + 1)) + low;
        const timeLimit = 60_000;

        const cancelRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel(localeManager.get('minigame.guessthenumber.messages.btn_cancel', interaction.guildLocale || 'ru'))
                .setStyle(ButtonStyle.Danger)
        );

        const embed = EmbedService.createBaseEmbed(interaction)
            .setTitle(localeManager.get('minigame.guessthenumber.messages.title', interaction.guildLocale || 'ru'))
            .setDescription(localeManager.get('minigame.guessthenumber.messages.start_desc', interaction.guildLocale || 'ru', { low, high, time: timeLimit / 1000 }))
            .setFooter({ text: localeManager.get('minigame.guessthenumber.messages.footer', interaction.guildLocale || 'ru', { attempts: 0, players: 0 }) });

        await interaction.reply({ embeds: [embed], components: [cancelRow] });
        const message = await interaction.fetchReply();

        let attempts = 0;
        const players = new Set();
        let finished = false;

        const btnCollector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: timeLimit
        });
        const guessCollector = interaction.channel.createMessageCollector({
            time: timeLimit,
            filter: msg => !msg.author.bot && !isNaN(msg.content) && +msg.content >= low && +msg.content <= high
        });

        btnCollector.on('collect', btn => {
            if (btn.user.id === interaction.user.id) {
                finished = true;
                finishGame(localeManager.get('minigame.guessthenumber.messages.game_cancelled', interaction.guildLocale || 'ru'));
            } else {
                btn.reply({ content: localeManager.get('minigame.guessthenumber.messages.only_initiator_cancel', interaction.guildLocale || 'ru'), flags: MessageFlags.Ephemeral });
            }
        });

        guessCollector.on('collect', async msg => {
            if (finished) return;
            const guess = +msg.content;
            attempts++;
            players.add(msg.author.id);
            await msg.delete().catch(() => {});

            if (guess === target) {
                finished = true;
                finishGame(localeManager.get('minigame.guessthenumber.messages.winner_desc', interaction.guildLocale || 'ru', { user: msg.author.username, target, attempts }));
            } else {
                if (guess > target) high = guess - 1;
                else low = guess + 1;
                embed.setDescription(localeManager.get('minigame.guessthenumber.messages.range_hint', interaction.guildLocale || 'ru', { low, high }))
                     .setFooter({ text: localeManager.get('minigame.guessthenumber.messages.footer', interaction.guildLocale || 'ru', { attempts, players: players.size }) });
                await message.edit({ embeds: [embed] });
            }
        });

        guessCollector.on('end', () => {
            if (!finished) {
                finishGame(localeManager.get('minigame.guessthenumber.messages.timeout_desc', interaction.guildLocale || 'ru', { target }));
            }
        });

        async function finishGame(resultText) {
            embed.setDescription(resultText)
                 .setFooter({ text: localeManager.get('minigame.guessthenumber.messages.footer', interaction.guildLocale || 'ru', { attempts, players: players.size }) });
            await message.edit({ embeds: [embed], components: [] });
            btnCollector.stop();
            guessCollector.stop();
            activeGames.delete(channelId);
        }
    }
};
