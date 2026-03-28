const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType,
    MessageFlags
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const replies = require('../../locales/answers/replies');
const { utility } = require('../../locales/descriptions/utility');

const getReply = (key, locale, vars = {}) => {
    let text = replies[key]?.[locale] || replies[key]?.['ru'] || key;
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
    }
    return text;
};

async function safeReply(interaction, content, isEphemeral = true) {
    const flags = isEphemeral ? MessageFlags.Ephemeral : 0;
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content, flags });
        } else {
            await interaction.reply({ content, flags });
        }
    } catch (e) {
        console.error(`[SafeReply Error] Не удалось ответить/продолжить взаимодействие. Содержимое: "${content}". Ошибка:`, e);
    }
}

function getCommandsByCategory(client) {
    const categories = new Map();

    const commandsPath = path.join(__dirname, '../../commands');

    if (!fs.existsSync(commandsPath)) {
        console.error(`[ERROR] Директория команд не найдена по пути: ${commandsPath}`);
        return categories;
    }

    const commandFolders = fs.readdirSync(commandsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const rootCommandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    if (rootCommandFiles.length > 0) {
        commandFolders.unshift('.');
    }

    if (commandFolders.length === 0 && rootCommandFiles.length > 0) {
        commandFolders.push('.');
    }

    for (const folder of commandFolders) {
        const currentFolderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(currentFolderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(currentFolderPath, file);
            if (file === 'help.js' && folder === 'utility') continue;

            const commandName = path.basename(file, '.js');
            let command = client.commands.get(commandName);

            if (!command) {
                try {
                    command = require(filePath);
                } catch (e) {
                    console.error(`Ошибка при загрузке команды из файла ${filePath}:`, e);
                    continue;
                }
            }

            if ('data' in command && 'execute' in command) {
                const categoryName = folder === '.' ? 'General' : folder.charAt(0).toUpperCase() + folder.slice(1);
                if (!categories.has(categoryName)) {
                    categories.set(categoryName, []);
                }
                if (!categories.get(categoryName).some(c => c.data.name === command.data.name)) {
                    categories.get(categoryName).push(command);
                }
            }
        }
    }

    return categories;
}

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Показать список команд с пагинацией и выбором категории.')
        .setDescriptionLocalizations(utility.help.description),

    async execute(interaction) {
        const loc = interaction.locale;
        const categoriesMap = getCommandsByCategory(interaction.client);
        const allCommands = Array.from(interaction.client.commands.values());

        if (allCommands.length === 0) {
            return await safeReply(interaction, getReply('help_not_found', loc));
        }

        const pageSize = 5;
        let currentCategory = getReply('help_cat_all', loc);
        let pageIndex = 0;

        const buildHelpPayload = (category, page) => {
            let commandsToShow = [];
            if (category === getReply('help_cat_all', loc)) {
                commandsToShow = allCommands;
            } else {
                commandsToShow = categoriesMap.get(category) || [];
            }

            const totalPages = Math.ceil(commandsToShow.length / pageSize);
            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;
            const slicedCommands = commandsToShow.slice(startIndex, endIndex);

            const embed = new EmbedBuilder()
                .setTitle(getReply('help_title', loc, { category }))
                .setColor(0x9B59B6)
                .setTimestamp();

            if (slicedCommands.length === 0) {
                embed.setDescription(getReply('help_empty_category', loc));
            } else {
                for (const cmd of slicedCommands) {
                    const meta = cmd.data.toJSON();
                    let details = '';

                    if (meta.options && meta.options.length > 0) {
                        for (const opt of meta.options) {
                            if (opt.type === 1) {
                                details += `\n  \`/${meta.name} ${opt.name}\` — ${opt.description_localizations?.[loc] || opt.description_localizations?.['ru'] || opt.description || getReply('help_no_desc', loc)}`;
                            } else if (opt.type === 2) {
                                details += `\n  \`/${meta.name} ${opt.name}\` ${getReply('help_group', loc)}`;
                                for (const subOpt of opt.options || []) {
                                    if (subOpt.type === 1) {
                                        details += `\n     \`/${meta.name} ${opt.name} ${subOpt.name}\` — ${subOpt.description_localizations?.[loc] || subOpt.description_localizations?.['ru'] || subOpt.description || getReply('help_no_desc', loc)}`;
                                    }
                                }
                            }
                        }
                    }

                    let fieldName = `\`/${meta.name}\``;
                    let fieldValue = meta.description_localizations?.[loc] || meta.description_localizations?.['ru'] || meta.description || getReply('help_no_desc', loc);
                    let finalValue = fieldValue + (details ? `\n${details}` : '');

                    if (fieldName.length > 256) {
                        fieldName = fieldName.substring(0, 253) + '...';
                    }
                    if (fieldName.length === 0) {
                        fieldName = 'Команда без имени';
                    }

                    if (finalValue.length > 1024) {
                        finalValue = finalValue.substring(0, 1021) + '...';
                    }
                    if (finalValue.length === 0) {
                        finalValue = getReply('help_no_desc', loc);
                    }


                    embed.addFields({
                        name: fieldName,
                        value: finalValue,
                        inline: false
                    });
                }
            }

            embed.setFooter({ text: getReply('help_page', loc, { page: page + 1, total: totalPages === 0 ? 1 : totalPages }) });


            const prevButton = new ButtonBuilder()
                .setCustomId('help_prev')
                .setLabel(getReply('help_btn_prev', loc))
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 0);

            const nextButton = new ButtonBuilder()
                .setCustomId('help_next')
                .setLabel(getReply('help_btn_next', loc))
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page >= totalPages - 1 || totalPages === 0);

            const buttonRow = new ActionRowBuilder().addComponents(prevButton, nextButton);

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_category_select')
                .setPlaceholder(getReply('help_select_ph', loc))
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(getReply('help_cat_all', loc))
                        .setValue(getReply('help_cat_all', loc))
                        .setDescription(getReply('help_cat_all_desc', loc))
                        .setDefault(category === getReply('help_cat_all', loc))
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
        };

        await interaction.deferReply({ flags: 0 });
        const message = await interaction.editReply(buildHelpPayload(currentCategory, pageIndex));

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Any,
            time: 5 * 60 * 1000
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return await i.reply({ content: getReply('help_invalid_user', loc), flags: MessageFlags.Ephemeral });
            }

            if (i.isButton()) {
                if (i.customId === 'help_prev') {
                    const totalCategoryPages = Math.ceil((currentCategory === getReply('help_cat_all', loc) ? allCommands.length : (categoriesMap.get(currentCategory)?.length || 0)) / pageSize);
                    if (pageIndex > 0) pageIndex--;
                } else if (i.customId === 'help_next') {
                    const totalCategoryPages = Math.ceil((currentCategory === getReply('help_cat_all', loc) ? allCommands.length : (categoriesMap.get(currentCategory)?.length || 0)) / pageSize);
                    if (pageIndex < totalCategoryPages - 1) pageIndex++;
                }
                await i.update(buildHelpPayload(currentCategory, pageIndex));
            } else if (i.isStringSelectMenu()) {
                if (i.customId === 'help_category_select') {
                    currentCategory = i.values[0];
                    pageIndex = 0;
                    await i.update(buildHelpPayload(currentCategory, pageIndex));
                }
            }
        });

        collector.on('end', async () => {
            const finalPayload = buildHelpPayload(currentCategory, pageIndex);
            finalPayload.components.forEach(row =>
                row.components.forEach(comp => comp.setDisabled(true))
            );

            finalPayload.embeds[0].setFooter({
                text: getReply('help_page_timeout', loc, { page: pageIndex + 1, total: Math.ceil((currentCategory === getReply('help_cat_all', loc) ? allCommands.length : (categoriesMap.get(currentCategory)?.length || 0)) / pageSize) === 0 ? 1 : Math.ceil((currentCategory === getReply('help_cat_all', loc) ? allCommands.length : (categoriesMap.get(currentCategory)?.length || 0)) / pageSize) })
            });

            try {
                await message.edit(finalPayload);
            } catch (e) {
                console.error('Ошибка при отключении компонентов сообщения help:', e);
            }
        });
    }
};