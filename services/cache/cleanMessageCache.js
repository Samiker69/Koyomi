const CacheService = require('../CacheService');

module.exports = {
    name: 'message-cache-cleanup',
    interval: 60 * 60 * 1000,
    immediate: false,
    execute(client) {
        console.log('🧹 Cleaning up message cache...');
        const cutoff = Date.now() - (24 * 60 * 60 * 1000);
        CacheService.pruneMessages(cutoff);
    }
};