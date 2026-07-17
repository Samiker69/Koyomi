const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const localeManager = require('../locales/localeManager');

class RoleMenuViews {
    static buildMenu(title, description, type, roles, lang = 'ru') {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('Blurple')
            .setFooter({ text: localeManager.get('utility.rolemenu.messages.footer', lang) });

        const rows = [];
        if (roles && roles.length > 0) {
            if (type === 'buttons') {
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
        }

        return { embeds: [embed], components: rows };
    }
}

module.exports = RoleMenuViews;