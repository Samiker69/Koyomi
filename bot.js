const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const ModerationDB = require('./functions/db/case');
require('dotenv').config();

if (!process.env.token) return console.error(`[ERROR]: Переменная token в .env отсутсвтует!`);
if (!process.env.clientId) return console.error(`[ERROR]: Переменная clientId в .env отсутсвтует!`);

if (!fs.existsSync('./database')) {
	fs.mkdirSync('./database')
}
const {close} = new ModerationDB('./database/cases.db')
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
	],
});

client.cooldowns = new Collection();
client.commands = new Collection();

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
process.on('SIGINT', () => {
    close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    close();
    process.exit(0);
});