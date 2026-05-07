const EmbedService = require('../../services/EmbedService');
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    ChannelType
} = require('discord.js');

const {
    AutoModerationRuleTriggerType,
    AutoModerationActionType,
    AutoModerationRuleEventType
} = require('discord.js');

function parseMentionString(inputString) {
    if (!inputString) return [];
    const ids = [];
    const mentionOrIdRegex = /<@&(\d+)>|<#(\d+)>|(\d+)/g;
    let match;
    while ((match = mentionOrIdRegex.exec(inputString)) !== null) {
        const id = match[1] || match[2] || match[3];
        if (id) ids.push(id);
    }
    return ids;
}

async function fetchRuleById(interaction, ruleId) {
     try {
         const rule = await interaction.guild.autoModerationRules.fetch(ruleId);
         return rule;
     } catch (error) {
         if (error.code === 10048 || (error.rawError && error.rawError.code === 0 && error.status === 404)) {
              const embed = EmbedService.createBaseEmbed(interaction)
                 .setTitle('Правило не найдено')
                 .setDescription(`Правило Автомодерации с ID \`${ruleId}\` не найдено.`);
             await interaction.editReply({ embeds: [embed] }).catch(console.error);
         } else {
             console.error(`Ошибка при получении правила Автомода ${ruleId}:`, error);
             const embed = EmbedService.createBaseEmbed(interaction)
                .setTitle('Ошибка API')
                .setDescription(`Произошла ошибка при получении правила: ${error.message}`);
             await interaction.editReply({ embeds: [embed] }).catch(console.error);
         }
         return null;
     }
}


