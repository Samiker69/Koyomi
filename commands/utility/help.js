const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
  } = require('discord.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('Показать список команд с пагинацией и учётом подкоманд'),
  
    async execute(interaction) {
      const cmds = Array.from(interaction.client.commands.values());
      if (cmds.length === 0) {
        return await interaction.reply({ content: 'Команды не найдены.' });
      }
  
      const pageSize = 4;
      const pages = [];
      for (let i = 0; i < cmds.length; i += pageSize) {
        const slice = cmds.slice(i, i + pageSize);
        const embed = new EmbedBuilder()
          .setTitle('Список команд')
          .setColor(0x9B59B6)
          .setTimestamp();
  
        for (const cmd of slice) {
          const meta = cmd.data.toJSON();
          let details = '';
          for (const opt of meta.options ?? []) {
            if (opt.type === 1) {
              details += `\n  • ${opt.name} — ${opt.description || 'описание отсутствует'}`;
            } else if (opt.type === 2) {
              details += `\n  ◦ ${opt.name} (группа)`;
              for (const sub of opt.options ?? []) {
                if (sub.type === 1) {
                  details += `\n     - ${sub.name} — ${sub.description || 'описание отсутствует'}`;
                }
              }
            }
          }
          embed.addFields({
            name: `/${meta.name}`,
            value: meta.description + (details ? `\n${details}` : ''),
            inline: false
          });
        }
        pages.push(embed);
      }
  
      let pageIndex = 0;
      const totalPages = pages.length;
  
      const buildPayload = idx => {
        const embed = pages[idx].setFooter({ text: `Страница ${idx + 1} из ${totalPages}` });
        const prev = new ButtonBuilder()
          .setCustomId('help_prev')
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(idx === 0);
        const next = new ButtonBuilder()
          .setCustomId('help_next')
          .setLabel('➡️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(idx === totalPages - 1);
        const row = new ActionRowBuilder().addComponents(prev, next);
        return { embeds: [embed], components: [row] };
      };

      await interaction.reply(buildPayload(pageIndex));
      const message = await interaction.fetchReply();
  
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: Math.min(totalPages * 60_000, 15 * 60_000) // до 15 мин
      });
  
      collector.on('collect', async btn => {
        if (btn.customId === 'help_prev' && pageIndex > 0) pageIndex--;
        if (btn.customId === 'help_next' && pageIndex < totalPages - 1) pageIndex++;
        try {
          await btn.update(buildPayload(pageIndex));
        } catch {
        }
      });
  
      collector.on('end', async () => {
        const embed = pages[pageIndex].setFooter({
          text: `Страница ${pageIndex + 1} из ${totalPages} (время вышло)`
        });
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('help_prev_disabled')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('help_next_disabled')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );
        try {
          await message.edit({ embeds: [embed], components: [row] });
        } catch {
        }
      });
    }
  };
  