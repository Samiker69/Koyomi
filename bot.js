require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const BaseBot = require('./core/BaseBot');
const CommandHandler = require('./core/handlers/commandHandler');
const EventHandler = require('./core/handlers/eventHandler');
const ServiceHandler = require('./core/handlers/serviceHandler');
const CommandDeployer = require('./core/utils/deployCommands');
const KeyRotator = require('./lib/KeyRotator/KeyRotator');
const DatabaseService = require('./services/DatabaseService');

function setupApiKeys(client) {
    var kr = new KeyRotator('keys.txt');
    client.keyManager = kr;
}

async function bootstrap() {
    await DatabaseService.init();
    const client = new BaseBot();
    const commandsPath = path.join(__dirname, 'commands');
    const eventsPath = path.join(__dirname, 'events');
    const servicesPath = path.join(__dirname, 'services');
    CommandHandler.load(client, commandsPath);
    EventHandler.load(client, eventsPath);
    if (fs.existsSync(servicesPath)) {
        ServiceHandler.load(client, servicesPath);
    }
    const deployer = new CommandDeployer();
    await deployer.deploy(client.commands);
    await client.login(process.env.token || process.env.TOKEN);
}

bootstrap().catch(error => {
    console.error('[FATAL ERROR]:', error);
    process.exit(1)
});