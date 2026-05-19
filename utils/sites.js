const sites = {
    "e621.net": {
        "aliases": [
        "e621"
        ]
    },
    "e926.net": {
        "aliases": [
        "e926"
        ]
    },
    "hypnohub.net": {
        "aliases": [
        "hypnohub"
        ]
    },
    "danbooru.donmai.us": {
        "aliases": [
        "danbooru"
        ]
    },
    "konachan.com": {
        "aliases": [
        "kcom"
        ]
    },
    "konachan.net": {
        "aliases": [
        "knet"
        ]
    },
    "yande.re": {
        "aliases": [
        "yandere"
        ]
    },
    "gelbooru.com": {
        "aliases": [
        "gelbooru"
        ]
    },
    "rule34.xxx": {
        "aliases": [
        "rule34"
        ]
    },
    "safebooru.org": {
        "aliases": [
        "safebooru"
        ]
    },
    "tbib.org": {
        "aliases": [
        "tbib",
        ]
    },
    "xbooru.com": {
        "aliases": [
        "xbooru"
        ]
    },
    "rule34.paheal.net": {
        "aliases": [
        "paheal"
        ]
    },
    "derpibooru.org": {
        "aliases": [
        "derpibooru"
        ]
    },
    "realbooru.com": {
        "aliases": [
        "realbooru"
        ]
    }
}

// Создаем карту для быстрого поиска каноничного имени по алиасу или имени
const siteLookup = new Map();
const siteChoices = []; // Для автодополнения

for (const siteKey in sites) {
    const siteData = sites[siteKey];
    const mainName = siteKey; // e.g., "gelbooru.com"

    // Добавляем основное имя сайта
    siteLookup.set(mainName.toLowerCase(), mainName);

    // Добавляем все алиасы
    if (siteData.aliases) {
        siteData.aliases.forEach(alias => {
            const lowerAlias = alias.toLowerCase();
            // Если алиас еще не занят (на всякий случай)
            if (!siteLookup.has(lowerAlias)) {
                siteLookup.set(lowerAlias, mainName);
                siteChoices.push({ name: mainName+`(${alias})`, value: alias });
            }
        });
    }
}

const uniqueSiteChoices = [...new Map(siteChoices.map(item => [item.value + item.name, item])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));


module.exports = { sites, siteLookup, uniqueSiteChoices };