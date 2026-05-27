const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const DatabaseService = require('../../services/DatabaseService');
const EmbedService = require('../../services/EmbedService');
const localeManager = require('../../locales/localeManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('parser')
    .setDescription(localeManager.get('parser.commands.description', 'en-US'))
    .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.description'))
    .addSubcommandGroup(group =>
      group
        .setName('banned')
        .setDescription(localeManager.get('parser.commands.options.banned.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.banned.description'))
        .addSubcommand(sub =>
          sub
            .setName('add')
            .setDescription(localeManager.get('parser.commands.options.add.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.add.description'))
            .addStringOption(o =>
              o.setName('mod_id')
               .setDescription(localeManager.get('parser.commands.options.mod_id.description', 'en-US'))
               .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.mod_id.description'))
               .setRequired(true)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('remove')
            .setDescription(localeManager.get('parser.commands.options.remove.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.remove.description'))
            .addStringOption(o =>
              o.setName('mod_id')
               .setDescription(localeManager.get('parser.commands.options.mod_id.description', 'en-US'))
               .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.mod_id.description'))
               .setRequired(true)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('role')
            .setDescription(localeManager.get('parser.commands.options.role.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.role.description'))
            .addRoleOption(o =>
              o.setName('role')
               .setDescription(localeManager.get('parser.commands.options.role_val.description', 'en-US'))
               .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.role_val.description'))
               .setRequired(false)
            )
        )
    )
    .addSubcommandGroup(group =>
      group
        .setName('unsupported')
        .setDescription(localeManager.get('parser.commands.options.unsupported.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.unsupported.description'))
        .addSubcommand(sub =>
          sub
            .setName('add')
            .setDescription(localeManager.get('parser.commands.options.add.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.add.description'))
            .addStringOption(o =>
              o.setName('mod_id')
               .setDescription(localeManager.get('parser.commands.options.mod_id.description', 'en-US'))
               .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.mod_id.description'))
               .setRequired(true)
            )
            .addStringOption(o =>
              o.setName('reason')
               .setDescription(localeManager.get('parser.commands.options.reason.description', 'en-US'))
               .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.reason.description'))
               .setRequired(true)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('remove')
            .setDescription(localeManager.get('parser.commands.options.remove.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.remove.description'))
            .addStringOption(o =>
              o.setName('mod_id')
               .setDescription(localeManager.get('parser.commands.options.mod_id.description', 'en-US'))
               .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.mod_id.description'))
               .setRequired(true)
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('list')
        .setDescription(localeManager.get('parser.commands.options.list.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('parser.commands.options.list.description'))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();
    
    const guildSettings = await DatabaseService.getSettings(interaction.guildId);
    const lang = (guildSettings && guildSettings.language) || interaction.guildLocale || 'ru';

    try {
      if (sub === 'list') {
        const banned = await DatabaseService.getBannedMods();
        const unsupported = await DatabaseService.getUnsupportedMods();

        const embed = EmbedService.createBaseEmbed(interaction)
          .setTitle(localeManager.get('parser.commands.options.list.description', lang));

        const noneText = localeManager.get('parser.commands.messages.none', lang);
        let bannedText = banned.length > 0 ? banned.map(m => `\`${m}\``).join(', ') : noneText;
        embed.addFields({
          name: localeManager.get('parser.commands.messages.list_banned', lang),
          value: bannedText.substring(0, 1024)
        });

        let unsupportedText = Object.keys(unsupported).length > 0 
          ? Object.entries(unsupported).map(([m, r]) => `**${m}**: ${r}`).join('\n')
          : noneText;
        embed.addFields({
          name: localeManager.get('parser.commands.messages.list_unsupported', lang),
          value: unsupportedText.substring(0, 1024)
        });

        return await interaction.reply({ embeds: [embed] });
      }

      if (group === 'banned') {
        if (sub === 'role') {
          const role = interaction.options.getRole('role');
          const roleId = role ? role.id : '';
          await DatabaseService.updateSetting(interaction.guildId, 'parserBannedRoleId', roleId);
          
          return await interaction.reply({
            content: roleId 
              ? localeManager.get('parser.commands.messages.role_set', lang, { role: role.name })
              : localeManager.get('parser.commands.messages.role_removed', lang),
            flags: MessageFlags.Ephemeral
          });
        }

        const modId = interaction.options.getString('mod_id').toLowerCase();
        
        if (sub === 'add') {
          const res = await DatabaseService.addBannedMod(modId);
          return await interaction.reply({
            content: res ? localeManager.get('parser.commands.messages.added', lang) : localeManager.get('parser.commands.messages.not_found', lang),
            flags: MessageFlags.Ephemeral
          });
        }
        
        if (sub === 'remove') {
          const res = await DatabaseService.removeBannedMod(modId);
          return await interaction.reply({
            content: res ? localeManager.get('parser.commands.messages.removed', lang) : localeManager.get('parser.commands.messages.not_found', lang),
            flags: MessageFlags.Ephemeral
          });
        }
      }

      if (group === 'unsupported') {
        const modId = interaction.options.getString('mod_id').toLowerCase();
        
        if (sub === 'add') {
          const reason = interaction.options.getString('reason');
          const res = await DatabaseService.addUnsupportedMod(modId, reason);
          return await interaction.reply({
            content: res ? localeManager.get('parser.commands.messages.added', lang) : localeManager.get('parser.commands.messages.not_found', lang),
            flags: MessageFlags.Ephemeral
          });
        }
        
        if (sub === 'remove') {
          const res = await DatabaseService.removeUnsupportedMod(modId);
          return await interaction.reply({
            content: res ? localeManager.get('parser.commands.messages.removed', lang) : localeManager.get('parser.commands.messages.not_found', lang),
            flags: MessageFlags.Ephemeral
          });
        }
      }

      return await interaction.reply({
        content: localeManager.get('parser.commands.messages.unknown_sub', lang),
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      console.error('[ERROR] /parser:', err);
      return interaction.reply({
        content: localeManager.get('parser.commands.messages.error', lang),
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
