const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, MessageFlags } = require('discord.js');
const booru = require('booru');
const { changePage, activeTime } = require('../../functions/changePage');
const { uniqueSiteChoices, siteLookup } = require('../../functions/sites');
const {nsfw} = require('../../locales/descriptions/nsfw')

module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('booru')
		.setDescription(nsfw.booru.description.ru)
        .setDescriptionLocalizations(nsfw.booru.description)
        .addSubcommand(sub =>
            sub.setName('search')
            .setDescription(nsfw.booru.search.description.ru)
            .setDescriptionLocalizations(nsfw.booru.search.description)
            .addStringOption(o =>
                o.setName('site')
                .setDescription(nsfw.booru.options.site.description.ru)
                .setDescriptionLocalizations(nsfw.booru.options.site.description)
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addStringOption(o =>
                o.setName('tags')
                .setDescription(nsfw.booru.options.tags.description.ru)
                .setDescriptionLocalizations(nsfw.booru.options.tags.description)
                .setRequired(true)
            )
            .addNumberOption(o => 
                o.setName('limit')
                .setDescription(nsfw.booru.options.limit.description.ru)
                .setDescriptionLocalizations(nsfw.booru.options.limit.description)
                .setMaxValue(100)
                .setMinValue(1)
            )
            .addNumberOption(o => 
                o.setName('page')
                .setDescription(nsfw.booru.options.page.description.ru)
                .setDescriptionLocalizations(nsfw.booru.options.page.description)
                .setMinValue(0)
            )
        )
        .addSubcommand(sub =>
            sub.setName('random')
            .setDescription(nsfw.booru.random.description.ru)
            .setDescriptionLocalizations(nsfw.booru.random.description)
            .addStringOption(o =>
                o.setName('site')
                .setDescription(nsfw.booru.options.site.description.ru)
                .setDescriptionLocalizations(nsfw.booru.options.site.description)
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addStringOption(o =>
                o.setName('tags')
                .setDescription(nsfw.booru.options.tags.description.ru)
                .setDescriptionLocalizations(nsfw.booru.options.tags.description)
            )
        )
,
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true); // Получаем опцию, на которой сфокусирован пользователь
        let choices = [];

        if (focusedOption.name === 'site') {
            const focusedValue = focusedOption.value.toLowerCase();
            choices = uniqueSiteChoices
                .filter(choice => choice.name.toLowerCase().includes(focusedValue)) // Фильтруем по вводу пользователя
                .slice(0, 25); // Discord показывает не более 25 подсказок
        }
        await interaction.respond(choices);
    },

	async execute(interaction) {
        await interaction.deferReply();

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
            const siteOfbooru = await interaction.options.getString('site');
            const tags = await interaction.options.getString('tags');
            const limit = await interaction.options.getNumber('limit') | 1;
            const pageOfBooru = await interaction.options.getNumber('page') | null;

            const canonicalSite = siteLookup.get(siteOfbooru.toLowerCase());
            if (!canonicalSite) return await interaction.reply({content: `Не удалось найти ${canonicalSite}. Убедитесь, что вы ввели верное название`, flags: MessageFlags.Ephemeral});
            const site = booru.forSite(canonicalSite);
            let result, rndtag = []
            if (tags) rndtag = tags

            if (interaction.options.getSubcommand() === "search") result = await site.search(tags.split(' '), { limit: limit, page: pageOfBooru });
            else if (interaction.options.getSubcommand() === "random") result = await site.search(rndtag, { random: true })

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

                if ( (post.rating === 'u' || post.rating === 'e' || post.rating === 'q') && !interaction.channel.nsfw ) {
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