const fs = require('node:fs');

async function ChangeSettings(setting, value) {
    const data = fs.readFileSync('data.json', 'utf8');
    const jsonData = JSON.parse(data);

    jsonData[setting] = value;

    fs.writeFileSync('settings.json', JSON.stringify(jsonData, null, 4));
    return;
}

module.exports = {
    ChangeSettings
}