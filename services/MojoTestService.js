const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const EmbedService = require('./EmbedService');

// База вопросов о Mojo Launcher (15 вопросов)
const QUESTION_BANK = [
    { q: "Что такое Mojo Launcher?", a: ["Эмулятор Java Edition для Android", "Лаунчер для Bedrock Edition", "Чит-клиент для ПК", "Программа для создания серверов"], c: 0 },
    { q: "На базе какого проекта основан Mojo Launcher?", a: ["TLauncher", "PojavLauncher", "Lunar Client", "Badlion Client"], c: 1 },
    { q: "Какую версию Minecraft позволяет запускать Mojo Launcher?", a: ["Только старые альфа-версии", "Minecraft: Bedrock Edition", "Minecraft: Java Edition", "Minecraft: Dungeons"], c: 2 },
    { q: "Поддерживает ли Mojo Launcher установку модов?", a: ["Нет, только 'ванилла'", "Только аддоны из Marketplace", "Да, поддерживает Forge и Fabric", "Да, но только платно"], c: 2 },
    { q: "Для какой операционной системы доступно приложение?", a: ["iOS", "Windows", "Linux", "Android"], c: 3 },
    { q: "Можно ли играть на многопользовательских серверах через Mojo?", a: ["Да, на любых Java-серверах", "Нет, только одиночная игра", "Только по локальной сети", "Только на серверах Realms"], c: 0 },
    { q: "Поддерживает ли Mojo Launcher установку шейдеров?", a: ["Да, через OptiFine/Iris", "Нет, телефоны не потянут", "Только встроенные RTX шейдеры", "Да, но без теней"], c: 0 },
    { q: "От чего в первую очередь зависит FPS при игре через Mojo?", a: ["От скорости интернета", "От версии лаунчера", "От мощности телефона (процессор/ОЗУ)", "От заряда батареи"], c: 2 },
    { q: "Можно ли играть без купленного (лицензионного) аккаунта?", a: ["Нет, вообще нельзя", "Да, есть оффлайн-режим (пиратка)", "Да, но только 5 минут", "Только если купить подписку"], c: 1 },
    { q: "Поддерживает ли Mojo Launcher подключение клавиатуры и мыши к телефону?", a: ["Да, полностью поддерживает", "Нет, только сенсор", "Поддерживает только геймпады", "Только клавиатуру без мыши"], c: 0 },
    { q: "Можно ли настраивать экранные кнопки (размер, положение)?", a: ["Нет, интерфейс фиксированный", "Только прозрачность", "Да, есть полная кастомизация", "Настройка доступна только в VIP-версии"], c: 2 },
    { q: "Чем Mojo Launcher принципиально отличается от Minecraft PE (Bedrock)?", a: ["Там другая графика", "Это эмуляция полноценной ПК-версии (Java)", "В Mojo меньше блоков", "Mojo — это просто набор текстур"], c: 1 },
    { q: "Можно ли перенести свои миры с ПК на телефон для игры в Mojo?", a: ["Да, скопировав их в папку saves", "Нет, миры несовместимы", "Только через специальный конвертер", "Только миры созданные в новых версиях"], c: 0 },
    { q: "Есть ли в Mojo Launcher русский язык интерфейса?", a: ["Нет, только английский", "Только китайский", "Да, интерфейс русифицирован", "Только в чате игры"], c: 2 },
    { q: "Какую архитектуру процессоров поддерживает Mojo Launcher лучше всего?", a: ["ARM64 (современные телефоны)", "x86 (старые ПК)", "ARMv7 (очень старые смартфоны)", "PowerPC"], c: 0 }
];

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
    static async startTest(interaction, targetMember) {
        const guild = interaction.guild;
        const targetUser = targetMember.user;

        // Если тест уже идёт для этого юзера
        if (this.activeTests.has(targetUser.id)) {
            return await interaction.editReply({ content: 'Пользователь уже проходит тест!' });
        }

        // Сохраняем и снимаем роли
        const rolesToSave = targetMember.roles.cache
            .filter(r => r.id !== guild.id && r.editable)
            .map(r => r.id);

        let rolesRemoved = false;
        try {
            if (rolesToSave.length > 0) {
                await targetMember.roles.remove(rolesToSave, 'MojoTest started');
                rolesRemoved = true;
            }
        } catch (error) {
            console.error('[MojoTest] Ошибка при снятии ролей:', error);
            return await interaction.editReply({ content: 'Не удалось снять роли. Проверьте иерархию бота.' });
        }

        // Добавляем юзера в "черный список" для отправки сообщений
        this.activeTests.add(targetUser.id);

        // Функция восстановления прав
        const cleanupTest = async (kick = false, reason = 'Провал MojoTest') => {
            this.activeTests.delete(targetUser.id);

            if (kick) {
                try {
                    await targetMember.kick(reason);
                } catch (e) {
                    console.error('[MojoTest] Ошибка при кике:', e);
                }
            } else if (rolesRemoved && rolesToSave.length > 0) {
                try {
                    // Возвращаем роли только если не кикаем (если кикнули, пользователя уже нет на сервере)
                    await targetMember.roles.add(rolesToSave, 'MojoTest finished');
                } catch (e) {
                    console.error('[MojoTest] Ошибка при возврате ролей:', e);
                }
            }
        };

        // Подготавливаем 3 вопроса
        const questionsForTest = this.getRandomItems(QUESTION_BANK, 3);
        let currentQuestionIdx = 0;
        let score = 0;

        const getQuestionData = () => {
            const rawQ = questionsForTest[currentQuestionIdx];

            // Формируем ответы и перемешиваем
            const answersObj = rawQ.a.map((text, i) => ({ text, correct: i === rawQ.c }));
            const shuffledAnswers = this.getRandomItems(answersObj, answersObj.length);

            const embed = EmbedService.createBaseEmbed(interaction)
                .setTitle(`Проверка MojoLauncher - Вопрос ${currentQuestionIdx + 1} из 3`)
                .setDescription(`**${rawQ.q}**\n\n` + shuffledAnswers.map((ans, i) => `**${['A', 'B', 'C', 'D'][i]}**. ${ans.text}`).join('\n'))
                .setFooter({ text: 'У вас есть 30 секунд. Любая ошибка приведёт к исключению (кик).', iconURL: targetUser.displayAvatarURL() });

            const row = new ActionRowBuilder();
            shuffledAnswers.forEach((ans, i) => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`mojotest_${i}_${ans.correct}`)
                        .setLabel(['A', 'B', 'C', 'D'][i])
                        .setStyle(ButtonStyle.Primary)
                );
            });

            return { content: `<@${targetUser.id}>, ваш тест начался! Вы не можете отправлять сообщения.\n**Ошибаться нельзя!**`, embeds: [embed], components: [row] };
        };

        const initialMsg = await interaction.editReply(getQuestionData());

        const collector = initialMsg.createMessageComponentCollector({
            filter: i => i.user.id === targetUser.id,
            time: 30000
        });

        collector.on('collect', async i => {
            const isCorrect = i.customId.split('_')[2] === 'true';

            if (!isCorrect) {
                // Провал
                collector.stop('failed');
                await cleanupTest(true, 'Неверный ответ на MojoTest');

                const failEmbed = EmbedService.createBaseEmbed()
                    .setTitle('Тест провален')
                    .setColor(0xff0000)
                    .setDescription(`Пользователь <@${targetUser.id}> ответил **неверно** и был кикнут с сервера.`);

                await i.update({ content: `<@${targetUser.id}> провалил тест.`, embeds: [failEmbed], components: [] });
                return;
            }

            score++;
            currentQuestionIdx++;

            if (currentQuestionIdx >= questionsForTest.length) {
                // Успех
                collector.stop('success');
                await cleanupTest(false);

                const successEmbed = EmbedService.createBaseEmbed()
                    .setTitle('Тест успешно пройден!')
                    .setColor(0x00ff00)
                    .setDescription(`Пользователь <@${targetUser.id}> ответил правильно на все 3 вопроса. Ограничения сняты.`);

                await i.update({ content: `Тест пройден!`, embeds: [successEmbed], components: [] });
            } else {
                // Следующий вопрос
                collector.resetTimer({ time: 30000 });
                const nextData = getQuestionData();
                nextData.content = `<@${targetUser.id}>, следующий вопрос!`;
                await i.update(nextData);
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                // Провал по времени
                await cleanupTest(true, 'Время на ответ в MojoTest вышло');

                const timeoutEmbed = EmbedService.createBaseEmbed()
                    .setTitle('Время вышло')
                    .setColor(0xff0000)
                    .setDescription(`Пользователь <@${targetUser.id}> не успел ответить на вопрос и был кикнут с сервера.`);

                interaction.editReply({ content: 'Время вышло.', embeds: [timeoutEmbed], components: [] }).catch(() => { });
            }
        });
    }
}

module.exports = MojoTestService;
