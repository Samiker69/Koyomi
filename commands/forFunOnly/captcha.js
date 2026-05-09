const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const localeManager = require('../../locales/localeManager');
const { generateCaptcha } = require('../../functions/createCaptcha');
const { privateAccess } = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(localeManager.get('forFunOnly.captcha.name'))
        .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.name', 'name'))
        .setDescription(localeManager.get('forFunOnly.captcha.description'))
        .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.description'))
        .setContexts(0,1,2)
        .addBooleanOption(opt => 
            opt.setName(localeManager.get('forFunOnly.captcha.options.invisible.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.invisible.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.invisible.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.invisible.description'))
        )
        // Базовые настройки
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.length.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.length.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.length.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.length.description'))
            .setMinValue(1)
            .setMaxValue(12)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.width.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.width.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.width.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.width.description'))
            .setMinValue(150)
            .setMaxValue(400)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.height.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.height.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.height.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.height.description'))
            .setMinValue(50)
            .setMaxValue(200)
        )
        // Настройки текста
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.min_font_size.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.min_font_size.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.min_font_size.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.min_font_size.description'))
            .setMinValue(10)
            .setMaxValue(50)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.max_font_size.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.max_font_size.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.max_font_size.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.max_font_size.description'))
            .setMinValue(15)
            .setMaxValue(60)
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.max_rotation.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.max_rotation.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.max_rotation.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.max_rotation.description'))
            .setMinValue(0.1)
            .setMaxValue(2.0)
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.max_skew.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.max_skew.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.max_skew.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.max_skew.description'))
            .setMinValue(0.1)
            .setMaxValue(1.0)
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.text_outline.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.text_outline.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.text_outline.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.text_outline.description'))
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.random_colors.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.random_colors.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.random_colors.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.random_colors.description'))
        )
        // Настройки фона
        .addBooleanOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.gradient_bg.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.gradient_bg.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.gradient_bg.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.gradient_bg.description'))
        )
        .addStringOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.gradient_type.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.gradient_type.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.gradient_type.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.gradient_type.description'))
            .addChoices(
                { name: localeManager.get('forFunOnly.captcha.options.gradient_type.choices.linear'), value: 'linear' },
                { name: localeManager.get('forFunOnly.captcha.options.gradient_type.choices.radial'), value: 'radial' }
            )
        )
        // Настройки шума
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.noise_lines.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_lines.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.noise_lines.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_lines.description'))
            .setMinValue(0)
            .setMaxValue(20)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.noise_dots.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_dots.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.noise_dots.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_dots.description'))
            .setMinValue(0)
            .setMaxValue(300)
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.noise_circles.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_circles.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.noise_circles.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_circles.description'))
            .setMinValue(0)
            .setMaxValue(15)
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.curved_lines.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.curved_lines.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.curved_lines.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.curved_lines.description'))
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.noise_opacity.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_opacity.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.noise_opacity.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.noise_opacity.description'))
            .setMinValue(0.1)
            .setMaxValue(1.0)
        )
        // Настройки искажений
        .addBooleanOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.wave_distortion.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.wave_distortion.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.wave_distortion.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.wave_distortion.description'))
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.wave_amplitude.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.wave_amplitude.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.wave_amplitude.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.wave_amplitude.description'))
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addNumberOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.wave_frequency.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.wave_frequency.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.wave_frequency.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.wave_frequency.description'))
            .setMinValue(0.01)
            .setMaxValue(0.2)
        )
        // Настройки помех
        .addBooleanOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.scratches.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.scratches.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.scratches.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.scratches.description'))
        )
        .addIntegerOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.scratch_count.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.scratch_count.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.scratch_count.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.scratch_count.description'))
            .setMinValue(1)
            .setMaxValue(10)
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.grid_interference.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.grid_interference.name', 'name'))
            .setDescription(localeManager.get('forFunOnly.captcha.options.grid_interference.description'))
            .setDescriptionLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.grid_interference.description'))
        )
        .addBooleanOption(opt =>
            opt.setName(localeManager.get('forFunOnly.captcha.options.overlay_interference.name'))
            .setNameLocalizations(localeManager.getLocalizations('forFunOnly.captcha.options.overlay_interference.name', 'name'))
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
        const captchaLength = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.length.name')) || 6;
        const width = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.width.name')) || 200;
        const height = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.height.name')) || 80;
        const invisible = interaction.options.getBoolean(localeManager.get('forFunOnly.captcha.options.invisible.name')) || false;

        // Настройки текста
        const minFontSize = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.min_font_size.name')) || 16;
        const maxFontSize = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.max_font_size.name')) || 32;
        const maxRotation = interaction.options.getNumber(localeManager.get('forFunOnly.captcha.options.max_rotation.name')) || 0.8;
        const maxSkew = interaction.options.getNumber(localeManager.get('forFunOnly.captcha.options.max_skew.name')) || 0.3;
        const textOutline = interaction.options.getBoolean(localeManager.get('forFunOnly.captcha.options.text_outline.name')) || false;
        const randomColors = interaction.options.getBoolean(localeManager.get('forFunOnly.captcha.options.random_colors.name')) ?? true;

        // Настройки фона
        const gradientBg = interaction.options.getBoolean(localeManager.get('forFunOnly.captcha.options.gradient_bg.name')) || false;
        const gradientType = interaction.options.getString(localeManager.get('forFunOnly.captcha.options.gradient_type.name')) || 'linear';

        // Настройки шума
        const noiseLines = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.noise_lines.name')) || 8;
        const noiseDots = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.noise_dots.name')) || 150;
        const noiseCircles = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.noise_circles.name')) || 5;
        const curvedLines = interaction.options.getBoolean(localeManager.get('forFunOnly.captcha.options.curved_lines.name')) ?? true;
        const noiseOpacity = interaction.options.getNumber(localeManager.get('forFunOnly.captcha.options.noise_opacity.name')) || 0.6;

        // Настройки искажений
        const waveDistortion = interaction.options.getBoolean(localeManager.get('forFunOnly.captcha.options.wave_distortion.name')) ?? true;
        const waveAmplitude = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.wave_amplitude.name')) || 3;
        const waveFrequency = interaction.options.getNumber(localeManager.get('forFunOnly.captcha.options.wave_frequency.name')) || 0.05;

        // Настройки помех
        const scratches = interaction.options.getBoolean(localeManager.get('forFunOnly.captcha.options.scratches.name')) ?? true;
        const scratchCount = interaction.options.getInteger(localeManager.get('forFunOnly.captcha.options.scratch_count.name')) || 3;
        const gridInterference = interaction.options.getBoolean(localeManager.get('forFunOnly.captcha.options.grid_interference.name')) || false;
        const overlayInterference = interaction.options.getBoolean(localeManager.get('forFunOnly.captcha.options.overlay_interference.name')) ?? true;

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