const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    MessageFlags
} = require('discord.js');
const DatabaseService = require('../../services/DatabaseService');
const EmbedService = require('../../services/EmbedService');
const { privateAccess } = require('../../config.json');

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
      )
      .addSubcommand(sub =>
        sub
          .setName('import')
          .setDescription(localeManager.get('moderation.tag.options.import.description', 'en-US'))
          .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.import.description'))
          .addAttachmentOption(o =>
            o.setName('file')
             .setDescription(localeManager.get('moderation.tag.options.import.options.file.description', 'en-US'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.import.options.file.description'))
             .setRequired(true)
          )
          .addBooleanOption(o =>
            o.setName('overwrite')
             .setDescription(localeManager.get('moderation.tag.options.import.options.overwrite.description', 'en-US'))
             .setDescriptionLocalizations(localeManager.getLocalizations('moderation.tag.options.import.options.overwrite.description'))
             .setRequired(false)
          )
      ),
  
    async execute(interaction) {
      const sub = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;
      const lang = interaction.guildLocale || 'ru';
  
      if (sub === 'import') {
        const isDeveloper = privateAccess.includes(interaction.user.id) || 
                            interaction.user.id === interaction.client.application?.owner?.id ||
                            interaction.client.application?.owner?.members?.has(interaction.user.id);
        if (!isDeveloper) {
          return await interaction.reply({
            content: localeManager.get('moderation.tag.messages.no_perms', lang),
            flags: MessageFlags.Ephemeral
          });
        }
      } else if (['add', 'remove', 'edit'].includes(sub)) {
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
          
            let description = rows
              .map(r => {
                const preview = r.content.length > 50
                  ? r.content.slice(0, 47) + '...'
                  : r.content;
                return `\`${r.name}\` — ${preview}`;
              })
              .join('\n');
          
            if (description.length > 4000) {
              description = rows.map(r => `\`${r.name}\``).join(', ');
              if (description.length > 4000) {
                description = description.slice(0, 3950) + '...';
              }
            }

            const embed = EmbedService.createBaseEmbed(interaction)
              .setTitle(localeManager.get('moderation.tag.messages.list_title', lang))
              .setDescription(description);
          
            return interaction.reply({ embeds: [embed] });
          }          

          case 'import': {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const file = interaction.options.getAttachment('file');
            const overwrite = interaction.options.getBoolean('overwrite') || false;

            let parsedJson;
            try {
              const res = await fetch(file.url);
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              parsedJson = await res.json();
            } catch (err) {
              console.error('[ERROR] Failed to import tags:', err);
              return await interaction.editReply({
                content: localeManager.get('moderation.tag.messages.import_error', lang, { error: err.message })
              });
            }

            const importedTags = [];
            const items = Array.isArray(parsedJson) ? parsedJson : Object.entries(parsedJson || {}).map(([k, v]) => 
              typeof v === 'string' ? { name: k, content: v } : { name: k, ...v }
            );

            for (const item of items) {
              if (!item || typeof item !== 'object') continue;
              const name = (item.name || item.tag || item.key || item.title || item.id || '').toString().trim();
              const content = (item.content || item.value || item.response || item.text || item.val || item.msg || '').toString();
              if (name && content) {
                importedTags.push({ name, content });
              }
            }

            if (importedTags.length === 0) {
              return await interaction.editReply({
                content: localeManager.get('moderation.tag.messages.import_no_tags', lang)
              });
            }

            const existingTags = await DatabaseService.getTagsByServer(guildId);
            const existingNames = new Set(existingTags.map(t => t.name.toLowerCase()));

            let importedCount = 0;
            let skippedCount = 0;
            let overwrittenCount = 0;

            for (const tag of importedTags) {
              const name = tag.name.toLowerCase();
              if (existingNames.has(name)) {
                if (overwrite) {
                  await DatabaseService.addTag(guildId, name, tag.content);
                  overwrittenCount++;
                } else {
                  skippedCount++;
                }
              } else {
                await DatabaseService.addTag(guildId, name, tag.content);
                importedCount++;
              }
            }

            return await interaction.editReply({
              content: localeManager.get('moderation.tag.messages.import_success', lang, {
                imported: importedCount,
                skipped: skippedCount,
                overwritten: overwrittenCount,
                total: importedTags.length
              })
            });
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
  