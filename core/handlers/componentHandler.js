const fs = require('fs');
const path = require('path');
class ComponentHandler {
    constructor() {
        this.components = new Map();
        this.components.set('buttons', []);
        this.components.set('modals', []);
        this.components.set('selects', []);
    }
    load(dirToSearch) {
        const scan = (currentDir, type) => {
            if (!fs.existsSync(currentDir)) return;
            const files = fs.readdirSync(currentDir);
            for (const file of files) {
                const fullPath = path.join(currentDir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    scan(fullPath, type);
                } else if (file.endsWith('.js')) {
                    const component = require(fullPath);
                    this.components.get(type).push(component);
                }
            }
        };
        scan(path.join(dirToSearch, 'buttons'), 'buttons');
        scan(path.join(dirToSearch, 'modals'), 'modals');
        scan(path.join(dirToSearch, 'selects'), 'selects');
    }
    async handle(interaction) {
        let type;
        if (interaction.isButton()) type = 'buttons';
        else if (interaction.isModalSubmit()) type = 'modals';
        else if (interaction.isStringSelectMenu() || interaction.isChannelSelectMenu()) type = 'selects';
        else return;
        const customId = interaction.customId;
        const registry = this.components.get(type);
        const target = registry.find(comp => {
            if (typeof comp.match === 'function') return comp.match(customId);
            if (comp.id) return comp.id === customId;
            if (comp.prefix) return customId.startsWith(comp.prefix);
            return false;
        });
        if (target) {
            await target.execute(interaction);
        }
    }
}
module.exports = new ComponentHandler();