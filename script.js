// Данные аккаунтов
let accounts = [
    { id: 1, name: "", status: "", date: "", type: "", isActive: false },
    { id: 2, name: "", status: "", date: "", type: "", isActive: false }
];

// Популярные типы аккаунтов для подсказок
const popularTypes = ["Основной", "Дополнительный", "Рабочий", "Личный", "Резервный", "Админ", "Тестовый", "Гостевой"];

let editingAccountId = null;

// DOM элементы
const accountModal = document.getElementById('account-modal');
const confirmModal = document.getElementById('confirm-modal');
const modalTitle = document.getElementById('modal-title');
const accountToDeleteElement = document.getElementById('account-to-delete');
const typeInput = document.getElementById('account-type-input');
const typeSuggestions = document.getElementById('type-suggestions');
let accountToDeleteId = null;

// Инициализация
function init() {
    setupEventListeners();
    updateTable(); // ВАЖНО: сразу отображаем таблицу
    
    // Настройка автозаполнения для типа аккаунта
    if (typeInput) {
        typeInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            if (value.length > 0) {
                const filtered = popularTypes.filter(type => 
                    type.toLowerCase().includes(value)
                );
                showTypeSuggestions(filtered);
            } else {
                showTypeSuggestions(popularTypes);
            }
        });
        
        typeInput.addEventListener('focus', function() {
            showTypeSuggestions(popularTypes);
        });
        
        // Закрытие подсказок при клике вне
        document.addEventListener('click', function(e) {
            if (!typeInput.contains(e.target) && !typeSuggestions.contains(e.target)) {
                typeSuggestions.style.display = 'none';
            }
        });
    }
}

// Показать подсказки типов
function showTypeSuggestions(types) {
    if (!typeSuggestions) return;
    
    typeSuggestions.innerHTML = '';
    
    if (types.length === 0) {
        typeSuggestions.style.display = 'none';
        return;
    }
    
    types.forEach(type => {
        const suggestion = document.createElement('div');
        suggestion.className = 'type-suggestion';
        suggestion.textContent = type;
        suggestion.onclick = () => selectType(type);
        typeSuggestions.appendChild(suggestion);
    });
    
    typeSuggestions.style.display = 'block';
}

// Выбрать тип из подсказок
function selectType(type) {
    if (typeInput) {
        typeInput.value = type;
    }
    if (typeSuggestions) {
        typeSuggestions.style.display = 'none';
    }
    if (typeInput) {
        typeInput.focus();
    }
}

// Редактирование аккаунта
function editAccount(id) {
    const account = accounts.find(acc => acc.id === id);
    if (!account || !account.name) return;
    
    editingAccountId = id;
    modalTitle.textContent = 'Редактировать аккаунт';
    
    document.getElementById('account-name').value = account.name;
    typeInput.value = account.type || '';
    
    // Устанавливаем статус
    const statusSelect = document.getElementById('account-status');
    if (account.status === 'Активный') {
        statusSelect.value = 'check';
    } else if (account.status === 'Неактивный') {
        statusSelect.value = 'inactive';
    } else if (account.status === 'Ожидание') {
        statusSelect.value = 'pending';
    } else if (account.status === 'Ошибка') {
        statusSelect.value = 'error';
    } else {
        statusSelect.value = 'check';
    }
    
    document.getElementById('account-id').value = account.id;
    
    accountModal.style.display = 'flex';
}

// Добавление аккаунта
function addAccount() {
    editingAccountId = null;
    modalTitle.textContent = 'Добавить аккаунт';
    document.getElementById('account-form').reset();
    typeInput.value = '';
    document.getElementById('account-id').value = '';
    document.getElementById('account-status').value = 'check';
    accountModal.style.display = 'flex';
}

// Синхронизация аккаунта
function syncAccount(id) {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;
    
    // Показываем анимацию синхронизации
    const syncBtn = document.querySelector(`button[onclick="syncAccount(${id})"] span`);
    if (syncBtn) {
        const originalIcon = syncBtn.textContent;
        syncBtn.textContent = '⏳';
        syncBtn.parentElement.style.pointerEvents = 'none';
        
        setTimeout(() => {
            syncBtn.textContent = originalIcon;
            syncBtn.parentElement.style.pointerEvents = 'auto';
            showNotification(`Аккаунт "${account.name}" синхронизирован`, 'success');
        }, 1000);
    }
}