const data = new SlashCommandBuilder()
    .setName('automod-native')
    .setDescription('Управление встроенными правилами автомодерации Discord')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    .addSubcommand(subcommand =>
        subcommand.setName('add-keyword')
            .setDescription('Добавляет новое правило фильтрации слов для нативного Автомода')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('Название правила')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('keywords')
                    .setDescription('Слова или фразы для блокировки (через запятую). Можно использовать *.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('action')
                    .setDescription('Действие при срабатывании правила')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Блокировать сообщение', value: 'block_message' },
                        { name: 'Таймаут пользователя', value: 'timeout' }
                    ))
            .addIntegerOption(option =>
                option.setName('timeout_duration')
                    .setDescription('Длительность таймаута в секундах (требуется для действия "Таймаут")')
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('block_message')
                    .setDescription('Сообщение при блокировке (для действия "Блокировать сообщение")')
                    .setRequired(false))
            .addStringOption(option =>
                 option.setName('exempt_roles')
                    .setDescription('Роли, для которых правило не применяется (упоминания или ID через запятую)')
                    .setRequired(false))
            .addStringOption(option =>
                 option.setName('exempt_channels')
                    .setDescription('Каналы, в которых правило не применяется (упоминания или ID через запятую)')
                    .setRequired(false))
           )

    .addSubcommand(subcommand =>
        subcommand.setName('edit')
            .setDescription('Редактирует существующее правило нативного Автомода по его ID (выберите из списка)')
            .addStringOption(option =>
                option.setName('rule_id')
                    .setDescription('Выберите правило для редактирования по ID или названию')
                    .setRequired(true)
                    .setAutocomplete(true))
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('Новое название правила'))
            .addStringOption(option =>
                option.setName('keywords')
                    .setDescription('Новые слова или фразы (через запятую). Можно использовать *.'))
            .addStringOption(option =>
                option.setName('action')
                    .setDescription('Новое действие при срабатывании правила')
                    .addChoices(
                        { name: 'Блокировать сообщение', value: 'block_message' },
                        { name: 'Таймаут пользователя', value: 'timeout' }
                    ))
            .addIntegerOption(option =>
                option.setName('timeout_duration')
                    .setDescription('Новая длительность таймаута в секундах (требуется, если новое действие "Таймаут")'))
            .addStringOption(option =>
                option.setName('block_message')
                    .setDescription('Новое сообщение при блокировке (требуется, если новое действие "Блокировать сообщение")'))
            .addStringOption(option =>
                 option.setName('exempt_roles')
                    .setDescription('Новые роли, для которых правило не применяется (упоминания или ID через запятую)'))
            .addStringOption(option =>
                 option.setName('exempt_channels')
                    .setDescription('Новые каналы, в которых правило не применяется (упоминания или ID через запятия)'))
            .addBooleanOption(option =>
                option.setName('enabled')
                    .setDescription('Включить или отключить правило'))
           )

    .addSubcommand(subcommand =>
        subcommand.setName('remove')
            .setDescription('Удаляет правило нативного Автомода по его ID (выберите из списка)')
            .addStringOption(option =>
                option.setName('rule_id')
                    .setDescription('Выберите правило для удаления по ID или названию')
                    .setRequired(true)
                    .setAutocomplete(true)))

    .addSubcommand(subcommand =>
        subcommand.setName('list')
            .setDescription('Показывает все правила нативного Автомода на сервере'))

     .addSubcommand(subcommand =>
         subcommand.setName('view')
             .setDescription('Показывает подробности одного правила нативного Автомода по его ID (выберите из списка)')
             .addStringOption(option =>
                 option.setName('rule_id')
                     .setDescription('Выберите правило для просмотра')
                     .setRequired(true)
                     .setAutocomplete(true)))

    .addSubcommand(subcommand =>
        subcommand.setName('toggle')
            .setDescription('Включает или отключает правило нативного Автомода по его ID (выберите из списка)')
            .addStringOption(option =>
                option.setName('rule_id')
                    .setDescription('Выберите правило для переключения статуса')
                    .setRequired(true)
                    .setAutocomplete(true)))

    .addSubcommandGroup(subcommandGroup =>
        subcommandGroup.setName('exempt')
            .setDescription('Управление исключениями для правил Автомода')
            .addSubcommand(subcommand =>
                subcommand.setName('add-role')
                    .setDescription('Добавить роль в список исключений правила')
                    .addStringOption(option =>
                        option.setName('rule_id')
                            .setDescription('Выберите правило для изменения')
                            .setRequired(true)
                            .setAutocomplete(true))
                    .addRoleOption(option =>
                        option.setName('role')
                            .setDescription('Роль, которую нужно добавить в исключения')
                            .setRequired(true)))
             .addSubcommand(subcommand =>
                subcommand.setName('remove-role')
                    .setDescription('Удалить роль из списка исключений правила')
                    .addStringOption(option =>
                        option.setName('rule_id')
                            .setDescription('Выберите правило для изменения')
                            .setRequired(true)
                            .setAutocomplete(true))
                    .addRoleOption(option =>
                        option.setName('role')
                            .setDescription('Роль, которую нужно удалить из исключений')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand.setName('add-channel')
                    .setDescription('Добавить канал в список исключений правила')
                    .addStringOption(option =>
                        option.setName('rule_id')
                            .setDescription('Выберите правило для изменения')
                            .setRequired(true)
                            .setAutocomplete(true))
                    .addChannelOption(option =>
                        option.setName('channel')
                            .setDescription('Канал, который нужно добавить в исключения')
                            .setRequired(true)
                             .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                            ))
             .addSubcommand(subcommand =>
                subcommand.setName('remove-channel')
                    .setDescription('Удалить канал из списка исключений правила')
                    .addStringOption(option =>
                        option.setName('rule_id')
                            .setDescription('Выберите правило для изменения')
                            .setRequired(true)
                            .setAutocomplete(true))
                    .addChannelOption(option =>
                        option.setName('channel')
                            .setDescription('Канал, который нужно удалить из исключений')
                            .setRequired(true)
                            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                            ))
           )

    .addSubcommand(subcommand =>
        subcommand.setName('clear-all')
            .setDescription('Удаляет ВСЕ правила нативного Автомода на сервере (требует подтверждения)'));


module.exports = {
    cooldown: 5,
    data,
    async execute(interaction) {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
             const embed = EmbedService.createBaseEmbed(interaction)
                .setTitle('Недостаточно прав')
                .setDescription('У вас недостаточно прав (ManageGuild) для выполнения этой команды.');
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral }).catch(console.error);
            return;
        }

        const subcommandGroupName = interaction.options.getSubcommandGroup();
        const subcommandName = interaction.options.getSubcommand();

        if (subcommandName !== 'clear-all') {
             await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(console.error);
        }

        try {
            if (subcommandGroupName) {
                 switch (subcommandGroupName) {
                     case 'exempt':
                         await handleExemptSubcommands(interaction, subcommandName);
                         break;
                     default:
                         const embed = EmbedService.createBaseEmbed(interaction).setTitle('Неизвестная группа').setDescription('Кажется, такой группы подкоманд не существует.');
                         await interaction.editReply({ embeds: [embed] }).catch(console.error);
                         break;
                 }
            } else {
                 switch (subcommandName) {
                     case 'add-keyword':
                         await handleAddKeywordSubcommand(interaction);
                         break;
                     case 'edit':
                         await handleEditSubcommand(interaction);
                         break;
                     case 'remove':
                         await handleRemoveSubcommand(interaction);
                         break;
                     case 'list':
                         await handleListSubcommand(interaction);
                         break;
                     case 'clear-all':
                         await handleClearAllSubcommand(interaction);
                         break;
                     case 'view':
                         await handleViewSubcommand(interaction);
                         break;
                     case 'toggle':
                         await handleToggleSubcommand(interaction);
                         break;
                     default:
                          const embed = EmbedService.createBaseEmbed(interaction).setTitle('Неизвестная подкоманда').setDescription('Кажется, такой подкоманды не существует.');
                          if (interaction.replied || interaction.deferred) {
                             await interaction.editReply({ embeds: [embed] }).catch(console.error);
                          } else {
                             await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral }).catch(console.error);
                          }
                          break;
                 }
            }

        } catch (error) {
            console.error('Критическая ошибка при выполнении команды automod-native:', error);
             if (interaction.replied || interaction.deferred) {
                 const errorEmbed = EmbedService.createBaseEmbed(interaction)
                     .setTitle('Произошла внутренняя ошибка')
                     .setDescription(`Произошла ошибка при выполнении команды: ${error.message}`);
                 await interaction.editReply({ embeds: [errorEmbed] }).catch(console.error);
             } else {
                  const errorEmbed = EmbedService.createBaseEmbed(interaction)
                     .setTitle('Произошла внутренняя ошибка')
                     .setDescription(`Произошла ошибка при выполнении команды: ${error.message}`);
                  await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral }).catch(console.error);
             }
        }
    },

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const searchTerm = focusedOption.value.toLowerCase();
        const subcommandGroupName = interaction.options.getSubcommandGroup();
        const subcommandName = interaction.options.getSubcommand();

        const usesRuleIdAutocomplete =
            (focusedOption.name === 'rule_id') &&
            (subcommandName === 'remove' || subcommandName === 'edit' || subcommandName === 'view' || subcommandName === 'toggle' ||
             (subcommandGroupName === 'exempt' && (subcommandName === 'add-role' || subcommandName === 'remove-role' || subcommandName === 'add-channel' || subcommandName === 'remove-channel')));


        if (usesRuleIdAutocomplete) {
            try {
                const rules = await interaction.guild.autoModerationRules.fetch();
                const filteredRulesCollection = rules.filter(rule =>
                    rule.name.toLowerCase().includes(searchTerm) ||
                    rule.id.includes(searchTerm)
                );
                const filteredRulesArray = [...filteredRulesCollection.values()];
                const options = filteredRulesArray.slice(0, 25).map(rule => ({
                    name: `${rule.name} (${rule.id})`,
                    value: rule.id
                }));
                await interaction.respond(options).catch(console.error);
            } catch (error) {
                console.error('Ошибка автозаполнения правил Автомода:', error);
                await interaction.respond([]).catch(console.error);
            }
        }
    },
};


