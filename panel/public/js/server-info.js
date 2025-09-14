const cacheFor = {
    messages: true,
    channels: true
}

/**
 * Закрывает все открытые модальные окна
 */
function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
}

/**
 * Главная функция для открытия модальных окон
 * @param {string} type - Тип окна ('info' или 'send2channel')
 * @param {object} options - Объект с опциями для конкретного окна
 */
function openModal(type, options = {}) {
    // Сначала закроем все другие модальные окна, чтобы избежать наложения
    closeAllModals();

    let modalElement;

    switch (type) {
        case 'info':
            modalElement = createInfoModal(options);
            break;
        case 'send2channel':
            // Для этого типа окна обязателен serverId
            if (!options.serverId) {
                console.error("Для модального окна 'send2channel' необходим 'serverId' в опциях.");
                return;
            }
            modalElement = createSendToChannelModal(options);
            break;
        default:
            console.error(`Неизвестный тип модального окна: ${type}`);
            return;
    }

    if (modalElement) {
        document.body.appendChild(modalElement);
    }
}

/**
 * Создает базовую структуру модального окна (оверлей, контейнер, кнопка закрытия)
 * @returns {{overlay: HTMLElement, content: HTMLElement}}
 */
function createModalBase() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', (e) => {
        // Закрываем окно при клике на оверлей, но не на его содержимое
        if (e.target === overlay) {
            closeAllModals();
        }
    });

    const content = document.createElement('div');
    content.className = 'modal-content';

    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-btn';
    closeButton.innerHTML = '&times;'; // Символ 'x'
    closeButton.onclick = closeAllModals;

    content.appendChild(closeButton);
    overlay.appendChild(content);

    return { overlay, content };
}


/**
 * Создает простое информационное модальное окно
 * @param {{title: string, message: string}} options 
 * @returns {HTMLElement} - Готовый DOM элемент модального окна
 */
function createInfoModal({ title = 'Информация', message = 'Это стандартное сообщение.' }) {
    const { overlay, content } = createModalBase();

    const header = document.createElement('h2');
    header.textContent = title;

    const paragraph = document.createElement('p');
    paragraph.textContent = message;

    content.appendChild(header);
    content.appendChild(paragraph);

    return overlay;
}

