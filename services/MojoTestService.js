const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const EmbedService = require('./EmbedService');
const localeManager = require('../locales/localeManager');

class MojoTestService {
    // Хранит ID пользователей, которые сейчас проходят тест
    static activeTests = new Set();

    /**
     * Возвращает случайные n элементов из массива
     */
    static getRandomItems(arr, n) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    /**
     * Основная логика тестирования
     */
    static async startTest(interaction, targetMember, moderator) {
        const guild = interaction.guild;
        const targetUser = targetMember.user;
        const lang = interaction.guildLocale || 'ru';

        // Если тест уже идёт для этого юзера
        if (this.activeTests.has(targetUser.id)) {
            return await interaction.editReply({ content: localeManager.get('services.mojotest.already_running', lang) });
        }

        // Добавляем юзера в "черный список" для отправки сообщений
        this.activeTests.add(targetUser.id);

        // Функция восстановления прав
        const cleanupTest = async (kick = false, reason = localeManager.get('services.mojotest.audit_log.failed', lang)) => {
            this.activeTests.delete(targetUser.id);

            if (kick) {
                try {
                    await targetMember.kick(reason);
                } catch (e) {
                    console.error('[MojoTest] Ошибка при кике:', e);
                }
            }
        };

        // Загружаем и локализуем вопросы
        const rawQuestions = localeManager._getValueByPath('services.mojotest.questions') || [];
        const localizedBank = rawQuestions.map(q => ({
            q: q.q[lang] || q.q['ru'],
            a: q.a.map(a => a[lang] || a['ru']),
            c: q.c
        }));

        // Подготавливаем 3 вопроса
        const questionsForTest = this.getRandomItems(localizedBank, 3);
        let currentQuestionIdx = 0;

        const getQuestionData = () => {
            const rawQ = questionsForTest[currentQuestionIdx];

            // Формируем ответы и перемешиваем
            const answersObj = rawQ.a.map((text, i) => ({ text, correct: i === rawQ.c }));
            const shuffledAnswers = this.getRandomItems(answersObj, answersObj.length);

            const embed = EmbedService.createBaseEmbed(interaction)
                .setTitle(localeManager.get('services.mojotest.question_title', lang, { current: currentQuestionIdx + 1 }))
                .setDescription(`**${rawQ.q}**\n\n` + shuffledAnswers.map((ans, i) => `**${['A', 'B', 'C', 'D'][i]}**. ${ans.text}`).join('\n'))
                .setFooter({ text: localeManager.get('services.mojotest.footer_note', lang), iconURL: targetUser.displayAvatarURL() });

            const row = new ActionRowBuilder();
            shuffledAnswers.forEach((ans, i) => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`mojotest_${i}_${ans.correct}`)
                        .setLabel(['A', 'B', 'C', 'D'][i])
                        .setStyle(ButtonStyle.Primary)
                );
            });

            return { 
                content: localeManager.get('services.mojotest.test_started', lang, { user: targetUser.id }), 
                embeds: [embed], 
                components: [row] 
            };
        };

        let initialMsg;
        try {
            initialMsg = await interaction.editReply(getQuestionData());
        } catch (error) {
            console.error('[MojoTest] Failed to send initial test message:', error);
            this.activeTests.delete(targetUser.id);
            return;
        }

        const collector = initialMsg.createMessageComponentCollector({
            filter: i => i.user.id === targetUser.id,
            time: 30000
        });

        collector.on('collect', async i => {
            const isCorrect = i.customId.split('_')[2] === 'true';

            if (!isCorrect) {
                // Провал
                collector.stop('failed');
                await cleanupTest(true, localeManager.get('services.mojotest.failed_content', lang, { user: targetUser.id }));

                const failEmbed = EmbedService.createBaseEmbed()
                    .setTitle(localeManager.get('services.mojotest.test_failed', lang))
                    .setColor(0xff0000)
                    .setDescription(localeManager.get('services.mojotest.failed_description', lang, { user: targetUser.id }));

                await i.update({ 
                    content: localeManager.get('services.mojotest.failed_content', lang, { user: targetUser.id }), 
                    embeds: [failEmbed], 
                    components: [] 
                });
                return;
            }

            currentQuestionIdx++;

            if (currentQuestionIdx >= questionsForTest.length) {
                // Успех
                collector.stop('success');
                await cleanupTest(false);

                const successEmbed = EmbedService.createBaseEmbed()
                    .setTitle(localeManager.get('services.mojotest.test_passed', lang))
                    .setColor(0x00ff00)
                    .setDescription(localeManager.get('services.mojotest.passed_description', lang, { user: targetUser.id }));

                await i.update({ 
                    content: localeManager.get('services.mojotest.passed_content', lang), 
                    embeds: [successEmbed], 
                    components: [] 
                });
            } else {
                // Следующий вопрос
                collector.resetTimer({ time: 30000 });
                const nextData = getQuestionData();
                nextData.content = localeManager.get('services.mojotest.next_question', lang, { user: targetUser.id });
                await i.update(nextData);
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                // Провал по времени
                await cleanupTest(true, localeManager.get('services.mojotest.timeout_content', lang));

                const timeoutEmbed = EmbedService.createBaseEmbed()
                    .setTitle(localeManager.get('services.mojotest.timeout_title', lang))
                    .setColor(0xff0000)
                    .setDescription(localeManager.get('services.mojotest.timeout_description', lang, { user: targetUser.id }));

                if (initialMsg) {
                    await initialMsg.edit({ 
                        content: localeManager.get('services.mojotest.timeout_content', lang), 
                        embeds: [timeoutEmbed], 
                        components: [] 
                    }).catch(() => { });
                }
            }
        });
    }
}

module.exports = MojoTestService;
