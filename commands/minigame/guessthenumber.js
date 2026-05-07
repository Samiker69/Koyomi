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

const activeGames = new Set();

module.exports = {
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName('guessthenumber')
        .setDescription('Угадай число на скорость'),

    async execute(interaction) {
        const channelId = interaction.channelId;
        if (activeGames.has(channelId)) {
            return interaction.reply({ content: 'В этом канале уже идёт игра «Угадай число». Подождите её окончания.', flags: MessageFlags.Ephemeral });
        }
        activeGames.add(channelId);

        let low = 1;
        let high = 100;
        const target = Math.floor(Math.random() * (high - low + 1)) + low;
        const timeLimit = 60_000;

        const cancelRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Отменить игру')
                .setStyle(ButtonStyle.Danger)
        );

        const embed = EmbedService.createBaseEmbed(interaction)
            .setTitle('Угадай число')
            .setDescription(`Я загадал число от ${low} до ${high}. У вас ${timeLimit / 1000} секунд, чтобы угадать его.`)
            .setFooter({ text: 'Попыток: 0 | Игроков: 0' });

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
                finishGame('Игра отменена инициатором.');
            } else {
                btn.reply({ content: 'Только инициатор может отменить игру.', flags: MessageFlags.Ephemeral });
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
                finishGame(`Победитель: ${msg.author.username}\nЧисло: ${target}\nПопыток: ${attempts}`);
            } else {
                if (guess > target) high = guess - 1;
                else low = guess + 1;
                embed.setDescription(`Число находится между ${low} и ${high}.`)
                     .setFooter({ text: `Попыток: ${attempts} | Игроков: ${players.size}` });
                await message.edit({ embeds: [embed] });
            }
        });

        guessCollector.on('end', () => {
            if (!finished) {
                finishGame(`Время вышло! Было загадано: ${target}`);
            }
        });

        async function finishGame(resultText) {
            embed.setDescription(resultText)
                 .setFooter({ text: `Попыток: ${attempts} | Игроков: ${players.size}` });
            await message.edit({ embeds: [embed], components: [] });
            btnCollector.stop();
            guessCollector.stop();
            activeGames.delete(channelId);
        }
    }
};
