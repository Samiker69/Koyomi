const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, MessageFlags } = require('discord.js');
const booru = require('booru');
const { changePage, activeTime } = require('../../functions/changePage');

module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('booru')
		.setDescription('parse boorus')
        .addSubcommand(sc=>
            sc.setName('safebooru').setDescription('parse safebooru.org')
            .addStringOption(o =>
                o.setName('tags')
                .setDescription('Теги. Между тегами оставляйте только пробелы!')
                .setRequired(true)
            )
            .addNumberOption(o => 
                o.setName('limit')
                .setDescription('Сколько всего будет артов')
                .setMaxValue(100)
                .setMinValue(1)
            )
            .addNumberOption(o => 
                o.setName('page')
                .setDescription('Страница')
                .setMinValue(0)
            )
        )
        .addSubcommand(sc=>
            sc.setName('gelbooru').setDescription('parse gelbooru.com')
            .addStringOption(o =>
                o.setName('tags')
                .setDescription('Теги. Между тегами оставляйте только пробелы!')
                .setRequired(true)
            )
            .addNumberOption(o => 
                o.setName('limit')
                .setDescription('Сколько всего будет артов')
                .setMaxValue(100)
                .setMinValue(1)
            )
            .addNumberOption(o => 
                o.setName('page')
                .setDescription('Страница')
                .setMinValue(0)
            )
        ),

	async execute(interaction) {
        //if (!interaction.channel.nsfw) return await interaction.reply({ content: 'Эта команда может быть использована только в NSFW каналах!', flags: MessageFlags.Ephemeral})
        await interaction.deferReply();

        let site;
        console.log(await interaction.options.getSubcommand())
        switch (await interaction.options.getSubcommand()) {
            case "safebooru": {
                site = booru.forSite('sb')
                break;
            }
                
            case "gelbooru": {
                site = booru.forSite('gb')
                break;
            }
                
        
            default:
                await interaction.editReply('Что-то пошло не так... Выбран поисковик: safebooru')
                site = booru.forSite('sb')
                break;
        }
        

        let pages = [], page = 0, nsfw = false;
        const filter = (i) => {
            // Проверяем customId и пользователя
             if (i.customId === 'previous_page' || i.customId === 'next_page') {
                 if (i.user.id !== interaction.user.id) {
                    i.reply({ content: `Только ${interaction.user.username} может взаимодействовать`, flags: MessageFlags.Ephemeral });
                    return false; // Игнорируем нажатие от другого пользователя
                 }
                 return true; // Обрабатываем нажатие от автора команды
             }
             return false; // Игнорируем другие типы компонентов
        };

        try {
            if (site.domain = "gelbooru.com") nsfw = true
            const tags = await interaction.options.getString('tags');
            const limit = await interaction.options.getNumber('limit') | 1;
            const pageOfBooru = await interaction.options.getNumber('page') | null;

            const result = await site.search(tags.split(' '), { limit: limit, page: pageOfBooru });
            if (result.posts.length < 1) return await interaction.editReply('Кажется, ничего не удалось найти. Проверьте правильность написания тегов')

            for (let post of result) {
                    const ok = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle(`Rating ${post.rating} | from ${post.booru.domain}`)
                    .setDescription(`-# \`${post.tags.join(',')}\``)
                    .setURL(post.postView)
                    .setTimestamp(post.createdAt)
                    .setImage(post.fileUrl)

                    const banned = new EmbedBuilder()
                    .setColor('Grey')
                    .setTitle(`Rating ${post.rating} | from ${post.booru.domain}`)
                    .setDescription(
                        `Данный пост заблокирован, так как имеет опасный рейтинг для этого канала.`+
                        `\nИнформация о посте: \`id ${post.id}\``
                    )
                    .setTimestamp(post.createdAt)

                if ( (post.rating === 'e' || post.rating === 'u') && !(interaction.channel.nsfw && nsfw) ) {
                    pages.push(banned)
                } else {
                    pages.push(ok)
                }

            }

            const message = await interaction.editReply(await changePage(page, pages));

            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button, 
                filter: filter,
                time: await activeTime(pages.length)
            });

            collector.on('collect', async (button) => {
                if (button.customId === 'previous_page') {
                    if (page > 0) {
                        page--;
                    }
                } else if (button.customId === 'next_page') {
                    if (page < pages.length - 1) {
                        page++;
                    }
                }
    
                // Обновляем сообщение с новой страницей и состоянием кнопок
                const updatedMessagePayload = await changePage(page, pages);
                try {
                    await button.update(updatedMessagePayload);
                } catch (error) {
                    console.error("Не удалось обновить взаимодействие кнопки:", error);
                }
            });

            collector.on('end', async (collected, reason) => {
                const disabledEmbed = pages[page].setFooter({ text: `page ${page + 1} of ${pages.length} (timeOut)` });
    
                const leftB = new ButtonBuilder()
                    .setCustomId('previous_page_disabled')
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);
    
                const rigthB = new ButtonBuilder()
                    .setCustomId('next_page_disabled')
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);
    
                const disabledRow = new ActionRowBuilder().addComponents(leftB, rigthB);
                pages = []
    
                try {
                     // Редактируем исходное сообщение, убирая активные кнопки
                    await message.edit({ embeds: [disabledEmbed], components: [disabledRow] });
                } catch (error) {
                    console.error("Не удалось отредактировать сообщение после завершения коллектора:", error);
                }
            })
            
       } catch (error) {
            await interaction.editReply('говнокод детектед');
            console.error(error)
       }
   },
};