const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Удаляет указанное количество сообщений от пользователей')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Количество сообщений для удаления (1-100)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Укажи количество сообщений от 1 до 100.', flags: MessageFlags.Ephemeral });
        }

        const channel = interaction.channel;

        try {
            const messages = await channel.messages.fetch({ limit: amount });
            const userMessages = messages.filter(msg => !msg.author.bot);

            if (userMessages.size === 0) {
                return interaction.reply({ content: 'Нет сообщений для удаления.', flags: MessageFlags.Ephemeral });
            }

            await channel.bulkDelete(userMessages, true);

            const reply = await interaction.reply({ content: `Удалено ${userMessages.size} сообщений.`, flags: MessageFlags.Ephemeral });

            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 5000);
        } catch (error) {
            console.error(`[ERROR] Clear command: ${error}`);
            interaction.reply({ content: 'Произошла ошибка при удалении сообщений.', flags: MessageFlags.Ephemeral });
        }
    },
};
