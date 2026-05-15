const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const booru = require('booru');
const { changePage, activeTime } = require('../../utils/changePage');
const { uniqueSiteChoices, siteLookup } = require('../../utils/sites');
const localeManager = require('../../locales/localeManager');
const { bot_log_channel } = require('../../config.json')

module.exports = {
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('booru')
		.setDescription(localeManager.get('nsfw.booru.description'))
		.setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.description'))
        .setContexts(0,1,2)
        .addSubcommand(sub =>
            sub.setName('search')
            .setDescription(localeManager.get('nsfw.booru.options.search.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.search.description'))
            .addStringOption(o =>
                o.setName('site')
                .setDescription(localeManager.get('nsfw.booru.options.search.options.site.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.search.options.site.description'))
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addStringOption(o =>
                o.setName('tags')
                .setDescription(localeManager.get('nsfw.booru.options.search.options.tags.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.search.options.tags.description'))
                .setRequired(true)
            )
            .addNumberOption(o => 
                o.setName('limit')
                .setDescription(localeManager.get('nsfw.booru.options.search.options.limit.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.search.options.limit.description'))
                .setMaxValue(100)
                .setMinValue(1)
            )
            .addNumberOption(o => 
                o.setName('page')
                .setDescription(localeManager.get('nsfw.booru.options.search.options.page.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.search.options.page.description'))
                .setMinValue(0)
            )
            .addBooleanOption(o =>
                o.setName('no_ai')
                .setDescription(localeManager.get('nsfw.booru.options.search.options.no_ai.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.search.options.no_ai.description'))
            )
        )
        .addSubcommand(sub =>
            sub.setName('random')
            .setDescription(localeManager.get('nsfw.booru.options.random.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.random.description'))
            .addStringOption(o =>
                o.setName('site')
                .setDescription(localeManager.get('nsfw.booru.options.search.options.site.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.search.options.site.description'))
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addStringOption(o =>
                o.setName('tags')
                .setDescription(localeManager.get('nsfw.booru.options.search.options.tags.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.search.options.tags.description'))
            )
            .addBooleanOption(o =>
                o.setName('no_ai')
                .setDescription(localeManager.get('nsfw.booru.options.search.options.no_ai.description'))
                .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.booru.options.search.options.no_ai.description'))
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
        const lang = interaction.guildLocale || 'ru';
        let pages = [], page = 0, nsfw = false;
        const filter = (i) => {
            // Проверяем customId и пользователя
             if (i.customId === 'booru_previous_page' || i.customId === 'booru_next_page') {
                 if (i.user.id !== interaction.user.id) {
                    i.reply({ content: localeManager.get('nsfw.booru.messages.only_author', lang, { user: interaction.user.username }), flags: MessageFlags.Ephemeral });
                    return false; // Игнорируем нажатие от другого пользователя
                 }
                 return true; // Обрабатываем нажатие от автора команды
             }
             return false; // Игнорируем другие типы компонентов
        };

        try {
            const siteOfbooru = await interaction.options.getString('site');
            let tags = await interaction.options.getString('tags');
            const limit = await interaction.options.getNumber('limit') | 1;
            const pageOfBooru = await interaction.options.getNumber('page') | null;
            const no_ai = await interaction.options.getBoolean('no_ai') | false;

            if (!siteOfbooru) return await interaction.reply({ content: localeManager.get('nsfw.booru.messages.invalid_site', lang) });
            const canonicalSite = siteLookup.get(siteOfbooru.toLowerCase());
            if (!canonicalSite) return await interaction.reply({ content: localeManager.get('nsfw.booru.messages.site_not_found', lang, { site: siteOfbooru }), flags: MessageFlags.Ephemeral });
            const site = booru.forSite(canonicalSite);
            let result, lastartlink; 
            if (no_ai) tags += ' -ai_generated -thick -lactation -fart -futanari -peeing -big_belly -breast_bigger_than_head -pregnant -gigantic_breasts -huge_breasts -thick_thighs -thick_ass -gigantic_ass -huge_ass'

            if (interaction.options.getSubcommand() === "search") result = await site.search(tags.split(' '), { limit: limit, page: pageOfBooru });
            else if (interaction.options.getSubcommand() === "random") result = await site.search(tags, { random: true });
            await interaction.deferReply();
            if (result.posts.length < 1) {
                const noAiTip = no_ai ? localeManager.get('nsfw.booru.messages.no_ai_tip', lang) : '';
                return await interaction.editReply(localeManager.get('nsfw.booru.messages.nothing_found', lang, { no_ai_tip: noAiTip }));
            }

            for (let post of result) {
                if ( (post.rating === 'u' || post.rating === 'e' || post.rating === 'q') && !interaction.channel.nsfw ) {
                    const banned = EmbedService.createBaseEmbed(interaction)
                    .setTitle(localeManager.get('nsfw.booru.messages.post_blocked_title', lang, { rating: post.rating, domain: post.booru.domain }))
                    .setDescription(localeManager.get('nsfw.booru.messages.post_blocked_desc', lang, { id: post.id }))
                    .setTimestamp(post.createdAt)
                    
                    pages.push(banned)
                } else {
                    if (lastartlink === post.fileUrl) continue;
                    lastartlink = post.fileUrl;
                    const ok = EmbedService.createBaseEmbed(interaction)
                    .setTitle(localeManager.get('nsfw.booru.messages.post_blocked_title', lang, { rating: post.rating, domain: post.booru.domain }))
                    .setDescription(`-# \`${post.tags.join(',')}\``)
                    .setURL(post.postView)
                    .setTimestamp(post.createdAt)
                    .setImage(post.fileUrl)

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
                if (button.customId === 'booru_previous_page') {
                    if (page > 0) {
                        page--;
                    }
                } else if (button.customId === 'booru_next_page') {
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
                const timeoutStr = localeManager.get('nsfw.booru.messages.timeout', lang);
                const disabledEmbed = pages[page].setFooter({ 
                    text: localeManager.get('nsfw.booru.messages.page_info', lang, { 
                        current: page + 1, 
                        total: pages.length, 
                        timeout: timeoutStr 
                    }) 
                });
    
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
                    await message.edit({ embeds: [disabledEmbed], components: [disabledRow] });
                } catch (error) {
                    console.error("Не удалось отредактировать сообщение после завершения коллектора:", error);
                }
            })
            
       } catch (error) {
            const errorEmbed = EmbedService.createBaseEmbed(interaction)
            .setTitle(localeManager.get('nsfw.booru.messages.error_title', lang))
            .addFields(
                { name: localeManager.get('nsfw.booru.messages.command_label', lang), value: `${interaction.commandName}` },
                { name: localeManager.get('nsfw.booru.messages.error_label', lang), value: `\`\`\`txt\n${error.message}\n${error.stack}\`\`\`` }
            )
            .setTimestamp(new Date())
            console.error(error);
            const logChannel = await interaction.client.channels.fetch(bot_log_channel)
            await logChannel.send({ embeds: [errorEmbed] });
            await interaction.editReply(localeManager.get('nsfw.booru.messages.generic_error', lang));
       }
   },
};