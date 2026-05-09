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
    .setName('action')
    .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.name'))
    .setDescription(localeManager.get('forFunOnly.action.description', 'en-US'))
    .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.description'))
    .addSubcommand(sub =>
      sub.setName('hug')
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.hug.name'))
        .setDescription(localeManager.get('forFunOnly.action.options.hug.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.hug.description'))
        .addUserOption(opt =>
          opt.setName('user')
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.hug.options.user.name'))
            .setDescription(localeManager.get('forFunOnly.action.options.hug.options.user.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.hug.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('slap')
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.slap.name'))
        .setDescription(localeManager.get('forFunOnly.action.options.slap.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.slap.description'))
        .addUserOption(opt =>
          opt.setName('user')
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.slap.options.user.name'))
            .setDescription(localeManager.get('forFunOnly.action.options.slap.options.user.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.slap.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('pat')
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.pat.name'))
        .setDescription(localeManager.get('forFunOnly.action.options.pat.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.pat.description'))
        .addUserOption(opt =>
          opt.setName('user')
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.pat.options.user.name'))
            .setDescription(localeManager.get('forFunOnly.action.options.pat.options.user.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.pat.options.user.description'))
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('kiss')
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.kiss.name'))
        .setDescription(localeManager.get('forFunOnly.action.options.kiss.description', 'en-US'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.kiss.description'))
        .addUserOption(opt =>
          opt.setName('user')
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.action.options.kiss.options.user.name'))
            .setDescription(localeManager.get('forFunOnly.action.options.kiss.options.user.description', 'en-US'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.action.options.kiss.options.user.description'))
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const lang = interaction.guildLocale || 'ru';
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user');
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
        searchQuery = 'anime+hug';
        text = localeManager.get('forFunOnly.action.messages.hug_msg', lang, { author: author.toString(), target: target.toString() });
        break;
      case 'slap':
        searchQuery = 'anime+slap';
        text = localeManager.get('forFunOnly.action.messages.slap_msg', lang, { author: author.toString(), target: target.toString() });
        break;
      case 'pat':
        searchQuery = 'anime+pat';
        text = localeManager.get('forFunOnly.action.messages.pat_msg', lang, { author: author.toString(), target: target.toString() });
        break;
      case 'kiss':
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