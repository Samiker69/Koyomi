const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly');
const { generateCaptcha } = require('../../functions/createCaptcha');
const { privateAccess } = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('captcha')
        .setDescription("Создаёт капчу")
        .setContexts(0,1,2)
        .addBooleanOption(opt => 
            opt.setName('invisible')
            .setDescription('Сделать сообщение невидимым?')
        )
        // Базовые настройки
        .addIntegerOption(opt =>
            opt.setName("length")
            .setDescription("Кол-во символов")
            .setMinValue(1)
            .setMaxValue(12)
        )
        .addIntegerOption(opt =>
            opt.setName('width')
            .setDescription("Ширина изображения капчи")
            .setMinValue(150)
            .setMaxValue(400)
        )
        .addIntegerOption(opt =>
            opt.setName('height')
            .setDescription("Высота изображения капчи")
            .setMinValue(50)
            .setMaxValue(200)
        )
        // Настройки текста
        .addIntegerOption(opt =>
            opt.setName('min_font_size')
            .setDescription("Минимальный размер шрифта")
            .setMinValue(10)
            .setMaxValue(50)
        )
        .addIntegerOption(opt =>
            opt.setName('max_font_size')
            .setDescription("Максимальный размер шрифта")
            .setMinValue(15)
            .setMaxValue(60)
        )
        .addNumberOption(opt =>
            opt.setName('max_rotation')
            .setDescription("Максимальный поворот текста (0.1-2.0)")
            .setMinValue(0.1)
            .setMaxValue(2.0)
        )
        .addNumberOption(opt =>
            opt.setName('max_skew')
            .setDescription("Максимальное искажение текста (0.1-1.0)")
            .setMinValue(0.1)
            .setMaxValue(1.0)
        )
        .addBooleanOption(opt =>
            opt.setName('text_outline')
            .setDescription("Обводка текста")
        )
        .addBooleanOption(opt =>
            opt.setName('random_colors')
            .setDescription("Случайные цвета для каждого символа")
        )
        // Настройки фона
        .addBooleanOption(opt =>
            opt.setName('gradient_bg')
            .setDescription("Градиентный фон")
        )
        .addStringOption(opt =>
            opt.setName('gradient_type')
            .setDescription("Тип градиента")
            .addChoices(
                { name: 'Линейный', value: 'linear' },
                { name: 'Радиальный', value: 'radial' }
            )
        )
        // Настройки шума
        .addIntegerOption(opt =>
            opt.setName('noise_lines')
            .setDescription("Кол-во линий шума")
            .setMinValue(0)
            .setMaxValue(20)
        )
        .addIntegerOption(opt =>
            opt.setName('noise_dots')
            .setDescription("Кол-во точек шума")
            .setMinValue(0)
            .setMaxValue(300)
        )
        .addIntegerOption(opt =>
            opt.setName('noise_circles')
            .setDescription("Кол-во кругов шума")
            .setMinValue(0)
            .setMaxValue(15)
        )
        .addBooleanOption(opt =>
            opt.setName('curved_lines')
            .setDescription("Изогнутые линии шума")
        )
        .addNumberOption(opt =>
            opt.setName('noise_opacity')
            .setDescription("Прозрачность шума (0.1-1.0)")
            .setMinValue(0.1)
            .setMaxValue(1.0)
        )
        // Настройки искажений
        .addBooleanOption(opt =>
            opt.setName('wave_distortion')
            .setDescription("Волновые искажения")
        )
        .addIntegerOption(opt =>
            opt.setName('wave_amplitude')
            .setDescription("Амплитуда волн")
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addNumberOption(opt =>
            opt.setName('wave_frequency')
            .setDescription("Частота волн (0.01-0.2)")
            .setMinValue(0.01)
            .setMaxValue(0.2)
        )
        // Настройки помех
        .addBooleanOption(opt =>
            opt.setName('scratches')
            .setDescription("Царапины")
        )
        .addIntegerOption(opt =>
            opt.setName('scratch_count')
            .setDescription("Количество царапин")
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addBooleanOption(opt =>
            opt.setName('grid_interference')
            .setDescription("Сетка помех")
        )
        .addBooleanOption(opt =>
            opt.setName('overlay_interference')
            .setDescription("Помехи поверх текста")
        ),

    async execute(interaction) {
        if (!privateAccess.includes(interaction.user.id)) {
            return await interaction.reply({ 
                content: `Вы не можете использовать эту команду`, 
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // Получение базовых параметров
        const captchaLength = interaction.options.getInteger("length") || 6;
        const width = interaction.options.getInteger("width") || 200;
        const height = interaction.options.getInteger("height") || 80;
        const invisible = interaction.options.getBoolean('invisible') || false;

        // Настройки текста
        const minFontSize = interaction.options.getInteger('min_font_size') || 16;
        const maxFontSize = interaction.options.getInteger('max_font_size') || 32;
        const maxRotation = interaction.options.getNumber('max_rotation') || 0.8;
        const maxSkew = interaction.options.getNumber('max_skew') || 0.3;
        const textOutline = interaction.options.getBoolean('text_outline') || false;
        const randomColors = interaction.options.getBoolean('random_colors') ?? true;

        // Настройки фона
        const gradientBg = interaction.options.getBoolean('gradient_bg') || false;
        const gradientType = interaction.options.getString('gradient_type') || 'linear';

        // Настройки шума
        const noiseLines = interaction.options.getInteger('noise_lines') || 8;
        const noiseDots = interaction.options.getInteger('noise_dots') || 150;
        const noiseCircles = interaction.options.getInteger('noise_circles') || 5;
        const curvedLines = interaction.options.getBoolean('curved_lines') ?? true;
        const noiseOpacity = interaction.options.getNumber('noise_opacity') || 0.6;

        // Настройки искажений
        const waveDistortion = interaction.options.getBoolean('wave_distortion') ?? true;
        const waveAmplitude = interaction.options.getInteger('wave_amplitude') || 3;
        const waveFrequency = interaction.options.getNumber('wave_frequency') || 0.05;

        // Настройки помех
        const scratches = interaction.options.getBoolean('scratches') ?? true;
        const scratchCount = interaction.options.getInteger('scratch_count') || 3;
        const gridInterference = interaction.options.getBoolean('grid_interference') || false;
        const overlayInterference = interaction.options.getBoolean('overlay_interference') ?? true;

        try {
            const captcha = await generateCaptcha({
                length: captchaLength,
                width,
                height,
                outputType: "buffer",
                text: {
                    minFontSize,
                    maxFontSize,
                    maxRotation,
                    maxSkew,
                    outline: textOutline,
                    randomColors
                },
                background: {
                    gradient: gradientBg,
                    gradientType
                },
                noise: {
                    lines: noiseLines,
                    dots: noiseDots,
                    circles: noiseCircles,
                    curves: curvedLines,
                    opacity: noiseOpacity
                },
                distortion: {
                    wave: waveDistortion,
                    waveAmplitude,
                    waveFrequency,
                    horizontalWave: true,
                    verticalWave: true
                },
                interference: {
                    scratches,
                    scratchCount,
                    grid: gridInterference,
                    overlay: overlayInterference
                }
            });

            // Создание описания настроек для отладки
            const settingsInfo = [];
            if (gradientBg) settingsInfo.push(`градиент (${gradientType})`);
            if (textOutline) settingsInfo.push('обводка текста');
            if (!randomColors) settingsInfo.push('единый цвет текста');
            if (waveDistortion) settingsInfo.push(`волны (${waveAmplitude}/${waveFrequency})`);
            if (scratches) settingsInfo.push(`царапины (${scratchCount})`);
            if (gridInterference) settingsInfo.push('сетка');
            if (!curvedLines) settingsInfo.push('прямые линии');

            const settingsText = settingsInfo.length > 0 ? 
                `\nНастройки: ${settingsInfo.join(', ')}` : '';

            if (invisible) {
                await interaction.editReply({ 
                    content: `Капча готова! Исходный текст: **${captcha.text}**${settingsText}`, 
                    flags: MessageFlags.Ephemeral, 
                    files: [{
                        attachment: captcha.data,
                        name: 'captcha.png'
                    }]
                });
            } else {
                await interaction.editReply({ 
                    content: `Капча готова! Исходный текст: **${captcha.text}**${settingsText}`, 
                    flags: MessageFlags.Ephemeral 
                });
                await interaction.followUp({ 
                    content: "Всем решать капчу!", 
                    files: [{
                        attachment: captcha.data,
                        name: 'captcha.png'
                    }]
                });
            }

        } catch (error) {
            console.error('Ошибка при генерации CAPTCHA:', error);
            await interaction.editReply({ 
                content: '❌ Произошла ошибка при создании капчи. Попробуйте снова.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};