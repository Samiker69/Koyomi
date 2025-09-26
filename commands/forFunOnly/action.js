const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const LocaleManager = require('../../locales/localesManager');

const TENOR_API_KEY = process.env.TENOR_API_KEY || 'LIVDSRZULELA';
const localeManager = new LocaleManager();

async function getActionGif(query) {
  const url = `https://g.tenor.com/v1/search?q=${query}&key=${TENOR_API_KEY}&limit=50`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * data.results.length);
    return data.results[randomIndex].media[0].gif.url;
  } catch (err) {
    console.error('GIF fetch error:', err);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName(localeManager.getString('commands.action.name'))
    .setDescription(localeManager.getString('commands.action.description'))
    .addSubcommand(sub =>
      sub.setName(localeManager.getString('commands.action.options.hug.name'))
        .setDescription(localeManager.getString('commands.action.options.hug.description'))
        .addUserOption(opt =>
          opt.setName(localeManager.getString('commands.action.options.hug.options.user.name')).setDescription(localeManager.getString('commands.action.options.hug.user.description')).setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName(localeManager.getString('commands.action.options.slap.name'))
        .setDescription(localeManager.getString('commands.action.options.slap.description'))
        .addUserOption(opt =>
          opt.setName(localeManager.getString('commands.action.options.slap.user.name')).setDescription(localeManager.getString('commands.action.options.slap.user.description')).setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName(localeManager.getString('commands.action.slapslap.name'))
        .setDescription(localeManager.getString('commands.action.options.pat.description'))
        .addUserOption(opt =>
          opt.setName(localeManager.getString('commands.action.options.pat.user.name')).setDescription(localeManager.getString('commands.action.options.pat.user.description')).setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName(localeManager.getString('commands.action.options.kiss.name'))
        .setDescription(localeManager.getString('commands.action.options.kiss.description'))
        .addUserOption(opt =>
          opt.setName(localeManager.getString('commands.action.options.kiss.user.name')).setDescription(localeManager.getString('commands.action.options.kiss.user.description')).setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user');
    const author = interaction.user;

    if (target.id === author.id) {
      return interaction.reply({
        content: localeManager.getString('commands.action.self_action_error'),
        flags: MessageFlags.Ephemeral
      });
    }

    let searchQuery = '';
    let text = '';

    switch (sub) {
      case 'hug':
        searchQuery = 'anime+hug';
        text = localeManager.getString('commands.action.options.hug.message', { author: author.toString(), target: target.toString() });
        break;
      case 'slap':
        searchQuery = 'anime+slap';
        text = localeManager.getString('commands.action.options.slap.message', { author: author.toString(), target: target.toString() });
        break;
      case 'pat':
        searchQuery = 'anime+pat';
        text = localeManager.getString('commands.action.options.pat.message', { author: author.toString(), target: target.toString() });
        break;
      case 'kiss':
        searchQuery = 'anime+kiss';
        text = localeManager.getString('commands.action.options.kiss.message', { author: author.toString(), target: target.toString() });
        break;
    }

    const gifUrl = await getActionGif(searchQuery);
    if (!gifUrl) {
      return interaction.reply({
        content: localeManager.getString('commands.action.gif_not_found_error'),
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.reply({
      content: text,
      embeds: [{
        color: 0x9B59B6,
        image: { url: gifUrl }
      }]
    });
  }
};
