const {
  SlashCommandBuilder,
  ComponentType,
  MessageFlags
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const HelpViews = require('../../views/HelpViews');
const localeManager = require('../../locales/localeManager');

async function safeReply(interaction, content, isEphemeral = true) {
  const flags = isEphemeral ? MessageFlags.Ephemeral : 0;
  try {
      if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content, flags });
      } else {
          await interaction.reply({ content, flags });
      }
  } catch (e) {
      console.error(`[SafeReply Error] Failed to reply/followUp. Content: "${content}". Error:`, e);
  }
}

function getCommandsByCategory(client) {
  if (client.helpCategoriesMap) return client.helpCategoriesMap;
  const categories = new Map();
  const commandsPath = path.join(__dirname, '../../commands');
  if (!fs.existsSync(commandsPath)) {
      console.error(`[ERROR] Commands directory not found: ${commandsPath}`);
      return categories;
  }
  const commandFolders = fs.readdirSync(commandsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  const rootCommandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  if (rootCommandFiles.length > 0) {
      commandFolders.unshift('.');
  }
  if (commandFolders.length === 0 && rootCommandFiles.length > 0) {
      commandFolders.push('.');
  }
  for (const folder of commandFolders) {
      const currentFolderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(currentFolderPath).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
          const filePath = path.join(currentFolderPath, file);
          if (file === 'help.js' && folder === 'utility') continue;
          const commandName = path.basename(file, '.js');
          let command = client.commands.get(commandName) || Array.from(client.commands.values()).find(c => c.data.name === commandName);
          if (!command) {
              try {
                  command = require(filePath);
              } catch (e) {
                  console.error(`Error loading command from ${filePath}:`, e);
                  continue;
              }
          }
          if ('data' in command && 'execute' in command) {
              const categoryName = folder === '.' ? 'General' : folder.charAt(0).toUpperCase() + folder.slice(1);
              command.category = folder === '.' ? 'general' : folder;
              if (!categories.has(categoryName)) {
                  categories.set(categoryName, []);
              }
              if (!categories.get(categoryName).some(c => c.data.name === command.data.name)) {
                  categories.get(categoryName).push(command);
              }
          }
      }
  }
  client.helpCategoriesMap = categories;
  return categories;
}

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
      .setName('help')
      .setDescription(localeManager.get('utility.help.description'))
      .setDescriptionLocalizations(localeManager.getLocalizations('utility.help.description')),
  async execute(interaction) {
      const lang = interaction.guildLocale || 'ru';
      const categoriesMap = getCommandsByCategory(interaction.client);
      const allCommands = Array.from(interaction.client.commands.values());
      if (allCommands.length === 0) {
          return await safeReply(interaction, localeManager.get('utility.help.messages.not_found', lang));
      }
      const pageSize = 5;
      let currentCategory = localeManager.get('utility.help.messages.all_commands', lang);
      let pageIndex = 0;

      const buildHelpPayload = (category, page) => {
          return HelpViews.renderHelp(category, page, allCommands, categoriesMap, pageSize, lang, interaction);
      };

      await interaction.deferReply({ flags: 0 });
      const message = await interaction.editReply(buildHelpPayload(currentCategory, pageIndex));
      const collector = message.createMessageComponentCollector({
          componentType: ComponentType.Any,
          time: 5 * 60 * 1000
      });
      collector.on('collect', async i => {
          if (i.user.id !== interaction.user.id) {
              return await i.reply({ content: localeManager.get('utility.help.messages.only_author', lang), flags: MessageFlags.Ephemeral });
          }
          if (i.isButton()) {
              if (i.customId === 'help_prev') {
                  if (pageIndex > 0) pageIndex--;
              } else if (i.customId === 'help_next') {
                  const commandsTotal = (currentCategory === localeManager.get('utility.help.messages.all_commands', lang) ? allCommands.length : (categoriesMap.get(currentCategory)?.length || 0));
                  const totalCategoryPages = Math.ceil(commandsTotal / pageSize);
                  if (pageIndex < totalCategoryPages - 1) pageIndex++;
              }
              await i.update(buildHelpPayload(currentCategory, pageIndex));
          } else if (i.isStringSelectMenu()) {
              if (i.customId === 'help_category_select') {
                  currentCategory = i.values[0];
                  pageIndex = 0;
                  await i.update(buildHelpPayload(currentCategory, pageIndex));
              }
          }
      });
      collector.on('end', async () => {
          const finalPayload = buildHelpPayload(currentCategory, pageIndex);
          finalPayload.components.forEach(row => row.components.forEach(comp => comp.setDisabled(true)));
          const commandsTotal = (currentCategory === localeManager.get('utility.help.messages.all_commands', lang) ? allCommands.length : (categoriesMap.get(currentCategory)?.length || 0));
          const totalCategoryPages = Math.ceil(commandsTotal / pageSize);
          finalPayload.embeds[0].setFooter({
              text: localeManager.get('utility.help.messages.page_info', lang, {
                  current: pageIndex + 1,
                  total: totalCategoryPages === 0 ? 1 : totalCategoryPages
              }) + ` ${localeManager.get('utility.help.messages.timeout', lang)}`,
              iconURL: interaction.user.displayAvatarURL({ dynamic: true })
          });
          try {
              await message.edit(finalPayload);
          } catch (e) {
              console.error('Error disabling help components:', e);
          }
      });
  }
};