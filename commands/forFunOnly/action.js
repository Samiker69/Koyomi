const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const TENOR_API_KEY = process.env.TENOR_API_KEY || 'LIVDSRZULELA';

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
    .setName(localeManager.get('forFunOnly.action.name'))
    .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.name', 'name'))
    .setDescription(localeManager.get('forFunOnly.action.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.description'))
    .addSubcommand(sub =>
      sub.setName(localeManager.get('forFunOnly.action.options.hug.name'))
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.hug.name', 'name'))
        .setDescription(localeManager.get('forFunOnly.action.options.hug.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.hug.description'))
        .addUserOption(opt =>
          opt.setName(localeManager.get('forFunOnly.action.options.hug.options.user.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.hug.options.user.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.action.options.hug.options.user.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.hug.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName(localeManager.get('forFunOnly.action.options.slap.name'))
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.slap.name', 'name'))
        .setDescription(localeManager.get('forFunOnly.action.options.slap.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.slap.description'))
        .addUserOption(opt =>
          opt.setName(localeManager.get('forFunOnly.action.options.slap.options.user.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.slap.options.user.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.action.options.slap.options.user.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.slap.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName(localeManager.get('forFunOnly.action.options.pat.name'))
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.pat.name', 'name'))
        .setDescription(localeManager.get('forFunOnly.action.options.pat.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.pat.description'))
        .addUserOption(opt =>
          opt.setName(localeManager.get('forFunOnly.action.options.pat.options.user.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.pat.options.user.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.action.options.pat.options.user.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.pat.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName(localeManager.get('forFunOnly.action.options.kiss.name'))
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.kiss.name', 'name'))
        .setDescription(localeManager.get('forFunOnly.action.options.kiss.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.kiss.description'))
        .addUserOption(opt =>
          opt.setName(localeManager.get('forFunOnly.action.options.kiss.options.user.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.kiss.options.user.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.action.options.kiss.options.user.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.kiss.options.user.description'))
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const lang = interaction.guildLocale || 'ru';
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser(localeManager.get('forFunOnly.action.options.hug.options.user.name')); // All users are named same in options
    const author = interaction.user;

    if (target.id === author.id) {
      return interaction.reply({
        content: localeManager.get('forFunOnly.action.messages.self_action_error', lang),
        flags: MessageFlags.Ephemeral
      });
    }

    let searchQuery = '';
    let text = '';

    switch (sub) {
      case 'hug':
      case localeManager.get('forFunOnly.action.options.hug.name'):
        searchQuery = 'anime+hug';
        text = localeManager.get('forFunOnly.action.messages.hug_msg', lang, { author: author.toString(), target: target.toString() });
        break;
      case 'slap':
      case localeManager.get('forFunOnly.action.options.slap.name'):
        searchQuery = 'anime+slap';
        text = localeManager.get('forFunOnly.action.messages.slap_msg', lang, { author: author.toString(), target: target.toString() });
        break;
      case 'pat':
      case localeManager.get('forFunOnly.action.options.pat.name'):
        searchQuery = 'anime+pat';
        text = localeManager.get('forFunOnly.action.messages.pat_msg', lang, { author: author.toString(), target: target.toString() });
        break;
      case 'kiss':
      case localeManager.get('forFunOnly.action.options.kiss.name'):
        searchQuery = 'anime+kiss';
        text = localeManager.get('forFunOnly.action.messages.kiss_msg', lang, { author: author.toString(), target: target.toString() });
        break;
    }

    const gifUrl = await getActionGif(searchQuery);
    if (!gifUrl) {
      return interaction.reply({
        content: localeManager.get('forFunOnly.action.messages.gif_error', lang),
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.reply({
      content: text,
      embeds: [{
        color: 0x9B59B6,
        image: { url: gifUrl }
      }],
      allowedMentions: {
        parse: []
      }
    });
  }
};