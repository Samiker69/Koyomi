const { SlashCommandBuilder, MessageFlags } = require('discord.js');
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
    .setDescription('Различные действия с пользователями в аниме стиле.')
    .addSubcommand(sub =>
      sub.setName('hug')
        .setDescription('Обнять пользователя.')
        .addUserOption(opt =>
          opt.setName('user').setDescription('Кого обнять?').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('slap')
        .setDescription('Ударить пользователя пощёчиной.')
        .addUserOption(opt =>
          opt.setName('user').setDescription('Кого ударить?').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('pat')
        .setDescription('Погладить пользователя.')
        .addUserOption(opt =>
          opt.setName('user').setDescription('Кого погладить?').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('kiss')
        .setDescription('Поцеловать пользователя.')
        .addUserOption(opt =>
          opt.setName('user').setDescription('Kого поцеловать?').setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user');
    const author = interaction.user;

    if (target.id === author.id) {
      return interaction.reply({
        content: 'Ты не можешь сделать это с самим собой!',
        flags: MessageFlags.Ephemeral
      });
    }

    let searchQuery = '';
    let text = '';

    switch (sub) {
      case 'hug':
        searchQuery = 'anime+hug';
        text = `${author} обнимает ${target}! 🫂`;
        break;
      case 'slap':
        searchQuery = 'anime+slap';
        text = `${author} даёт пощёчину ${target}! 👋`;
        break;
      case 'pat':
        searchQuery = 'anime+pat';
        text = `${author} гладит ${target}! 🐾`;
        break;
      case 'kiss':
        searchQuery = 'anime+kiss';
        text = `${author} целует ${target}! 💋`;
        break;
    }

    const gifUrl = await getActionGif(searchQuery);
    if (!gifUrl) {
      return interaction.reply({
        content: 'Не удалось найти подходящую гифку, попробуй позже!',
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