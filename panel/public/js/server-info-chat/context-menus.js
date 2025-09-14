// Кэш профилей пользователей
const userProfiles = new Map();

function createActionModal(title, fields) {
    const modal = document.createElement('div');
    modal.className = 'action-modal';

    modal.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #fff;">${title}</h3>
        <form class="action-form">
            ${fields.map(field => `
                <div>
                    <label style="display: block; margin-bottom: 4px; color: #b9bbbe;">
                        ${field.label}
                    </label>
                    ${field.type === 'textarea' 
                        ? `<textarea name="${field.name}" rows="3">${field.value || ''}</textarea>`
                        : `<input type="${field.type}" name="${field.name}" value="${field.value || ''}">`
                    }
                </div>
            `).join('')}
            <div class="action-buttons">
                <button type="button" class="user-profile-action" data-action="cancel">Отмена</button>
                <button type="submit" class="user-profile-action">Подтвердить</button>
            </div>
        </form>
    `;

    return modal;
}

function createUserProfileModal(userInfo, serverId) {
    const modal = document.createElement('div');
    modal.className = 'user-profile-modal';

    // Функция рендеринга ролей
    function renderRoles(roles) {
        const rolesList = roles
            .map(role => `
                <span class="user-role removable" 
                      data-role-id="${role.id}" 
                      style="color: ${role.color}">
                    ${role.name}
                </span>
            `)
            .join('');

        return `
            <div class="roles-list">
                ${rolesList}
                <button type="button" class="add-role-btn">+ Добавить роль</button>
            </div>
        `;
    }

    // Базовая информация о пользователе
    function renderBasicInfo() {
        return `
            <div class="user-profile-header">
                <img src="${userInfo.avatarURL}" alt="Avatar" class="user-profile-avatar">
                <div class="user-profile-info">
                    <div class="user-profile-name">${userInfo.displayName}</div>
                    <div class="user-profile-id">ID: ${userInfo.id}</div>
                </div>
            </div>
        `;
    }

    // Обновленная функция рендеринга детальной информации
    function renderDetailedInfo(member) {
        const joinDate = new Date(member.joinedAt).toLocaleString();

        return `
            <div class="user-profile-details">
                <div class="user-profile-section">
                    <div class="section-title">Присоединился</div>
                    <div class="section-content">${joinDate}</div>
                </div>
                <div class="user-profile-section">
                    <div class="section-title">Роли</div>
                    <div class="roles-container">
                        ${renderRoles(member.roles)}
                    </div>
                </div>
            </div>
        `;
    }

    // Кнопки действий
    function renderActions(detailed = false) {
        return `
            <div class="user-profile-actions">
                <button class="user-profile-action" data-action="fetch">${detailed ? 'Обновить' : 'Подробнее'}</button>
                <button class="user-profile-action" data-action="mute">Мут</button>
                <button class="user-profile-action danger" data-action="kick">Кик</button>
                <button class="user-profile-action danger" data-action="ban">Бан</button>
            </div>
        `;
    }

    function renderModal(detailed = false) {
        const member = detailed ? userProfiles.get(userInfo.id) : null;
        modal.innerHTML = `
            ${renderBasicInfo()}
            ${member ? renderDetailedInfo(member) : ''}
            ${renderActions(detailed)}
        `;

        // Добавляем обработчики после обновления DOM
        if (member) {
            // Обработчики для ролей
            const rolesContainer = modal.querySelector('.roles-container');
            if (rolesContainer) {
                // Обработчик для удаления ролей
                rolesContainer.addEventListener('click', async (e) => {
                    const roleEl = e.target.closest('.user-role');
                    if (roleEl) {
                        const roleId = roleEl.dataset.roleId;
                        if (confirm('Удалить эту роль?')) {
                            await handleAction('role', { roleId, type: 'remove' });
                        }
                    }
                });

                // Обработчик для добавления ролей
                const addRoleBtn = rolesContainer.querySelector('.add-role-btn');
                if (addRoleBtn) {
                    addRoleBtn.addEventListener('click', () => handleRoles());
                }
            }
        }

        // Обработчики для кнопок действий
        const actionButtons = modal.querySelectorAll('.user-profile-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const action = button.dataset.action;
                if (action === 'fetch') {
                    // Существующая логика fetch...
                    const response = await fetch(`/api/server/${serverId}/members/${userInfo.id}`);
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.member) {
                            userProfiles.set(userInfo.id, result.member);
                            renderModal(true);
                        }
                    }
                } else {
                    handleModerationAction(action);
                }
            });
        });
    }

    async function handleAction(action, data = {}) {
        try {
            const response = await fetch(`/api/server/${serverId}/members/${userInfo.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...data })
            });

            const result = await response.json();

            if (result.error === 'Member not found') {
                // Показываем кнопку unban
                const actionsDiv = modal.querySelector('.user-profile-actions');
                const banButton = actionsDiv.querySelector('[data-action="ban"]');
                if (banButton) {
                    banButton.dataset.action = 'unban';
                    banButton.textContent = 'Разбанить';
                }
                return;
            }

            if (!response.ok) throw new Error(result.error || `HTTP error! status: ${response.status}`);

            if (result.success) {
                alert(`Действие "${action}" выполнено успешно!`);
                if (action !== 'role') {
                    modal.remove();
                } else {
                    // Обновляем список ролей
                    const response = await fetch(`/api/server/${serverId}/members/${userInfo.id}`);
                    const userData = await response.json();
                    if (userData.success) {
                        userProfiles.set(userInfo.id, userData.member);
                        renderModal(true);
                    }
                }
            }
        } catch (error) {
            console.error(`Ошибка при выполнении действия ${action}:`, error);
            alert('Произошла ошибка при выполнении действия');
        }
    }

    function positionActionModal(actionModal, button) {
        const buttonRect = button.getBoundingClientRect();
        const modalHeight = actionModal.offsetHeight;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
    
        // Проверяем, хватает ли места снизу
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
    
        // Определяем позицию по вертикали
        let top;
        if (spaceBelow >= modalHeight + 5) {
            // Если внизу достаточно места, размещаем под кнопкой
            top = buttonRect.bottom + 5;
        } else if (spaceAbove >= modalHeight + 5) {
            // Если вверху достаточно места, размещаем над кнопкой
            top = buttonRect.top - modalHeight - 5;
        } else {
            // Если места недостаточно ни сверху, ни снизу,
            // размещаем так, чтобы было видно максимальную часть модального окна
            top = Math.max(5, viewportHeight - modalHeight - 5);
        }
    
        // Определяем позицию по горизонтали
        let left = buttonRect.left;
        const modalWidth = actionModal.offsetWidth;
        
        // Проверяем, не выходит ли модальное окно за правый край
        if (left + modalWidth > viewportWidth - 5) {
            // Если выходит, сдвигаем влево
            left = viewportWidth - modalWidth - 5;
        }
    
        // Не даём выйти за левый край
        left = Math.max(5, left);
    
        actionModal.style.position = 'fixed';  // Используем fixed вместо absolute
        actionModal.style.top = `${top}px`;
        actionModal.style.left = `${left}px`;
    }
    
    // Обновляем функцию handleModerationAction
    async function handleModerationAction(action) {
        let actionModal;
        switch (action) {
            case 'kick':
            case 'ban':
            case 'unban':
                actionModal = createActionModal(`${action === 'kick' ? 'Кикнуть' : action === 'ban' ? 'Забанить' : 'Разбанить'} пользователя`, [
                    { label: 'Причина', name: 'reason', type: 'textarea' }
                ]);
                break;
    
            case 'mute':
                actionModal = createActionModal('Замутить пользователя', [
                    { label: 'Причина', name: 'reason', type: 'textarea' },
                    { label: 'Длительность (в минутах)', name: 'duration', type: 'number', value: '60' }
                ]);
                break;
        }
    
        if (actionModal) {
            modal.appendChild(actionModal);
            const button = modal.querySelector(`[data-action="${action}"]`);
            
            // Сначала устанавливаем visibility: hidden, чтобы получить реальные размеры
            actionModal.style.visibility = 'hidden';
            
            // Ждем следующего кадра для корректного расчета размеров
            requestAnimationFrame(() => {
                positionActionModal(actionModal, button);
                actionModal.style.visibility = 'visible';
            });
    
            actionModal.querySelector('form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                
                if (action === 'mute') {
                    data.duration = parseInt(data.duration) * 60;
                }
                
                await handleAction(action, data);
                actionModal.remove();
            });
    
            actionModal.querySelector('[data-action="cancel"]').onclick = () => actionModal.remove();
    
            // Добавляем обработчик для закрытия по клику вне модального окна
            const closeOnOutsideClick = (e) => {
                if (!actionModal.contains(e.target) && e.target !== button) {
                    actionModal.remove();
                    document.removeEventListener('click', closeOnOutsideClick);
                }
            };
            // Используем setTimeout, чтобы обработчик не сработал сразу
            setTimeout(() => document.addEventListener('click', closeOnOutsideClick), 0);
        }
    }

    // Обработчик управления ролями
    async function handleRoles() {
        try {
            const response = await fetch(`/api/server/${serverId}/roles`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            const availableRoles = result.roles;
            
            const rolesDropdown = document.createElement('div');
            rolesDropdown.className = 'roles-dropdown';
            
            const currentRoles = new Set(userProfiles.get(userInfo.id)?.roles.map(r => r.id) || []);
            
            rolesDropdown.innerHTML = availableRoles
                .filter(role => !currentRoles.has(role.id))
                .map(role => `
                    <div class="role-option" 
                         data-role-id="${role.id}" 
                         style="color: ${role.color}">
                        ${role.name}
                    </div>
                `)
                .join('');

            const addButton = modal.querySelector('.add-role-btn');
            const rect = addButton.getBoundingClientRect();
            
            rolesDropdown.style.top = `${rect.bottom + 5}px`;
            rolesDropdown.style.left = `${rect.left}px`;
            
            modal.appendChild(rolesDropdown);

            rolesDropdown.onclick = async (e) => {
                const roleOption = e.target.closest('.role-option');
                if (roleOption) {
                    const roleId = roleOption.dataset.roleId;
                    await handleAction('role', { roleId, type: 'add' });
                    rolesDropdown.remove();
                }
            };

            // Закрываем при клике вне дропдауна
            document.addEventListener('click', function closeDropdown(e) {
                if (!rolesDropdown.contains(e.target) && e.target !== addButton) {
                    rolesDropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        } catch (error) {
            console.error('Ошибка при загрузке ролей:', error);
            alert('Не удалось загрузить список ролей');
        }
    }

    // Инициализация с базовой информацией
    renderModal(userProfiles.has(userInfo.id));

    // Обработчики кнопок
    modal.addEventListener('click', async (e) => {
        const button = e.target.closest('.user-profile-action');
        if (!button) return;

        const action = button.dataset.action;
        button.disabled = true;

        try {
            if (action === 'fetch') {
                const response = await fetch(`/api/server/${serverId}/members/${userInfo.id}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const result = await response.json();
                if (result.member && result.success) {
                    // Сохраняем в кэш
                    userProfiles.set(userInfo.id, result.member);
                    // Обновляем отображение
                    renderModal(true);
                }
            } else {
                handleModerationAction(action);
            }
            const roleEl = e.target.closest('.user-role');
            if (roleEl) {
                const roleId = roleEl.dataset.roleId;
                if (confirm('Удалить эту роль?')) {
                    await handleAction('role', { roleId, type: 'remove' });
                }
                return;
            }
    
            if (e.target.classList.contains('add-role-btn')) {
                handleRoles();
            }
        } catch (error) {
            console.error(`Ошибка при выполнении действия ${action}:`, error);
            alert('Произошла ошибка при выполнении действия');
        } finally {
            if (modal.isConnected) { // Если модальное окно еще существует
                button.disabled = false;
            }
        }
    });

    return modal;
}

// Добавим метод для очистки кэша
function clearUserProfilesCache() {
    userProfiles.clear();
}

// Добавим метод для удаления конкретного профиля из кэша
function removeUserProfile(userId) {
    userProfiles.delete(userId);
}

// Добавим метод для обновления кэша
function updateUserProfile(userId, profileData) {
    userProfiles.set(userId, profileData);
}

// Функция создания контекстного меню канала
function createChannelContextMenu(channel, serverId) {
    const menu = document.createElement('div');
    menu.className = 'channel-context-menu';

    menu.innerHTML = `
        <div class="context-menu-item" data-action="webhook">Создать вебхук</div>
        <div class="context-menu-item" data-action="rename">Изменить название</div>
        <div class="context-menu-item danger" data-action="delete">Удалить канал</div>
    `;//<div class="context-menu-item" data-action="channel-detailes">Подробнее</div>

    const handleChannelAction = async (action) => {
        try {
            switch (action) {
                case 'webhook':
                    const webhookModal = createWebhookModal(channel, serverId);
                    document.body.appendChild(webhookModal);
                    
                    // Позиционируем модальное окно в центре экрана
                    webhookModal.style.position = 'fixed';
                    webhookModal.style.top = '50%';
                    webhookModal.style.left = '50%';
                    webhookModal.style.transform = 'translate(-50%, -50%)';
                    webhookModal.style.zIndex = 1003
    
                    // Добавляем обработчик для закрытия по клику вне модального окна
                    const closeWebhookModal = (e) => {
                        if (!webhookModal.contains(e.target)) {
                            webhookModal.remove();
                            document.removeEventListener('click', closeWebhookModal);
                        }
                    };
                    setTimeout(() => document.addEventListener('click', closeWebhookModal), 0);
                    break;
                case 'rename':
                    const newName = prompt('Введите новое название канала:');
                    if (newName) {
                        const response = await updateChannel(serverId, channel.id, { action: 'rename', name: newName });
                        if (response.success) {
                            const element = document.querySelector(`[data-channel-id="${response.id}"]`);
                            element.textContent(response.data.name);
                        }
                    }
                    break;
                case 'delete':
                    if (confirm('Вы уверены, что хотите удалить этот канал?')) {
                        const response = await updateChannel(serverId, channel.id, { action: 'delete' });
                        if (response.success) {
                            const element = document.querySelector(`[data-channel-id="${channel.id}"]`);
                            element.remove();
                        }
                    }
                    break;
            }
            menu.remove();
        } catch (error) {
            console.error('Ошибка при выполнении действия:', error);
            alert('Произошла ошибка при выполнении действия');
        }
    };

    menu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', () => handleChannelAction(item.dataset.action));
    });

    return menu;
}

function createWebhookModal(channel, serverId) {
    const modal = document.createElement('div');
    modal.className = 'webhook-modal';

    modal.innerHTML = `
        <div class="webhook-form">
            <input type="text" placeholder="Название вебхука" id="webhook-name">
            <input type="url" placeholder="URL аватара" id="webhook-avatar">
            <div id="webhook-url-container"></div>
            <div class="webhook-actions">
                <button class="user-profile-action" id="apply-webhook">Применить</button>
                <button class="user-profile-action" id="create-webhook">Создать</button>
            </div>
        </div>
    `;

    // Создаём отдельную функцию для отображения URL вебхука
    function displayWebhookUrl(url) {
        const container = modal.querySelector('#webhook-url-container');
        container.innerHTML = `
            <div class="webhook-url">
                <span>${url}</span>
                <button class="copy-btn">Копировать</button>
            </div>
        `;

        // Добавляем обработчик для кнопки копирования
        const copyBtn = container.querySelector('.copy-btn');
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(url);
                copyBtn.textContent = 'Скопировано!';
                setTimeout(() => {
                    copyBtn.textContent = 'Копировать';
                }, 2000);
            } catch (err) {
                console.error('Не удалось скопировать URL:', err);
                alert('Не удалось скопировать URL');
            }
        });
    }

    const createButton = modal.querySelector('#create-webhook');
    const applyButton = modal.querySelector('#apply-webhook');

    createButton.addEventListener('click', async () => {
        try {
            const name = modal.querySelector('#webhook-name').value;
            const avatar = modal.querySelector('#webhook-avatar').value;

            createButton.disabled = true;
            createButton.textContent = 'Создание...';

            const response = await fetch(`/api/server/${serverId}/channels/${channel.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'createWebhook',
                    name: name || undefined,
                    avatar: avatar || undefined
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            if (result.success && result.data.url) {
                displayWebhookUrl(result.data.url);
                createButton.textContent = 'Создано!';
                setTimeout(() => {
                    createButton.textContent = 'Создать';
                    createButton.disabled = false;
                }, 2000);
            } else {
                throw new Error('Не получен URL вебхука');
            }

        } catch (error) {
            console.error('Ошибка при создании вебхука:', error);
            alert('Произошла ошибка при создании вебхука');
            createButton.textContent = 'Создать';
            createButton.disabled = false;
        }
    });

    applyButton.addEventListener('click', async () => {
        try {
            const name = modal.querySelector('#webhook-name').value;
            const avatar = modal.querySelector('#webhook-avatar').value;

            if (!name && !avatar) {
                alert('Введите название или URL аватара для применения изменений');
                return;
            }

            return alert('заглушка');

            applyButton.disabled = true;
            applyButton.textContent = 'Применение...';

            const response = await fetch(`/api/server/${serverId}/channels/${channel.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateWebhook',
                    name,
                    avatar
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            if (result.success) {
                applyButton.textContent = 'Применено!';
                setTimeout(() => {
                    applyButton.textContent = 'Применить';
                    applyButton.disabled = false;
                }, 2000);
            }

        } catch (error) {
            console.error('Ошибка при обновлении вебхука:', error);
            alert('Произошла ошибка при обновлении вебхука');
            applyButton.textContent = 'Применить';
            applyButton.disabled = false;
        }
    });

    return modal;
}

// Функция обновления канала
async function updateChannel(serverId, channelId, data) {
    const response = await fetch(`/api/server/${serverId}/channels/${channelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
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
    channelList.classList.add('channel-list', 'scroll-area');

    channelList.innerHTML = '<h3>Каналы</h3><p>Загрузка...</p>';

    // --- Правая часть: зона чата ---
    const chatZone = document.createElement('div');
    chatZone.classList.add('chat-zone');

    const messagesContainer = document.createElement('div');
    messagesContainer.classList.add('messages-container', 'scroll-area');
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
    loadMessagesBtn.classList.add('btn');
    loadMessagesBtn.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (cacheFor.messages) {
            loadMessagesBtn.classList.add('danger');
            cacheFor.messages = !cacheFor.messages;
        } else {
            loadMessagesBtn.classList.remove('danger');
            cacheFor.messages = !cacheFor.messages;
        }
    })

    const loadChannelsBtn = document.createElement('button');
    loadChannelsBtn.textContent = 'Загрузить каналы'
    loadChannelsBtn.onclick = async () => await fetchAndRenderChannels();
    loadChannelsBtn.classList.add('btn');
    loadChannelsBtn.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (cacheFor.channels) {
            loadChannelsBtn.classList.add('danger');
            cacheFor.channels = !cacheFor.channels;
        } else {
            loadChannelsBtn.classList.remove('danger');
            cacheFor.channels = !cacheFor.channels;
        }
    })

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Отправить';
    sendBtn.disabled = true;
    sendBtn.classList.add('btn');

    chatActions.append(loadMessagesBtn, loadChannelsBtn, sendBtn);
    chatInput.append(textarea, chatActions);
    chatZone.append(messagesContainer, chatInput);
    
    content.append(channelList, chatZone);

    // --- Логика ---

    // 1. Получение и отображение каналов
    async function fetchAndRenderChannels() {
        try {
            const response = await fetch(`/api/server/${serverId}/channels?cache=${cacheFor.channels}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const channels = (await response.json()).data.channels;

            channelList.innerHTML = '<h3>Каналы</h3>'; // Очистка
            
            // Фильтруем, чтобы оставить только текстовые каналы (type: 0 для Discord)
            channels.filter(ch => ch.type === 0).forEach(channel => {
                const channelDiv = document.createElement('div');
                channelDiv.className = 'channel-item';
                channelDiv.textContent = `# ${channel.name}`;
                channelDiv.dataset.channelId = channel.id;

                channelDiv.onclick = async () => {
                    selectedChannelId = channel.id;
                    // Снимаем выделение со всех
                    channelList.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
                    // Выделяем текущий
                    channelDiv.classList.add('active');
                    messagesContainer.innerHTML = ''; // Очищаем сообщения при смене канала
                    await loadMessages(serverId, selectedChannelId);
                    
                    // Активируем кнопки
                    sendBtn.disabled = false;
                    loadMessagesBtn.disabled = false;
                };
                channelList.appendChild(channelDiv);
            });
            // Добавляем обработчик правого клика по каналу
            channelList.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const channelEl = e.target.closest('.channel-item');
                if (!channelEl) return;

                const channelInfo = {
                    id: channelEl.dataset.channelId,
                    name: channelEl.textContent.trim().slice(2) // Убираем "# " из названия
                };

                const contextMenu = createChannelContextMenu(channelInfo, serverId);
                document.body.appendChild(contextMenu);

                // Позиционируем контекстное меню
                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.top = `${e.clientY}px`;

                // Закрываем при клике вне меню
                const closeHandler = (e) => {
                    if (!contextMenu.contains(e.target)) {
                        contextMenu.remove();
                        document.removeEventListener('click', closeHandler);
                    }
                };
                setTimeout(() => document.addEventListener('click', closeHandler), 0);
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
            await loadMessages(serverId, selectedChannelId);
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

    async function loadMessages(serverId, selectedChannelId) {
        const response = await fetch(`/api/server/${serverId}/channel/${selectedChannelId}/messages?cache=${cacheFor.messages}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const res = await response.json()
        const messages = res.data.messages;
    
        messagesContainer.innerHTML = ''; // Очистка
        if (messages.length === 0) {
            messagesContainer.textContent = 'В этом канале пока нет сообщений.';
            return;
        }
        
        messages.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = 'message';
            msgEl.dataset.authorId = msg.author.id
            
            let embedsHTML = '';
            let attachmentsHTML = '';
            
            // Рендеринг эмбедов
            if (msg.embeds && msg.embeds.length > 0) {
                embedsHTML = msg.embeds.map(embed => {
                    let embedContent = '';
                    
                    // Автор эмбеда
                    if (embed.author) {
                        embedContent += `
                            <div class="embed-author">
                                ${embed.author.iconURL ? `<img src="${embed.author.iconURL}" class="embed-author-icon">` : ''}
                                <span class="embed-author-name">${embed.author.name}</span>
                            </div>
                        `;
                    }
                    
                    // Миниатюра
                    let thumbnailHTML = '';
                    if (embed.thumbnail) {
                        thumbnailHTML = `<div class="embed-thumbnail"><img src="${embed.thumbnail.url}"></div>`;
                    }
                    
                    // Заголовок
                    if (embed.title) {
                        const titleTag = embed.url ? `<a href="${embed.url}" target="_blank" class="embed-title">${embed.title}</a>` : `<div class="embed-title">${embed.title}</div>`;
                        embedContent += titleTag;
                    }
                    
                    // Описание
                    if (embed.description) {
                        embedContent += `<div class="embed-description">${embed.description}</div>`;
                    }
                    
                    // Поля
                    if (embed.fields && embed.fields.length > 0) {
                        const fieldsHTML = embed.fields.map(field => {
                            const inlineClass = field.inline ? 'inline' : '';
                            return `
                                <div class="embed-field ${inlineClass}">
                                    <div class="embed-field-name">${field.name}</div>
                                    <div class="embed-field-value">${field.value}</div>
                                </div>
                            `;
                        }).join('');
                        embedContent += `<div class="embed-fields">${fieldsHTML}</div>`;
                    }
                    
                    // Изображение
                    if (embed.image) {
                        embedContent += `<div class="embed-image"><img src="${embed.image.url}"></div>`;
                    }
                    
                    // Футер
                    if (embed.footer || embed.timestamp) {
                        let footerContent = '';
                        if (embed.footer) {
                            footerContent += `
                                ${embed.footer.iconURL ? `<img src="${embed.footer.iconURL}" class="embed-footer-icon">` : ''}
                                <span>${embed.footer.text}</span>
                            `;
                        }
                        if (embed.timestamp) {
                            if (footerContent) footerContent += ' • ';
                            footerContent += new Date(embed.timestamp).toLocaleString();
                        }
                        embedContent += `<div class="embed-footer">${footerContent}</div>`;
                    }
                    
                    const borderColor = embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#7289da';
                    return `<div class="embed" style="border-left-color: ${borderColor}">${thumbnailHTML}${embedContent}</div>`;
                }).join('');
            }
            
            // Рендеринг вложений
            if (msg.attachments && msg.attachments.length > 0) {
                attachmentsHTML = '<div class="attachments">' + msg.attachments.map(attachment => {
                    const isImage = attachment.contentType && attachment.contentType.startsWith('image/');
                    const fileExt = attachment.filename.split('.').pop().toUpperCase();
                    const fileSize = formatFileSize(attachment.size);
                    
                    if (isImage && attachment.width && attachment.height) {
                        // Для изображений показываем превью
                        return `
                            <div class="attachment-image">
                                <img src="${attachment.url}" alt="${attachment.filename}" onclick="window.open('${attachment.url}', '_blank')">
                            </div>
                        `;
                    } else {
                        // Для остальных файлов показываем иконку и информацию
                        return `
                            <div class="attachment">
                                <div class="attachment-icon">${fileExt}</div>
                                <div class="attachment-info">
                                    <div class="attachment-name" onclick="window.open('${attachment.url}', '_blank')">${attachment.filename}</div>
                                    <div class="attachment-size">${fileSize}</div>
                                </div>
                            </div>
                        `;
                    }
                }).join('') + '</div>';
            }
    
            let stickersHTML = ''
            if (msg.stickers && msg.stickers.length > 0) {
                stickersHTML = '<div class="stickers">' + msg.stickers.map(sticker => {
                    return `<div class="sticker"><img src="${sticker.url}" alt="${sticker.name}" title="${sticker.name}"></div>`;
                }).join('') + '</div>';
            }
            
            msgEl.innerHTML = `
                <img src="${msg.author.avatarURL}" alt="avatar" class="message-avatar">
                <div>
                    <div>
                        <span class="message-author" >${msg.author.displayName}</span>
                        <span class="message-timestamp">${new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="message-content">${msg.content}</div>
                    ${embedsHTML}
                    ${attachmentsHTML}
                    ${stickersHTML}
                </div>
            `;
            messagesContainer.appendChild(msgEl);

            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 50);

            // Добавляем обработчик клика по аватару
            messagesContainer.addEventListener('click', (e) => {
                const avatarEl = e.target.closest('.message-avatar');
                if (!avatarEl) return;

                const messageEl = avatarEl.closest('.message');
                const authorName = messageEl.querySelector('.message-author').textContent;
                const authorId = messageEl.dataset.authorId;
                const avatarURL = avatarEl.src;

                const userInfo = {
                    displayName: authorName,
                    id: authorId,
                    avatarURL: avatarURL
                };

                const profileModal = createUserProfileModal(userInfo, serverId);
                document.body.appendChild(profileModal);

                // Позиционируем модальное окно рядом с аватаром
                const rect = avatarEl.getBoundingClientRect();
                profileModal.style.left = `${rect.right + 10}px`;
                profileModal.style.top = `${rect.top}px`;

                // Закрываем при клике вне модального окна
                const closeHandler = (e) => {
                    if (!profileModal.contains(e.target)) {
                        profileModal.remove();
                        document.removeEventListener('click', closeHandler);
                    }
                };
                setTimeout(() => document.addEventListener('click', closeHandler), 0);
            });
        });
    }

    // Вспомогательная функция для форматирования размера файла
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    return overlay;
}