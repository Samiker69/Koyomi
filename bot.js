const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes, Partials  } = require('discord.js');

const ApikeyManager = require('./lib/ApikeyManager/ApikeyManager')
const loadApiKeys = require('./functions/loadKeysFromEnv');
require('dotenv').config();

if (!process.env.token) return console.error(`[ERROR]: Переменная token в .env отсутсвтует!`);
if (!process.env.clientId) return console.error(`[ERROR]: Переменная clientId в .env отсутсвтует!`);
const keys = [];
const allKeys = loadApiKeys();
if (allKeys?.error) console.warn("[WARN]: "+allKeys.error);
else allKeys.forEach(key => {
	keys.push({key, timeoutDuration: 60_000});
});

if (!fs.existsSync('./database')) {
	fs.mkdirSync('./database')
	console.log('[INFO]: Папка database создана')
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessageReactions
	],
	partials: [Partials.Message, Partials.Reaction],
	allowedMentions: { 
		parse: ['users', 'roles'] 
	}
});

if (keys.length > 0) {
	try {
		client.keyManager = new ApikeyManager(keys);
		console.log(`[INFO]: Loaded ${keys.length} Gemini API dev key(s). ApiManager avalible at client.keyManager`)
	} catch (error) {
		console.error('[ERROR]: Произошла ошибка при загрузке ключей', error)
	}
}

client.lastMessages = new Map();
client.lastChannels = new Map();
client.queues = new Map()
client.cooldowns = new Collection();
client.commands = new Collection();

client.eventscount = 0
client.commandscount = 0
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const commandsForRegister = []; // Для глобальной регистрации

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	if (!fs.statSync(commandsPath).isDirectory()) continue;
	
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commandscount++
			client.commands.set(command.data.name, command);
			commandsForRegister.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsFolserPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventsFolserPath);

for (const folder of eventFolders) {
	const eventsPath = path.join(eventsFolserPath, folder);
	if (!fs.statSync(eventsPath).isDirectory()) continue;
	
	const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
	for (const file of eventsFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		client.eventscount++
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

const servicesFolderPath = path.join(__dirname, 'services');
const serviceFolders = fs.readdirSync(servicesFolderPath);

// Массив для хранения активных сервисов (для graceful shutdown)
client.services = [];
client.servicesCount = 0;

for (const folder of serviceFolders) {
	const servicesPath = path.join(servicesFolderPath, folder);
	if (!fs.statSync(servicesPath).isDirectory()) continue;
	
	const serviceFiles = fs.readdirSync(servicesPath).filter(file => file.endsWith('.js'));
	
	for (const file of serviceFiles) {
		const filePath = path.join(servicesPath, file);
		const service = require(filePath);
		
		client.servicesCount++;
		
		// Валидация структуры сервиса
		if (!service.name || typeof service.execute !== 'function') {
			console.warn(`⚠️ Service ${file} missing required properties (name, execute)`);
			continue;
		}
		
		console.log(`🔧 Loading service: ${service.name}`);
		
		try {
			// Запуск сервиса
			const serviceInstance = {
				name: service.name,
				interval: null,
				isRunning: false,
				stop: function() {
					if (this.interval) {
						clearInterval(this.interval);
						this.interval = null;
						this.isRunning = false;
						console.log(`🛑 Service ${this.name} stopped`);
					}
				}
			};
			
			// Если есть интервал, запускаем циклически
			if (service.interval && service.interval > 0) {
				serviceInstance.interval = setInterval(() => {
					try {
						service.execute(client);
					} catch (error) {
						console.error(`❌ Error in service ${service.name}:`, error);
					}
				}, service.interval);
				serviceInstance.isRunning = true;
			}
			
			// Если есть флаг immediate, выполняем сразу
			if (service.immediate) {
				try {
					service.execute(client);
				} catch (error) {
					console.error(`❌ Error in immediate service ${service.name}:`, error);
				}
			}
			
			client.services.push(serviceInstance);
			console.log(`✅ Service ${service.name} loaded successfully`);
			
		} catch (error) {
			console.error(`❌ Failed to load service ${service.name}:`, error);
		}
	}
}

console.log(`🔧 Loaded ${client.servicesCount} services`);

const BotIPCServer = require('./bot-ipc-server');

// После успешного логина бота
client.once('ready', async () => {
    const rest = new REST().setToken(process.env.token);

    try {
        console.log(`[INFO] Регистрация ${commandsForRegister.length} глобальных слэш-команд...`);
        await rest.put(
            Routes.applicationCommands(process.env.clientId),
            { body: commandsForRegister }
        );
        console.log('[INFO] Глобальные слэш-команды успешно зарегистрированы.');
    } catch (error) {
        console.error('[ERROR] Ошибка при регистрации команд:', error);
    }

    // Запуск WebSocket сервера для связи с админ-панелью
    try {
        // Можно изменить порт через переменную окружения или оставить по умолчанию 8765
        const wsPort = process.env.WS_PORT || 8765;
        const ipcServer = new BotIPCServer(client, wsPort);
        ipcServer.start();
        
        // Сохраняем ссылку для корректного завершения
        client.ipcServer = ipcServer;
        
        // Обработка сигналов для корректного завершения
        process.on('SIGINT', () => {
            console.log('\n[INFO] Получен сигнал SIGINT, завершение работы...');
            ipcServer.stop();
            client.destroy();
            client.services.forEach(service => service.stop());
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n[INFO] Получен сигнал SIGTERM, завершение работы...');
            ipcServer.stop();
            client.destroy();
            client.services.forEach(service => service.stop());
            process.exit(0);
        });
        
    } catch (error) {
        console.error('[ERROR] Ошибка запуска WebSocket сервера:', error);
    }
});

client.login(process.env.token);