// Подтверждение удаления аккаунта
function deleteAccount(id) {
    const account = accounts.find(acc => acc.id === id);
    if (!account || !account.name) return;
    
    accountToDeleteId = id;
    accountToDeleteElement.textContent = account.name;
    confirmModal.style.display = 'flex';
}

// Сохранение аккаунта
function saveAccount() {
    const name = document.getElementById('account-name').value.trim();
    const type = typeInput.value.trim();
    const status = document.getElementById('account-status').value;
    const id = document.getElementById('account-id').value;
    
    if (!name) {
        showNotification('Введите никнейм аккаунта', 'error');
        return;
    }
    
    // Преобразуем статус для отображения
    let displayStatus;
    switch(status) {
        case 'check': displayStatus = 'Активный'; break;
        case 'inactive': displayStatus = 'Неактивный'; break;
        case 'pending': displayStatus = 'Ожидание'; break;
        case 'error': displayStatus = 'Ошибка'; break;
        default: displayStatus = 'Активный';
    }
    
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
    
    if (id) {
        // Редактирование существующего аккаунта
        const accountIndex = accounts.findIndex(acc => acc.id === parseInt(id));
        if (accountIndex !== -1) {
            accounts[accountIndex].name = name;
            accounts[accountIndex].type = type || 'Основной';
            accounts[accountIndex].status = displayStatus;
            accounts[accountIndex].date = formattedDate;
            accounts[accountIndex].isActive = true;
            
            showNotification(`Аккаунт "${name}" обновлен`, 'success');
        }
    } else {
        // Добавление нового аккаунта
        const emptyAccountIndex = accounts.findIndex(acc => !acc.name);
        
        if (emptyAccountIndex !== -1) {
            // Заполняем пустой слот
            accounts[emptyAccountIndex] = {
                id: accounts[emptyAccountIndex].id,
                name,
                type: type || 'Основной',
                status: displayStatus,
                date: formattedDate,
                isActive: true
            };
        } else {
            // Проверяем, можно ли добавить ещё один аккаунт
            const activeAccounts = accounts.filter(acc => acc.isActive);
            if (activeAccounts.length >= 2) {
                showNotification('Нельзя добавить более 2 аккаунтов', 'error');
                accountModal.style.display = 'none';
                return;
            }
            
            // Добавляем новый аккаунт
            const newId = Math.max(...accounts.map(a => a.id), 0) + 1;
            accounts.push({
                id: newId,
                name,
                type: type || 'Основной',
                status: displayStatus,
                date: formattedDate,
                isActive: true
            });
        }
        
        showNotification(`Аккаунт "${name}" добавлен`, 'success');
    }
    
    // Обновляем таблицу
    updateTable();
    accountModal.style.display = 'none';
}

// Подтвержденное удаление аккаунта
function confirmDelete() {
    if (!accountToDeleteId) return;
    
    const accountIndex = accounts.findIndex(acc => acc.id === accountToDeleteId);
    if (accountIndex !== -1) {
        const accountName = accounts[accountIndex].name;
        
        // Очищаем данные аккаунта (оставляем пустой слот)
        accounts[accountIndex] = {
            id: accountToDeleteId,
            name: "",
            status: "",
            date: "",
            type: "",
            isActive: false
        };
        
        showNotification(`Аккаунт "${accountName}" удален`, 'success');
        updateTable();
    }
    
    confirmModal.style.display = 'none';
    accountToDeleteId = null;
}

