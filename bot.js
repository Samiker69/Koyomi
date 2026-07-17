require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const BaseBot = require('./core/BaseBot');
const CommandHandler = require('./core/handlers/commandHandler');
const EventHandler = require('./core/handlers/eventHandler');
const ServiceHandler = require('./core/handlers/serviceHandler');
const CommandDeployer = require('./core/utils/deployCommands');
const DatabaseConnection = require('./database/connection');
const componentHandler = require('./core/handlers/componentHandler');
async function bootstrap() {
    await DatabaseConnection.init();
    const client = new BaseBot();
    const commandsPath = path.join(__dirname, 'commands');
    const eventsPath = path.join(__dirname, 'events');
    const servicesPath = path.join(__dirname, 'services');
    const componentsPath = path.join(__dirname, 'components');
    CommandHandler.load(client, commandsPath);
    EventHandler.load(client, eventsPath);
    componentHandler.load(componentsPath);
    if (fs.existsSync(servicesPath)) {
        ServiceHandler.load(client, servicesPath);
    }
    const deployer = new CommandDeployer();
    await deployer.deploy(client.commands);
    await client.login(process.env.token || process.env.TOKEN);
}
bootstrap().catch(error => {
    console.error('[FATAL ERROR]:', error);
    process.exit(1);
});