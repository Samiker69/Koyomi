const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Разместить интерактивную панель для подачи жалоб.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option.setName('faq_link')
                .setDescription('Ссылка на FAQ или правила сервера (необязательно).')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const faqLink = interaction.options.getString('faq_link');

            const reportEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Система Жалоб')
                .setDescription(
                    'Здесь вы можете сообщить о нарушениях правил сервера. ' +
                    'Ваши жалобы помогают поддерживать порядок.'
                )
                .addFields(
                    {
                        name: 'Как подать жалобу:',
                        value:
                            '1. **Выберите тип** нарушения, нажав кнопку ниже.\n' +
                            '2. Заполните **форму**, подробно описав проблему.\n' +
                            '3. **Укажите нарушителя** (если есть) и **добавьте ссылки/доказательства**.\n' +
                            '4. Модераторы рассмотрят вашу жалобу. Вы получите уведомление о статусе в личные сообщения.'
                    },
                    {
                        name: 'Важно:',
                        value: 'Пожалуйста, используйте систему жалоб ответственно. Ложные жалобы могут привести к последствиям.'
                    }
                )
                .setThumbnail(interaction.guild.iconURL() || interaction.client.user.displayAvatarURL())
                .setFooter({
                    text: 'Спасибо за помощь в поддержании порядка.',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            const reportButtonsRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('report_user')
                        .setLabel('На пользователя')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('report_message')
                        .setLabel('На сообщение')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('report_moderator')
                        .setLabel('На модератора')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('report_other')
                        .setLabel('Другое')
                        .setStyle(ButtonStyle.Secondary)
                );
            
            const componentsToSend = [reportButtonsRow];

            if (faqLink) {
                const faqButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Ознакомиться с правилами / FAQ')
                            .setStyle(ButtonStyle.Link)
                            .setURL(faqLink)
                    );
                componentsToSend.push(faqButtonRow);
            }

            await interaction.channel.send({
                embeds: [reportEmbed],
                components: componentsToSend
            });

            await interaction.editReply({
                content: `Панель жалоб успешно размещена в канале <#${interaction.channel.id}>.`,
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error('Ошибка при размещении панели жалоб:', error);
            await interaction.editReply({
                content: 'Произошла ошибка при размещении панели жалоб. Проверьте права бота.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};