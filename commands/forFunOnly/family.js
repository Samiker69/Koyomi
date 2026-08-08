const {
    SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ComponentType
} = require('discord.js');
const db = require('../../database/repositories');
const localeManager = require('../../locales/localeManager');
const { generateFamilyTree } = require('../../core/utils/familyTreeCanvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('family')
        .setDescription(localeManager.get('forFunOnly.family.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.description'))
        .addSubcommand(sub => sub
            .setName('propose')
            .setDescription(localeManager.get('forFunOnly.family.options.propose.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.propose.description'))
            .addUserOption(opt => opt.setName('user').setDescription(localeManager.get('forFunOnly.family.options.propose.options.user.description')).setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.propose.options.user.description')).setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('divorce')
            .setDescription(localeManager.get('forFunOnly.family.options.divorce.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.divorce.description'))
        )
        .addSubcommand(sub => sub
            .setName('adopt')
            .setDescription(localeManager.get('forFunOnly.family.options.adopt.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.adopt.description'))
            .addUserOption(opt => opt.setName('user').setDescription(localeManager.get('forFunOnly.family.options.adopt.options.user.description')).setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.adopt.options.user.description')).setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('abandon')
            .setDescription(localeManager.get('forFunOnly.family.options.abandon.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.abandon.description'))
            .addUserOption(opt => opt.setName('user').setDescription(localeManager.get('forFunOnly.family.options.abandon.options.user.description')).setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.abandon.options.user.description')).setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('leave')
            .setDescription(localeManager.get('forFunOnly.family.options.leave.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.leave.description'))
        )
        .addSubcommand(sub => sub
            .setName('tree')
            .setDescription(localeManager.get('forFunOnly.family.options.tree.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.tree.description'))
            .addUserOption(opt => opt.setName('user').setDescription(localeManager.get('forFunOnly.family.options.tree.options.user.description')).setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.family.options.tree.options.user.description')).setRequired(false))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const lang = interaction.guildLocale || 'ru';

        // Хелпер для быстрого форматирования локализованных сообщений с заменами
        const getMsg = (key, ...replacements) => {
            let val = localeManager.get(`forFunOnly.family.messages.${key}`, lang);
            replacements.forEach(([search, replace]) => val = val.replace(search, replace));
            return val;
        };

        // ==========================================
        // SUBCOMMAND: PROPOSE
        // ==========================================
        if (subcommand === 'propose') {
            const target = interaction.options.getUser('user');

            if (target.id === interaction.user.id) return interaction.reply({ content: getMsg('propose_self'), ephemeral: true });
            if (target.bot) return interaction.reply({ content: getMsg('propose_bot'), ephemeral: true });
            if (await db.getMarriage(guildId, interaction.user.id)) return interaction.reply({ content: getMsg('already_married'), ephemeral: true });
            if (await db.getMarriage(guildId, target.id)) return interaction.reply({ content: getMsg('target_already_married'), ephemeral: true });

            const authorFamily = await db.getFamily(guildId, interaction.user.id);
            if (authorFamily.parentIds.includes(target.id) || authorFamily.childrenIds.includes(target.id) || authorFamily.siblingIds.includes(target.id)) {
                return interaction.reply({ content: getMsg('propose_family'), ephemeral: true });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('accept').setLabel(lang === 'ru' ? 'Да, я согласен(на) 💍' : 'Yes, I do 💍').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('decline').setLabel(lang === 'ru' ? 'Отказать 💔' : 'Decline 💔').setStyle(ButtonStyle.Danger)
            );

            const msg = await interaction.reply({
                content: getMsg('propose_sent', ['{author}', `<@${interaction.user.id}>`], ['{target}', `<@${target.id}>`]),
                components: [row]
            });

            const col = msg.createMessageComponentCollector({ filter: i => i.user.id === target.id, time: 60000, componentType: ComponentType.Button });

            col.on('collect', async i => {
                if (i.customId === 'accept') {
                    if (await db.getMarriage(guildId, interaction.user.id) || await db.getMarriage(guildId, target.id)) {
                        return i.reply({ content: getMsg('already_married'), ephemeral: true });
                    }
                    await db.marry(guildId, interaction.user.id, target.id);
                    await i.update({ content: getMsg('propose_accepted', ['{author}', `<@${interaction.user.id}>`], ['{target}', `<@${target.id}>`]), components: [] });
                } else {
                    await i.update({ content: getMsg('propose_declined', ['{author}', `<@${interaction.user.id}>`], ['{target}', `<@${target.id}>`]), components: [] });
                }
                col.stop();
            });

            col.on('end', (_, r) => r === 'time' && interaction.deleteReply().catch(() => { }));
        }

        // ==========================================
        // SUBCOMMAND: DIVORCE
        // ==========================================
        else if (subcommand === 'divorce') {
            if (!(await db.getMarriage(guildId, interaction.user.id))) return interaction.reply({ content: getMsg('not_married'), ephemeral: true });

            const sharedChildren = await db.getChildren(guildId, interaction.user.id);
            const confirmText = sharedChildren.length > 0
                ? getMsg('divorce_confirm_children', ['{count}', sharedChildren.length])
                : getMsg('divorce_confirm');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('confirm').setLabel(lang === 'ru' ? 'Да, развестись 💔' : 'Yes, divorce 💔').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('cancel').setLabel(lang === 'ru' ? 'Отмена 🥰' : 'Cancel 🥰').setStyle(ButtonStyle.Secondary)
            );

            const msg = await interaction.reply({ content: confirmText, components: [row], ephemeral: true });
            const col = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 30000, componentType: ComponentType.Button });

            col.on('collect', async i => {
                if (i.customId === 'confirm') {
                    const success = await db.divorce(guildId, interaction.user.id);
                    await i.update({ content: getMsg(success ? 'divorce_success' : 'not_married'), components: [] });
                } else {
                    await i.update({ content: getMsg('divorce_cancelled'), components: [] });
                }
                col.stop();
            });
        }

        // ==========================================
        // SUBCOMMAND: ADOPT
        // ==========================================
        else if (subcommand === 'adopt') {
            const target = interaction.options.getUser('user');

            if (target.id === interaction.user.id) return interaction.reply({ content: getMsg('adopt_self'), ephemeral: true });
            if (target.bot) return interaction.reply({ content: getMsg('adopt_bot'), ephemeral: true });
            if (await db.getMarriage(guildId, target.id)) return interaction.reply({ content: getMsg('adopt_married'), ephemeral: true });
            if ((await db.getChildren(guildId, target.id)).length > 0) return interaction.reply({ content: getMsg('adopt_has_children'), ephemeral: true });

            const authorFamily = await db.getFamily(guildId, interaction.user.id);
            if (!authorFamily.spouseId) return interaction.reply({ content: getMsg('adopt_no_spouse'), ephemeral: true });
            if (authorFamily.spouseId === target.id) return interaction.reply({ content: getMsg('adopt_spouse'), ephemeral: true });
            if (authorFamily.parentIds.includes(target.id) || authorFamily.childrenIds.includes(target.id) || authorFamily.siblingIds.includes(target.id)) return interaction.reply({ content: getMsg('already_parent'), ephemeral: true });
            if ((await db.getParents(guildId, target.id)).length > 0) return interaction.reply({ content: getMsg('has_parents'), ephemeral: true });
            if (authorFamily.childrenIds.length >= 10) return interaction.reply({ content: getMsg('too_many_children'), ephemeral: true });
            if (await db.isAncestor(guildId, interaction.user.id, target.id)) return interaction.reply({ content: getMsg('adopt_is_ancestor'), ephemeral: true });
            if (await db.isDescendant(guildId, interaction.user.id, target.id)) return interaction.reply({ content: getMsg('adopt_is_descendant'), ephemeral: true });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('accept').setLabel(lang === 'ru' ? 'Войти в семью 🥰' : 'Join family 🥰').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('decline').setLabel(lang === 'ru' ? 'Отклонить ❌' : 'Decline ❌').setStyle(ButtonStyle.Danger)
            );

            const msg = await interaction.reply({
                content: getMsg('adopt_sent', ['{author}', `<@${interaction.user.id}>`], ['{target}', `<@${target.id}>`]),
                components: [row]
            });

            const col = msg.createMessageComponentCollector({ filter: i => i.user.id === target.id, time: 60000, componentType: ComponentType.Button });

            col.on('collect', async i => {
                if (i.customId === 'accept') {
                    if ((await db.getParents(guildId, target.id)).length > 0) {
                        return i.reply({ content: getMsg('has_parents'), ephemeral: true });
                    }
                    await db.adoptChild(guildId, interaction.user.id, target.id);
                    if (authorFamily.spouseId) {
                        await db.adoptChild(guildId, authorFamily.spouseId, target.id);
                    }
                    await i.update({ content: getMsg('adopt_accepted', ['{author}', `<@${interaction.user.id}>`], ['{target}', `<@${target.id}>`]), components: [] });
                } else {
                    await i.update({ content: getMsg('adopt_declined', ['{author}', `<@${interaction.user.id}>`], ['{target}', `<@${target.id}>`]), components: [] });
                }
                col.stop();
            });

            col.on('end', (_, r) => r === 'time' && interaction.deleteReply().catch(() => { }));
        }

        // ==========================================
        // SUBCOMMAND: ABANDON
        // ==========================================
        else if (subcommand === 'abandon') {
            const target = interaction.options.getUser('user');
            if (target.id === interaction.user.id) return interaction.reply({ content: getMsg('abandon_self'), ephemeral: true });
            if (target.bot) return interaction.reply({ content: getMsg('abandon_bot'), ephemeral: true });

            const children = await db.getChildren(guildId, interaction.user.id);
            if (!children.some(c => c.childId === target.id)) return interaction.reply({ content: getMsg('abandon_not_child'), ephemeral: true });

            await db.abandonChild(guildId, interaction.user.id, target.id);
            const marriage = await db.getMarriage(guildId, interaction.user.id);
            if (marriage) await db.abandonChild(guildId, marriage.spouseId, target.id);

            return interaction.reply({ content: getMsg('abandon_success', ['{target}', `<@${target.id}>`]) });
        }

        // ==========================================
        // SUBCOMMAND: LEAVE
        // ==========================================
        else if (subcommand === 'leave') {
            const parents = await db.getParents(guildId, interaction.user.id);
            if (parents.length === 0) return interaction.reply({ content: getMsg('leave_no_parents'), ephemeral: true });
            if (await db.getMarriage(guildId, interaction.user.id)) return interaction.reply({ content: getMsg('leave_married'), ephemeral: true });

            await db.leaveParents(guildId, interaction.user.id);
            return interaction.reply({ content: getMsg('leave_success') });
        }

        // ==========================================
        // SUBCOMMAND: TREE
        // ==========================================
        else if (subcommand === 'tree') {
            await interaction.deferReply();
            const target = interaction.options.getUser('user') || interaction.user;
            const family = await db.getFamily(guildId, target.id);

            if (!family.spouseId && family.parentIds.length === 0 && family.childrenIds.length === 0 && family.siblingIds.length === 0) {
                return interaction.editReply({ content: getMsg('lonely_tree') });
            }

            try {
                const buffer = await generateFamilyTree(interaction.client, guildId, target.id, family, lang);
                const attachment = new AttachmentBuilder(buffer, { name: 'family_tree.png' });
                return interaction.editReply({ files: [attachment] });
            } catch (err) {
                console.error('[FamilyTreeCommand] Error generating family tree:', err);
                return interaction.editReply({ content: lang === 'ru' ? 'Произошла ошибка при отрисовке семейного древа.' : 'An error occurred while rendering the family tree.' });
            }
        }
    }
};
