require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const DatabaseService = require('../services/DatabaseService');
const { Collection } = require('discord.js'); // Лучше использовать реальную Collection из discord.js

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

    // Вспомогательная функция для создания мок-коллекции (так как в Discord.js Map имеет доп. методы типа .filter)
    const createMockCollection = (entries) => {
        const map = new Map(entries);
        map.filter = (fn) => {
            const result = new Map();
            for (const [k, v] of map) if (fn(v, k, map)) result.set(k, v);
            return result;
        };
        return map;
    };

    // Мок сообщения
    const mockMessage = {
        id: '111122223333444455',
        createdTimestamp: Date.now(),
        content: 'Mocked Message',
        edit: async () => mockMessage,
        delete: async () => true,
        react: async () => true,
        // Исправление для /settings (collector)
        createMessageComponentCollector: () => ({
            on: () => {},
            stop: () => {}
        })
    };

    // Мок канала
    const mockChannel = { 
        id: '1264316836959223904', 
        name: 'general', 
        isTextBased: () => true, 
        send: async() => mockMessage,
        // Исправление для clear команды
        messages: {
            fetch: async () => createMockCollection()
        }
    };

    // Мок клиента
    const mockClientUser = {
        id: "1312124121978765393",
        bot: true,
        system: false,
        username: "Koyomi",
        tag: "Koyomi#0638",
        presence: { status: 'online', name: 'Testing' },
        displayAvatarURL: () => "https://cdn.discordapp.com/avatars/1312124121978765393/f20095c76dfc7fa8bfc4547e635e1f7d.webp",
        avatarURL: () => "https://cdn.discordapp.com/avatars/1312124121978765393/f20095c76dfc7fa8bfc4547e635e1f7d.webp",
        // Исправление для /eval
        setPresence: async () => true 
    };

    // Мок пользователя
    const mockUser = { 
        id: '691246997646213131', 
        username: 'TestUser', 
        tag: 'TestUser#1234',
        bot: false,
        // Исправление для /info
        createdAt: new Date(), 
        displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/0.png' 
    };

    // Мок роли
    const mockRole = { 
        id: '1264317115620393123', 
        name: 'Admin', 
        position: 10,
        editable: true,
        // Исправление для /role
        comparePositionTo: () => 1 
    };

    const mockEveryoneRole = { 
        id: '1264316836414226464', 
        name: '@everyone', 
        position: 0,
        editable: false,
        comparePositionTo: () => -1 
    };

    // Мок Member
    const mockGuildMember = {
        id: mockUser.id,
        user: mockUser,
        displayName: 'TestUser',
        guildId: "1264316836414226464",
        roles: { 
            cache: createMockCollection([
                ['1264316836414226464', mockEveryoneRole],
                ['1264317115620393123', mockRole]
            ]),
            highest: mockRole
        },
        permissions: { has: () => true }, 
        displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/0.png',
        // Исправление для /room и /user
        voice: {
            channel: mockChannel,
            selfDeaf: false,
            selfMute: false
        }
    };

    // Мок сервера (Guild)
    const mockGuild = { 
        id: "1264316836414226464",
        name: "Dev server",
        ownerId: "691246997646213131",
        memberCount: 11,
        premiumTier: 0,
        preferredLocale: 'ru',
        iconURL: () => "https://cdn.discordapp.com/icons/1264316836414226464/3bff75199c5f8af539b983c28404b12c.webp",
        // Исправление для /guild
        disableInvites: async () => true,
        members: {
            fetch: async () => mockGuildMember,
            cache: createMockCollection([[mockUser.id, mockGuildMember]]),
            me: {
                ...mockGuildMember,
                id: mockClientUser.id,
                user: mockClientUser,
                displayName: 'Koyomi'
            }
        },
        roles: {
            cache: createMockCollection([
                ['1264316836414226464', mockEveryoneRole],
                ['1264317115620393123', mockRole]
            ])
        },
        channels: {
            cache: createMockCollection([
                ['1264316836959223904', mockChannel]
            ])
        },
        // Исправление для /automod
        autoModerationRules: {
            fetch: async () => createMockCollection()
        }
    };

    return {
        // Исправления для Client
        client: {
            user: mockClientUser,
            helpCategoriesMap: { "general": [] },
            guilds: { cache: createMockCollection([[mockGuild.id, mockGuild]]) },
            users: { 
                cache: createMockCollection([
                    [mockUser.id, mockUser], 
                    [mockClientUser.id, mockClientUser]
                ]),
                fetch: async () => mockUser
            },
            channels: {
                // Исправление для /guild и /eval
                fetch: async () => mockChannel
            },
            commands: {
                // Исправление для /restrict и /help
                has: () => true,
                values: () => []
            },
            ws: {
                // Исправление для /botstatus
                ping: 42 
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
        channel: mockChannel,
        
        deferred: false,
        replied: false,
        deferReply: async function() { this.deferred = true; return mockMessage; },
        reply: async function() { this.replied = true; return mockMessage; },
        editReply: async function() { return mockMessage; },
        followUp: async function() { return mockMessage; },
        deleteReply: async function() { return true; },
        // Исправление для /2048 и /guessthenumber
        fetchReply: async function() { return mockMessage; },

        options: {
            getSubcommand: () => firstSubcommand || 'default_sub',
            getSubcommandGroup: () => firstSubcommandGroup,
            getString: (name) => {
                if (optionsData[name] !== undefined) return String(optionsData[name]);
                // Исправление для shapeshift /report: если просит url/link, возвращаем валидный url
                if (name.toLowerCase().includes('url') || name.toLowerCase().includes('link')) return 'https://example.com/image.png';
                return 'test_string';
            },
            getInteger: (name) => optionsData[name] !== undefined ? Number(optionsData[name]) : 1,
            getNumber: (name) => optionsData[name] !== undefined ? Number(optionsData[name]) : 1.0,
            getBoolean: (name) => optionsData[name] !== undefined ? Boolean(optionsData[name]) : true,
            getUser: (name) => mockUser,
            getMember: (name) => mockGuildMember,
            getChannel: (name) => mockChannel,
            getRole: (name) => mockRole,
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