const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const EmbedService = require('../../services/EmbedService');
const axios = require('axios');
const localeManager = require('../../locales/localeManager');

const categories = {
  boobs: ['Boobies', 'BustyPetite', 'Stacked'],
  ass: ['asstastic', 'BestBooties', 'pawgt'],
  gif: ['NSFW_GIF', 'porninfocus', '60fpsporn', 'nsfw_gifs'],
  realgirls: ['RealGirls', 'Amateur', 'collegebabes'],
  gonewild: ['gonewild', 'LegalTeens', 'gonewild30plus'],
  milf: ['milf', 'amateur_milfs', 'hot_wifes'],
  '4k': ['NSFW_GIF', 'HighResNSFW', 'NSFW_Pics'],
  thighs: ['Thighs', 'thick', 'urbandickgirls'],
  feet: ['feet', 'FootFetish'],
  femboy: ['FemBoys'],
  random: ['nsfw', 'gonewild', 'RealGirls', 'Amateur', 'LegalTeens', 'nsfw_gifs', 'milf', 'asstastic', 'Boobies']
};

async function getRedditImage(category = 'random', fetchRetries = 3) {
  if (fetchRetries < 0) return null;

  const subs = categories[category] || categories.random;
  const sub = subs[Math.floor(Math.random() * subs.length)];
  const url = `https://www.reddit.com/r/${sub}/hot/.json?limit=50`;

  let posts;
  try {
    const res = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
    });
    posts = res.data?.data?.children;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
        return await getRedditImage(category, fetchRetries - 1);
    }

  } catch (e) {
    if (e.response) {
        console.error(`Axios Error (${e.response.status}): Request failed for ${url}. Message: ${e.message}`, e.response.data);
    } else if (e.request) {
        console.error(`Axios Error: No response received for ${url}. Message: ${e.message}`);
    } else {
        console.error(`Axios Error: Could not send request for ${url}. Message: ${e.message}`);
    }
    return await getRedditImage(category, fetchRetries - 1);
  }

  const maxPostRetries = posts.length * 2;
  const triedIndices = new Set();

  while (triedIndices.size < posts.length && triedIndices.size < maxPostRetries) {
      let randomIndex = Math.floor(Math.random() * posts.length);
      let attemptCount = 0;
      while(triedIndices.has(randomIndex) && attemptCount < posts.length * 2) {
           randomIndex = Math.floor(Math.random() * posts.length);
           attemptCount++;
      }
       if (triedIndices.has(randomIndex) && triedIndices.size === posts.length) {
           break;
       }


      const post = posts[randomIndex]?.data;

      triedIndices.add(randomIndex);


      if (!(post && post.over_18 && !post.is_gallery)) {
           continue;
      }

      let imageUrl = null;
      const postUrl = post.url;
      const previewUrl = post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&');
      const redditVideoUrl = post.secure_media?.reddit_video?.fallback_url;


      const isLikelyImageOrVideo = post.post_hint && ['image', 'hosted:video', 'link', 'video'].includes(post.post_hint);
      const urlEndsWithFileExtension = postUrl && /\.(jpg|jpeg|png|gif|mp4|webm|gifv|mov)$/.test(postUrl.toLowerCase());

      if (isLikelyImageOrVideo || urlEndsWithFileExtension) {
          if (urlEndsWithFileExtension) {
              imageUrl = postUrl;
          } else if (post.post_hint === 'hosted:video' && redditVideoUrl) {
              imageUrl = redditVideoUrl;
          } else if (post.domain === 'i.imgur.com' && postUrl) {
              imageUrl = postUrl;
          } else if (post.domain === 'v.redd.it' && redditVideoUrl) {
              imageUrl = redditVideoUrl;
          }
          else if (previewUrl && /\.(jpg|jpeg|png|gif|mp4|webm)$/.test(previewUrl.toLowerCase())) {
               imageUrl = previewUrl;
          }
           else if (post.domain === 'imgur.com' && postUrl && !postUrl.toLowerCase().endsWith('.gifv')) {
           }
           else if ((post.domain === 'redgifs.com' || post.domain === 'gfycat.com') && (postUrl || previewUrl)) {
               if (postUrl && /\.(mp4|webm|gifv)$/.test(postUrl.toLowerCase())) imageUrl = postUrl;
               else if (previewUrl && /\.(mp4|webm)$/.test(previewUrl.toLowerCase())) imageUrl = previewUrl;
           }
      }


      if (imageUrl && !/\.(jpg|jpeg|png|gif|mp4|webm|gifv|mov)$/.test(imageUrl.toLowerCase())) {
           imageUrl = null;
      }


      if (imageUrl) {
           return {
               title: post.title,
               url: imageUrl,
               subreddit: post.subreddit
           };
      }
  }

  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reddit')
    .setDescription(localeManager.get('nsfw.reddit.description'))
    .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.reddit.description'))
    .setNSFW(true)
    .addStringOption(option =>
      option.setName('category')
        .setDescription(localeManager.get('nsfw.reddit.options.category.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('nsfw.reddit.options.category.description'))
        .setRequired(false)
        .addChoices(...Object.keys(categories).map(cat => ({
          name: cat,
          value: cat
        })))
    ),

  async execute(interaction) {
      const lang = interaction.guildLocale || 'ru';
      if (!interaction.channel.nsfw) {
          return await interaction.reply({ content: localeManager.get('nsfw.reddit.messages.not_nsfw', lang), flags: MessageFlags.Ephemeral });
      }

      await interaction.deferReply();

      const category = interaction.options.getString('category') || 'random';
      const content = await getRedditImage(category);

      if (!content) {
          return interaction.editReply({ content: localeManager.get('nsfw.reddit.messages.load_error', lang), flags: MessageFlags.Ephemeral });
      }

      const embed = EmbedService.createBaseEmbed(interaction)
        .setTitle(content.title || localeManager.get('nsfw.common.messages.untitled', lang))
        .setImage(content.url)
        .setFooter({ text: `r/${content.subreddit}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

      await interaction.editReply({ embeds: [embed] });
  }
};