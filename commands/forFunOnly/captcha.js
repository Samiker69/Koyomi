const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const { generateCaptcha } = require('../../functions/createCaptcha');
const { privateAccess } = require('../../config.json');
const LocaleManager = require('../../locales/localesManager');

const localeManager = new LocaleManager();

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(localeManager.getString('commands.captcha.name'))
        .setDescription(localeManager.getString('commands.captcha.description'))
        .setContexts(0,1,2)
        .addBooleanOption(opt => 
            opt.setName(localeManager.getString('commands.captcha.options.invisible.name'))
            .setDescription(localeManager.getString('commands.captcha.options.invisible.description'))
        )
        // Базовые настройки
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.length.name'))
            .setDescription(localeManager.getString('commands.captcha.options.length.description'))
            .setMinValue(1)
            .setMaxValue(12)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.width.name'))
            .setDescription(localeManager.getString('commands.captcha.options.width.description'))
            .setMinValue(150)
            .setMaxValue(400)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.height.name'))
            .setDescription(localeManager.getString('commands.captcha.options.height.description'))
            .setMinValue(50)
            .setMaxValue(200)
        )
        // Настройки текста
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.min_font_size.name'))
            .setDescription(localeManager.getString('commands.captcha.options.min_font_size.description'))
            .setMinValue(10)
            .setMaxValue(50)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.max_font_size.name'))
            .setDescription(localeManager.getString('commands.captcha.options.max_font_size.description'))
            .setMinValue(15)
            .setMaxValue(60)
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.max_rotation.name'))
            .setDescription(localeManager.getString('commands.captcha.options.max_rotation.description'))
            .setMinValue(0.1)
            .setMaxValue(2.0)
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.max_skew.name'))
            .setDescription(localeManager.getString('commands.captcha.options.max_skew.description'))
            .setMinValue(0.1)
            .setMaxValue(1.0)
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.text_outline.name'))
            .setDescription(localeManager.getString('commands.captcha.options.text_outline.description'))
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.random_colors.name'))
            .setDescription(localeManager.getString('commands.captcha.options.random_colors.description'))
        )
        // Настройки фона
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.gradient_bg.name'))
            .setDescription(localeManager.getString('commands.captcha.options.gradient_bg.description'))
        )
        .addStringOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.gradient_type.name'))
            .setDescription(localeManager.getString('commands.captcha.options.gradient_type.description'))
            .addChoices(
                { name: localeManager.getString('commands.captcha.options.gradient_type.choices.linear'), value: 'linear' },
                { name: localeManager.getString('commands.captcha.options.gradient_type.choices.radial'), value: 'radial' }
            )
        )
        // Настройки шума
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.noise_lines.name'))
            .setDescription(localeManager.getString('commands.captcha.options.noise_lines.description'))
            .setMinValue(0)
            .setMaxValue(20)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.noise_dots.name'))
            .setDescription(localeManager.getString('commands.captcha.options.noise_dots.description'))
            .setMinValue(0)
            .setMaxValue(300)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.noise_circles.name'))
            .setDescription(localeManager.getString('commands.captcha.options.noise_circles.description'))
            .setMinValue(0)
            .setMaxValue(15)
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.curved_lines.name'))
            .setDescription(localeManager.getString('commands.captcha.options.curved_lines.description'))
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.noise_opacity.name'))
            .setDescription(localeManager.getString('commands.captcha.options.noise_opacity.description'))
            .setMinValue(0.1)
            .setMaxValue(1.0)
        )
        // Настройки искажений
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.wave_distortion.name'))
            .setDescription(localeManager.getString('commands.captcha.options.wave_distortion.description'))
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.wave_amplitude.name'))
            .setDescription(localeManager.getString('commands.captcha.options.wave_amplitude.description'))
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.wave_frequency.name'))
            .setDescription(localeManager.getString('commands.captcha.options.wave_frequency.description'))
            .setMinValue(0.01)
            .setMaxValue(0.2)
        )
        // Настройки помех
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.scratches.name'))
            .setDescription(localeManager.getString('commands.captcha.options.scratches.description'))
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.scratch_count.name'))
            .setDescription(localeManager.getString('commands.captcha.options.scratch_count.description'))
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.grid_interference.name'))
            .setDescription(localeManager.getString('commands.captcha.options.grid_interference.description'))
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.getString('commands.captcha.options.overlay_interference.name'))
            .setDescription(localeManager.getString('commands.captcha.options.overlay_interference.description'))
        ),

    async execute(interaction) {
        if (!privateAccess.includes(interaction.user.id)) {
            return await interaction.reply({ 
                content: localeManager.getString('commands.captcha.no_permissions'), 
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
            if (gradientBg) settingsInfo.push(localeManager.getString('commands.captcha.settings.gradient', { gradientType: gradientType }));
            if (textOutline) settingsInfo.push(localeManager.getString('commands.captcha.settings.text_outline'));
            if (!randomColors) settingsInfo.push(localeManager.getString('commands.captcha.settings.single_text_color'));
            if (waveDistortion) settingsInfo.push(localeManager.getString('commands.captcha.settings.waves', { waveAmplitude: waveAmplitude, waveFrequency: waveFrequency }));
            if (scratches) settingsInfo.push(localeManager.getString('commands.captcha.settings.scratches', { scratchCount: scratchCount }));
            if (gridInterference) settingsInfo.push(localeManager.getString('commands.captcha.settings.grid'));
            if (!curvedLines) settingsInfo.push(localeManager.getString('commands.captcha.settings.straight_lines'));

            const settingsText = settingsInfo.length > 0 ? 
                `\n${localeManager.getString('commands.captcha.settings.prefix')}: ${settingsInfo.join(', ')}` : '';

            if (invisible) {
                await interaction.editReply({ 
                    content: localeManager.getString('commands.captcha.captcha_ready', { text: captcha.text, settingsText: settingsText }), 
                    flags: MessageFlags.Ephemeral, 
                    files: [{
                        attachment: captcha.data,
                        name: 'captcha.png'
                    }]
                });
            } else {
                await interaction.editReply({ 
                    content: localeManager.getString('commands.captcha.captcha_ready', { text: captcha.text, settingsText: settingsText }), 
                    flags: MessageFlags.Ephemeral 
                });
                await interaction.followUp({ 
                    content: localeManager.getString('commands.captcha.solve_captcha'), 
                    files: [{
                        attachment: captcha.data,
                        name: 'captcha.png'
                    }]
                });
            }

        } catch (error) {
            console.error('Ошибка при генерации CAPTCHA:', error);
            await interaction.editReply({ 
                content: localeManager.getString('commands.captcha.error_generating_captcha'), 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};