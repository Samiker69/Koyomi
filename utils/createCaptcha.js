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
 * Генерирует случайный цвет с прозрачностью
 * @param {number} min - Минимальное значение для компонента цвета (0-255)
 * @param {number} max - Максимальное значение для компонента цвета (0-255)
 * @param {number} alpha - Прозрачность (0-1)
 * @returns {string} Строка цвета CSS с альфа-каналом
 */
function getRandomColorWithAlpha(min = 0, max = 255, alpha = 1) {
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    const g = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * (max - min + 1)) + min;
    return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Создает градиентный фон
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 * @param {number} width - Ширина canvas
 * @param {number} height - Высота canvas
 * @param {object} gradientOptions - Опции градиента
 */
function createGradientBackground(ctx, width, height, gradientOptions) {
    const { enabled, type, colors } = gradientOptions;
    
    if (!enabled) {
        ctx.fillStyle = getRandomColor(180, 255);
        ctx.fillRect(0, 0, width, height);
        return;
    }

    let gradient;
    if (type === 'radial') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.max(width, height) / 2;
        gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    } else {
        // linear gradient
        const angle = Math.random() * Math.PI * 2;
        const x1 = Math.cos(angle) * width;
        const y1 = Math.sin(angle) * height;
        gradient = ctx.createLinearGradient(0, 0, x1, y1);
    }

    colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

/**
 * Добавляет искажения волнами
 * @param {CanvasRenderingContext2D} ctx - Контекст canvas
 * @param {number} width - Ширина canvas
 * @param {number} height - Высота canvas
 * @param {object} waveOptions - Опции волн
 */
function addWaveDistortion(ctx, width, height, waveOptions) {
    const { amplitude, frequency, horizontal, vertical } = waveOptions;
    
    if (!horizontal && !vertical) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const distortedData = ctx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sourceX = x;
            let sourceY = y;

            if (horizontal) {
                sourceY += Math.sin(x * frequency) * amplitude;
            }
            if (vertical) {
                sourceX += Math.sin(y * frequency) * amplitude;
            }

            sourceX = Math.max(0, Math.min(width - 1, Math.round(sourceX)));
            sourceY = Math.max(0, Math.min(height - 1, Math.round(sourceY)));

            const sourceIndex = (sourceY * width + sourceX) * 4;
            const targetIndex = (y * width + x) * 4;

            distortedData.data[targetIndex] = imageData.data[sourceIndex];
            distortedData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
            distortedData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
            distortedData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
        }
    }

    ctx.putImageData(distortedData, 0, 0);
}

/**
 * Генерирует расширенную CAPTCHA
 * @param {object} options - Опции генерации
 * @param {number} [options.width=200] - Ширина изображения
 * @param {number} [options.height=80] - Высота изображения
 * @param {number} [options.length=6] - Длина текста CAPTCHA
 * @param {string} [options.chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] - Набор символов
 * @param {string} [options.outputType='buffer'] - Тип возвращаемых данных
 * @param {string} [options.filePath='./captcha.png'] - Путь для сохранения файла
 * 
 * Опции текста:
 * @param {object} [options.text] - Настройки текста
 * @param {number} [options.text.minFontSize=16] - Минимальный размер шрифта
 * @param {number} [options.text.maxFontSize=32] - Максимальный размер шрифта
 * @param {string[]} [options.text.fonts=['Arial', 'Times', 'Courier', 'Helvetica']] - Шрифты
 * @param {number} [options.text.maxRotation=0.8] - Максимальный угол поворота (радианы)
 * @param {number} [options.text.maxSkew=0.3] - Максимальное искажение
 * @param {number} [options.text.spacing=1.2] - Коэффициент расстояния между символами
 * @param {boolean} [options.text.randomColors=true] - Случайные цвета для каждого символа
 * @param {boolean} [options.text.outline=false] - Обводка текста
 * @param {number} [options.text.outlineWidth=2] - Толщина обводки
 * 
 * Опции фона:
 * @param {object} [options.background] - Настройки фона
 * @param {boolean} [options.background.gradient=false] - Использовать градиент
 * @param {string} [options.background.gradientType='linear'] - Тип градиента ('linear' или 'radial')
 * @param {string[]} [options.background.gradientColors] - Цвета градиента
 * 
 * Опции шума:
 * @param {object} [options.noise] - Настройки шума
 * @param {number} [options.noise.lines=8] - Количество линий шума
 * @param {number} [options.noise.dots=150] - Количество точек шума
 * @param {number} [options.noise.circles=5] - Количество кругов шума
 * @param {number} [options.noise.maxLineWidth=3] - Максимальная толщина линий
 * @param {boolean} [options.noise.curves=true] - Изогнутые линии
 * @param {number} [options.noise.opacity=0.6] - Прозрачность шума
 * 
 * Опции искажений:
 * @param {object} [options.distortion] - Настройки искажений
 * @param {boolean} [options.distortion.wave=true] - Волновые искажения
 * @param {number} [options.distortion.waveAmplitude=3] - Амплитуда волн
 * @param {number} [options.distortion.waveFrequency=0.05] - Частота волн
 * @param {boolean} [options.distortion.horizontalWave=true] - Горизонтальные волны
 * @param {boolean} [options.distortion.verticalWave=true] - Вертикальные волны
 * 
 * Опции помех:
 * @param {object} [options.interference] - Настройки помех
 * @param {boolean} [options.interference.grid=false] - Сетка помех
 * @param {number} [options.interference.gridSpacing=10] - Расстояние между линиями сетки
 * @param {boolean} [options.interference.scratches=true] - Царапины
 * @param {number} [options.interference.scratchCount=3] - Количество царапин
 * @param {boolean} [options.interference.overlay=true] - Наложение помех поверх текста
 * 
 * @returns {Promise<{text: string, data: string | Buffer}>} - Объект с текстом CAPTCHA и данными изображения
 */
