module.exports = {
	name: 'message-cache-cleanup',
	interval: 60 * 60 * 1000,
	immediate: false,
	execute(client) {
		console.log('🧹 Cleaning up message cache...');
		
		const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 часа
		
		for (const [channelId, messages] of client.lastMessages) {
			const filtered = messages.filter(msg => msg.timestamp > cutoff);
			
			if (filtered.length === 0) {
				client.lastMessages.delete(channelId);
			} else {
				client.lastMessages.set(channelId, filtered);
			}
		}
		
		console.log(`🧹 Cache cleanup complete. Active channels: ${client.lastMessages.size}`);
	}
};