async function handleAddKeywordSubcommand(interaction) {
     const name = interaction.options.getString('name', true);
     const keywordsString = interaction.options.getString('keywords', true);
     const actionType = interaction.options.getString('action', true);
     const timeoutDuration = interaction.options.getInteger('timeout_duration');
     const blockMessage = interaction.options.getString('block_message');
     const exemptRolesString = interaction.options.getString('exempt_roles');
     const exemptChannelsString = interaction.options.getString('exempt_channels');

     const keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k.length > 0);
     const exemptRoles = parseMentionString(exemptRolesString);
     const exemptChannels = parseMentionString(exemptChannelsString);

     if (keywords.length === 0) {
          const embed = EmbedService.createBaseEmbed(interaction).setTitle('Ошибка ввода').setDescription('Укажите хотя бы одно ключевое слово или фразу.');
          await interaction.editReply({ embeds: [embed] }).catch(console.error);
          return;
     }

     let actionConfig = null;
     let actionError = null;

     if (actionType === 'block_message') {
         actionConfig = { type: AutoModerationActionType.BlockMessage, metadata: blockMessage ? { custom_message: blockMessage } : {} };
     } else if (actionType === 'timeout') {
          if (!timeoutDuration || timeoutDuration < 1 || timeoutDuration > 2419200) {
               actionError = 'Для действия "Таймаут" необходимо указать длительность от 1 до 2419200 секунд (4 недели).';
          } else {
              actionConfig = { type: AutoModerationActionType.Timeout, metadata: { durationSeconds: timeoutDuration } };
          }
     } else {
          actionError = 'Выбран неверный тип действия.';
     }

     if (actionError || !actionConfig) {
         const embed = EmbedService.createBaseEmbed(interaction).setTitle('Ошибка настройки действия').setDescription(actionError || 'Не удалось определить действие для правила.');
         await interaction.editReply({ embeds: [embed] }).catch(console.error);
         return;
     }

     const actions = [actionConfig];

     try {
         const rule = await interaction.guild.autoModerationRules.create({
             name: name,
             triggerType: AutoModerationRuleTriggerType.Keyword,
             eventType: AutoModerationRuleEventType.MessageSend,
             triggerMetadata: { keywordFilter: keywords },
             actions: actions,
             enabled: true,
             exemptRoles: exemptRoles,
             exemptChannels: exemptChannels
         });

         const embed = EmbedService.createBaseEmbed(interaction).setTitle('Правило добавлено')
             .setDescription(`Создано правило Автомодерации "${rule.name}".`)
             .addFields(
                 { name: 'ID Правила', value: `\`${rule.id}\``, inline: false },
                 { name: 'Триггер', value: 'Ключевые слова', inline: true },
                  { name: 'Слова/Фразы', value: keywords.join(', ') || 'Не указаны', inline: true },
                  { name: 'Действия', value: actions.map(a => {
                      if (a.type === AutoModerationActionType.BlockMessage) return `Блокировать сообщение${a.metadata?.custom_message ? ` ("${a.metadata.custom_message}")` : ''}`;
                       if (a.type === AutoModerationActionType.Timeout) return `Таймаут ${a.metadata.durationSeconds || a.metadata.duration_seconds} сек`;
                       return 'Неизвестно';
                  }).join(', ') || 'Не указаны', inline: false },
                  { name: 'Исключенные роли', value: exemptRoles.map(id => `<@&${id}>`).join(', ') || 'Нет', inline: true },
                  { name: 'Исключенные каналы', value: exemptChannels.map(id => `<#${id}>`).join(', ') || 'Нет', inline: true }
             ).setFooter({ text: 'Настройка нативного Автомода' });

         await interaction.editReply({ embeds: [embed] }).catch(console.error);

     } catch (error) {
         console.error('Ошибка при создании правила Автомода:', error);
         const embed = EmbedService.createBaseEmbed(interaction).setTitle('Ошибка API').setDescription(`Произошла ошибка при создании правила: ${error.message}`);
         await interaction.editReply({ embeds: [embed] }).catch(console.error);
     }
}

