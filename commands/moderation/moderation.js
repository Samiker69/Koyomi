const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const ModerationDB = require('../../functions/db/case');
const db = new ModerationDB('./database/cases.db')

const data = new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('all mod-type command')
    .addSubcommand(sub =>
        sub.setName('ban')
        .setDescription('Забанить пользователя на сервере')
        .addUserOption(option =>
            option.setName('пользователь')
                .setDescription('Пользователь для бана')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('причина')
                .setDescription('Причина бана')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName('доказательства')
                .setDescription('Прикрепите доказательства (если есть)')
                .setRequired(false)
        )
    )
    .addSubcommand(sub =>
        sub.setName('mute')
        .setDescription('Замьютить пользователя')
        .addUserOption(option =>
          option.setName('пользователь')
                .setDescription('Пользователь для мута')
                .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('время')
                .setDescription('Длительность мута в минутах (макс. 40320, то есть 28 дней)')
                .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('причина')
                .setDescription('Причина мута')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
          option.setName('доказательства')
                .setDescription('Прикрепите доказательства (если есть)')
                .setRequired(false)
        )
    )
    .addSubcommand(sub => 
        sub.setName('kick')
        .setDescription('Кикнуть пользователя с сервера')
        .addUserOption(option =>
            option.setName('пользователь')
                .setDescription('Пользователь для кика')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('причина')
                .setDescription('Причина кика')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName('доказательства')
                .setDescription('Прикрепите доказательства (если есть)')
                .setRequired(false)
        )
    )
    .addSubcommand(sub => 
        sub.setName('unmute')
        .setDescription('Снять мут (таймаут) с пользователя')
        .addUserOption(option =>
          option.setName('пользователь')
            .setDescription('Пользователь, у которого снимают мут')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('причина')
            .setDescription('Причина снятия мута')
            .setRequired(false)
        )
        .addAttachmentOption(option =>
          option.setName('доказательства')
            .setDescription('Прикрепите доказательства (если есть)')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
        sub.setName('unban')
        .setDescription('Разбанить пользователя по ID')
        .addUserOption(option =>
          option.setName('userid')
            .setDescription('ID пользователя для разбанивания')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Причина разбана')
            .setRequired(false)
        )
        .addAttachmentOption(option =>
          option.setName('evidence')
            .setDescription('Прикрепите доказательства (если есть)')
            .setRequired(false)
        )
    )


    module.exports = {
    cooldown: 5,
    data,
    async execute(interaction) {
        if (!(interaction.memberPermissions.has('BanMembers') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }
        if (!interaction.guild.members.me.permissions.has('BanMembers')) {
            await interaction.reply({ content: "У меня недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }

        switch (interaction.options.getSubcommand()) {
            case "ban": {
                const targetUser = interaction.options.getUser('пользователь');
                const reason = interaction.options.getString('причина') || 'Без причины';
                const evidence = interaction.options.getAttachment('доказательства');

                if (targetUser.id === interaction.user.id) {
                    await interaction.reply({ content: "Ты не можешь забанить самого себя!", flags: MessageFlags.Ephemeral });
                    return;
                }
                if (targetUser.id === interaction.guild.ownerId) {
                    await interaction.reply({ content: "Ты не можешь забанить владельца сервера", flags: MessageFlags.Ephemeral });
                    return;
                }
                const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                if (!member) {
                    await interaction.reply({ content: "Участник не найден", flags: MessageFlags.Ephemeral });
                    return;
                }
                if (!interaction.memberPermissions.has('Administrator') && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
                    await interaction.reply({ content: "Позиция вашей роли ниже чем роль выбранного участника", flags: MessageFlags.Ephemeral });
                    return;
                }
                if (!member.bannable) {
                    await interaction.reply({ content: "Я не могу забанить этого участника", flags: MessageFlags.Ephemeral });
                    return;
                }
                try {
                    await member.ban({ reason: reason + ` | by ${interaction.user.username}(${interaction.user.id})` });
                    await db.addModCase({
                        serverId: interaction.guild.id,
                        targetId: targetUser.id,
                        moderatorId: interaction.user.id,
                        action: 'ban',
                        reason: reason,
                        timestamp: new Date()
                    });
        
                    const latestCase = db.getServerModCases(interaction.guild.id)
        
                    const embed = {
                        color: 0xff0000,
                        title: `Case \`#${latestCase[0].caseNum}\``,
                        thumbnail: { url: interaction.guild.iconURL() || '' },
                        fields: [
                            { name: 'Модератор', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Пользователь', value: `<@${targetUser.id}>`, inline: true },
                            { name: 'Причина', value: reason, inline: false },
                            { name: 'Время', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        ],
                        footer: { text: 'Бан выполнен', icon_url: interaction.user.displayAvatarURL({ dynamic: true }) },
                        timestamp: new Date()
                    };
        
                    if (evidence) {
                        embed.fields.push({
                            name: 'Доказательства',
                            value: `[Нажмите для просмотра](${evidence.url})`
                        });
                        embed.image = { url: evidence.url };
                    }
        
                    await interaction.reply({ embeds: [embed] });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: "Не удалось забанить пользователя", flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case "mute": {
                await interaction.deferReply()

                const targetUser = interaction.options.getUser('пользователь');
                if (targetUser.id === interaction.user.id) {
                  await interaction.editReply({ content: "Ты не можешь замьютить самого себя" });
                  return;
                }
                
                const timeInput = interaction.options.getString('время');
                const reason = interaction.options.getString('причина') || "Без причины"
                const evidence = interaction.options.getAttachment('доказательства');
                
                let durationMinutes = 10;
                if (timeInput) {
                  const parsed = parseInt(timeInput);
                  if (!isNaN(parsed) && parsed > 0) {
                    durationMinutes = parsed;
                  }
                }
                if (durationMinutes > 40320) {
                  await interaction.editReply({ content: `Вы не можете замьютить участника на \`${durationMinutes}\` минут!` });
                  return;
                }
                const durationMs = durationMinutes * 60000;

                if (targetUser.id === interaction.user.id) {
                    await interaction.reply({ content: "Ты не можешь замьютить самого себя!", flags: MessageFlags.Ephemeral });
                    return;
                }
                if (targetUser.id === interaction.guild.ownerId) {
                    await interaction.reply({ content: "Ты не можешь замьютить владельца сервера", flags: MessageFlags.Ephemeral });
                    return;
                }
                const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                if (!member) {
                    await interaction.reply({ content: "Участник не найден", flags: MessageFlags.Ephemeral });
                    return;
                }
                if (!interaction.memberPermissions.has('Administrator') && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
                    await interaction.reply({ content: "Позиция вашей роли ниже чем роль выбранного участника", flags: MessageFlags.Ephemeral });
                    return;
                }
                if (!member.moderatable) {
                    await interaction.editReply({ content: "Я не могу замьютить этого участника" });
                    return;
                }

                try {
                    await member.timeout(durationMs, reason + ` | by ${interaction.user.username}(${interaction.user.id})`);
                    await db.addModCase({
                      serverId: interaction.guild.id,
                      targetId: targetUser.id,
                      moderatorId: interaction.user.id,
                      action: 'mute',
                      reason: reason,
                      timestamp: new Date()
                    });
                    
                    const latestCase = db.getServerModCases(interaction.guild.id)
                    
                    const embed = new EmbedBuilder()
                      .setColor(0x808080)
                      .setTitle(`Case \`#${latestCase[0].caseNum}\``)
                      .setThumbnail(interaction.guild.iconURL() || '')
                      .addFields(
                        { name: 'Модератор', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Пользователь', value: `<@${targetUser.id}>`, inline: true },
                        { name: 'Причина', value: reason, inline: false },
                        { name: 'Длительность', value: `${durationMinutes} минут`, inline: true },
                        { name: 'Время', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                      )
                      .setFooter({ text: 'Мут выполнен', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                      .setTimestamp();
                    
                    if (evidence) {
                      embed.addFields({ name: 'Доказательства', value: `[Нажмите для просмотра](${evidence.url})` });
                      embed.setImage(evidence.url);
                    }
                    
                    await interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    console.error('Ошибка при муте пользователя:', error);
                    await interaction.editReply({ content: "Не удалось замьютить участника" });
                }
                break;
            }
            case "kick": {
                const targetUser = interaction.options.getUser('пользователь');
                const reason = interaction.options.getString('причина') || 'Без причины';
                const evidence = interaction.options.getAttachment('доказательства');
                
                if (targetUser.id === interaction.user.id) {
                    await interaction.reply({ content: "Ты не можешь кикнуть самого себя!", flags: MessageFlags.Ephemeral });
                    return;
                }
                
                if (targetUser.id === interaction.guild.ownerId) {
                    await interaction.reply({ content: "Ты не можешь кикнуть владельца сервера!", flags: MessageFlags.Ephemeral });
                    return;
                }
                
                const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                if (!member) {
                    await interaction.reply({ content: "Участник не найден", flags: MessageFlags.Ephemeral });
                    return;
                }
                if (!interaction.memberPermissions.has('Administrator') && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
                    await interaction.reply({ content: "Позиция вашей роли ниже чем роль выбранного участника", flags: MessageFlags.Ephemeral });
                    return;
                }
                
                if (!member.kickable) {
                    await interaction.reply({ content: "Я не могу кикнуть этого участника", flags: MessageFlags.Ephemeral });
                    return;
                }
                
                try {
                    await member.kick(reason + ` | by ${interaction.user.username}(${interaction.user.id})`);
                    await db.addModCase({
                        serverId: interaction.guild.id,
                        targetId: targetUser.id,
                        moderatorId: interaction.user.id,
                        action: 'kick',
                        reason: reason,
                        timestamp: new Date()
                    });
                    
                    const latestCase = db.getServerModCases(interaction.guild.id)
                    
                    const embed = new EmbedBuilder()
                        .setColor(0xffa500)
                        .setTitle(`Case \`#${latestCase[0].caseNum}\``)
                        .setThumbnail(interaction.guild.iconURL() || '')
                        .addFields(
                            { name: 'Модератор', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Пользователь', value: `<@${targetUser.id}>`, inline: true },
                            { name: 'Причина', value: reason, inline: false },
                            { name: 'Время', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setFooter({ text: "Кик выполнен", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();
                    
                    if (evidence) {
                        embed.addFields({ name: 'Доказательства', value: `[Нажмите для просмотра](${evidence.url})` });
                        embed.setImage(evidence.url);
                    }
                    
                    await interaction.reply({ embeds: [embed] });
                } catch (error) {
                    console.error('Ошибка при кике пользователя:', error);
                    await interaction.reply({ content: "Не удалось кикнуть пользователя", flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case "unmute": {
                const targetUser = interaction.options.getUser('пользователь');
                if (targetUser.id === interaction.user.id) {
                  await interaction.reply({ content: "Ты не можешь размутить самого себя", flags: MessageFlags.Ephemeral });
                  return;
                }
                
                const reason = interaction.options.getString('причина') || 'Без причины';
                const evidence = interaction.options.getAttachment('доказательства');
                
                const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                if (!member) {
                  await interaction.reply({ content: "Участник не найден", flags: MessageFlags.Ephemeral });
                  return;
                }
                
                if (!interaction.memberPermissions.has('Administrator') &&
                    interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
                        await interaction.reply({ content: "Позиция вашей роли ниже чем роль выбранного участника", flags: MessageFlags.Ephemeral });
                        return;
                    }
                
                if (!member.moderatable) {
                  await interaction.reply({ content: "Я не могу размутить этого участника", flags: MessageFlags.Ephemeral });
                  return;
                }
                
                try {
                  await member.timeout(null, reason + ` | by ${interaction.user.username}(${interaction.user.id})`);
                  
                  await db.addModCase({
                    serverId: interaction.guild.id,
                    targetId: targetUser.id,
                    moderatorId: interaction.user.id,
                    action: 'unmute',
                    reason: reason,
                    timestamp: new Date()
                  });
                  
                  const latestCase = db.getServerModCases(interaction.guild.id)
                  
                  const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle(`Case \`#${latestCase[0].caseNum}\``)
                    .setThumbnail(interaction.guild.iconURL() || '')
                    .addFields(
                      { name: "Модератор", value: `<@${interaction.user.id}>`, inline: true },
                      { name: "Пользователь", value: `<@${targetUser.id}>`, inline: true },
                      { name: "Причина", value: reason, inline: false },
                      { name: "Время", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: "Размут выполнен", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();
                  
                  if (evidence) {
                    embed.addFields({ name: 'Доказательства', value: `[Нажмите для просмотра](${evidence.url})` });
                    embed.setImage(evidence.url);
                  }
                  
                  await interaction.reply({ embeds: [embed] });
                } catch (error) {
                  console.error('Ошибка при снятии мута:', error);
                  await interaction.reply({ content: "Не удалось размутить участника", flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case "unban": {
                const user = interaction.options.getUser('userid');
                const reason = interaction.options.getString('reason') || 'Без причины';
                const evidence = interaction.options.getAttachment('evidence');
            
                try {
                  await interaction.guild.members.unban(user.id, reason + ` | by ${interaction.user.username}(${interaction.user.id})`);
                  await db.addModCase({
                    serverId: interaction.guild.id,
                    targetId: user.id,
                    moderatorId: interaction.user.id,
                    action: 'unban',
                    reason: reason,
                    timestamp: new Date()
                  });
            
                  const latestCase = db.getServerModCases(interaction.guild.id)
            
                  const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle(`Case \`#${latestCase[0].caseNum}\``)
                    .setThumbnail(interaction.guild.iconURL() || '')
                    .addFields(
                      { name: "Модератор", value: `<@${interaction.user.id}>`, inline: true },
                      { name: "Пользователь", value: user.id, inline: true },
                      { name: "Причина", value: reason, inline: false },
                      { name: "Время", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setFooter({ text: "Разбан выполнен", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();
            
                  if (evidence) {
                    embed.addFields({ name: 'Доказательства', value: `[Нажмите для просмотра](${evidence.url})` });
                    embed.setImage(evidence.url);
                  }
            
                  await interaction.reply({ embeds: [embed] });
                } catch (error) {
                  if (error.code === 10026) {
                    await interaction.reply({ content: "Участник не забанен", flags: MessageFlags.Ephemeral });
                  } else {
                    console.error('Ошибка при разбане пользователя:', error);
                    await interaction.reply({ content: "Не удалось разбанить участника", flags: MessageFlags.Ephemeral });
                  }
                }
                break;
            }

            default:
                await interaction.reply({content: 'Кажется, такой саб-команды не существует', D})
                break;
        }
    }
}