async function generateCaptcha(options = {}) {
    const {
        width = 200,
        height = 80,
        length = 6,
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        outputType = 'buffer',
        filePath = './captcha.png'
    } = options;

    // Настройки текста
    const textOptions = {
        minFontSize: 16,
        maxFontSize: 32,
        fonts: ['Arial', 'Times', 'Courier', 'Helvetica', 'Georgia', 'Verdana'],
        maxRotation: 0.8,
        maxSkew: 0.3,
        spacing: 1.2,
        randomColors: true,
        outline: false,
        outlineWidth: 2,
        ...options.text
    };

    // Настройки фона
    const backgroundOptions = {
        gradient: false,
        gradientType: 'linear',
        gradientColors: [
            getRandomColor(200, 255),
            getRandomColor(180, 240),
            getRandomColor(190, 250)
        ],
        ...options.background
    };

    // Настройки шума
    const noiseOptions = {
        lines: 8,
        dots: 150,
        circles: 5,
        maxLineWidth: 3,
        curves: true,
        opacity: 0.6,
        ...options.noise
    };

    // Настройки искажений
    const distortionOptions = {
        wave: true,
        waveAmplitude: 3,
        waveFrequency: 0.05,
        horizontalWave: true,
        verticalWave: true,
        ...options.distortion
    };

    // Настройки помех
    const interferenceOptions = {
        grid: false,
        gridSpacing: 10,
        scratches: true,
        scratchCount: 3,
        overlay: true,
        ...options.interference
    };

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Создание фона
    createGradientBackground(ctx, width, height, {
        enabled: backgroundOptions.gradient,
        type: backgroundOptions.gradientType,
        colors: backgroundOptions.gradientColors
    });

    // 2. Добавление сетки помех (под текстом)
    if (interferenceOptions.grid && !interferenceOptions.overlay) {
        ctx.strokeStyle = getRandomColorWithAlpha(100, 180, 0.3);
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += interferenceOptions.gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += interferenceOptions.gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    // 3. Генерация и рисование текста CAPTCHA
    let captchaText = '';
    for (let i = 0; i < length; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const charSpacing = (width * 0.8) / length;
    const startX = width * 0.1;

    for (let i = 0; i < length; i++) {
        const char = captchaText[i];
        
        // Случайный размер шрифта для каждого символа
        const fontSize = Math.floor(Math.random() * (textOptions.maxFontSize - textOptions.minFontSize + 1)) + textOptions.minFontSize;
        const font = textOptions.fonts[Math.floor(Math.random() * textOptions.fonts.length)];
        
        ctx.font = `bold ${fontSize}px ${font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const x = startX + charSpacing * i + (Math.random() - 0.5) * 20;
        const y = height / 2 + (Math.random() - 0.5) * (height * 0.3);
        const rotation = (Math.random() - 0.5) * textOptions.maxRotation;
        const skewX = (Math.random() - 0.5) * textOptions.maxSkew;
        const skewY = (Math.random() - 0.5) * textOptions.maxSkew;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.transform(1, skewY, skewX, 1, 0, 0); // Применяем искажение

        // Цвет текста
        const textColor = textOptions.randomColors ? 
            getRandomColor(0, 120) : 
            getRandomColor(50, 100);

        // Обводка
        if (textOptions.outline) {
            ctx.strokeStyle = getRandomColor(0, 80);
            ctx.lineWidth = textOptions.outlineWidth;
            ctx.strokeText(char, 0, 0);
        }

        ctx.fillStyle = textColor;
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    // 4. Добавление шума (линии)
    for (let i = 0; i < noiseOptions.lines; i++) {
        ctx.strokeStyle = getRandomColorWithAlpha(80, 180, noiseOptions.opacity);
        ctx.lineWidth = Math.random() * noiseOptions.maxLineWidth + 0.5;
        ctx.beginPath();
        
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        ctx.moveTo(startX, startY);

        if (noiseOptions.curves) {
            // Изогнутые линии (квадратичные кривые Безье)
            const controlX = Math.random() * width;
            const controlY = Math.random() * height;
            const endX = Math.random() * width;
            const endY = Math.random() * height;
            ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        } else {
            // Прямые линии
            ctx.lineTo(Math.random() * width, Math.random() * height);
        }
        
        ctx.stroke();
    }

    // 5. Добавление точек шума
    for (let i = 0; i < noiseOptions.dots; i++) {
        ctx.fillStyle = getRandomColorWithAlpha(100, 200, noiseOptions.opacity);
        ctx.beginPath();
        ctx.arc(
            Math.random() * width, 
            Math.random() * height, 
            Math.random() * 2, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
    }

    // 6. Добавление кругов шума
    for (let i = 0; i < noiseOptions.circles; i++) {
        ctx.strokeStyle = getRandomColorWithAlpha(100, 180, noiseOptions.opacity * 0.5);
        ctx.lineWidth = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(
            Math.random() * width,
            Math.random() * height,
            Math.random() * 20 + 5,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }

    // 7. Царапины
    if (interferenceOptions.scratches) {
        for (let i = 0; i < interferenceOptions.scratchCount; i++) {
            ctx.strokeStyle = getRandomColorWithAlpha(60, 140, 0.7);
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.beginPath();
            
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            const length = Math.random() * width * 0.3 + 20;
            const angle = Math.random() * Math.PI * 2;
            
            ctx.moveTo(startX, startY);
            ctx.lineTo(
                startX + Math.cos(angle) * length,
                startY + Math.sin(angle) * length
            );
            ctx.stroke();
        }
    }

    // 8. Сетка помех поверх текста
    if (interferenceOptions.grid && interferenceOptions.overlay) {
        ctx.strokeStyle = getRandomColorWithAlpha(100, 180, 0.2);
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += interferenceOptions.gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += interferenceOptions.gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    // 9. Применение волновых искажений
    if (distortionOptions.wave) {
        addWaveDistortion(ctx, width, height, {
            amplitude: distortionOptions.waveAmplitude,
            frequency: distortionOptions.waveFrequency,
            horizontal: distortionOptions.horizontalWave,
            vertical: distortionOptions.verticalWave
        });
    }

    // 10. Вывод результата
    let imageData;
    try {
        if (outputType === 'file') {
            const buffer = canvas.toBuffer('image/png');
            await fs.promises.writeFile(filePath, buffer);
            imageData = path.resolve(filePath);
        } else if (outputType === 'buffer') {
            imageData = canvas.toBuffer('image/png');
        } else {
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

module.exports = { generateCaptcha };

//example 
/*
// Простая капча
const simple = await generateCaptcha();

// Сложная капча с множеством настроек
const complex = await generateCaptcha({
    width: 250,
    height: 100,
    length: 7,
    text: {
        minFontSize: 20,
        maxFontSize: 40,
        maxRotation: 1.0,
        maxSkew: 0.5,
        outline: true,
        randomColors: true
    },
    background: {
        gradient: true,
        gradientType: 'radial'
    },
    noise: {
        lines: 12,
        dots: 200,
        circles: 8,
        curves: true,
        opacity: 0.7
    },
    distortion: {
        wave: true,
        waveAmplitude: 5,
        waveFrequency: 0.08
    },
    interference: {
        scratches: true,
        scratchCount: 5,
        grid: true,
        overlay: true
    }
});
// result.data - это изображение
*/