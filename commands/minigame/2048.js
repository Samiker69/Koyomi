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
const cooldowns = new Map();

const tileEmojis = {
    0: '⬛', 2: '2️⃣', 4: '4️⃣', 8: '🟦', 16: '🟩', 32: '🟨',
    64: '🟧', 128: '🟥', 256: '🟪', 512: '🟫', 1024: '🔵', 2048: '🟡', 4096: '💎',
};

function createEmptyBoard() {
    return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function getEmptyCells(board) {
    const empty = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) empty.push([r, c]);
        }
    }
    return empty;
}

function spawnTile(board) {
    const empty = getEmptyCells(board);
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function renderBoard(board) {
    return board.map(row => row.map(cell => tileEmojis[cell] || '❓').join(' ')).join('\n');
}

function slideAndMerge(row) {
    let arr = row.filter(v => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            arr[i + 1] = 0;
        }
    }
    return arr.filter(v => v !== 0).concat(Array(4 - arr.filter(v => v !== 0).length).fill(0));
}

function moveBoard(board, dir) {
    let moved = false;
    const newBoard = board.map(row => [...row]);

    if (dir === 'left') {
        for (let r = 0; r < 4; r++) {
            const newRow = slideAndMerge(newBoard[r]);
            if (newRow.join() !== newBoard[r].join()) moved = true;
            newBoard[r] = newRow;
        }
    } else if (dir === 'right') {
        for (let r = 0; r < 4; r++) {
            const newRow = slideAndMerge(newBoard[r].slice().reverse()).reverse();
            if (newRow.join() !== newBoard[r].join()) moved = true;
            newBoard[r] = newRow;
        }
    } else if (dir === 'up') {
        for (let c = 0; c < 4; c++) {
            const col = newBoard.map(row => row[c]);
            const newCol = slideAndMerge(col);
            for (let r = 0; r < 4; r++) {
                if (newBoard[r][c] !== newCol[r]) moved = true;
                newBoard[r][c] = newCol[r];
            }
        }
    } else if (dir === 'down') {
        for (let c = 0; c < 4; c++) {
            const col = newBoard.map(row => row[c]).reverse();
            const newCol = slideAndMerge(col).reverse();
            for (let r = 0; r < 4; r++) {
                if (newBoard[r][c] !== newCol[r]) moved = true;
                newBoard[r][c] = newCol[r];
            }
        }
    }

    return moved ? newBoard : null;
}

function isGameOver(board) {
    if (getEmptyCells(board).length > 0) return false;
    return !['left', 'right', 'up', 'down'].some(dir => moveBoard(board, dir));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('2048')
        .setDescription('Play 2048 game')
        .setDescriptionLocalizations(localeManager.getLocalizations('minigame.2048.description')),

    async execute(interaction) {
        const playerId = interaction.user.id;
        const now = Date.now();
        const last = cooldowns.get(playerId);
        if (last && now - last < 10000) {
            return interaction.reply({
                content: localeManager.get('minigame.2048.messages.cooldown', interaction.guildLocale || 'ru', { time: (10 - Math.floor((now - last) / 1000)) }),
                flags: MessageFlags.Ephemeral
            });
        }
        cooldowns.set(playerId, now);

        if (activeGames.has(playerId)) {
            return interaction.reply({
                content: localeManager.get('minigame.2048.messages.already_active', interaction.guildLocale || 'ru'),
                flags: MessageFlags.Ephemeral
            });
        }
        activeGames.add(playerId);

        let board = createEmptyBoard();
        spawnTile(board);
        spawnTile(board);

        const getComponents = (disabled = false) => [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('up').setEmoji('⬆️').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
                new ButtonBuilder().setCustomId('down').setEmoji('⬇️').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
                new ButtonBuilder().setCustomId('left').setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
                new ButtonBuilder().setCustomId('right').setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
                new ButtonBuilder().setCustomId('restart').setEmoji('🔁').setStyle(ButtonStyle.Success).setDisabled(disabled)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('end').setLabel(localeManager.get('minigame.2048.messages.btn_surrender', interaction.guildLocale || 'ru')).setStyle(ButtonStyle.Danger).setDisabled(disabled)
            )
        ];

        const embed = EmbedService.createBaseEmbed(interaction)
            .setTitle('🎮 2048')
            .setDescription(renderBoard(board))
            .setFooter({ text: localeManager.get('minigame.2048.messages.footer', interaction.guildLocale || 'ru') });

        await interaction.reply({ embeds: [embed], components: getComponents() });
        const msg = await interaction.fetchReply();

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 10 * 60 * 1000
        });

        collector.on('collect', async btn => {
            if (btn.user.id !== playerId) {
                return btn.reply({ content: localeManager.get('minigame.2048.messages.not_your_game', interaction.guildLocale || 'ru'), flags: MessageFlags.Ephemeral });
            }

            try {
                if (btn.customId === 'end') {
                    collector.stop('surrendered');
                    return await btn.update({
                        embeds: [embed.setDescription(renderBoard(board) + localeManager.get('minigame.2048.messages.surrendered', interaction.guildLocale || 'ru'))],
                        components: getComponents(true)
                    });
                }

                if (btn.customId === 'restart') {
                    board = createEmptyBoard();
                    spawnTile(board);
                    spawnTile(board);
                    embed.setDescription(renderBoard(board));
                    return await btn.update({ embeds: [embed], components: getComponents() });
                }

                const moved = moveBoard(board, btn.customId);
                if (!moved) return await btn.deferUpdate();

                board = moved;
                spawnTile(board);

                if (isGameOver(board)) {
                    collector.stop('gameover');
                    return await btn.update({
                        embeds: [embed.setDescription(renderBoard(board) + localeManager.get('minigame.2048.messages.game_over', interaction.guildLocale || 'ru'))],
                        components: getComponents(true)
                    });
                }

                embed.setDescription(renderBoard(board));
                await btn.update({ embeds: [embed] });
            } catch (err) {
                console.error('Ошибка взаимодействия:', err);
            }
        });

        collector.on('end', async () => {
            activeGames.delete(playerId);
            try {
                await msg.edit({ components: getComponents(true) });
            } catch (err) {
                console.error('Ошибка при отключении кнопок:', err);
            }
        });
    }
};
