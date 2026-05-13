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
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Play Tic Tac Toe with someone')
        .setDescriptionLocalizations(localeManager.getLocalizations('minigame.tictactoe.description'))
        .addUserOption(opt =>
            opt.setName('opponent')
                .setDescription('Select an opponent')
                .setDescriptionLocalizations(localeManager.getLocalizations('minigame.tictactoe.options.opponent.description'))
                .setRequired(true)
        ),

    async execute(interaction) {
        const playerX = interaction.user;
        const playerO = interaction.options.getUser('opponent');

        if (playerO.bot) {
            return interaction.reply({
                content: localeManager.get('minigame.tictactoe.messages.no_bots', interaction.guildLocale || 'ru'),
                flags: MessageFlags.Ephemeral
            });
        }

        if (playerX.id === playerO.id) {
            return interaction.reply({
                content: localeManager.get('minigame.tictactoe.messages.no_self', interaction.guildLocale || 'ru'),
                flags: MessageFlags.Ephemeral
            });
        }

        if (activeGames.has(playerX.id) || activeGames.has(playerO.id)) {
            return interaction.reply({
                content: localeManager.get('minigame.tictactoe.messages.already_in_game', interaction.guildLocale || 'ru'),
                flags: MessageFlags.Ephemeral
            });
        }

        activeGames.add(playerX.id);
        activeGames.add(playerO.id);

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('accept')
                .setLabel('✅ ' + localeManager.get('minigame.tictactoe.messages.btn_accept', interaction.guildLocale || 'ru'))
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('decline')
                .setLabel('❌ ' + localeManager.get('minigame.tictactoe.messages.btn_decline', interaction.guildLocale || 'ru'))
                .setStyle(ButtonStyle.Danger)
        );

        const confirmEmbed = EmbedService.createBaseEmbed(interaction)
            .setTitle(localeManager.get('minigame.tictactoe.messages.invite_title', interaction.guildLocale || 'ru'))
            .setDescription(localeManager.get('minigame.tictactoe.messages.invite_desc', interaction.guildLocale || 'ru', { opponent: playerO.toString(), user: playerX.toString() }));

        await interaction.reply({
            embeds: [confirmEmbed],
            components: [confirmRow]
        });

        const confirmMsg = await interaction.fetchReply();
        const confirmCollector = confirmMsg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60_000
        });

        confirmCollector.on('collect', async btn => {
            if (btn.user.id !== playerO.id) {
                return btn.reply({
                    content: localeManager.get('minigame.tictactoe.messages.not_your_challenge', interaction.guildLocale || 'ru'),
                    flags: MessageFlags.Ephemeral
                });
            }
            if (btn.customId === 'decline') {
                confirmCollector.stop();
                activeGames.delete(playerX.id);
                activeGames.delete(playerO.id);
                return interaction.editReply({
                    content: localeManager.get('minigame.tictactoe.messages.challenge_declined', interaction.guildLocale || 'ru'),
                    embeds: [],
                    components: []
                });
            }
            if (btn.customId === 'accept') {
                confirmCollector.stop();
                startGame();
            }
        });

        confirmCollector.on('end', (_, reason) => {
            if (reason === 'time') {
                activeGames.delete(playerX.id);
                activeGames.delete(playerO.id);
                interaction.editReply({
                    content: localeManager.get('minigame.tictactoe.messages.challenge_timeout', interaction.guildLocale || 'ru'),
                    embeds: [],
                    components: []
                });
            }
        });

        async function startGame() {
            let board = Array(9).fill('⬜');
            let turn = 0;
            const players = [playerX, playerO];
            const emojis = ['❌', '⭕'];

            const getBoardComponents = (addSurrender = true) => {
                const rows = [
                    new ActionRowBuilder().addComponents(
                        board.slice(0, 3).map((cell, i) =>
                            new ButtonBuilder()
                                .setCustomId(i.toString())
                                .setLabel(cell)
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(cell !== '⬜')
                        )
                    ),
                    new ActionRowBuilder().addComponents(
                        board.slice(3, 6).map((cell, i) =>
                            new ButtonBuilder()
                                .setCustomId((i + 3).toString())
                                .setLabel(cell)
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(cell !== '⬜')
                        )
                    ),
                    new ActionRowBuilder().addComponents(
                        board.slice(6, 9).map((cell, i) =>
                            new ButtonBuilder()
                                .setCustomId((i + 6).toString())
                                .setLabel(cell)
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(cell !== '⬜')
                        )
                    )
                ];

                if (addSurrender) {
                    rows.push(new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('surrender')
                            .setLabel('🏳️ ' + localeManager.get('minigame.tictactoe.messages.btn_surrender', interaction.guildLocale || 'ru'))
                            .setStyle(ButtonStyle.Danger)
                    ));
                }
                return rows;
            };

            const embed = EmbedService.createBaseEmbed(interaction)
                .setTitle(localeManager.get('minigame.tictactoe.messages.invite_title', interaction.guildLocale || 'ru'))
                .setDescription(localeManager.get(turn === 0 ? 'minigame.tictactoe.messages.turn_x' : 'minigame.tictactoe.messages.turn_o', interaction.guildLocale || 'ru', { user: players[turn].toString() }));

            const msg = await interaction.editReply({
                embeds: [embed],
                components: getBoardComponents(),
                fetchReply: true
            });

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 5 * 60 * 1000
            });

            const checkWin = () => {
                const lines = [
                    [0,1,2],[3,4,5],[6,7,8],
                    [0,3,6],[1,4,7],[2,5,8],
                    [0,4,8],[2,4,6]
                ];
                return lines.some(([a,b,c]) =>
                    board[a] !== '⬜' && board[a] === board[b] && board[a] === board[c]
                );
            };

            collector.on('collect', async btn => {
                const user = btn.user;
                if (btn.customId === 'surrender') {
                    if (user.id !== players[turn].id) {
                        return btn.reply({
                            content: localeManager.get('minigame.tictactoe.messages.not_your_turn', interaction.guildLocale || 'ru'),
                            flags: MessageFlags.Ephemeral
                        });
                    }
                    embed.setDescription(localeManager.get('minigame.tictactoe.messages.surrendered', interaction.guildLocale || 'ru', { user: user.toString(), winner: players[1-turn].toString() }));
                    collector.stop('surrender');
                    return btn.update({ embeds:[embed], components:disableBoard() });
                }

                if (user.id !== players[turn].id) {
                    return btn.reply({
                        content: localeManager.get('minigame.tictactoe.messages.not_your_turn', interaction.guildLocale || 'ru'),
                        flags: MessageFlags.Ephemeral
                    });
                }
                const idx = parseInt(btn.customId);
                if (board[idx] !== '⬜') {
                    return btn.reply({
                        content: localeManager.get('minigame.tictactoe.messages.cell_occupied', interaction.guildLocale || 'ru'),
                        flags: MessageFlags.Ephemeral
                    });
                }
                board[idx] = emojis[turn];
                if (checkWin()) {
                    embed.setDescription(localeManager.get('minigame.tictactoe.messages.winner', interaction.guildLocale || 'ru', { user: players[turn].toString() }));
                    collector.stop('win');
                } else if (!board.includes('⬜')) {
                    embed.setDescription(localeManager.get('minigame.tictactoe.messages.draw', interaction.guildLocale || 'ru'));
                    collector.stop('tie');
                } else {
                    turn = 1 - turn;
                    embed.setDescription(localeManager.get(turn === 0 ? 'minigame.tictactoe.messages.turn_x' : 'minigame.tictactoe.messages.turn_o', interaction.guildLocale || 'ru', { user: players[turn].toString() }));
                }
                await btn.update({ embeds:[embed], components:getBoardComponents() });
            });

            collector.on('end', async (_, reason) => {
                activeGames.delete(playerX.id);
                activeGames.delete(playerO.id);

                if (reason === 'time') {
                    embed.setDescription(localeManager.get('minigame.tictactoe.messages.timeout', interaction.guildLocale || 'ru'));
                }
                await msg.edit({ embeds:[embed], components:disableBoard() });
            });

            function disableBoard() {
                return getBoardComponents(false).map(row =>
                    new ActionRowBuilder().addComponents(
                        row.components.map(b => ButtonBuilder.from(b).setDisabled(true))
                    )
                );
            }
        }
    }
};
