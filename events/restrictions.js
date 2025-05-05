const fs = require('node:fs');
const path = require('node:path');

const dataPath = path.join(__dirname, 'disabledCommands.json');
let disabledCommands = {}; // Формат: { "guildId": ["commandName1", "commandName2"], ... }

try {
    if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        if (data) {
            disabledCommands = JSON.parse(data);
        } else {
             disabledCommands = {};
        }
        console.log('[Restrictions] Loaded restrictions from disabledCommands.json');
    } else {
        console.log('[Restrictions] disabledCommands.json not found, starting with empty restrictions.');
    }
} catch (error) {
    console.error('[Restrictions] Error loading restrictions:', error);
    disabledCommands = {};
}

const saveRestrictions = () => {
    try {
        const dataToSave = JSON.stringify(disabledCommands, null, 2);
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dataPath, dataToSave, 'utf8');
    } catch (error) {
    }
};

const isCommandDisabled = (guildId, commandName) => {
    if (!guildId || !commandName) {
        return false;
    }
    return disabledCommands[guildId] && disabledCommands[guildId].includes(commandName);
};

const disableCommandForGuild = (guildId, commandName) => {
    if (!guildId || !commandName) {
        return false;
    }
    if (!disabledCommands[guildId]) {
        disabledCommands[guildId] = [];
    }
    if (disabledCommands[guildId].includes(commandName)) {
        return false;
    }
    disabledCommands[guildId].push(commandName);
    saveRestrictions();
    return true;
};

const enableCommandForGuild = (guildId, commandName) => {
    if (!guildId || !commandName) {
        return false;
    }
    if (disabledCommands[guildId]) {
        const initialLength = disabledCommands[guildId].length;
        disabledCommands[guildId] = disabledCommands[guildId].filter(cmd => cmd !== commandName);

        if (disabledCommands[guildId].length < initialLength) {
             if (disabledCommands[guildId].length === 0) {
                 delete disabledCommands[guildId];
             }
             saveRestrictions();
             return true;
        }
    }
    return false;
};

const getDisabledCommandsForGuild = (guildId) => {
     if (!guildId || !disabledCommands[guildId]) {
         return [];
     }
     return [...disabledCommands[guildId]];
};

module.exports = {
    isCommandDisabled,
    disableCommandForGuild,
    enableCommandForGuild,
    getDisabledCommandsForGuild,
};