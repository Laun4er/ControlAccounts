 // Данные аккаунтов
        let accounts = [
            { id: 1, name: "", status: "", date: "", type: "", isActive: true },
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
            
            // Настройка автозаполнения для типа аккаунта
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
        
        // Показать подсказки типов
        function showTypeSuggestions(types) {
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
            typeInput.value = type;
            typeSuggestions.style.display = 'none';
            typeInput.focus();
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
            if (account.status === '✅ check') {
                statusSelect.value = 'check';
            } else if (account.status === 'Неактивный') {
                statusSelect.value = 'inactive';
            } else if (account.status === 'Ожидание') {
                statusSelect.value = 'pending';
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
            const originalIcon = syncBtn.textContent;
            syncBtn.textContent = '⏳';
            syncBtn.parentElement.style.pointerEvents = 'none';
            
            setTimeout(() => {
                syncBtn.textContent = originalIcon;
                syncBtn.parentElement.style.pointerEvents = 'auto';
                showNotification(`Аккаунт "${account.name}" синхронизирован`, 'success');
            }, 1000);
        }
        
        // Подтверждение удаления аккаунта
        function deleteAccount(id) {
            const account = accounts.find(acc => acc.id === id);
            if (!account || !account.name) return;
            
            // Нельзя удалить основной аккаунт
            if (account.type === 'Основной' && account.name === 'Laun4er') {
                showNotification('Нельзя удалить основной аккаунт', 'error');
                return;
            }
            
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
                    accounts[accountIndex].isActive = true;
                    
                    showNotification(`Аккаунт "${name}" обновлен`, 'success');
                }
            } else {
                // Добавление нового аккаунта
                const emptyAccountIndex = accounts.findIndex(acc => !acc.name);
                
                if (emptyAccountIndex !== -1) {
                    // Заполняем пустой слот
                    accounts[emptyAccountIndex] = {
                        id: accounts.length + 1,
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
                        return;
                    }
                    
                    // Добавляем новый аккаунт
                    accounts.push({
                        id: accounts.length + 1,
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
            tableBody.innerHTML = '';
            
            // Сортируем: сначала активные аккаунты, потом пустые слоты
            const activeAccounts = accounts.filter(acc => acc.isActive);
            const emptyAccounts = accounts.filter(acc => !acc.isActive);
            const sortedAccounts = [...activeAccounts, ...emptyAccounts];
            
            sortedAccounts.forEach((account, index) => {
                const row = document.createElement('tr');
                
                if (!account.name) {
                    row.classList.add('empty-account');
                }
                
                row.innerHTML = `
                    <td>
                        <div class="account-name">${account.name || 'Нет аккаунта'}</div>
                    </td>
                    <td>
                        ${account.status ? `<div class="status-badge ${account.status === 'Активный' ? 'check' : ''}">
                            ${account.status}
                        </div>` : ''}
                    </td>
                    <td>${account.date || ''}</td>
                    <td>
                        ${account.type ? `<span class="account-type">${account.type}</span>` : ''}
                    </td>
                    <td>
                        <div class="actions">
                            ${account.name ? `
                                <button class="action-btn edit" title="Редактировать" onclick="editAccount(${account.id})">
                                    <span>✏️</span>
                                </button>
                                <button class="action-btn sync" title="Синхронизировать" onclick="syncAccount(${account.id})">
                                    <span>🔄</span>
                                </button>
                                <button class="action-btn delete" title="Удалить" onclick="deleteAccount(${account.id})">
                                    <span>🗑️</span>
                                </button>
                            ` : `
                                <button class="action-btn add" title="Добавить аккаунт" onclick="addAccount()">
                                    <span>➕</span>
                                </button>
                            `}
                        </div>
                    </td>
                `;
                
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
            document.getElementById('save-account').addEventListener('click', saveAccount);
            
            // Кнопки отмены
            document.getElementById('cancel-modal').addEventListener('click', () => {
                accountModal.style.display = 'none';
            });
            
            document.getElementById('cancel-delete').addEventListener('click', () => {
                confirmModal.style.display = 'none';
            });
            
            // Закрытие модальных окон
            document.getElementById('close-modal').addEventListener('click', () => {
                accountModal.style.display = 'none';
            });
            
            document.getElementById('close-confirm').addEventListener('click', () => {
                confirmModal.style.display = 'none';
            });
            
            // Подтверждение удаления
            document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
            
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
            document.getElementById('account-form').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveAccount();
                }
            });
        }
        
        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', init);