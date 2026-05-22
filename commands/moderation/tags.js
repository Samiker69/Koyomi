const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    MessageFlags
} = require('discord.js');
const DatabaseService = require('../../services/DatabaseService');
const EmbedService = require('../../services/EmbedService');

const localeManager = require('../../locales/localeManager');

// DatabaseService используется напрямую
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('tag')
      .setDescription(localeManager.get('moderation.tag.description', 'en-US'))
      .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.description'))
      .addSubcommand(sub =>
        sub
          .setName('add')
          .setDescription(localeManager.get('moderation.tag.options.add.description', 'en-US'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.add.description'))
          .addStringOption(o =>
            o.setName('name')
             .setDescription(localeManager.get('moderation.tag.options.add.options.name.description', 'en-US'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.add.options.name.description'))
             .setRequired(true)
          )
          .addStringOption(o =>
            o.setName('content')
             .setDescription(localeManager.get('moderation.tag.options.add.options.content.description', 'en-US'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.add.options.content.description'))
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('remove')
          .setDescription(localeManager.get('moderation.tag.options.remove.description', 'en-US'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.remove.description'))
          .addStringOption(o =>
            o.setName('name')
             .setDescription(localeManager.get('moderation.tag.options.remove.options.name.description', 'en-US'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.remove.options.name.description'))
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('edit')
          .setDescription(localeManager.get('moderation.tag.options.edit.description', 'en-US'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.edit.description'))
          .addStringOption(o =>
            o.setName('name')
             .setDescription(localeManager.get('moderation.tag.options.edit.options.name.description', 'en-US'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.edit.options.name.description'))
             .setRequired(true)
          )
          .addStringOption(o =>
            o.setName('content')
             .setDescription(localeManager.get('moderation.tag.options.edit.options.content.description', 'en-US'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.edit.options.content.description'))
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('get')
          .setDescription(localeManager.get('moderation.tag.options.get.description', 'en-US'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.get.description'))
          .addStringOption(o =>
            o.setName('name')
             .setDescription(localeManager.get('moderation.tag.options.get.options.name.description', 'en-US'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.get.options.name.description'))
             .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('list')
          .setDescription(localeManager.get('moderation.tag.options.list.description', 'en-US'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.list.description'))
      ),
  
    async execute(interaction) {
      const sub = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;
      const lang = interaction.guildLocale || 'ru';
  
      if (['add', 'remove', 'edit'].includes(sub)) {
        const hasPerms = interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages) ||
                         interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers) ||
                         interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ||
                         interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
        if (!hasPerms) {
          return await interaction.reply({
            content: localeManager.get('moderation.tag.messages.no_perms', lang),
            flags: MessageFlags.Ephemeral
          });
        }
      }
  
      try {
        switch (sub) {
          case 'add': {
            const name = interaction.options.getString('name').toLowerCase();
            const content = interaction.options.getString('content');
  
            const exists = await DatabaseService.addTag(guildId, name, content)
  
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
            const result = await DatabaseService.removeTag(guildId, name)
  
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
            const result = await DatabaseService.editTag(guildId, name, { content: newContent} )
  
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
            const row = await DatabaseService.getTag(guildId, name)
  
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
            const rows = await DatabaseService.getTagsByServer(guildId);

          
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
  