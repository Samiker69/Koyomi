const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const { generateCaptcha } = require('../../utils/createCaptcha');
const { privateAccess } = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('captcha')
        .setDescription(localeManager.get('forFunOnly.captcha.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.description'))
        .setContexts(0,1,2)
        .addBooleanOption(opt => 
            opt.setName('invisible')
            .setDescription(localeManager.get('forFunOnly.captcha.options.invisible.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.invisible.description'))
        )
        // Базовые настройки
        .addIntegerOption(opt =>
            opt.setName('length')
            .setDescription(localeManager.get('forFunOnly.captcha.options.length.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.length.description'))
            .setMinValue(1)
            .setMaxValue(12)
        )
        .addIntegerOption(opt =>
            opt.setName('width')
            .setDescription(localeManager.get('forFunOnly.captcha.options.width.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.width.description'))
            .setMinValue(150)
            .setMaxValue(400)
        )
        .addIntegerOption(opt =>
            opt.setName('height')
            .setDescription(localeManager.get('forFunOnly.captcha.options.height.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.height.description'))
            .setMinValue(50)
            .setMaxValue(200)
        )
        // Настройки текста
        .addIntegerOption(opt =>
            opt.setName('min_font_size')
            .setDescription(localeManager.get('forFunOnly.captcha.options.min_font_size.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.min_font_size.description'))
            .setMinValue(10)
            .setMaxValue(50)
        )
        .addIntegerOption(opt =>
            opt.setName('max_font_size')
            .setDescription(localeManager.get('forFunOnly.captcha.options.max_font_size.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.max_font_size.description'))
            .setMinValue(15)
            .setMaxValue(60)
        )
        .addNumberOption(opt =>
            opt.setName('max_rotation')
            .setDescription(localeManager.get('forFunOnly.captcha.options.max_rotation.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.max_rotation.description'))
            .setMinValue(0.1)
            .setMaxValue(2.0)
        )
        .addNumberOption(opt =>
            opt.setName('max_skew')
            .setDescription(localeManager.get('forFunOnly.captcha.options.max_skew.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.max_skew.description'))
            .setMinValue(0.1)
            .setMaxValue(1.0)
        )
        .addBooleanOption(opt =>
            opt.setName('text_outline')
            .setDescription(localeManager.get('forFunOnly.captcha.options.text_outline.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.text_outline.description'))
        )
        .addBooleanOption(opt =>
            opt.setName('random_colors')
            .setDescription(localeManager.get('forFunOnly.captcha.options.random_colors.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.random_colors.description'))
        )
        // Настройки фона
        .addBooleanOption(opt =>
            opt.setName('gradient_bg')
            .setDescription(localeManager.get('forFunOnly.captcha.options.gradient_bg.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.gradient_bg.description'))
        )
        .addStringOption(opt =>
            opt.setName('gradient_type')
            .setDescription(localeManager.get('forFunOnly.captcha.options.gradient_type.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.gradient_type.description'))
            .addChoices(
                { name: localeManager.get('forFunOnly.captcha.options.gradient_type.choices.linear'), value: 'linear' },
                { name: localeManager.get('forFunOnly.captcha.options.gradient_type.choices.radial'), value: 'radial' }
            )
        )
        // Настройки шума
        .addIntegerOption(opt =>
            opt.setName('noise_lines')
            .setDescription(localeManager.get('forFunOnly.captcha.options.noise_lines.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_lines.description'))
            .setMinValue(0)
            .setMaxValue(20)
        )
        .addIntegerOption(opt =>
            opt.setName('noise_dots')
            .setDescription(localeManager.get('forFunOnly.captcha.options.noise_dots.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_dots.description'))
            .setMinValue(0)
            .setMaxValue(300)
        )
        .addIntegerOption(opt =>
            opt.setName('noise_circles')
            .setDescription(localeManager.get('forFunOnly.captcha.options.noise_circles.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_circles.description'))
            .setMinValue(0)
            .setMaxValue(15)
        )
        .addBooleanOption(opt =>
            opt.setName('curved_lines')
            .setDescription(localeManager.get('forFunOnly.captcha.options.curved_lines.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.curved_lines.description'))
        )
        .addNumberOption(opt =>
            opt.setName('noise_opacity')
            .setDescription(localeManager.get('forFunOnly.captcha.options.noise_opacity.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_opacity.description'))
            .setMinValue(0.1)
            .setMaxValue(1.0)
        )
        // Настройки искажений
        .addBooleanOption(opt =>
            opt.setName('wave_distortion')
            .setDescription(localeManager.get('forFunOnly.captcha.options.wave_distortion.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.wave_distortion.description'))
        )
        .addIntegerOption(opt =>
            opt.setName('wave_amplitude')
            .setDescription(localeManager.get('forFunOnly.captcha.options.wave_amplitude.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.wave_amplitude.description'))
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addNumberOption(opt =>
            opt.setName('wave_frequency')
            .setDescription(localeManager.get('forFunOnly.captcha.options.wave_frequency.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.wave_frequency.description'))
            .setMinValue(0.01)
            .setMaxValue(0.2)
        )
        // Настройки помех
        .addBooleanOption(opt =>
            opt.setName('scratches')
            .setDescription(localeManager.get('forFunOnly.captcha.options.scratches.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.scratches.description'))
        )
        .addIntegerOption(opt =>
            opt.setName('scratch_count')
            .setDescription(localeManager.get('forFunOnly.captcha.options.scratch_count.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.scratch_count.description'))
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addBooleanOption(opt =>
            opt.setName('grid_interference')
            .setDescription(localeManager.get('forFunOnly.captcha.options.grid_interference.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.grid_interference.description'))
        )
        .addBooleanOption(opt =>
            opt.setName('overlay_interference')
            .setDescription(localeManager.get('forFunOnly.captcha.options.overlay_interference.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.overlay_interference.description'))
        ),

    async execute(interaction) {
        const lang = interaction.guildLocale || 'ru';
        if (!privateAccess.includes(interaction.user.id)) {
            return await interaction.reply({ 
                content: localeManager.get('forFunOnly.captcha.messages.no_access', lang), 
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // Получение базовых параметров
        const captchaLength = interaction.options.getInteger('length') || 6;
        const width = interaction.options.getInteger('width') || 200;
        const height = interaction.options.getInteger('height') || 80;
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

            const successMsg = localeManager.get('forFunOnly.captcha.messages.success', lang, { code: captcha.text });

            if (invisible) {
                await interaction.editReply({ 
                    content: successMsg, 
                    flags: MessageFlags.Ephemeral, 
                    files: [{
                        attachment: captcha.data,
                        name: 'captcha.png'
                    }]
                });
            } else {
                await interaction.editReply({ 
                    content: successMsg, 
                    flags: MessageFlags.Ephemeral 
                });
                await interaction.followUp({ 
                    content: localeManager.get('forFunOnly.captcha.messages.solve_everyone', lang), 
                    files: [{
                        attachment: captcha.data,
                        name: 'captcha.png'
                    }]
                });
            }

        } catch (error) {
            console.error('Ошибка при генерации CAPTCHA:', error);
            await interaction.editReply({ 
                content: localeManager.get('events.errors.generic_error', lang), 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};