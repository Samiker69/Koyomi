const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes, Partials  } = require('discord.js');
const ModerationDB = require('./functions/db/case');
const settings = require('./functions/db/settings');
const TagsDB = require('./functions/db/tags');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

if (!process.env.token) return console.error(`[ERROR]: Переменная token в .env отсутсвтует!`);
if (!process.env.clientId) return console.error(`[ERROR]: Переменная clientId в .env отсутсвтует!`);
if (!process.env.gemini_api_key) console.warn('[WARNING]: Переменная gemini_api_key в .env отсутсвтует. Функционал AI будет недоступен.\nНет ключа? Получите его: https://aistudio.google.com/apikey')

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
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildModeration
	],
	partials: [Partials.Message, Partials.Reaction, Partials.Channel],
	allowedMentions: { 
		parse: ['users', 'roles'] 
	}
});

if (process.env.gemini_api_key) {
	try {
		client.gemini = new GoogleGenAI({ apiKey: process.env.gemini_api_key });
		console.log('[INFO]: Gemini интегрирован в client.gemini')
	} catch (error) {
		console.error('[ERROR]: Произошла ошибка при инициализации gemini:', error)
	}

}

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

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	client.eventscount++
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

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
});

client.login(process.env.token);