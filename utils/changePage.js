const { ButtonBuilder,ButtonStyle,ActionRowBuilder} = require('discord.js')

async function changePage(pageIndex, pages) {
    const currentEmbed = pages[pageIndex].setFooter({ text: `page ${pageIndex + 1} of ${pages.length}` });

    const previousButton = new ButtonBuilder()
        .setCustomId('booru_previous_page')
        .setLabel('⬅️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pageIndex === 0); // Отключаем кнопку "Назад" на первой странице

    const nextButton = new ButtonBuilder()
        .setCustomId('booru_next_page')
        .setLabel('➡️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pageIndex === pages.length - 1); // Отключаем кнопку "Вперед" на последней странице

    const row = new ActionRowBuilder().addComponents(previousButton, nextButton);

    return { embeds: [currentEmbed], components: [row], withResponse: true };
};

async function activeTime(pages_length, type = 'arts') {
    let timeToRead = 1
    if (type === 'manga') timeToRead = 4
    if (pages_length <= 10) {
        return 1000*pages_length*60*timeToRead //минимум - минута, максимум - 10 минут
    } else if (pages_length <= 30) {
        return 1000*pages_length*6*timeToRead //минимум - 66 секунд, максимум 3 минуты
    } else if (pages_length <= 101) {
        return 1000*pages_length*10*timeToRead //минимум 5 минут 10 секунд, максимум 16 минут
    }
    return 60*1000*timeToRead //если каким-то блять хуем пошло не так, то будет минута
}

module.exports = {
    changePage,
    activeTime
}