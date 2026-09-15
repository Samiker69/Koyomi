const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const EmbedService = require('../../services/EmbedService');

const data = new SlashCommandBuilder()
    .setName('message')
    .setDescription(localeManager.get('moderation.message.description', 'en-US'))
    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.description'))

    .addSubcommand(subcommand =>
        subcommand.setName('clear')
            .setDescription(localeManager.get('moderation.message.options.clear.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.options.clear.description'))
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription(localeManager.get('moderation.message.options.clear.options.amount.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.options.clear.options.amount.description'))
                    .setRequired(true)))

    .addSubcommand(subcommand =>
        subcommand.setName('pin')
            .setDescription(localeManager.get('moderation.message.options.pin.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.options.pin.description'))
            .addStringOption(option =>
                option.setName('id')
                    .setDescription(localeManager.get('moderation.message.options.pin.options.id.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.options.pin.options.id.description'))
                    .setRequired(true)))

    .addSubcommand(subcommand =>
        subcommand.setName('unpin')
            .setDescription(localeManager.get('moderation.message.options.unpin.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.options.unpin.description'))
            .addStringOption(option =>
                option.setName('id')
                    .setDescription(localeManager.get('moderation.message.options.unpin.options.id.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.options.unpin.options.id.description'))
                    .setRequired(true)))

    .addSubcommand(subcommand =>
        subcommand.setName('purge')
            .setDescription(localeManager.get('moderation.message.options.purge.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.options.purge.description'))
            .addUserOption(option =>
                option.setName('target')
                    .setDescription(localeManager.get('moderation.message.options.purge.options.target.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.options.purge.options.target.description'))
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription(localeManager.get('moderation.message.options.purge.options.amount.description', 'en-US'))
                    .setDescriptionLocalizations(localeManager.getLocalizations('moderation.message.options.purge.options.amount.description'))
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(100)
            )
    ).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

module.exports = {
    cooldown: 3,
    data,
    async execute(interaction) {
        const lang = interaction.guildLocale;
        if (!(interaction.memberPermissions.has('ManageMessages') || interaction.memberPermissions.has('Administrator'))) {
            await interaction.reply({
                content: localeManager.get('moderation.moderation.messages.no_perms', lang),
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "clear": {
                const amount = interaction.options.getInteger('amount');

                if (amount < 1 || amount > 100) {
                    return await interaction.reply({
                        content: localeManager.get('moderation.message.messages.invalid_amount', lang),
                        flags: MessageFlags.Ephemeral
                    });
                }

                const channel = interaction.channel;

                try {
                    const messages = await channel.messages.fetch({ limit: amount });
                    const userMessages = messages.filter(msg => !msg.author.bot);

                    if (userMessages.size === 0) {
                        return await interaction.reply({
                            content: localeManager.get('moderation.message.messages.no_messages', lang),
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    await channel.bulkDelete(userMessages, true);

                    const reply = await interaction.reply({
                        content: localeManager.get('moderation.message.messages.deleted_messages', lang, { count: userMessages.size }),
                        flags: MessageFlags.Ephemeral
                    });

                    setTimeout(async () => {
                        await reply.delete().catch(() => { });
                    }, 5000);
                } catch (error) {
                    console.error(`[ERROR] Clear command: ${error}`);
                    await interaction.reply({
                        content: localeManager.get('moderation.message.messages.clear_error', lang),
                        flags: MessageFlags.Ephemeral
                    });
                }
                break;
            }

            case "pin": {
                const messageId = interaction.options.getString('id');
                if (isNaN(Number(messageId))) return await interaction.reply({
                    content: localeManager.get('moderation.message.messages.id_not_number', lang),
                    flags: MessageFlags.Ephemeral
                });

                try {
                    await interaction.channel.messages.pin(messageId);
                    await interaction.reply(localeManager.get('moderation.message.messages.pinned', lang));
                } catch (error) {
                    await interaction.reply({
                        content: localeManager.get('moderation.message.messages.message_not_found', lang),
                        flags: MessageFlags.Ephemeral
                    });
                }
                break;
            }

            case "unpin": {
                const messageId = interaction.options.getString('id');
                if (isNaN(Number(messageId))) return await interaction.reply({
                    content: localeManager.get('moderation.message.messages.id_not_number', lang),
                    flags: MessageFlags.Ephemeral
                });

                try {
                    await interaction.channel.messages.unpin(messageId);
                    await interaction.reply(localeManager.get('moderation.message.messages.unpinned', lang));
                } catch (error) {
                    await interaction.reply({
                        content: localeManager.get('moderation.message.messages.message_not_found', lang),
                        flags: MessageFlags.Ephemeral
                    });
                }
                break;
            }

            case "purge": {
                const target = interaction.options.getUser('target', true);
                const amount = interaction.options.getInteger('amount', true);
                const channel = interaction.channel;

                try {
                    const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                    const targetMessages = fetchedMessages.filter(msg => msg.author.id === target.id);
                    const messagesToDelete = targetMessages.first(amount);

                    if (!messagesToDelete || messagesToDelete.length === 0) {
                        await interaction.reply({
                            content: localeManager.get('moderation.message.messages.purge_not_found', lang, { user: target.toString() }),
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    await channel.bulkDelete(messagesToDelete, true);

                    const embed = EmbedService.createBaseEmbed(interaction)
                        .setTitle(localeManager.get('moderation.message.messages.purge_title', lang))
                        .addFields(
                            { name: localeManager.get('moderation.message.messages.purge_mod', lang), value: `<@${interaction.user.id}>`, inline: true },
                            { name: localeManager.get('moderation.message.messages.purge_user', lang), value: `<@${target.id}>`, inline: true },
                            { name: localeManager.get('moderation.message.messages.purge_channel', lang), value: `<#${channel.id}>`, inline: true },
                            { name: localeManager.get('moderation.message.messages.purge_amount', lang), value: `${messagesToDelete.length}`, inline: true }
                        )
                        .setFooter({
                            text: localeManager.get('moderation.message.messages.purge_footer', lang),
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                        });

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                } catch (error) {
                    console.error('Ошибка при очистке сообщений:', error);
                    await interaction.reply({
                        content: localeManager.get('moderation.message.messages.purge_error', lang),
                        flags: MessageFlags.Ephemeral
                    });
                }
                break;
            }

            default:
                await interaction.reply({
                    content: localeManager.get('moderation.moderation.messages.unknown_sub', lang),
                    flags: MessageFlags.Ephemeral
                });
                break;
        }
    }
}