async function handleEditSubcommand(interaction) {
     const ruleId = interaction.options.getString('rule_id', true);
     const newName = interaction.options.getString('name');
     const newKeywordsString = interaction.options.getString('keywords');
     const newActionType = interaction.options.getString('action');
     const newTimeoutDuration = interaction.options.getInteger('timeout_duration');
     const newBlockMessage = interaction.options.getString('block_message');
     const newExemptRolesString = interaction.options.getString('exempt_roles');
     const newExemptChannelsString = interaction.options.getString('exempt_channels');
     const newEnabledStatus = interaction.options.getBoolean('enabled');

     const existingRule = await fetchRuleById(interaction, ruleId);
     if (!existingRule) return;

     const updateData = {};
     let actionEdited = false;

     if (newName !== null) updateData.name = newName;

     if (newKeywordsString !== null) {
         const newKeywords = newKeywordsString.split(',').map(k => k.trim()).filter(k => k.length > 0);
         if (newKeywords.length === 0 && newKeywordsString.length > 0) {
              const embed = EmbedService.createBaseEmbed(interaction).setTitle('Предупреждение').setDescription('Вы указали пустой список ключевых слов. Правило может стать неактивным или работать неожиданно.');
              await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral }).catch(console.error);
         }
         updateData.triggerMetadata = { ...existingRule.triggerMetadata, keywordFilter: newKeywords };
     }

     if (newActionType !== null) {
         let newActionConfig = null;
         let actionEditError = null;

         if (newActionType === 'block_message') {
             newActionConfig = { type: AutoModerationActionType.BlockMessage, metadata: newBlockMessage !== undefined ? { custom_message: newBlockMessage } : {} };
         } else if (newActionType === 'timeout') {
             if (newTimeoutDuration === null) { actionEditError = 'При смене действия на "Таймаут" необходимо указать длительность.'; }
             else if (newTimeoutDuration !== null && (newTimeoutDuration < 1 || newTimeoutDuration > 2419200)) { actionEditError = 'Длительность таймаута должна быть от 1 до 2419200 секунд.'; }
             else { newActionConfig = { type: AutoModerationActionType.Timeout, metadata: { durationSeconds: newTimeoutDuration } }; }
         }

         if (actionEditError || !newActionConfig) {
             const embed = EmbedService.createBaseEmbed(interaction).setTitle('Ошибка настройки нового действия').setDescription(actionEditError || 'Не удалось сконфигурировать новое действие.');
              await interaction.editReply({ embeds: [embed] }).catch(console.error);
             return;
         }
         updateData.actions = [newActionConfig];
         actionEdited = true;

     } else {
         const currentAction = existingRule.actions[0];
         if (currentAction) {
             let metadataUpdate = { ...currentAction.metadata };
             let metadataChanged = false;

             if (currentAction.type === AutoModerationActionType.BlockMessage && newBlockMessage !== undefined) {
                 metadataUpdate.custom_message = newBlockMessage;
                 metadataChanged = true;
             }
             if (currentAction.type === AutoModerationActionType.Timeout && newTimeoutDuration !== undefined) {
                  if (newTimeoutDuration !== null && (newTimeoutDuration < 1 || newTimeoutDuration > 2419200)) {
                       const embed = EmbedService.createBaseEmbed(interaction).setTitle('Ошибка обновления длительности таймаута').setDescription('Новая длительность таймаута должна быть от 1 до 2419200 секунд.');
                       await interaction.editReply({ embeds: [embed] }).catch(console.error); return;
                  }
                 metadataUpdate.durationSeconds = newTimeoutDuration;
                 metadataChanged = true;
             }

             if (metadataChanged) {
                 updateData.actions = [{ type: currentAction.type, metadata: metadataUpdate }];
                 actionEdited = true;
             }
         }
     }

     if (newExemptRolesString !== null) { updateData.exemptRoles = parseMentionString(newExemptRolesString); }
     if (newExemptChannelsString !== null) { updateData.exemptChannels = parseMentionString(newExemptChannelsString); }
     if (newEnabledStatus !== null) { updateData.enabled = newEnabledStatus; }

     if (Object.keys(updateData).length === 0) {
          const embed = EmbedService.createBaseEmbed(interaction).setTitle('Нет изменений').setDescription('Вы не указали ни одного параметра для изменения правила.');
          await interaction.editReply({ embeds: [embed] }).catch(console.error);
          return;
     }

     try {
          console.log(`Attempting to edit automod rule ${ruleId} with data:`, JSON.stringify(updateData, null, 2));
          const editedRule = await existingRule.edit(updateData);

          const embed = EmbedService.createBaseEmbed(interaction).setTitle('Правило отредактировано')
             .setDescription(`Правило Автомодерации "${editedRule.name}" (ID: \`${editedRule.id}\`) успешно отредактировано.`);

          const actionsText = editedRule.actions.map(a => {
              if (a.type === AutoModerationActionType.BlockMessage) return `Блокировать сообщение${a.metadata?.custom_message ? ` ("${a.metadata.custom_message}")` : ''}`;
               if (a.type === AutoModerationActionType.SendAlertMessage) return `Уведомление в <#${a.metadata.channelId || a.metadata.channel_id}>`;
               if (a.type === AutoModerationActionType.Timeout) return `Таймаут ${a.metadata.durationSeconds || a.metadata.duration_seconds} сек`;
               return 'Неизвестное действие';
          }).join(', ') || 'Не указаны';

          const editedKeywords = editedRule.triggerMetadata?.keywordFilter?.join(', ') || 'Не указаны';
          const triggerDetails = editedRule.triggerType === AutoModerationRuleTriggerType.Keyword ? `Ключевые слова: ${editedKeywords}` : 'Неизвестный триггер';

          const exemptionsText = [(editedRule.exemptRoles?.length || 0) > 0 ? `Роли: ${editedRule.exemptRoles.map(id => `<@&${id}>`).join(', ')}` : '', (editedRule.exemptChannels?.length || 0) > 0 ? `Каналы: ${editedRule.exemptChannels.map(id => `<#${id}>`).join(', ')}` : ''].filter(Boolean).join('; ') || 'Нет';

          embed.addFields(
              { name: 'Обновленные данные', value: '---', inline: false },
              { name: 'Статус', value: editedRule.enabled ? 'Включено' : 'Отключено', inline: true },
              { name: 'Триггер', value: triggerDetails, inline: false },
              { name: 'Действия', value: actionsText, inline: false },
              { name: 'Исключения', value: exemptionsText, inline: false }
          );

          await interaction.editReply({ embeds: [embed] }).catch(console.error);

     } catch (error) {
         console.error(`Ошибка API при редактировании правила Автомода ${ruleId}:`, error);
         const embed = EmbedService.createBaseEmbed(interaction).setTitle('Ошибка редактирования').setDescription(`Произошла ошибка при редактировании правила: ${error.message}`);
         await interaction.editReply({ embeds: [embed] }).catch(console.error);
     }
}

