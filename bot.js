require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

const BaseBot = require('./core/BaseBot');
const CommandHandler = require('./core/handlers/commandHandler');
const EventHandler = require('./core/handlers/eventHandler');
const ServiceHandler = require('./core/handlers/serviceHandler');
const CommandDeployer = require('./core/utils/deployCommands');

// Импорт специфичных модулей
const ApikeyManager = require('./lib/ApikeyManager/ApikeyManager');
const loadApiKeys = require('./utils/loadKeysFromEnv');
const BotIPCServer = require('./bot-ipc-server');
const DatabaseService = require('./services/DatabaseService');

function setupApiKeys(client) {
    const keys = [];
    const allKeys = loadApiKeys();
    if (allKeys?.error) {
        console.warn("[WARN]: " + allKeys.error);
    } else {
        allKeys.forEach(key => keys.push({ key, timeoutDuration: 60_000 }));
    }

    if (keys.length > 0) {
        try {
            client.keyManager = new ApikeyManager(keys);
            console.log(`[INFO]: Loaded ${keys.length} Gemini API dev key(s).`);
        } catch (error) {
            console.error('[ERROR]: Ошибка при загрузке ключей', error);
        }
    }
}

function setupIPCServerAndGracefulShutdown(client) {
    const wsPort = process.env.WS_PORT || 8765;
    const ipcServer = new BotIPCServer(client, wsPort);
    ipcServer.start();
    client.ipcServer = ipcServer;

    const shutdown = () => {
        console.log('\n[INFO] Получен сигнал завершения работы...');
        if (client.ipcServer) client.ipcServer.stop();
        client.services.forEach(service => service.stop());
        client.destroy();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
// -----------------------------------------------------------------

async function bootstrap() {
    await DatabaseService.init();

    const client = new BaseBot();
    setupApiKeys(client);

    const commandsPath = path.join(__dirname, 'commands');
    const eventsPath = path.join(__dirname, 'events');
    const servicesPath = path.join(__dirname, 'services');

    // 1. Загрузка компонентов
    CommandHandler.load(client, commandsPath);
    EventHandler.load(client, eventsPath);
    
    if (fs.existsSync(servicesPath)) {
        ServiceHandler.load(client, servicesPath);
    }
    const deployer = new CommandDeployer();
    await deployer.deploy(client.commands);

    // 3. Запуск IPC Сервера (WebSocket для админки)
    setupIPCServerAndGracefulShutdown(client);
    await client.login(process.env.token || process.env.TOKEN);
}

bootstrap().catch(error => {
    console.error('[FATAL ERROR]:', error);
    process.exit(1)
});