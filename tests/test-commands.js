require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const DatabaseService = require('../services/DatabaseService');

function createMockInteraction(command, optionsData = {}) {
    const cmdName = command.data.name;
    
    let firstSubcommand = null;
    let firstSubcommandGroup = null;

    if (typeof command.data.toJSON === 'function') {
        const cmdJson = command.data.toJSON();
        if (cmdJson.options) {
            const group = cmdJson.options.find(o => o.type === 2);
            if (group) {
                firstSubcommandGroup = group.name;
                const sub = group.options?.find(o => o.type === 1);
                if (sub) firstSubcommand = sub.name;
            } else {
                const sub = cmdJson.options.find(o => o.type === 1);
                if (sub) firstSubcommand = sub.name;
            }
        }
    }

    // 1. Реальный мок client.user
    const mockClientUser = {
        id: "1312124121978765393",
        bot: true,
        system: false,
        username: "Koyomi",
        tag: "Koyomi#0638",
        displayAvatarURL: () => "https://cdn.discordapp.com/avatars/1312124121978765393/f20095c76dfc7fa8bfc4547e635e1f7d.webp",
        avatarURL: () => "https://cdn.discordapp.com/avatars/1312124121978765393/f20095c76dfc7fa8bfc4547e635e1f7d.webp"
    };

    // 2. Мок пользователя, который вызывает команду
    const mockUser = { 
        id: '691246997646213131', // ID из твоего дампа (owner)
        username: 'TestUser', 
        tag: 'TestUser#1234',
        bot: false,
        displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/0.png' 
    };

    // 3. Мок GuildMember (участник сервера)
    const mockGuildMember = {
        id: mockUser.id,
        user: mockUser,
        displayName: 'TestUser',
        guildId: "1264316836414226464",
        roles: { 
            cache: new Map([
                ['1264316836414226464', { id: '1264316836414226464', name: '@everyone' }]
            ])
        },
        permissions: { has: () => true }, // Даем права
        displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/0.png'
    };

    // 4. Реальный мок сервера (Guild)
    const mockGuild = { 
        id: "1264316836414226464",
        name: "Dev server",
        ownerId: "691246997646213131",
        memberCount: 11,
        premiumTier: 0,
        preferredLocale: 'ru',
        iconURL: () => "https://cdn.discordapp.com/icons/1264316836414226464/3bff75199c5f8af539b983c28404b12c.webp",
        members: {
            fetch: async () => mockGuildMember,
            cache: new Map([[mockUser.id, mockGuildMember]]),
            me: {
                ...mockGuildMember,
                id: mockClientUser.id,
                user: mockClientUser,
                displayName: 'Koyomi'
            }
        },
        roles: {
            cache: new Map([
                ['1264316836414226464', { id: '1264316836414226464', name: '@everyone', position: 0 }],
                ['1264317115620393123', { id: '1264317115620393123', name: 'Admin', position: 10 }]
            ])
        },
        channels: {
            cache: new Map([
                ['1264316836959223904', { id: '1264316836959223904', name: 'general', isTextBased: () => true, send: async() => true }]
            ])
        }
    };

    const mockMessage = {
        id: '111122223333444455',
        createdTimestamp: Date.now(),
        content: 'Mocked Message',
        edit: async () => mockMessage,
        delete: async () => true,
        react: async () => true
    };

    return {
        // Заглушка Discord Client
        client: {
            user: mockClientUser,
            helpCategoriesMap: { "general": [] },
            guilds: { cache: new Map([[mockGuild.id, mockGuild]]) },
            users: { 
                cache: new Map([
                    [mockUser.id, mockUser], 
                    [mockClientUser.id, mockClientUser]
                ]),
                fetch: async () => mockUser
            }
        },
        
        commandName: cmdName,
        isCommand: () => true,
        isChatInputCommand: () => true,
        guildId: mockGuild.id,
        guildLocale: 'ru',
        
        guild: mockGuild,
        user: mockUser,
        member: mockGuildMember,
        memberPermissions: mockGuildMember.permissions,

        channel: { 
            id: '1264316836959223904', 
            name: 'general',
            send: async () => mockMessage 
        },
        
        deferred: false,
        replied: false,
        deferReply: async function() { this.deferred = true; return mockMessage; },
        reply: async function() { this.replied = true; return mockMessage; },
        editReply: async function() { return mockMessage; },
        followUp: async function() { return mockMessage; },
        deleteReply: async function() { return true; },

        options: {
            getSubcommand: () => firstSubcommand || 'default_sub',
            getSubcommandGroup: () => firstSubcommandGroup,
            getString: (name) => optionsData[name] !== undefined ? String(optionsData[name]) : 'test_string',
            getInteger: (name) => optionsData[name] !== undefined ? Number(optionsData[name]) : 1,
            getNumber: (name) => optionsData[name] !== undefined ? Number(optionsData[name]) : 1.0,
            getBoolean: (name) => optionsData[name] !== undefined ? Boolean(optionsData[name]) : true,
            getUser: (name) => mockUser,
            getMember: (name) => mockGuildMember,
            getChannel: (name) => mockGuild.channels.cache.get('1264316836959223904'),
            getRole: (name) => mockGuild.roles.cache.get('1264317115620393123'),
            getAttachment: (name) => null
        }
    };
}

async function runTests() {
    console.log('Подключение к тестовой БД...');
    await DatabaseService.init();

    const commandsPath = path.join(__dirname, '../', 'commands');
    const commandFiles = getAllFiles(commandsPath).filter(file => file.endsWith('.js'));

    console.log(`Найдено команд для тестирования: ${commandFiles.length}\n`);

    for (const file of commandFiles) {
        const command = require(file);
        
        if (!command.data || !command.execute) continue;

        const cmdName = command.data.name;
        const interaction = createMockInteraction(command);

        try {
            await command.execute(interaction);
            console.log(`✅ [OK] Команда /${cmdName}`);
        } catch (error) {
            console.error(`❌ [FAIL] Команда /${cmdName}:`);
            console.error(error.stack || error);
        }
    }

    console.log('\n🎉 Тестирование команд на падения завершено.');
    process.exit(0);
}

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

runTests();``