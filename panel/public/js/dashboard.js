async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('general-stats').innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${stats.totalServers}</div>
                <div>Всего серверов</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalCases}</div>
                <div>Всего кейсов модерации</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalTokens}</div>
                <div>Всего GeminiApi-ключей</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.totalPunishments}</div>
                <div>Всего наказаний</div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('general-stats').innerHTML = '<div>Ошибка загрузки статистики</div>';
    }
}

async function loadServers() {
    try {
        const response = await fetch('/api/guilds');
        const guilds = await response.json();
        
        if (guilds.length === 0) {
            document.getElementById('servers-container').innerHTML = '<div>Серверов не найдено</div>';
            return;
        }
        
        const serversHtml = guilds.map(guild => `
            <div class="server-card" onclick="selectServer('${guild.id}')">
                <div class="server-info">
                    <img src="${guild.iconURL || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="Server Icon" class="server-avatar">
                    <div>
                        <h3>${guild.name}</h3>
                        <p>ID: ${guild.id}</p>
                        <p>Участников: ${guild.memberCount || 'N/A'}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('servers-container').innerHTML = serversHtml;
    } catch (error) {
        console.error('Error loading servers:', error);
        document.getElementById('servers-container').innerHTML = '<div>Ошибка загрузки серверов</div>';
    }
}

function selectServer(serverId) {
    window.location.href = `/server/${serverId}`;
}

// Загружаем данные при загрузке страницы
loadStats();
loadServers();