async function handleRemoveSubcommand(interaction) {
    const ruleId = interaction.options.getString('rule_id', true);

    try {
        await interaction.guild.autoModerationRules.delete(ruleId);
        const embed = EmbedService.createBaseEmbed(interaction)
            .setTitle('Правило удалено')
            .setDescription(`Правило Автомодерации с ID \`${ruleId}\` успешно удалено.`);
        await interaction.editReply({ embeds: [embed] }).catch(console.error);
    } catch (error) {
         console.error(`Ошибка при удалении правила Автомода ${ruleId}:`, error);

         const embed = EmbedService.createBaseEmbed(interaction)
            .setTitle('Ошибка удаления');

         if (error.code === 10048 || (error.rawError && error.rawError.code === 0 && error.status === 404)) {
              embed.setDescription(`Правило Автомодерации с ID \`${ruleId}\` не найдено или уже было удалено.`);
              embed.setColor(0x9B59B6);
         } else {
             embed.setDescription(`Произошла непредвиденная ошибка при удалении правила: ${error.message}`);
         }

         await interaction.editReply({ embeds: [embed] }).catch(console.error);
    }
}

async function handleListSubcommand(interaction) {
     const rules = await interaction.guild.autoModerationRules.fetch();

     if (rules.size === 0) {
          const embed = EmbedService.createBaseEmbed(interaction).setTitle('Список правил Автомодерации')
             .setDescription('На этом сервере нет правил Автомодерации.');
         await interaction.editReply({ embeds: [embed] }).catch(console.error);
         return;
     }

     const ruleFields = rules.map(rule => {
          const actionsText = rule.actions.map(action => {
             if (action.type === AutoModerationActionType.BlockMessage) return `Блокировать сообщение${action.metadata?.custom_message ? ` ("${action.metadata.custom_message}")` : ''}`;
             if (action.type === AutoModerationActionType.SendAlertMessage) return `Уведомление в <#${action.metadata.channelId || action.metadata.channel_id}>`;
             if (action.type === AutoModerationActionType.Timeout) return `Таймаут ${action.metadata.durationSeconds || action.metadata.duration_seconds} сек`;
             return 'Неизвестное действие';
         }).join(', ') || 'Не указаны';

         let triggerDetails = 'Неизвестный триггер';
          if (rule.triggerType === AutoModerationRuleTriggerType.Keyword) {
             const keywordsPreview = rule.triggerMetadata?.keywordFilter?.slice(0, 5).join(', ');
             const remainingKeywords = (rule.triggerMetadata?.keywordFilter?.length || 0) - (keywordsPreview?.split(',').length || 0);
             triggerDetails = `Ключевые слова: ${keywordsPreview || 'Не указаны'}${remainingKeywords > 0 ? ` и еще ${remainingKeywords}...` : ''}`;

         } else if (rule.triggerType === AutoModerationRuleTriggerType.Spam) {
             triggerDetails = 'Обнаружение спама';
         } else if (rule.triggerType === AutoModerationRuleTriggerType.MentionSpam) {
              triggerDetails = `Спам упоминаниями (лимит: ${rule.triggerMetadata?.mentionTotalLimit})`;
         } else if (rule.triggerType === AutoModerationRuleTriggerType.HarmfulLink) {
              triggerDetails = `Вредоносные ссылки`;
         }


          const exemptionsText = [
               (rule.exemptRoles?.length || 0) > 0 ? `Роли: ${rule.exemptRoles.map(id => `<@&${id}>`).join(', ')}` : '',
               (rule.exemptChannels?.length || 0) > 0 ? `Каналы: ${rule.exemptChannels.map(id => `<#${id}>`).join(', ')}` : ''
          ].filter(Boolean).join('; ') || 'Нет';


         return {
             name: `${rule.name} (ID: ${rule.id})`,
             value: `Статус: ${rule.enabled ? 'Включено' : 'Выключено'}\nТриггер: ${triggerDetails}\nДействия: ${actionsText}\nИсключения: ${exemptionsText}`,
             inline: false
         };
     });

     const embed = EmbedService.createBaseEmbed(interaction).setTitle('Список правил Автомодерации на сервере')
          .setDescription(ruleFields.length > 0 ? 'Список всех активных правил:' : 'На этом сервере нет правил Автомодерации.')
         .addFields(ruleFields)
         .setFooter({ text: `Всего правил: ${rules.size}` });

     await interaction.editReply({ embeds: [embed] }).catch(console.error);
}

