module.exports = {
	name: 'message-cache-cleanup',
	interval: 12 * 60 * 60 * 1000,
	immediate: false,
	execute(client) {
		console.log('🧹 Cleaning up channels cache...');

        const cutoff = Date.now() - (6 * 60 * 60 * 1000);

		for (const [guildId, channels] of client.lastChannels) {
			const filtered = channels.filter(channel => channel.lastMessage.createdTimestamp > cutoff);
			
			if (filtered.length === 0) {
				client.lastChannels.delete(guildId);
			} else {
				client.lastChannels.set(guildId, filtered);
			}
		}
		
		console.log(`🧹 Cache cleanup complete. Active servers: ${client.lastChannels.size}`);
	}
};