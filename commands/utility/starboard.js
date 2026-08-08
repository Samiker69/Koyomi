const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags, ActionRowBuilder, ChannelSelectMenuBuilder, ComponentType } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../database/repositories');
const SettingsViews = require('../../views/SettingsViews');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription(localeManager.get('utility.starboard.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('utility.starboard.description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const guildCfg = await DatabaseService.getSettings(guildId) || {};
    let lang = guildCfg.language || interaction.guildLocale || 'ru';
    const generateDashboard = async () => {
      const starboardCfg = await DatabaseService.getStarboardSettings(guildId) || {};
      return SettingsViews.renderStarboard(starboardCfg, lang, interaction);
    };
    const msg = await interaction.reply({
      ...await generateDashboard(),
      flags: MessageFlags.Ephemeral
    });
    const collector = msg.createMessageComponentCollector({ time: 300_000 });
    collector.on('collect', async i => {
      try {
        if (i.customId === 'menu_starboard') {
          const selection = i.values[0];
          if (selection === 'act_starboard_min') {
            const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
            const modalId = `modal_starboard_min_${i.id}`;
            const modal = new ModalBuilder()
              .setCustomId(modalId)
              .setTitle(localeManager.get('utility.starboard.messages.modal_starboard_min_title', lang));
            const sbSettings = await DatabaseService.getStarboardSettings(guildId);
            const currentMin = (sbSettings.minReactions || 5).toString();
            const minInput = new TextInputBuilder()
              .setCustomId('input_starboard_min')
              .setLabel(localeManager.get('utility.starboard.messages.modal_starboard_min_input', lang))
              .setStyle(TextInputStyle.Short)
              .setMinLength(1)
              .setMaxLength(2)
              .setRequired(true)
              .setValue(currentMin);
            const row = new ActionRowBuilder().addComponents(minInput);
            modal.addComponents(row);
            await i.showModal(modal);
            try {
              const modalInteraction = await i.awaitModalSubmit({
                filter: (subI) => subI.customId === modalId && subI.user.id === i.user.id,
                time: 60000
              });
              const newMinStr = modalInteraction.fields.getTextInputValue('input_starboard_min');
              const newMin = parseInt(newMinStr, 10);
              if (isNaN(newMin) || newMin < 1 || newMin > 50) {
                return await modalInteraction.reply({ content: localeManager.get('utility.starboard.messages.modal_starboard_min_invalid', lang), flags: MessageFlags.Ephemeral });
              }
              await DatabaseService.updateStarboardSetting(guildId, 'minReactions', newMin);
              await modalInteraction.update(await generateDashboard());
            } catch (err) {
            }
            return;
          }
          if (selection === 'act_starboard_channel') {
            const promptText = localeManager.get('utility.starboard.messages.placeholder_starboard', lang);
            const tempSelect = new ActionRowBuilder().addComponents(
              new ChannelSelectMenuBuilder()
                .setCustomId('temp_select')
                .setPlaceholder(promptText)
                .setChannelTypes(ChannelType.GuildText)
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
              await DatabaseService.updateStarboardSetting(guildId, 'starboardChannelId', selectedId);
              await selectionInteraction.update({ content: localeManager.get('utility.starboard.messages.saved', lang), components: [] });
              await interaction.editReply(await generateDashboard());
            } catch (err) {
              await i.editReply({ content: localeManager.get('utility.starboard.messages.select_timeout', lang), components: [] });
            }
            return;
          }
        }
        if (i.customId === 'toggle_starboard') {
          const sbSettings = await DatabaseService.getStarboardSettings(guildId);
          await DatabaseService.updateStarboardSetting(guildId, 'enabled', !sbSettings.enabled);
        }
        await i.update(await generateDashboard());
      } catch (err) {
        console.error(err);
        if (!i.replied && !i.deferred) {
          await i.reply({ content: localeManager.get('utility.starboard.messages.error_saving', lang), flags: MessageFlags.Ephemeral });
        }
      }
    });
    collector.on('end', () => {
      interaction.editReply({ components: [] }).catch(() => {});
    });
  }
};