async function handleClearAllSubcommand(interaction) {
     const confirmButtonId = `clear_automod_native_confirm_${interaction.id}`;
     const cancelButtonId = `clear_automod_native_cancel_${interaction.id}`;

     const row = new ActionRowBuilder()
         .addComponents(
             new ButtonBuilder()
                 .setCustomId(confirmButtonId)
                 .setLabel('Да, удалить ВСЕ')
                 .setStyle(ButtonStyle.Danger),
             new ButtonBuilder()
                 .setCustomId(cancelButtonId)
                 .setLabel('Отмена')
                 .setStyle(ButtonStyle.Secondary),
         );

      const confirmEmbed = EmbedService.createBaseEmbed(interaction).setTitle('Запрос подтверждения')
          .setDescription('Внимание: Вы уверены, что хотите удалить ВСЕ правила нативного Автомода на этом сервере? Это действие нельзя отменить и затронет все правила, даже созданные вручную.');

     const reply = await interaction.reply({
         embeds: [confirmEmbed], components: [row], flags: MessageFlags.Ephemeral
     }).catch(console.error);
     if (!reply) return;


     const filter = i => i.customId === confirmButtonId || i.customId === cancelButtonId;
     try {
         const confirmation = await reply.awaitMessageComponent({ filter, time: 60000 });

         if (confirmation.customId === confirmButtonId) {
             try {
                 await confirmation.update({ content: 'Удаляю все правила...', embeds: [], components: [] });
             } catch (editError) {
                 if (editError.code === 10008) {
                     console.warn('Не удалось обновить сообщение подтверждения (подготовка к очистке): Сообщение не найдено.');
                 } else {
                      console.error('Не удалось обновить сообщение подтверждения (подготовка к очистке) по другой причине:', editError);
                 }
             }

             const rulesToDelete = await interaction.guild.autoModerationRules.fetch();
             let deletedCount = 0;
             const failedDeletes = [];

             for (const rule of rulesToDelete.values()) {
                 try { await rule.delete(); deletedCount++; }
                 catch (deleteError) {
                      if (deleteError.code === 10048 || (deleteError.rawError && deleteError.rawError.code === 0 && deleteError.status === 404)) {
                          console.warn(`Правило Автомода ${rule.id} ("${rule.name || 'Неизвестно'}") не найдено или уже было удалено во время очистки.`);
                           failedDeletes.push({ id: rule.id, name: rule.name || 'Неизвестно', reason: 'Не найдено/уже удалено' });
                       } else {
                           console.error(`Не удалось удалить правило Автомода ${rule.id} ("${rule.name || 'Неизвестно'}"):`, deleteError);
                           failedDeletes.push({ id: rule.id, name: rule.name || 'Неизвестно', reason: deleteError.message || 'Неизвестная ошибка' });
                       }
                 }
             }

              const successEmbed = EmbedService.createBaseEmbed(interaction).setTitle('Очистка завершена')
                  .setDescription(`Запрос на удаление ${rulesToDelete.size} правил отправлен.\nУспешно удалено ${deletedCount}.`);

          if (failedDeletes.length > 0) {
              successEmbed.setColor(0x9B59B6);
              const failedList = failedDeletes.map(f => `\`${f.id}\` ("${f.name}"): ${f.reason}`).join('\n');
              const failedListValue = failedList.length > 1024 ? failedList.substring(0, 1000) + '...' : failedList;
              successEmbed.addFields({ name: 'Не удалось удалить следующие правила:', value: failedListValue, inline: false });
          }
              try {
                  await confirmation.message.edit({ embeds: [successEmbed], components: [] });
              } catch (editError) {
                   if (editError.code === 10008) {
                       console.warn('Не удалось отредактировать сообщение подтверждения (финальный результат): Сообщение не найдено.');
                   } else {
                       console.error('Не удалось отредактировать сообщение подтверждения (финальный результат) по другой причине:', editError);
                   }
              }

         } else {
             try {
                  const cancelEmbed = EmbedService.createBaseEmbed(interaction).setTitle('Очистка отменена').setDescription('Отмена удаления правил.');
                  await confirmation.update({ embeds: [cancelEmbed], components: [] });
             } catch (editError) {
                 if (editError.code === 10008) {
                     console.warn('Не удалось обновить сообщение подтверждения (отмена): Сообщение не найдено.');
                 } else {
                     console.error('Не удалось обновить сообщение подтверждения (отмена) по другой причине:', editError);
                 }
             }
         }
     } catch (e) {
          console.error('Ошибка при ожидании или обработке клика подтверждения:', e);
          const timeoutEmbed = EmbedService.createBaseEmbed(interaction).setTitle('Время истекло или ошибка').setDescription('Время ожидания подтверждения истекло или произошла ошибка.');
          if (reply && !reply.deleted) {
              try {
                  await reply.edit({ embeds: [timeoutEmbed], components: [] });
              } catch (editError) {
                   if (editError.code === 10008) {
                       console.warn('Не удалось отредактировать исходное сообщение подтверждения (таймаут/ошибка): Сообщение не найдено.');
                   } else {
                       console.error('Не удалось отредактировать исходное сообщение подтверждения (таймаут/ошибка) по другой причине:', editError);
                   }
              }
          } else { console.warn('Не удалось отредактировать исходное сообщение подтверждения: Оно уже удалено или недоступно.'); }
     }
}

