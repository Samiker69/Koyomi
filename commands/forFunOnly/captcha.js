const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { forFunOnly } = require('../../locales/descriptions/forFunOnly');
const { generateCaptcha } = require('../../functions/createCaptcha');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('captcha')
        .setDescription("Создаёт капчу")
        .addBooleanOption(opt => 
            opt.setName('invisible')
            .setDescription('Сделать сообщение невидимым?')
        )
        .addIntegerOption(opt =>
            opt.setName("length")
            .setDescription("Кол-во символов")
            .setMinValue(1)
        )
        .addIntegerOption(opt =>
            opt.setName('width')
            .setDescription("Ширина изображения капчи")
            .setMinValue(150)
            .setMaxValue(1080)
        )
        .addIntegerOption(opt =>
            opt.setName('height')
            .setDescription("Высота изображения капчи")
            .setMinValue(50)
            .setMaxValue(720)
        )
        .addIntegerOption(opt =>
            opt.setName('noise_dots')
            .setDescription("Кол-во точек шума")
        )
        .addIntegerOption(opt =>
            opt.setName('noise_lines')
            .setDescription("Кол-во линий")
        ),

    async execute(interaction) {
        if (!privateAccess.includes(interaction.user.id)) return await interaction.reply({ content: `Вы не можете использовать эту команду`, flags: MessageFlags.Ephemeral})

        const captchaLength = interaction.options.getInteger("length");
        const width = interaction.options.getInteger("width") || 150;
        const height = interaction.options.getInteger("height") || 50;
        const noiseDots = interaction.options.getInteger("noise_dots") || 100;
        const noiseLines = interaction.options.getInteger("noise_lines") || 10;
        const invisible = interaction.options.getBoolean('invisible') || false;
        const captcha = await generateCaptcha({
            length: captchaLength || 6,
            outputType: "buffer",
            width,
            height,
            noiseDots,
            noiseLines
        })

        if (invisible) {
            await interaction.reply({ content: `Капча готова! Исходный текст: ${captcha.text}`, flags: MessageFlags.Ephemeral, files: [captcha.data] });
        } else {
            await interaction.reply({ content: `Капча готова! Исходный текст: ${captcha.text}`, flags: MessageFlags.Ephemeral });
            await interaction.channel.send({ content: "Всем решать капчу!!!!", files: [captcha.data] });
        }
        
    }
};
