const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    MessageFlags, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ChannelSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ComponentType
} = require('discord.js');

const Settings = require('../../functions/db/settings');
const { bot_log_channel } = require('../../config.json');

const Sdb = new Settings();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Открыть панель управления настройками сервера')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        const generateDashboard = () => {
            const cfg = Sdb.getSettings(guildId) || {}; 

            const statusInvites = cfg.allowInviteLogging ? 'Включено' : 'Выключено';
            const statusMembers = cfg.allowLogingMembersAdd ? 'Включено' : 'Выключено';
            
            const valWelcome = cfg.newMemberChannelId ? `<#${cfg.newMemberChannelId}>` : 'Не задан';
            const valInvites = cfg.inviteLoggerChannel ? `<#${cfg.inviteLoggerChannel}>` : 'Не задан';
            const valVoiceCat = cfg.voiceCategoryId ? `<#${cfg.voiceCategoryId}>` : 'Не задана';
            const valVoiceMain = cfg.mainVoiceChannelId ? `<#${cfg.mainVoiceChannelId}>` : 'Не задан';
            const valSupport = cfg.supportChannelId ? `<#${cfg.supportChannelId}>` : 'Не задан';
            const valReports = cfg.reportsModerationChannelId ? `<#${cfg.reportsModerationChannelId}>` : 'Не задан';

            const settingsEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle(`Настройки сервера ${interaction.guild.name}`)
                .setDescription('Используйте меню и кнопки ниже для изменения параметров.')
                .addFields(
                    { 
                        name: 'Приветствия и Логи', 
                        value: `> **Канал приветствий:** ${valWelcome}\n> **Лог приглашений:** ${valInvites}\n> **Уведомлять о входе/выходе:** ${statusMembers}\n> **Уведомлять о ссылках:** ${statusInvites}`, 
                        inline: false 
                    },
                    { 
                        name: 'Приватные комнаты', 
                        value: `> **Категория:** ${valVoiceCat}\n> **Создать Комнату:** ${valVoiceMain}`, 
                        inline: false 
                    },
                    { 
                        name: 'Поддержка и Жалобы', 
                        value: `> **Канал поддержки:** ${valSupport}\n> **Канал жалоб:** ${valReports}`, 
                        inline: false 
                    }
                )
                .setFooter({ text: 'Настройки обновляются в реальном времени' })
                .setTimestamp();

            const rowWelcome = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('select_welcome')
                    .setPlaceholder('Выбрать канал приветствий')
                    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            );

            const rowVoice = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('select_voice_main')
                    .setPlaceholder('Выбрать канал "Создать комнату"')
                    .setChannelTypes(ChannelType.GuildVoice)
            );
            
            const rowOtherChannels = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_actions')
                    .setPlaceholder('Дополнительные настройки каналов...')
                    .addOptions(
                        { label: 'Задать категорию войсов', description: 'Где будут создаваться личные комнаты', value: 'act_cat' },
                        { label: 'Задать канал логов', description: 'Куда писать о приглашениях', value: 'act_log' },
                        { label: 'Задать канал поддержки', description: 'Куда приходят тикеты', value: 'act_sup' },
                        { label: 'Задать канал жалоб', description: 'Куда приходят репорты', value: 'act_rep' },
                        { label: 'СБРОСИТЬ ВСЁ', description: 'Удалить все настройки (Опасно!)', value: 'act_reset' }
                    )
            );

            const rowToggles = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('toggle_invites')
                    .setLabel(`Лог ссылок: ${cfg.allowInviteLogging ? 'ВКЛ' : 'ВЫКЛ'}`)
                    .setStyle(cfg.allowInviteLogging ? ButtonStyle.Success : ButtonStyle.Secondary),
                
                new ButtonBuilder()
                    .setCustomId('toggle_members')
                    .setLabel(`Лог входа: ${cfg.allowLogingMembersAdd ? 'ВКЛ' : 'ВЫКЛ'}`)
                    .setStyle(cfg.allowLogingMembersAdd ? ButtonStyle.Success : ButtonStyle.Secondary)
            );

            return { embeds: [settingsEmbed], components: [rowWelcome, rowVoice, rowOtherChannels, rowToggles] };
        };

        const msg = await interaction.reply({ 
            ...generateDashboard(), 
            flags: MessageFlags.Ephemeral 
        });

        const collector = msg.createMessageComponentCollector({ time: 300_000 });

        collector.on('collect', async i => {
            try {
                if (i.customId === 'menu_actions') {
                    const selection = i.values[0];
                    
                    if (selection === 'act_reset') {
                        Sdb.removeServer(guildId);
                        Sdb.addServer(guildId);
                        await i.update(generateDashboard());
                        return;
                    }

                    let typeFilter = [ChannelType.GuildText];
                    let promptText = 'Выберите текстовый канал:';
                    if (selection === 'act_cat') {
                        typeFilter = [ChannelType.GuildCategory];
                        promptText = 'Выберите категорию для войсов:';
                    }

                    const tempSelect = new ActionRowBuilder().addComponents(
                        new ChannelSelectMenuBuilder()
                            .setCustomId('temp_select') 
                            .setPlaceholder(promptText)
                            .setChannelTypes(...typeFilter)
                    );
                    
                    const tempMsg = await i.reply({ 
                        content: promptText, 
                        components: [tempSelect], 
                        flags: MessageFlags.Ephemeral,
                        fetchReply: true 
                    });

                    try {
                        const selectionInteraction = await tempMsg.awaitMessageComponent({
                            filter: (subI) => subI.user.id === i.user.id,
                            time: 60000,
                            componentType: ComponentType.ChannelSelect
                        });

                        const selectedId = selectionInteraction.values[0];

                        if (selection === 'act_cat') Sdb.updateSetting(guildId, 'voiceCategoryId', selectedId);
                        else if (selection === 'act_log') Sdb.updateSetting(guildId, 'inviteLoggerChannel', selectedId);
                        else if (selection === 'act_sup') Sdb.updateSetting(guildId, 'supportChannelId', selectedId);
                        else if (selection === 'act_rep') Sdb.updateSetting(guildId, 'reportsModerationChannelId', selectedId);

                        await selectionInteraction.update({ content: 'Сохранено!', components: [] });
                        await interaction.editReply(generateDashboard());

                    } catch (err) {
                        await i.editReply({ content: 'Время ожидания выбора истекло.', components: [] });
                    }
                    return; 
                }

                const currentCfg = Sdb.getSettings(guildId) || {};
                
                if (i.customId === 'select_welcome') {
                    Sdb.updateSetting(guildId, 'newMemberChannelId', i.values[0]);
                } 
                else if (i.customId === 'select_voice_main') {
                    Sdb.updateSetting(guildId, 'mainVoiceChannelId', i.values[0]);
                }
                else if (i.customId === 'toggle_invites') {
                    Sdb.updateSetting(guildId, 'allowInviteLogging', !currentCfg.allowInviteLogging);
                }
                else if (i.customId === 'toggle_members') {
                    Sdb.updateSetting(guildId, 'allowLogingMembersAdd', !currentCfg.allowLogingMembersAdd);
                }

                await i.update(generateDashboard());

            } catch (err) {
                console.error(err);
                const logChannel = await interaction.client.channels.fetch(bot_log_channel).catch(() => null);
                if (logChannel) logChannel.send(`Ошибка в Settings Dashboard: ${err.message}`);
                
                if (!i.replied && !i.deferred) {
                    await i.reply({ content: 'Произошла ошибка при сохранении.', flags: MessageFlags.Ephemeral });
                }
            }
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] }).catch(() => {});
        });
    }
};