async function loadServerStats() {
    try {
        const response = await fetch(`/api/server/${serverId}/stats`);
        const data = await response.json();
        const infores = await fetch(`/api/server/${serverId}/info`);
        const info = await infores.json();
        
        if (!data.success || !info.success) {
            console.log(data, info)
            throw new Error(data.error || 'Ошибка загрузки данных');
        }

        const guild = info.guild;
        
        // Обновляем основную информацию о сервере
        document.getElementById('server-name').textContent = guild.name;
        document.getElementById('server-info').innerHTML = `
            <div class="server-header">
                <img src="${guild.iconURL || '/img/default-server-icon.png'}" alt="Server Icon" class="server-icon">
                <div class="server-info-details">
                    <h3>${guild.name}</h3>
                    <div class="server-meta">
                        <span>ID: ${guild.id}</span>
                        <span>Владелец: ${guild.ownerId}</span>
                        <span>Участников: ${guild.memberCount}</span>
                    </div>
                    <div class="server-features">
                        ${guild.features.map(feature => 
                            `<span class="feature-badge">${feature}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;

        // Каналы
        document.getElementById('server-channels').innerHTML = `
            <div class="channel-list scroll-area">
                <h3>Каналы сервера</h3>
                ${guild.channels.map(channel => `
                    <div class="server-channel-item channel-type-${channel.type}" data-parent-id="${channel.parentId || ''}">
                        <span class="channel-type">${formatChannelType(channel.type)}</span>
                        <span class="channel-name">${channel.name}</span>
                        <div class="channel-popup">
                            <div>Позиция: ${channel.position}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Роли
        document.getElementById('server-roles').innerHTML = `
            <div class="roles-list scroll-area">
                ${guild.roles.sort((a, b) => a.position - b.position).map(role => `
                    <div class="user-role" style="background-color: ${role.color}">
                        ${role.name}
                        <div class="role-popup">
                            <div>Позиция: ${role.position}</div>
                            <div>Права: ${role.permissions.slice(0, 5).join(', ')}${role.permissions.length > 5 ? '...' : ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Вебхуки
        document.getElementById('server-webhooks').innerHTML = `
            <div class="webhooks-list scroll-area">
                ${guild.webhooks.map(webhook => `
                    <div class="webhook-item">
                        <div class="webhook-header">
                            <img src="${webhook.avatarURL || '/img/default-webhook-icon.png'}" 
                                 alt="Webhook Avatar" 
                                 class="webhook-avatar">
                            <div class="webhook-info">
                                <div class="webhook-name">${webhook.name}</div>
                                <div class="webhook-id">ID: ${webhook.id}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
            // Обновляем статистику
        document.getElementById('server-stats').innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${guild.channels.length}</div>
                <div>Каналов</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${guild.roles.length}</div>
                <div>Ролей</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${guild.webhooks.length}</div>
                <div>Вебхуков</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${guild.memberCount}</div>
                <div>Участников</div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading server stats:', error);
        showError();
    }
}

// Вспомогательная функция для форматирования типа канала
function formatChannelType(type) {
    const types = {
        0: '💬', // GUILD_TEXT
        2: '🔊', // GUILD_VOICE
        4: '📂', // GUILD_CATEGORY
        5: '📢', // GUILD_ANNOUNCEMENT (previously GUILD_NEWS)
        13: '🎭', // GUILD_STAGE_VOICE
        15: '🧵', // GUILD_FORUM
        16: '📱', // GUILD_MEDIA
        11: '🎯', // GUILD_PUBLIC_THREAD
        12: '🔒', // GUILD_PRIVATE_THREAD
        10: '📣', // GUILD_NEWS_THREAD
    };
    return types[type] || '❓';
}

// Вспомогательная функция для отображения ошибок
function showError() {
    const errorMessage = '<div class="error-message">Ошибка загрузки данных</div>';
    document.getElementById('server-info').innerHTML = errorMessage;
    document.getElementById('server-stats').innerHTML = errorMessage;
    document.getElementById('server-channels').innerHTML = errorMessage;
    document.getElementById('server-roles').innerHTML = errorMessage;
    document.getElementById('server-webhooks').innerHTML = errorMessage;
}

// Оставляем остальные функции без изменений
async function loadRecentCases() {
    try {
        const response = await fetch(`/api/server/${serverId}/cases?limit=10`); // Используем serverId из JS-переменной
        const cases = await response.json();
        
        if (cases.length === 0) {
            document.getElementById('recent-cases').innerHTML = '<p>Кейсов не найдено</p>';
            return;
        }
        
        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Кейс #</th>
                        <th>Действие</th>
                        <th>Цель</th>
                        <th>Модератор</th>
                        <th>Причина</th>
                        <th>Дата</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        cases.forEach(case_ => {
            const date = new Date(case_.timestamp).toLocaleString();
            tableHtml += `
                <tr>
                    <td>${case_.caseNum}</td>
                    <td>${case_.action}</td>
                    <td>${case_.targetId}</td>
                    <td>${case_.moderatorId}</td>
                    <td>${case_.reason || 'Не указана'}</td>
                    <td>${date}</td>
                </tr>
            `;
        });
        
        tableHtml += '</tbody></table>';
        document.getElementById('recent-cases').innerHTML = tableHtml;
    } catch (error) {
        console.error('Error loading cases:', error);
        document.getElementById('recent-cases').innerHTML = '<div>Ошибка загрузки кейсов</div>';
    }
}

function refreshStats() {
    loadServerStats();
    loadRecentCases();
}

async function exportData() {
    try {
        const response = await fetch(`/api/server/${serverId}/export`); // Используем serverId из JS-переменной
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `server_${serverId}_data.json`;
        a.click();
    } catch (error) {
        alert('Ошибка экспорта данных');
    }
}

async function clearData() {
    if (!confirm('Вы уверены? Это действие удалит ВСЕ данные сервера!')) return;
    
    try {
        const response = await fetch(`/api/server/${serverId}/clear`, { method: 'DELETE' }); // Используем serverId из JS-переменной
        if (response.ok) {
            alert('Данные сервера очищены');
            refreshStats();
        } else {
            alert('Ошибка очистки данных');
        }
    } catch (error) {
        alert('Ошибка очистки данных');
    }
}

// Загружаем данные при загрузке страницы
loadServerStats();
loadRecentCases();