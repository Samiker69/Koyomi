const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    MessageFlags
} = require('discord.js');
const TagsDB = require('../../functions/db/tags');
const EmbedService = require('../../services/EmbedService');

const localeManager = require('../../locales/localeManager');

const tags = new TagsDB()
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName(localeManager.get('moderation.tag.name'))
      .setNameLocalizations(localeManager.getLocalizations('moderation.tag.name', 'name'))
      .setDescription(localeManager.get('moderation.tag.description'))
      .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.description'))
      .addSubcommand(sub =>
        sub
          .setName(localeManager.get('moderation.tag.options.add.name'))
          .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.add.name', 'name'))
          .setDescription(localeManager.get('moderation.tag.options.add.description'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.add.description'))
          .addStringOption(o =>
            o.setName(localeManager.get('moderation.tag.options.add.options.name.name'))
             .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.add.options.name.name', 'name'))
             .setDescription(localeManager.get('moderation.tag.options.add.options.name.description'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.add.options.name.description'))
             .setRequired(true)
          )
          .addStringOption(o =>
            o.setName(localeManager.get('moderation.tag.options.add.options.content.name'))
             .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.add.options.content.name', 'name'))
             .setDescription(localeManager.get('moderation.tag.options.add.options.content.description'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.add.options.content.description'))
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName(localeManager.get('moderation.tag.options.remove.name'))
          .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.remove.name', 'name'))
          .setDescription(localeManager.get('moderation.tag.options.remove.description'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.remove.description'))
          .addStringOption(o =>
            o.setName(localeManager.get('moderation.tag.options.remove.options.name.name'))
             .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.remove.options.name.name', 'name'))
             .setDescription(localeManager.get('moderation.tag.options.remove.options.name.description'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.remove.options.name.description'))
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName(localeManager.get('moderation.tag.options.edit.name'))
          .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.edit.name', 'name'))
          .setDescription(localeManager.get('moderation.tag.options.edit.description'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.edit.description'))
          .addStringOption(o =>
            o.setName(localeManager.get('moderation.tag.options.edit.options.name.name'))
             .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.edit.options.name.name', 'name'))
             .setDescription(localeManager.get('moderation.tag.options.edit.options.name.description'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.edit.options.name.description'))
             .setRequired(true)
          )
          .addStringOption(o =>
            o.setName(localeManager.get('moderation.tag.options.edit.options.content.name'))
             .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.edit.options.content.name', 'name'))
             .setDescription(localeManager.get('moderation.tag.options.edit.options.content.description'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.edit.options.content.description'))
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName(localeManager.get('moderation.tag.options.get.name'))
          .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.get.name', 'name'))
          .setDescription(localeManager.get('moderation.tag.options.get.description'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.get.description'))
          .addStringOption(o =>
            o.setName(localeManager.get('moderation.tag.options.get.options.name.name'))
             .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.get.options.name.name', 'name'))
             .setDescription(localeManager.get('moderation.tag.options.get.options.name.description'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.get.options.name.description'))
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName(localeManager.get('moderation.tag.options.list.name'))
          .setNameLocalizations(localeManager.getLocalizations('moderation.tag.options.list.name', 'name'))
          .setDescription(localeManager.get('moderation.tag.options.list.description'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.list.description'))
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
    async execute(interaction) {
      const sub = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;
      const lang = interaction.guildLocale || 'ru';
  
      try {
        switch (sub) {
          case 'add': {
            const name = interaction.options.getString('name').toLowerCase();
            const content = interaction.options.getString('content');
  
            const exists = tags.add(guildId, name, content)
  
            if (!exists) {
              return await interaction.reply({
                content: localeManager.get('moderation.tag.messages.already_exists', lang, { name }),
                flags: MessageFlags.Ephemeral
              });
            }
  
            return await interaction.reply({
              content: localeManager.get('moderation.tag.messages.created', lang, { name }),
              flags: MessageFlags.Ephemeral
            });
          }
  
          case 'remove': {
            const name = interaction.options.getString('name').toLowerCase();
            const result = tags.remove(guildId, name)
  
            if (!result) {
              return await interaction.reply({
                content: localeManager.get('moderation.tag.messages.not_found_name', lang, { name }),
                flags: MessageFlags.Ephemeral
              });
            }
  
            return await interaction.reply({
              content: localeManager.get('moderation.tag.messages.removed', lang, { name }),
              flags: MessageFlags.Ephemeral
            });
          }
  
          case 'edit': {
            const name = interaction.options.getString('name').toLowerCase();
            const newContent = interaction.options.getString('content');
            const result = tags.edit(guildId, name, { content: newContent} )
  
            if (!result) {
              return await interaction.reply({
                content: localeManager.get('moderation.tag.messages.edit_error', lang, { name }),
                flags: MessageFlags.Ephemeral
              });
            }
  
            return await interaction.reply({
              content: localeManager.get('moderation.tag.messages.updated', lang, { name }),
              flags: MessageFlags.Ephemeral
            });
          }
  
          case 'get': {
            const name = interaction.options.getString('name').toLowerCase();
            const row = tags.get(guildId, name)
  
            if (!row) {
              return await interaction.reply({
                content: localeManager.get('moderation.tag.messages.not_found_name', lang, { name }),
                flags: MessageFlags.Ephemeral
              });
            }
  
            const embed = EmbedService.createBaseEmbed(interaction)
              .setTitle(localeManager.get('moderation.tag.messages.tag_label', lang, { name }))
              .setDescription(row.content);
  
            return await interaction.reply({ embeds: [embed] });
          }
  
          case 'list': {
            const rows = tags.db
              .prepare('SELECT name, content FROM tags WHERE serverId = ? ORDER BY name')
              .all(guildId);
          
            if (rows.length === 0) {
              return interaction.reply({
                content: localeManager.get('moderation.tag.messages.list_empty', lang),
                flags: MessageFlags.Ephemeral
              });
            }
          
            const description = rows
              .map(r => {
                const preview = r.content.length > 50
                  ? r.content.slice(0, 47) + '...'
                  : r.content;
                return `\`${r.name}\` — ${preview}`;
              })
              .join('\n');
          
            const embed = EmbedService.createBaseEmbed(interaction)
              .setTitle(localeManager.get('moderation.tag.messages.list_title', lang))
              .setDescription(description);
          
            return interaction.reply({ embeds: [embed] });
          }          
  
          default:
            return await interaction.reply({
              content: localeManager.get('moderation.tag.messages.unknown_sub', lang),
              flags: MessageFlags.Ephemeral
            });
        }
      } catch (err) {
        console.error('[ERROR] /tag:', err);
        return interaction.reply({
          content: localeManager.get('moderation.tag.messages.error', lang),
          flags: MessageFlags.Ephemeral
        });
      }
    }
  };
  