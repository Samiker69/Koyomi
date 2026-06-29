const fs = require('fs');
const path = require('path');

class KeyRotator {
    constructor(keysSource, fallbackType = 'main') {
        this.apiKeys = {};
        this.fallbackType = fallbackType;

        if (typeof keysSource === 'string') {
            this.keysPath = keysSource;
            this.loadApiKeysFromFile();
        } else if (Array.isArray(keysSource)) {
            this.loadApiKeysFromArray(keysSource);
        }
        console.info(`[KeyRotator] Loaded ${Object.values(this.apiKeys).flatMap(items => items).length} keys`);

        this.resetInterval = setInterval(() => this.resetUsageCounters(), 60 * 1000);
    }

    loadApiKeysFromFile() {
        const resolvedPath = path.resolve(this.keysPath);
        if (!fs.existsSync(resolvedPath)) {
            console.warn(`[KeyRotator] Keys file not found at ${resolvedPath}`);
            return;
        }
        const content = fs.readFileSync(resolvedPath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            if (trimmed.includes('=')) {
                const [type, key] = trimmed.split('=');
                if (type && key) {
                    this.addKey(type.trim(), key.trim());
                }
            } else if (trimmed.includes('|')) {
                const parts = trimmed.split('|');
                this.addKey(this.fallbackType, parts[0].trim());
            } else {
                this.addKey(this.fallbackType, trimmed);
            }
        }
    }

    loadApiKeysFromArray(keysArray) {
        for (const item of keysArray) {
            if (typeof item === 'string') {
                this.addKey(this.fallbackType, item);
            } else if (item && typeof item === 'object') {
                const key = item.key || item.token;
                const type = item.type || this.fallbackType;
                if (key) {
                    this.addKey(type, key);
                }
            }
        }
    }

    addKey(type, key) {
        if (!this.apiKeys[type]) {
            this.apiKeys[type] = [];
        }
        if (!this.apiKeys[type].some(record => record.key === key)) {
            this.apiKeys[type].push({ key, usageCount: 0 });
        }
    }

    resetUsageCounters() {
        for (const type in this.apiKeys) {
            for (const record of this.apiKeys[type]) {
                record.usageCount = 0;
            }
        }
    }

    getApiKey(type = 'main') {
        const keys = this.apiKeys[type] || this.apiKeys[this.fallbackType];
        if (!keys || keys.length === 0) {
            throw new Error(`API Key for [${type}] not found`);
        }
        if (keys.length === 1) {
            keys[0].usageCount++;
            return keys[0].key;
        }

        let totalWeight = 0;
        const weights = keys.map(k => {
            const weight = 1 / (k.usageCount + 1);
            totalWeight += weight;
            return weight;
        });

        let randomValue = Math.random() * totalWeight;
        let selectedIndex = 0;
        for (let i = 0; i < weights.length; i++) {
            randomValue -= weights[i];
            if (randomValue <= 0) {
                selectedIndex = i;
                break;
            }
        }

        const selectedKeyRecord = keys[selectedIndex];
        selectedKeyRecord.usageCount++;
        console.log(`[KeyRotator] Used ${type} key (Index: ${selectedIndex}, Total Uses this min: ${selectedKeyRecord.usageCount})`);
        return selectedKeyRecord.key;
    }

    async call(apiFn, type = 'main') {
        let key;
        try {
            key = this.getApiKey(type);
        } catch (err) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.call(apiFn, type);
        }
        try {
            return await apiFn(key);
        } catch (err) {
            const keysList = this.apiKeys[type] || this.apiKeys[this.fallbackType] || [];
            const record = keysList.find(k => k.key === key);
            if (record) {
                record.usageCount += 5; // Временное пенальти для снижения приоритета ключа при ошибке
            }
            if (err.rateLimited) {
                return this.call(apiFn, type);
            }
            throw err;
        }
    }

    destroy() {
        if (this.resetInterval) {
            clearInterval(this.resetInterval);
        }
    }
}

module.exports = KeyRotator;