async function handleViewSubcommand(interaction) {
     const ruleId = interaction.options.getString('rule_id', true);

     const rule = await fetchRuleById(interaction, ruleId);
     if (!rule) return;

     const actionsText = rule.actions.map(a => {
         if (a.type === AutoModerationActionType.BlockMessage) return `Блокировать сообщение${a.metadata?.custom_message ? ` ("${a.metadata.custom_message}")` : ''}`;
         if (a.type === AutoModerationActionType.SendAlertMessage) return `Уведомление в <#${a.metadata.channelId || a.metadata.channel_id}>`;
         if (a.type === AutoModerationActionType.Timeout) return `Таймаут ${a.metadata.durationSeconds || a.metadata.duration_seconds} сек`;
         return 'Неизвестное действие';
     }).join(', ') || 'Не указаны';

     const triggerDetails = rule.triggerType === AutoModerationRuleTriggerType.Keyword
         ? `Ключевые слова: ${rule.triggerMetadata?.keywordFilter?.join(', ') || 'Не указаны'}`
         : 'Неизвестный триггер';

      const exemptionsText = [
           (rule.exemptRoles?.length || 0) > 0 ? `Роли: ${rule.exemptRoles.map(id => `<@&${id}>`).join(', ')}` : '',
           (rule.exemptChannels?.length || 0) > 0 ? `Каналы: ${rule.exemptChannels.map(id => `<#${id}>`).join(', ')}` : ''
      ].filter(Boolean).join('; ') || 'Нет';

     const embed = EmbedService.createBaseEmbed(interaction)
         .setTitle(`Правило Автомодерации: ${rule.name}`)
         .setDescription(`**ID:** \`${rule.id}\`\n**Статус:** ${rule.enabled ? 'Включено' : 'Отключено'}`)
         .addFields(
              { name: 'Триггер', value: triggerDetails, inline: false },
              { name: 'Действия', value: actionsText, inline: false },
              { name: 'Исключения', value: exemptionsText, inline: false }
         )
          .setFooter({ text: `Создано: ${rule.creatorId || 'Неизвестно'}` });

      await interaction.editReply({ embeds: [embed] }).catch(console.error);
}

async function handleToggleSubcommand(interaction) {
     const ruleId = interaction.options.getString('rule_id', true);

     const rule = await fetchRuleById(interaction, ruleId);
     if (!rule) return;

     const newStatus = !rule.enabled;

     try {
         const updatedRule = await rule.edit({ enabled: newStatus });

         const embed = EmbedService.createBaseEmbed(interaction)
              .setTitle('Статус правила обновлен')
              .setDescription(`Статус правила "${updatedRule.name}" (ID: \`${updatedRule.id}\`) изменен на **${newStatus ? 'Включено' : 'Отключено'}**.`);

         await interaction.editReply({ embeds: [embed] }).catch(console.error);

     } catch (error) {
         console.error(`Ошибка при переключении статуса правила Автомода ${ruleId}:`, error);
         const embed = EmbedService.createBaseEmbed(interaction).setTitle('Ошибка API')
            .setDescription(`Произошла ошибка при переключении статуса правила: ${error.message}`);
         await interaction.editReply({ embeds: [embed] }).catch(console.error);
     }
}

