const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const DatabaseService = require('../../services/DatabaseService');

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

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(desc)
        .setColor('Blurple')
        .setFooter({ text: localeManager.get('utility.rolemenu.messages.footer', lang) });

      await interaction.reply({
        content: localeManager.get('utility.rolemenu.messages.setup_start', lang),
        flags: MessageFlags.Ephemeral
      });

      const menuMsg = await interaction.channel.send({ embeds: [embed] });
      
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

        const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
        const rows = [];

        if (menuData.type === 'buttons') {
          for (let i = 0; i < roles.length; i += 5) {
            const row = new ActionRowBuilder();
            const chunk = roles.slice(i, i + 5);
            chunk.forEach(r => {
              const btn = new ButtonBuilder()
                .setCustomId(`role_button_${r.id}`)
                .setLabel(r.label)
                .setStyle(ButtonStyle.Primary);
              if (r.emoji) btn.setEmoji(r.emoji);
              row.addComponents(btn);
            });
            rows.push(row);
          }
        } else {
          const select = new StringSelectMenuBuilder()
            .setCustomId('role_select_menu')
            .setPlaceholder(localeManager.get('utility.rolemenu.messages.footer', lang))
            .setMinValues(0)
            .setMaxValues(roles.length);

          roles.forEach(r => {
            select.addOptions({
              label: r.label,
              value: r.id,
              emoji: r.emoji || undefined
            });
          });
          rows.push(new ActionRowBuilder().addComponents(select));
        }

        await message.edit({ components: rows });

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