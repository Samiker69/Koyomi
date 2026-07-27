const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const localeManager = require('../locales/localeManager');

class HelpViews {
    static renderHelp(category, page, allCommands, categoriesMap, pageSize, lang, interaction) {
        let commandsToShow = [];
        const allCommandsLabel = localeManager.get('utility.help.messages.all_commands', lang);
        if (category === allCommandsLabel) {
            commandsToShow = allCommands;
        } else {
            commandsToShow = categoriesMap.get(category) || [];
        }
        const totalPages = Math.ceil(commandsToShow.length / pageSize);
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const slicedCommands = commandsToShow.slice(startIndex, endIndex);
        const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTimestamp()
            .setTitle(`${allCommandsLabel.split(':')[0]}: ${category}`);

        if (slicedCommands.length === 0) {
            embed.setDescription(localeManager.get('utility.help.messages.no_commands_in_category', lang));
        } else {
            for (const cmd of slicedCommands) {
                const meta = cmd.data.toJSON();
                const cmdDesc = meta.description_localizations?.[lang] || meta.description || localeManager.get('utility.help.messages.no_description', lang);
                let details = '';
                if (meta.options && meta.options.length > 0) {
                    for (const opt of meta.options) {
                        const optName = opt.name;
                        const optDesc = opt.description_localizations?.[lang] || opt.description || localeManager.get('utility.help.messages.no_description', lang);
                        if (opt.type === 1) {
                            details += `\n  \`/${meta.name} ${optName}\` — ${optDesc}`;
                        } else if (opt.type === 2) {
                            details += `\n  \`/${meta.name} ${optName}\` ${localeManager.get('utility.help.messages.group_label', lang)}`;
                            for (const subOpt of opt.options || []) {
                                const subOptName = subOpt.name;
                                const subOptDesc = subOpt.description_localizations?.[lang] || subOpt.description || localeManager.get('utility.help.messages.no_description', lang);
                                if (subOpt.type === 1) {
                                    details += `\n     \`/${meta.name} ${optName} ${subOptName}\` — ${subOptDesc}`;
                                }
                            }
                        }
                    }
                }
                let fieldName = `\`/${meta.name}\``;
                let finalValue = cmdDesc + (details ? `\n${details}` : '');
                if (fieldName.length > 256) fieldName = fieldName.substring(0, 253) + '...';
                if (fieldName.length === 0) fieldName = localeManager.get('utility.help.messages.no_name', lang);
                if (finalValue.length > 1024) finalValue = finalValue.substring(0, 1021) + '...';
                if (finalValue.length === 0) finalValue = localeManager.get('utility.help.messages.no_description', lang);
                embed.addFields({ name: fieldName, value: finalValue, inline: false });
            }
        }
        embed.setFooter({
            text: localeManager.get('utility.help.messages.page_info', lang, {
                current: page + 1,
                total: totalPages === 0 ? 1 : totalPages
            }),
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        });

        const prevButton = new ButtonBuilder()
            .setCustomId('help_prev')
            .setLabel(localeManager.get('utility.help.messages.prev', lang))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0);

        const nextButton = new ButtonBuilder()
            .setCustomId('help_next')
            .setLabel(localeManager.get('utility.help.messages.next', lang))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages - 1 || totalPages === 0);

        const buttonRow = new ActionRowBuilder().addComponents(prevButton, nextButton);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category_select')
            .setPlaceholder(localeManager.get('utility.help.messages.select_category', lang))
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(allCommandsLabel)
                    .setValue(allCommandsLabel)
                    .setDescription(localeManager.get('utility.help.messages.all_commands_desc', lang))
                    .setDefault(category === allCommandsLabel)
            );

        const sortedCategoryNames = Array.from(categoriesMap.keys()).sort();
        for (const catName of sortedCategoryNames) {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(catName)
                    .setValue(catName)
                    .setDefault(category === catName)
            );
        }

        const selectRow = new ActionRowBuilder().addComponents(selectMenu);
        return { embeds: [embed], components: [selectRow, buttonRow] };
    }
}

module.exports = HelpViews;