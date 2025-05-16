const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Генерирует случайный цвет в формате rgb(r,g,b)
 * @param {number} min - Минимальное значение для компонента цвета (0-255)
 * @param {number} max - Максимальное значение для компонента цвета (0-255)
 * @returns {string} Строка цвета CSS
 */
function getRandomColor(min = 0, max = 255) {
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    const g = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * (max - min + 1)) + min;
    return `rgb(${r},${g},${b})`;
}

/**
 * Генерирует CAPTCHA
 * @param {object} options - Опции генерации
 * @param {number} [options.width=150] - Ширина изображения
 * @param {number} [options.height=50] - Высота изображения
 * @param {number} [options.length=6] - Длина текста CAPTCHA
 * @param {number} [options.noiseLines=5] - Количество линий шума
 * @param {number} [options.noiseDots=100] - Количество точек шума
 * @param {string} [options.chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] - Набор символов для генерации текста
 * @param {string} [options.outputType='dataURL'] - Тип возвращаемых данных: 'dataURL', 'buffer', 'file'
 * @param {string} [options.filePath='./captcha.png'] - Путь для сохранения файла (если outputType='file')
 * @returns {Promise<{text: string, data: string | Buffer}>} - Объект с текстом CAPTCHA и данными изображения (Data URL, Buffer или путь к файлу)
 */
async function generateCaptcha(options = {}) {
    const {
        width = 150,
        height = 50,
        length = 6,
        noiseLines = 5,
        noiseDots = 100,
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        outputType = 'dataURL', // 'dataURL', 'buffer', or 'file'
        filePath = './captcha.png' // используется только если outputType='file'
    } = options;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Фон (светлый случайный цвет)
    ctx.fillStyle = getRandomColor(100, 255);
    ctx.fillRect(0, 0, width, height);

    // 2. Генерация текста CAPTCHA
    let captchaText = '';
    for (let i = 0; i < length; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 3. Рисование текста (с искажениями)
    ctx.font = `bold ${Math.floor(height * 0.4)}px Arial`; // Размер шрифта зависит от высоты
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const charSpacing = width / (length + 1); // Расстояние между символами

    for (let i = 0; i < length; i++) {
        const char = captchaText[i];
        const x = charSpacing * (i + 1) + (Math.random() - 0.5) * 10; // Небольшое случайное смещение по X
        const y = height / 2 + (Math.random() - 0.5) * (height * 0.2); // Случайное смещение по Y
        const angle = (Math.random() - 0.5) * 0.5; // Случайный угол наклона (в радианах)
        ctx.fillStyle = getRandomColor(0, 150); // Темный случайный цвет для текста

        ctx.save(); // Сохраняем текущее состояние контекста (трансформации)
        ctx.translate(x, y); // Смещаем точку отсчета
        ctx.rotate(angle); // Поворачиваем
        ctx.fillText(char, 0, 0); // Рисуем символ в новой точке отсчета (0,0)
        ctx.restore(); // Восстанавливаем предыдущее состояние контекста
    }

    // 4. Добавление шума (линии)
    for (let i = 0; i < noiseLines; i++) {
        ctx.strokeStyle = getRandomColor(100, 200); // Средний случайный цвет
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.lineWidth = Math.random() * 2; // Случайная толщина линии
        ctx.stroke();
    }

    // 5. Добавление шума (точки)
    for (let i = 0; i < noiseDots; i++) {
        ctx.fillStyle = getRandomColor(100, 200);
        ctx.beginPath();
        // Рисуем маленькие круги (точки) в случайных местах
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 6. Вывод результата
    let imageData;
    try {
        if (outputType === 'file') {
            const buffer = canvas.toBuffer('image/png');
            await fs.promises.writeFile(filePath, buffer);
            imageData = path.resolve(filePath); // Возвращаем абсолютный путь
        } else if (outputType === 'buffer') {
            imageData = canvas.toBuffer('image/png');
        } else { // По умолчанию 'dataURL'
            imageData = canvas.toDataURL('image/png');
        }
        return {
            text: captchaText,
            data: imageData
        };
    } catch (error) {
        console.error("Ошибка при создании или сохранении CAPTCHA:", error);
        throw new Error("Не удалось сгенерировать CAPTCHA");
    }
}

// --- Пример использования ---

/*async function runExample() {
    console.log("Генерация CAPTCHA...");

    try {
        // Пример 1: Получить Data URL (удобно для вставки в <img> src)
        const captchaDataUrl = await generateCaptcha({ length: 5, noiseLines: 3 });
        console.log("\n--- Пример 1 (Data URL) ---");
        console.log("Текст CAPTCHA:", captchaDataUrl.text);
        console.log("Data URL (начало):", captchaDataUrl.data.substring(0, 100) + "...");
        // Этот Data URL можно вставить прямо в атрибут src тега img:
        // <img src="data:image/png;base64,..." alt="CAPTCHA">

        // Пример 2: Сохранить в файл
        const captchaFile = await generateCaptcha({
            outputType: 'file',
            filePath: 'my_captcha.png',
            width: 200,
            height: 60,
            length: 7
        });
        console.log("\n--- Пример 2 (Файл) ---");
        console.log("Текст CAPTCHA:", captchaFile.text);
        console.log("Изображение сохранено в:", captchaFile.data); // Путь к файлу

        // Пример 3: Получить как Buffer (полезно для отправки через API или стриминга)
        const captchaBuffer = await generateCaptcha({ outputType: 'buffer' });
        console.log("\n--- Пример 3 (Buffer) ---");
        console.log("Текст CAPTCHA:", captchaBuffer.text);
        console.log("Buffer:", captchaBuffer.data);

    } catch (error) {
        console.error("\nПроизошла ошибка:", error.message);
        console.error("Убедитесь, что библиотека 'canvas' установлена корректно вместе с её зависимостями.");
        console.error("Инструкции по установке: https://www.npmjs.com/package/canvas#installation");
    }
}*/

module.exports = { generateCaptcha };