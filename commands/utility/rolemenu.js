const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../database/repositories');
const RoleMenuViews = require('../../views/RoleMenuViews');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription(localeManager.get('utility.rolemenu.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.description'))
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription(localeManager.get('utility.rolemenu.options.create.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.description'))
        .addStringOption(opt =>
          opt.setName('title')
            .setDescription(localeManager.get('utility.rolemenu.options.create.options.title.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.options.title.description'))
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('description')
            .setDescription(localeManager.get('utility.rolemenu.options.create.options.description.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.options.description.description'))
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription(localeManager.get('utility.rolemenu.options.create.options.type.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.create.options.type.description'))
            .addChoices(
              { name: localeManager.get('utility.rolemenu.options.create.options.type.choices.buttons', 'en-US'), value: 'buttons'},
              { name: localeManager.get('utility.rolemenu.options.create.options.type.choices.select', 'en-US'), value: 'select'}
            )
            .setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('addrole')
        .setDescription(localeManager.get('utility.rolemenu.options.addrole.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.addrole.description'))
        .addStringOption(opt =>
          opt.setName('message_id')
            .setDescription(localeManager.get('utility.rolemenu.options.addrole.options.message_id.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.addrole.options.message_id.description'))
            .setRequired(true))
        .addRoleOption(opt =>
          opt.setName('role')
            .setDescription(localeManager.get('utility.rolemenu.options.addrole.options.role.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.addrole.options.role.description'))
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('label')
            .setDescription(localeManager.get('utility.rolemenu.options.addrole.options.label.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.addrole.options.label.description'))
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('emoji')
            .setDescription(localeManager.get('utility.rolemenu.options.addrole.options.emoji.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('utility.rolemenu.options.addrole.options.emoji.description'))
            .setRequired(false))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const lang = interaction.guildLocale || 'ru';
    const sub = interaction.options.getSubcommand();
    if (sub === 'create') {
      const title = interaction.options.getString('title');
      const desc = interaction.options.getString('description');
      const type = interaction.options.getString('type');
      const payload = RoleMenuViews.buildMenu(title, desc, type, [], lang);
      await interaction.reply({
        content: localeManager.get('utility.rolemenu.messages.setup_start', lang),
        flags: MessageFlags.Ephemeral
      });
      const menuMsg = await interaction.channel.send(payload);
      await DatabaseService.addRoleMenu(menuMsg.id, interaction.guild.id, interaction.channel.id, type, []);
      await interaction.editReply({
        content: localeManager.get('utility.rolemenu.messages.setup_done', lang, { id: menuMsg.id })
      });
    } else if (sub === 'addrole') {
      const messageId = interaction.options.getString('message_id');
      const role = interaction.options.getRole('role');
      const label = interaction.options.getString('label');
      const emoji = interaction.options.getString('emoji');
      const menuData = await DatabaseService.getRoleMenu(messageId);
      if (!menuData || menuData.guildId !== interaction.guild.id) {
        return await interaction.reply({
          content: localeManager.get('utility.rolemenu.messages.msg_not_found', lang, { id: messageId }),
          flags: MessageFlags.Ephemeral
        });
      }
      try {
        const channel = await interaction.guild.channels.fetch(menuData.channelId);
        const message = await channel.messages.fetch(messageId);
        if (!message.editable) {
          return await interaction.reply({
            content: localeManager.get('utility.rolemenu.messages.not_role_menu', lang),
            flags: MessageFlags.Ephemeral
          });
        }
        const roles = menuData.roles;
        roles.push({ id: role.id, label, emoji });
        await DatabaseService.addRoleMenu(messageId, interaction.guild.id, channel.id, menuData.type, roles);
        const payload = RoleMenuViews.buildMenu(message.embeds[0]?.title || '', message.embeds[0]?.description || '', menuData.type, roles, lang);
        await message.edit(payload);
        await interaction.reply({
          content: localeManager.get('utility.rolemenu.messages.role_added_to_menu', lang, { role: role.name }),
          flags: MessageFlags.Ephemeral
        });
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: localeManager.get('events.errors.unexpected', lang),
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};