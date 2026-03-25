import { config } from 'dotenv';
import path from 'path';
import { setGlobalDispatcher, ProxyAgent  } from 'undici'; 
import { BaseBot } from './core/BaseBot';
import { CommandHandler } from './core/handlers/commandHandler';
import { EventHandler } from './core/handlers/eventHandler';
import { CommandDeployer } from './core/utils/deploycommands';
config({
    path: "../.env"
})

if (process.env.PROXY) {//самикер хас нетворк иссуе. игноре ит
    const proxyAgent = new ProxyAgent(process.env.PROXY);
    setGlobalDispatcher(proxyAgent);
}

if (!process.env.TOKEN || process.env.TOKEN.length < 20) throw new Error("Invalid token");

async function bootstrap() {
    const client = new BaseBot();
    const cd = new CommandDeployer();

    const commandsPath = path.join(__dirname, 'commands');
    const eventsPath = path.join(__dirname, 'events');

    await EventHandler.load(client, eventsPath);
    await CommandHandler.load(client, commandsPath);
    
    await cd.deploy(client.commands);
    await client.login(process.env.TOKEN);
}

bootstrap().catch(console.error);