// Обновление таблицы
function updateTable() {
    const tableBody = document.querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Сортируем: сначала активные аккаунты, потом пустые слоты
    const activeAccounts = accounts.filter(acc => acc.isActive && acc.name);
    const emptyAccounts = accounts.filter(acc => !acc.isActive || !acc.name);
    
    // Добавляем все аккаунты, но пустые должны быть в конце
    const sortedAccounts = [...activeAccounts, ...emptyAccounts];
    
    if (sortedAccounts.length === 0) {
        // Если нет ни одного аккаунта, создаем два пустых слота
        accounts = [
            { id: 1, name: "", status: "", date: "", type: "", isActive: false },
            { id: 2, name: "", status: "", date: "", type: "", isActive: false }
        ];
        updateTable();
        return;
    }
    
    sortedAccounts.forEach((account) => {
        const row = document.createElement('tr');
        
        if (!account.name) {
            row.classList.add('empty-account');
        }
        
        // Формируем ячейки
        const nameCell = document.createElement('td');
        const nameDiv = document.createElement('div');
        nameDiv.className = 'account-name';
        nameDiv.textContent = account.name || 'Нет аккаунта';
        nameCell.appendChild(nameDiv);
        
        const statusCell = document.createElement('td');
        if (account.status) {
            const statusBadge = document.createElement('div');
            statusBadge.className = `status-badge ${account.status === 'Активный' ? 'check' : ''}`;
            statusBadge.textContent = account.status;
            statusCell.appendChild(statusBadge);
        }
        
        const dateCell = document.createElement('td');
        dateCell.textContent = account.date || '';
        
        const typeCell = document.createElement('td');
        if (account.type) {
            const typeSpan = document.createElement('span');
            typeSpan.className = 'account-type';
            typeSpan.textContent = account.type;
            typeCell.appendChild(typeSpan);
        }
        
        const actionsCell = document.createElement('td');
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';
        
        if (account.name) {
            // Кнопки для активного аккаунта
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn edit';
            editBtn.title = 'Редактировать';
            editBtn.setAttribute('onclick', `editAccount(${account.id})`);
            editBtn.innerHTML = '<span>✏️</span>';
            
            const syncBtn = document.createElement('button');
            syncBtn.className = 'action-btn sync';
            syncBtn.title = 'Синхронизировать';
            syncBtn.setAttribute('onclick', `syncAccount(${account.id})`);
            syncBtn.innerHTML = '<span>🔄</span>';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete';
            deleteBtn.title = 'Удалить';
            deleteBtn.setAttribute('onclick', `deleteAccount(${account.id})`);
            deleteBtn.innerHTML = '<span>🗑️</span>';
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(syncBtn);
            actionsDiv.appendChild(deleteBtn);
        } else {
            // Кнопка для пустого слота
            const addBtn = document.createElement('button');
            addBtn.className = 'action-btn add';
            addBtn.title = 'Добавить аккаунт';
            addBtn.setAttribute('onclick', 'addAccount()');
            addBtn.innerHTML = '<span>➕</span>';
            
            actionsDiv.appendChild(addBtn);
        }
        
        actionsCell.appendChild(actionsDiv);
        
        // Собираем строку
        row.appendChild(nameCell);
        row.appendChild(statusCell);
        row.appendChild(dateCell);
        row.appendChild(typeCell);
        row.appendChild(actionsCell);
        
        tableBody.appendChild(row);
    });
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Удаляем старое уведомление, если есть
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) oldNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Стили уведомления
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 18px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
    notification.style.zIndex = '10000';
    notification.style.fontSize = '14px';
    notification.style.animation = 'slideIn 0.3s ease';
    notification.style.border = '1px solid rgba(255,255,255,0.1)';
    
    // Цвета по типу
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопка сохранения аккаунта
    const saveBtn = document.getElementById('save-account');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAccount);
    }
    
    // Кнопки отмены
    const cancelModal = document.getElementById('cancel-modal');
    if (cancelModal) {
        cancelModal.addEventListener('click', () => {
            accountModal.style.display = 'none';
        });
    }
    
    const cancelDelete = document.getElementById('cancel-delete');
    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
    }
    
    // Закрытие модальных окон
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            accountModal.style.display = 'none';
        });
    }
    
    const closeConfirm = document.getElementById('close-confirm');
    if (closeConfirm) {
        closeConfirm.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
    }
    
    // Подтверждение удаления
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', (e) => {
        if (e.target === accountModal) {
            accountModal.style.display = 'none';
        }
        if (e.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
    });
    
    // Сохранение по Enter в модальном окне
    const accountForm = document.getElementById('account-form');
    if (accountForm) {
        accountForm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveAccount();
            }
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', init);