async function handleExemptSubcommands(interaction, subcommandName) {
     const ruleId = interaction.options.getString('rule_id', true);
     const role = interaction.options.getRole('role');
     const channel = interaction.options.getChannel('channel');

     const rule = await fetchRuleById(interaction, ruleId);
     if (!rule) return;

     const currentExemptRoles = [...rule.exemptRoles];
     const currentExemptChannels = [...rule.exemptChannels];

     let updatedExemptRoles = [...currentExemptRoles];
     let updatedExemptChannels = [...currentExemptChannels];

     let successMessage = '';
     let errorMessage = null;

     switch (subcommandName) {
         case 'add-role': {
             if (!role) { errorMessage = 'Роль не указана.'; break; }
             if (currentExemptRoles.includes(role.id)) { errorMessage = `Роль ${role} уже в списке исключений для правила "${rule.name}".`; }
             else { updatedExemptRoles.push(role.id); successMessage = `Роль ${role} добавлена в список исключений для правила "${rule.name}".`; }
             break;
         }
         case 'remove-role': {
             if (!role) { errorMessage = 'Роль не указана.'; break; }
             const index = updatedExemptRoles.indexOf(role.id);
             if (index === -1) { errorMessage = `Роль ${role} не найдена в списке исключений для правила "${rule.name}".`; }
             else { updatedExemptRoles.splice(index, 1); successMessage = `Роль ${role} удалена из списка исключений для правила "${rule.name}".`; }
             break;
         }
         case 'add-channel': {
              if (!channel) { errorMessage = 'Канал не указан.'; break; }
              if (currentExemptChannels.includes(channel.id)) { errorMessage = `Канал ${channel} уже в списке исключений для правила "${rule.name}".`; }
             else { updatedExemptChannels.push(channel.id); successMessage = `Канал ${channel} добавлен в список исключений для правила "${rule.name}".`; }
             break;
         }
         case 'remove-channel': {
             if (!channel) { errorMessage = 'Канал не указан.'; break; }
             const index = updatedExemptChannels.indexOf(channel.id);
             if (index === -1) { errorMessage = `Канал ${channel} не найдена в списке исключений для правила "${rule.name}".`; }
             else { updatedExemptChannels.splice(index, 1); successMessage = `Канал ${channel} удален из списка исключений для правила "${rule.name}".`; }
             break;
         }
         default:
             errorMessage = 'Неизвестная подкоманда управления исключениями.';
             break;
     }

     if (errorMessage) {
          const embed = EmbedService.createBaseEmbed(interaction).setTitle('Ошибка/Предупреждение').setDescription(errorMessage);
          await interaction.editReply({ embeds: [embed] }).catch(console.error);
          return;
     }

      const rolesChanged = currentExemptRoles.length !== updatedExemptRoles.length || currentExemptRoles.some(id => !updatedExemptRoles.includes(id));
     const channelsChanged = currentExemptChannels.length !== updatedExemptChannels.length || currentExemptChannels.some(id => !updatedExemptChannels.includes(id));


     if (!rolesChanged && !channelsChanged) {
         const embed = EmbedService.createBaseEmbed(interaction).setTitle('Нет изменений').setDescription('Списки исключений не изменились.');
         await interaction.editReply({ embeds: [embed] }).catch(console.error);
         return;
     }


     try {
         const updateData = {};
         if(rolesChanged) updateData.exemptRoles = updatedExemptRoles;
         if(channelsChanged) updateData.exemptChannels = updatedExemptChannels;

         const updatedRule = await rule.edit(updateData);

         const embed = EmbedService.createBaseEmbed(interaction)
             .setTitle('Исключения правила обновлены')
             .setDescription(successMessage);

         const updatedExemptionsText = [
              (updatedRule.exemptRoles?.length || 0) > 0 ? `Роли: ${updatedRule.exemptRoles.map(id => `<@&${id}>`).join(', ')}` : '',
              (updatedRule.exemptChannels?.length || 0) > 0 ? `Каналы: ${updatedRule.exemptChannels.map(id => `<#${id}>`).join(', ')}` : ''
         ].filter(Boolean).join('; ') || 'Нет';

         embed.addFields(
             { name: 'Актуальные исключения', value: updatedExemptionsText, inline: false }
         );

         await interaction.editReply({ embeds: [embed] }).catch(console.error);

     } catch (error) {
         console.error(`Ошибка API при обновлении исключений правила Автомода ${ruleId}:`, error);
         const embed = EmbedService.createBaseEmbed(interaction).setTitle('Ошибка API')
            .setDescription(`Произошла ошибка при обновлении исключений правила: ${error.message}`);
         await interaction.editReply({ embeds: [embed] }).catch(console.error);
     }
}