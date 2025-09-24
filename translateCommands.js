const fs = require('fs').promises;
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({apiKey: process.env.gemini_api_key_3});


// Допустим, это ваша функция для перевода.
// Она принимает объект с командами и язык для перевода.
// Возвращает промис с переведенным объектом.
async function generateTranslate(commandBatch, targetLanguage) {
    const systemInstructions = `Ты — эксперт по локализации программного обеспечения, специализирующийся на переводе интерфейсов и текстовых команд для Discord-ботов. Твоя задача — точно и естественно переводить текстовые поля в предоставленном JSON-объекте на.
Правила:
1.  **Переводи только значения полей \`description\`**.
2.  **НИКОГДА не переводи значения полей \`name\`**. Эти поля являются программными идентификаторами и должны оставаться в оригинале.
3.  **Сохраняй исходную структуру JSON** один в один. Не добавляй, не удаляй и не переименовывай ключи.
4.  **Твой ответ должен быть ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом**. Не добавляй никаких комментариев, объяснений, извинений или markdown-форматирования (например, \`\`\`json). Только чистый JSON.
5.  Перевод должен быть естественным для пользователя Discord, а не дословным.
`
    const content = `
Переведи \`description\` в следующем JSON с русского(и не только) на **${targetLanguage}**. Не изменяй ключи и значения полей \`name\`. Верни только JSON.

${JSON.stringify(commandBatch, null, 4)}
`

    console.log(`Начинаю перевод батча на ${targetLanguage}...`);
    let reply = (await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: content,
        config: {
            systemInstruction: systemInstructions,
            temperature: 0.2,
        }
    })).candidates[0].content.parts[0].text
    console.log(reply)
    if (reply.startsWith('```')) {
        // Убираем markdown обертку, если есть
        const firstNewline = reply.indexOf('\n');
        const lastTripleBacktick = reply.lastIndexOf('```');
        reply = reply.substring(firstNewline + 1, lastTripleBacktick).trim();
    } else {
        reply = reply.trim();
    }

    try {
        const parsed = JSON.parse(reply);
        console.log(`Батч на ${targetLanguage} переведен.`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Имитация задержки сети
        return parsed
    } catch (error) {
        console.error('Ошибка парсинга JSON от AI:', error);
        throw new Error('AI вернул невалидный JSON');
    }
}


async function main() {
    const targetLanguage = 'Russian'; // Язык, на который переводим
    const BATCH_SIZE = 6; // Количество команд в одном запросе к AI

    try {
        // 1. Читаем исходный файл
        const data = await fs.readFile('commands.json', 'utf-8');
        const allCommands = JSON.parse(data).commands;
        const commandNames = Object.keys(allCommands);

        // 2. Делим на батчи
        const batches = [];
        for (let i = 0; i < commandNames.length; i += BATCH_SIZE) {
            const batchNames = commandNames.slice(i, i + BATCH_SIZE);
            const batchData = {};
            for (const name of batchNames) {
                batchData[name] = allCommands[name];
            }
            batches.push(batchData);
        }
        console.log(`Создано ${batches.length} батчей по ${BATCH_SIZE} команд в каждом.`);

        // 3. Создаем массив промисов для перевода
        const translationPromises = batches.map(batch => generateTranslate(batch, targetLanguage));

        // 4. Запускаем все переводы одновременно
        const translatedBatches = await Promise.all(translationPromises);

        // 5. Собираем результаты в один объект
        const finalTranslatedCommands = {};
        for (const batch of translatedBatches) {
            Object.assign(finalTranslatedCommands, batch);
        }

        const finalOutput = {
            commands: finalTranslatedCommands
        };

        // 6. Сохраняем в новый файл
        await fs.writeFile(`commands_${targetLanguage.toLowerCase()}.json`, JSON.stringify(finalOutput, null, 4));
        console.log(`Перевод успешно завершен и сохранен в файл commands_${targetLanguage.toLowerCase()}.json`);

    } catch (error) {
        console.error('Произошла ошибка в процессе перевода:', error);
    }
}

main();