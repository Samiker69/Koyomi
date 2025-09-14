let currentPage = 1;
let totalMembers = 0;
let allMembers = [];
let filteredMembers = [];
let currentAction = null;
let currentUserId = null;
const membersPerPage = 20;

async function loadMembers() {
    try {
        const response = await fetch(`/api/server/${serverId}/members?limit=100`);
        allMembers = await response.json();
        console.log(allMembers)
        filteredMembers = allMembers;
        totalMembers = allMembers.length;
        
        displayMembers();
        updatePagination();
    } catch (error) {
        console.error('Error loading members:', error);
        document.getElementById('members-container').innerHTML = '<div>Ошибка загрузки участников</div>';
    }
}

function displayMembers() {
    const startIndex = (currentPage - 1) * membersPerPage;
    const endIndex = startIndex + membersPerPage;
    const membersToShow = filteredMembers.slice(startIndex, endIndex);
    
    if (membersToShow.length === 0) {
        document.getElementById('members-container').innerHTML = '<div>Участники не найдены</div>';
        return;
    }
    
    const membersHtml = membersToShow.map(member => `
        <div class="member-card">
            <div class="member-info">
                <img src="${member.avatarURL}" alt="Avatar" class="member-avatar">
                <div>
                    <h4>${member.displayName}</h4>
                    <p style="margin: 5px 0; opacity: 0.7;">@${member.username} • ID: ${member.id}</p>
                    <div>
                        ${member.roles.slice(0, 3).map(role => 
                            role.name !== '@everyone' ? `<span class="role-tag" style="background: ${role.color}">${role.name}</span>` : ''
                        ).join('')}
                        ${member.roles.length > 3 ? `<span class="role-tag">+${member.roles.length - 3}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="member-actions">
                <button class="btn btn-info" onclick="viewMember('${member.id}')">Просмотр</button>
                <button class="btn btn-warning" onclick="showActionModal('kick', '${member.id}', '${member.displayName}')">Кик</button>
                <button class="btn btn-danger" onclick="showActionModal('ban', '${member.id}', '${member.displayName}')">Бан</button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('members-container').innerHTML = membersHtml;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
    
    document.getElementById('prev-btn').disabled = currentPage <= 1;
    document.getElementById('next-btn').disabled = currentPage >= totalPages;
    document.getElementById('page-info').textContent = `Страница ${currentPage} из ${totalPages} (${filteredMembers.length} участников)`;
}

function loadNextPage() {
    currentPage++;
    displayMembers();
    updatePagination();
}

function loadPreviousPage() {
    currentPage--;
    displayMembers();
    updatePagination();
}

function showActionModal(action, userId, displayName) {
    currentAction = action;
    currentUserId = userId;
    
    const modal = document.getElementById('action-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    title.textContent = action === 'kick' ? 'Исключить пользователя' : 'Забанить пользователя';
    
    content.innerHTML = `
        <p>Вы уверены, что хотите <strong>${action === 'kick' ? 'исключить' : 'забанить'}</strong> пользователя <strong>${displayName}</strong>?</p>
        <div style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px;">Причина:</label>
            <input type="text" id="reason-input" style="width: 100%; padding: 8px; background: #40444b; border: none; border-radius: 4px; color: #fff;" placeholder="Укажите причину...">
        </div>
        ${action === 'ban' ? `
            <div style="margin: 15px 0;">
                <label style="display: block; margin-bottom: 5px;">Удалить сообщения за (дней):</label>
                <select id="delete-messages" style="width: 100%; padding: 8px; background: #40444b; border: none; border-radius: 4px; color: #fff;">
                    <option value="0">Не удалять</option>
                    <option value="1">1 день</option>
                    <option value="7" selected>7 дней</option>
                </select>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('action-modal').style.display = 'none';
    currentAction = null;
    currentUserId = null;
}

async function confirmAction() {
    const reason = document.getElementById('reason-input').value || 'Не указана';
    const deleteMessages = document.getElementById('delete-messages')?.value || 0;
    
    try {
        const response = await fetch(`/api/server/${serverId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: currentAction,
                userId: currentUserId,
                reason: reason,
                extra: { deleteMessageDays: parseInt(deleteMessages) }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Действие выполнено успешно! Кейс #${result.caseNum}`);
            closeModal();
            loadMembers(); // Обновляем список
        } else {
            alert(`Ошибка: ${result.error}`);
        }
    } catch (error) {
        alert('Ошибка выполнения действия');
        console.error(error);
    }
}

function viewMember(userId) {
    window.open(`https://discord.com/users/${userId}`, '_blank');
}

// Поиск
document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (query === '') {
        filteredMembers = allMembers;
    } else {
        filteredMembers = allMembers.filter(member => 
            member.username.toLowerCase().includes(query) ||
            member.displayName.toLowerCase().includes(query)
        );
    }
    
    currentPage = 1;
    displayMembers();
    updatePagination();
});

// Загружаем участников при загрузке страницы
loadMembers();