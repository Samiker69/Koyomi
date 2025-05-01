const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ComponentType,
    MessageFlags
} = require('discord.js');
const {minigame} = require('../../locales/descriptions/minigame')

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription(minigame.tictactoe.description.ru)
        .setDescriptionLocalizations(minigame.tictactoe.description)
        .addUserOption(opt =>
            opt.setName('opponent')
                .setDescription(minigame.tictactoe.options.opponent.description.ru)
                .setDescriptionLocalizations(minigame.tictactoe.options.opponent.description)
                .setRequired(true)
        ),

    async execute(interaction) {
        const playerX = interaction.user;
        const playerO = interaction.options.getUser('opponent');

        if (playerX.id === playerO.id) {
            return interaction.reply({
                content: 'Нельзя играть с самим собой!',
                flags: MessageFlags.Ephemeral
            });
        }

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('accept')
                .setLabel('✅ Принять вызов')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('decline')
                .setLabel('❌ Отклонить')
                .setStyle(ButtonStyle.Danger)
        );

        const confirmEmbed = new EmbedBuilder()
            .setTitle('Вызов на Крестики-нолики')
            .setDescription(`${playerO}, ${playerX} вызывает вас на игру. Примите или отклоните.`)
            .setColor(0x3498DB);

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
                    content: 'Это не ваш вызов!',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (btn.customId === 'decline') {
                confirmCollector.stop();
                return interaction.editReply({
                    content: 'Вызов отклонён.',
                    embeds: [],
                    components: []
                });
            }

            if (btn.customId === 'accept') {
                confirmCollector.stop();
                startGame();
            }
        });

        confirmCollector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await interaction.editReply({
                    content: 'Время на принятие истекло.',
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
                            .setLabel('🏳️ Сдаться')
                            .setStyle(ButtonStyle.Danger)
                    ));
                }

                return rows;
            };

            const embed = new EmbedBuilder()
                .setTitle('Крестики-нолики')
                .setDescription(`Ходит: ${players[turn]}`)
                .setColor(0x2ECC71);

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
                    [0, 1, 2], [3, 4, 5], [6, 7, 8],
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],
                    [0, 4, 8], [2, 4, 6]
                ];
                return lines.some(([a, b, c]) =>
                    board[a] !== '⬜' && board[a] === board[b] && board[a] === board[c]
                );
            };

            collector.on('collect', async btn => {
                const user = btn.user;

                if (btn.customId === 'surrender') {
                    if (user.id !== players[turn].id) {
                        return btn.reply({
                            content: 'Сейчас не ваш ход.',
                            flags: MessageFlags.Ephemeral
                        });
                    }
                    embed.setDescription(`🏳️ ${user} сдался!\nПобедил ${players[1 - turn]}!`);
                    collector.stop('surrender');
                    return btn.update({
                        embeds: [embed],
                        components: disableBoard()
                    });
                }

                if (user.id !== players[turn].id) {
                    return btn.reply({
                        content: 'Сейчас не ваш ход.',
                        flags: MessageFlags.Ephemeral
                    });
                }

                const idx = parseInt(btn.customId);
                if (board[idx] !== '⬜') {
                    return btn.reply({
                        content: 'Эта клетка уже занята.',
                        flags: MessageFlags.Ephemeral
                    });
                }

                board[idx] = emojis[turn];
                if (checkWin()) {
                    embed.setDescription(`Победил ${players[turn]}!`);
                    collector.stop('win');
                } else if (!board.includes('⬜')) {
                    embed.setDescription('Ничья!');
                    collector.stop('tie');
                } else {
                    turn = 1 - turn;
                    embed.setDescription(`Ходит: ${players[turn]}`);
                }

                await btn.update({
                    embeds: [embed],
                    components: getBoardComponents()
                });
            });

            collector.on('end', async (_, reason) => {
                if (reason === 'time') {
                    embed.setDescription('Время вышло. Игра окончена.');
                }
                await msg.edit({
                    embeds: [embed],
                    components: disableBoard()
                });
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
