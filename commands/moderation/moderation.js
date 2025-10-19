const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModerationDB = require('../../functions/db/case');
const db = new ModerationDB()

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
                .setDescription('Длительность мута (например, 10m, 1h, 7d, 2w). Макс. 28 дней.')
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
     .addSubcommand(sub =>
         sub.setName('warn')
         .setDescription('Выдать предупреждение пользователю')
         .addUserOption(option =>
             option.setName('пользователь')
                 .setDescription('Пользователь для предупреждения')
                 .setRequired(true)
         )
         .addStringOption(option =>
             option.setName('причина')
                 .setDescription('Причина предупреждения')
                 .setRequired(false)
         )
         .addAttachmentOption(option =>
             option.setName('доказательства')
                 .setDescription('Прикрепите доказательства (если есть)')
                 .setRequired(false)
         )
     )
     .addSubcommand(sub =>
        sub.setName('unwarn')
        .setDescription('Снять предупреждение пользователя')
        .addUserOption(option =>
            option.setName('пользователь')
                .setDescription('Пользователь для снятия последнего предупреждения')
                .setRequired(false)
        )
        .addNumberOption(option =>
            option.setName('кейс')
                .setDescription('Номер кейса с предупреждением, которое надо снять')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('причина')
                .setDescription('Причина снятия предупреждения')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName('доказательства')
                .setDescription('Прикрепите доказательства (если есть)')
                .setRequired(false)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)


    module.exports = {
    cooldown: 3,
    data,
    async execute(interaction) {
        if (!(interaction.memberPermissions.has('KickMembers') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }
        if (!interaction.guild.members.me.permissions.has('BanMembers')) {
            await interaction.reply({ content: "У меня недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "ban": {
                if (!(interaction.memberPermissions.has('BanMembers'))) {
                  await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                  return;
                }
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
                    console.error('Ошибка при бане пользователя:', error);
                    await interaction.reply({ content: "Не удалось забанить пользователя", flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case "mute": {
                if (!(interaction.memberPermissions.has('MuteMembers') || interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers))) {
                  await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                  return;
                }
                await interaction.deferReply();

                const targetUser = interaction.options.getUser('пользователь');
                const timeInput = interaction.options.getString('время');
                const reason = interaction.options.getString('причина') || "Без причины";
                const evidence = interaction.options.getAttachment('доказательства');

                if (targetUser.id === interaction.user.id) {
                  await interaction.editReply({ content: "Ты не можешь замьютить самого себя" });
                  return;
                }

                 if (targetUser.id === interaction.guild.ownerId) {
                    await interaction.editReply({ content: "Ты не можешь замьютить владельца сервера" });
                    return;
                }

                const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                if (!member) {
                    await interaction.editReply({ content: "Участник не найден" });
                    return;
                }
                if (!interaction.memberPermissions.has('Administrator') && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
                    await interaction.editReply({ content: "Позиция вашей роли ниже чем роль выбранного участника" });
                    return;
                }
                if (!member.moderatable) {
                    await interaction.editReply({ content: "Я не могу замьютить этого участника" });
                    return;
                }

                let durationMs = 0;
                let durationString = "постоянно (макс. 28 дней)";
                const timeRegex = /^(\d+)([mhdwy])$/i;
                if (timeInput) {
                    const match = timeInput.match(timeRegex);
                    if (match) {
                        const amount = parseInt(match[1]);
                        const unit = match[2].toLowerCase();
                        let multiplier = 0;

                        switch (unit) {
                            case 'm':
                                multiplier = 60 * 1000;
                                durationString = `${amount} минут`;
                                break;
                            case 'h':
                                multiplier = 60 * 60 * 1000;
                                durationString = `${amount} часов`;
                                break;
                            case 'd':
                                multiplier = 24 * 60 * 60 * 1000;
                                durationString = `${amount} дней`;
                                break;
                            case 'w':
                                multiplier = 7 * 24 * 60 * 60 * 1000;
                                durationString = `${amount} недель`;
                                break;
                        }
                        durationMs = amount * multiplier;

                        const maxDurationMs = 28 * 24 * 60 * 60 * 1000;

                        if (durationMs > maxDurationMs) {
                             const overflowMs = durationMs - maxDurationMs;
                             let overflowString = '';
                             let tempMs = overflowMs;
                              if (tempMs >= 7 * 24 * 60 * 60 * 1000) {
                                  const weeks = Math.floor(tempMs / (7 * 24 * 60 * 60 * 1000));
                                  overflowString += `${weeks} нед `;
                                  tempMs %= (7 * 24 * 60 * 60 * 1000);
                              }
                              if (tempMs >= 24 * 60 * 60 * 1000) {
                                   const days = Math.floor(tempMs / (24 * 60 * 60 * 1000));
                                   overflowString += `${days} д `;
                                   tempMs %= (24 * 60 * 60 * 1000);
                              }
                              if (tempMs >= 60 * 60 * 1000) {
                                   const hours = Math.floor(tempMs / (60 * 60 * 1000));
                                   overflowString += `${hours} ч `;
                                   tempMs %= (60 * 60 * 1000);
                              }
                              if (tempMs >= 60 * 1000) {
                                  const minutes = Math.floor(tempMs / (60 * 1000));
                                  overflowString += `${minutes} м`;
                              }
                              overflowString = overflowString.trim();

                            await interaction.editReply({ content: `Вы не можете замьютить участника на ${durationString}! Максимальная длительность мута - 28 дней. Превышение: ${overflowString}.` });
                            return; 
                        } else if (durationMs <= 0) {
                             await interaction.editReply({ content: "Длительность мута должна быть положительной." });
                            return;
                        }
                    } else {
                        await interaction.editReply({ content: "Неверный формат времени. Используйте цифру и единицу (m/h/d/w), например: `10m`, `1h`, `7d`, `2w`." });
                        return;
                    }
                } else {
                    durationMs = null;
                    durationString = "постоянно (до 28 дней)";
                }


                try {
                    await member.timeout(durationMs, reason + ` | by ${interaction.user.username}(${interaction.user.id})`);

                    await db.addModCase({
                      serverId: interaction.guild.id,
                      targetId: targetUser.id,
                      moderatorId: interaction.user.id,
                      action: 'mute',
                      reason: reason,
                      timestamp: new Date(),
                      duration: durationMs 
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
                        { name: 'Длительность', value: durationString, inline: true },
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
                 if (!(interaction.memberPermissions.has('BanMembers'))) {
                   await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                   return;
                 }
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
            case "warn": {
                 if (!(interaction.memberPermissions.has('KickMembers') || interaction.memberPermissions.has('Administrator'))) {
                   await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                   return;
                 }
                 await interaction.deferReply();

                 const targetUser = interaction.options.getUser('пользователь');
                 const reason = interaction.options.getString('причина') || 'Без причины';
                 const evidence = interaction.options.getAttachment('доказательства');

                 if (targetUser.id === interaction.user.id) {
                     await interaction.editReply({ content: "Ты не можешь выдать предупреждение самому себе!" });
                     return;
                 }
                 if (targetUser.id === interaction.guild.ownerId) {
                     await interaction.editReply({ content: "Ты не можешь выдать предупреждение владельцу сервера" });
                     return;
                 }

                 const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                 if (!member) {
                     await interaction.editReply({ content: "Участник не найден" });
                     return;
                 }

                 if (!interaction.memberPermissions.has('Administrator') && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
                    await interaction.editReply({ content: "Позиция вашей роли ниже чем роль выбранного участника" });
                    return;
                 }

                 if (!member.moderatable) {
                     await interaction.editReply({ content: "Я не могу выдать предупреждение этому участнику" });
                     return;
                 }

                 try {
                     await db.addModCase({
                         serverId: interaction.guild.id,
                         targetId: targetUser.id,
                         moderatorId: interaction.user.id,
                         action: 'warn',
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
                         .setFooter({ text: "Предупреждение выдано", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                         .setTimestamp();

                     if (evidence) {
                         embed.addFields({ name: 'Доказательства', value: `[Нажмите для просмотра](${evidence.url})` });
                         embed.setImage(evidence.url);
                     }

                     await interaction.editReply({ embeds: [embed] });

                 } catch (error) {
                     console.error('Ошибка при выдаче предупреждения:', error);
                     await interaction.editReply({ content: "Не удалось выдать предупреждение участнику" });
                 }
                 break;
             }
             case "unwarn": {
                if (!(interaction.memberPermissions.has('KickMembers') || interaction.memberPermissions.has('Administrator'))) {
                  await interaction.reply({ content: "У вас недостаточно прав для выполнения действия", flags: MessageFlags.Ephemeral });
                  return;
                }
                await interaction.deferReply();

                let targetUser = interaction.options.getUser('пользователь'),
                caseNum, warnCase;
                const reason = interaction.options.getString('причина') || 'Без причины';
                const evidence = interaction.options.getAttachment('доказательства');
                if (!targetUser) {
                    caseNum = interaction.options.getNumber('кейс');
                    warnCase = db.getModCase(interaction.guild.id, caseNum);
                    targetUser = warnCase.targetId;
                } else {
                    const cases = db.getTargetModCases(interaction.guild.id, targetUser.id);
                    warnCase = db.getModCase(interaction.guild.id, cases.filter(i => i.action === "warn")[0].caseNum);
                    targetUser = targetUser.id
                }
            
                if (!warnCase) return await interaction.editReply({ content: "Не удалось найти кейс. Проверьте, что вы указали действительный номер кейса." });
                if (warnCase.action !== "warn") return await interaction.editReply({ content: `Этот кейс не относится к предупреждениям! Это \`${warnCase.action}\`` });
                
                const warns = db.getUserWarnings(interaction.guild.id, targetUser);
                console.log(warns)
                if (warns.true_warns <= 0) return await interaction.editReply({ content: "У этого пользователя нет действующих наказаний!" });


                if (targetUser === interaction.user.id) {
                    await interaction.editReply({ content: "Ты не можешь снять предупреждение самому себе!" });
                    return;
                }
                if (targetUser === interaction.guild.ownerId) {
                    await interaction.editReply({ content: "Ты не можешь снять предупреждение с владельца сервера" });
                    return;
                }

                const member = await interaction.guild.members.fetch(targetUser).catch(() => null);
                if (!member) {
                    await interaction.editReply({ content: "Участник не найден" });
                    return;
                }

                if (!interaction.memberPermissions.has('Administrator') && interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
                   await interaction.editReply({ content: "Позиция вашей роли ниже чем роль выбранного участника" });
                   return;
                }

                if (!member.moderatable) {
                    await interaction.editReply({ content: "Я не могу снять предупреждение с этого участника" });
                    return;
                }

                try {
                    await db.addModCase({
                        serverId: interaction.guild.id,
                        targetId: targetUser,
                        moderatorId: interaction.user.id,
                        action: 'unwarn',
                        reason: reason,
                        timestamp: new Date()
                    });

                    const latestCase = db.getServerModCases(interaction.guild.id)

                    const embed = new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle(`Case \`#${latestCase[0].caseNum}\``)
                        .setThumbnail(interaction.guild.iconURL() || '')
                        .addFields(
                            { name: 'Модератор', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Пользователь', value: `<@${targetUser}>`, inline: true },
                            { name: 'Причина', value: reason, inline: false },
                            { name: 'Время', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setFooter({ text: "Предупреждение снято", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();

                    if (evidence) {
                        embed.addFields({ name: 'Доказательства', value: `[Нажмите для просмотра](${evidence.url})` });
                        embed.setImage(evidence.url);
                    }

                    await interaction.editReply({ embeds: [embed] });

                } catch (error) {
                    console.error('Ошибка при снятии предупреждения:', error);
                    await interaction.editReply({ content: "Не удалось снять предупреждение" });
                }
                break;
            }
            default:
                await interaction.reply({content: 'Кажется, такой саб-команды не существует', flags: MessageFlags.Ephemeral})
                break;
        }
    }
}

async function sendPunishmentToUserChannel(userId) {
    
}