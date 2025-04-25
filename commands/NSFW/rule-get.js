const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, MessageFlags } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getrule')
        .setNSFW(false)
		.setDescription('Gets rule))')
        .addStringOption(option =>
            option.setName('tags')
                .setDescription('Search tags')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Search on a certain page')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('ammount')
                .setDescription('Ammount of images to get (note that Discord can only embed 10 at a time!)')
                .setMaxValue(50))  
        .addBooleanOption(option =>
            option.setName('invisible')
            .setDescription('Set to true if you want no one to see what you are searching for')
        )
        .addBooleanOption(option =>
            option.setName("no_ai")
            .setDescription('Set True if you don\'t want to see ai images')
        ),
                

	async execute(interaction) {
        const tags = interaction.options.getString('tags');
        const pageid = interaction.options.getInteger('page');
        const val = interaction.options.getInteger('ammount') | 1;
        const invis = interaction.options.getBoolean('invisible') | false;
        const no_ai = interaction.options.getBoolean('no_ai') | false;

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

        if (!interaction.channel.nsfw) return await interaction.reply({content: 'Это не NSFW канал, чертов дрочун малолетний', flags: MessageFlags.Ephemeral});

        await interaction.deferReply()
        let finalyTags = tags
        if (no_ai) finalyTags += ' -ai_generated -thick -lactation -fart -futanari -peeing -big_belly -breast_bigger_than_head -pregnant -gigantic_breasts -huge_breasts -thick_thighs -thick_ass -gigantic_ass -huge_ass'
        const url = await fetch(`https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&pid=${pageid}&limit=${val}&tags=${finalyTags}&json=1`);
        let response = await url.text()
        
        if (response.length < 1) return await interaction.editReply('Кажется, ничего не удалось найти. Проверьте правильность написания тегов');

        //const url = await fetch(`https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&pid=${pageid}&limit=${val}&tags=${tags}&json=1`);
        response = JSON.parse(response)

        let urlList = [], pages = [];
        for (let i = 0; i < response.length; i++) {
            const currentObj = response[i];

            // Make sure the object has a 'file_url' property
            if (currentObj && currentObj.file_url) {
                const a = new EmbedBuilder()
                .setColor('Random')
                .setDescription(`-# ${currentObj.tags}`)
                .setAuthor({name: currentObj.owner})
                .setImage(currentObj.file_url)

                pages.push(a)
            } else {
                console.error(`Object at index ${i} is missing 'file_url'`);
            }
        }
        let page = 0
        const message = await interaction.editReply(await changePage(page));

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
            const updatedMessagePayload = await changePage(page);
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
        async function changePage(pageIndex) {
            const currentEmbed = pages[pageIndex].setFooter({ text: `page ${pageIndex + 1} of ${pages.length}` });
        
            const previousButton = new ButtonBuilder()
                .setCustomId('previous_page')
                .setLabel('⬅️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(pageIndex === 0); // Отключаем кнопку "Назад" на первой странице
        
            const nextButton = new ButtonBuilder()
                .setCustomId('next_page')
                .setLabel('➡️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(pageIndex === pages.length - 1); // Отключаем кнопку "Вперед" на последней странице
        
            const row = new ActionRowBuilder().addComponents(previousButton, nextButton);
        
            return { embeds: [currentEmbed], components: [row], withResponse: true };
        };
	}
}

async function activeTime(pages_length) {
    if (pages_length <= 10) {
        return 1000*pages_length*60 //минимум - минута, максимум - 10 минут
    } else if (pages_length <= 30) {
        return 1000*pages_length*6 //минимум - 66 секунд, максимум 3 минуты
    } else if (pages_length <= 101) {
        return 1000*pages_length*10 //минимум 5 минут 10 секунд, максимум 16 минут
    }
    return 60*1000 //если каким-то блять хуем пошло не так, то будет минута
}