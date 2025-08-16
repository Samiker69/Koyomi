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

/**
 * Создает модальное окно для отправки сообщений в Discord
 * @param {{serverId: string}} options 
 * @returns {HTMLElement} - Готовый DOM элемент модального окна
 */
function createSendToChannelModal({ serverId }) {
    const { overlay, content } = createModalBase();
    content.classList.add('send2channel-modal');

    // Переменные для хранения состояния
    let selectedChannelId = null;
    
    // --- Левая часть: список каналов ---
    const channelList = document.createElement('div');
    channelList.className = 'channel-list';
    channelList.innerHTML = '<h3>Каналы</h3><p>Загрузка...</p>';

    // --- Правая часть: зона чата ---
    const chatZone = document.createElement('div');
    chatZone.className = 'chat-zone';

    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages-container';
    messagesContainer.textContent = 'Выберите канал, чтобы загрузить или отправить сообщение.';

    const chatInput = document.createElement('div');
    chatInput.className = 'chat-input';
    
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Введите ваше сообщение...';
    
    const chatActions = document.createElement('div');
    chatActions.className = 'chat-actions';

    const loadMessagesBtn = document.createElement('button');
    loadMessagesBtn.textContent = 'Загрузить сообщения';
    loadMessagesBtn.disabled = true;

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Отправить';
    sendBtn.disabled = true;

    chatActions.append(loadMessagesBtn, sendBtn);
    chatInput.append(textarea, chatActions);
    chatZone.append(messagesContainer, chatInput);
    
    content.append(channelList, chatZone);

    // --- Логика ---

    // 1. Получение и отображение каналов
    async function fetchAndRenderChannels() {
        try {
            const response = await fetch(`/api/server/${serverId}/channels`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const channels = await response.json();

            channelList.innerHTML = '<h3>Каналы</h3>'; // Очистка
            
            // Фильтруем, чтобы оставить только текстовые каналы (type: 0 для Discord)
            channels.filter(ch => ch.type === 0).forEach(channel => {
                const channelDiv = document.createElement('div');
                channelDiv.className = 'channel-item';
                channelDiv.textContent = `# ${channel.name}`;
                channelDiv.dataset.channelId = channel.id;

                channelDiv.onclick = () => {
                    selectedChannelId = channel.id;
                    // Снимаем выделение со всех
                    channelList.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
                    // Выделяем текущий
                    channelDiv.classList.add('active');
                    messagesContainer.innerHTML = ''; // Очищаем сообщения при смене канала
                    
                    // Активируем кнопки
                    sendBtn.disabled = false;
                    loadMessagesBtn.disabled = false;
                };
                channelList.appendChild(channelDiv);
            });

        } catch (error) {
            channelList.innerHTML = '<h3>Каналы</h3><p>Ошибка загрузки каналов.</p>';
            console.error('Ошибка при получении каналов:', error);
        }
    }

    // 2. Загрузка сообщений
    loadMessagesBtn.onclick = async () => {
        if (!selectedChannelId) return;
        messagesContainer.textContent = 'Загрузка сообщений...';
        
        try {
            // ПРИМЕЧАНИЕ: В задании не был указан эндпоинт для получения сообщений.
            // Используем предполагаемый GET /api/server/<serverId>/channel/<channelId>/messages
            const response = await fetch(`/api/server/${serverId}/channel/${selectedChannelId}/messages`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const messages = await response.json();

            messagesContainer.innerHTML = ''; // Очистка
            if (messages.length === 0) {
                messagesContainer.textContent = 'В этом канале пока нет сообщений.';
                return;
            }
            
            messages.forEach(msg => {
                const msgEl = document.createElement('div');
                msgEl.className = 'message';
                msgEl.innerHTML = `
                    <img src="${msg.author.avatarURL}" alt="avatar" class="message-avatar">
                    <div>
                        <div>
                            <span class="message-author">${msg.author.displayName}</span>
                            <span class="message-timestamp">${new Date(msg.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="message-content">${msg.content}</div>
                    </div>
                `;
                // Здесь можно добавить обработку embed'ов, если нужно
                messagesContainer.appendChild(msgEl);
            });
        } catch (error) {
            messagesContainer.textContent = 'Не удалось загрузить сообщения.';
            console.error('Ошибка при получении сообщений:', error);
        }
    };
    
    // 3. Отправка сообщения
    sendBtn.onclick = async () => {
        const content = textarea.value.trim();
        if (!selectedChannelId || !content) return;
        
        sendBtn.disabled = true;
        sendBtn.textContent = 'Отправка...';

        try {
            const response = await fetch(`/api/server/${serverId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channelId: selectedChannelId,
                    content: content,
                    embed: null, // Здесь можно добавить логику для embed
                }),
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // Успешная отправка
            textarea.value = '';
            alert('Сообщение успешно отправлено!');

        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            alert('Не удалось отправить сообщение.');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Отправить';
        }
    };

    // Запускаем загрузку каналов при создании окна
    fetchAndRenderChannels();

    return overlay;
}


// --- Инициализация кнопок на странице для демонстрации ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('infoBtn').addEventListener('click', () => {
        openModal('info', {
            title: 'Важное уведомление',
            message: 'Это окно было вызвано с пользовательскими параметрами.'
        });
    });

    document.getElementById('sendBtn').addEventListener('click', () => {
        // В реальном приложении serverId будет браться из контекста страницы
        const serverId = '1264316836414226464'; // Пример ID сервера
        openModal('send2channel', { serverId });
    });
});