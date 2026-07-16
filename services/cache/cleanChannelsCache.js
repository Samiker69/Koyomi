const CacheService = require('../CacheService');

module.exports = {
    name: 'channels-cache-cleanup',
    interval: 12 * 60 * 60 * 1000,
    immediate: false,
    execute(client) {
        console.log('🧹 Cleaning up channels cache...');
        const cutoff = Date.now() - (6 * 60 * 60 * 1000);
        CacheService.pruneChannels(cutoff);
    }
};