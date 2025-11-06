export function initializeUsersModule() {
    console.log('👥 Inicializando módulo de usuarios...');
    
    // ✅ ASIGNAR EXPLÍCITAMENTE TODOS LOS MÉTODOS
    this.loadUsersTable = loadUsersTable;
    this.editUser = editUser;
    this.editSelectedUser = editSelectedUser;
    this.deleteUser = deleteUser;
    this.deleteSelectedUser = deleteSelectedUser;
    this.handleUserFormSubmit = handleUserFormSubmit;
    this.deleteUserData = deleteUserData;
    this.moveUserData = moveUserData;
    
    // Variable para almacenar el usuario seleccionado
    this.selectedUsername = null;
    
    // Cargar datos iniciales
    this.loadUsersTable();
    
    // Configurar modal de edición
    const userModal = document.getElementById('user-modal');
    const modalClose = document.getElementById('user-modal-close');
    const modalCancel = document.getElementById('user-modal-cancel');
    const modalOverlay = userModal ? userModal.querySelector('.modal-overlay') : null;

    const closeModal = () => {
        if (!userModal) return;
        userModal.classList.add('hidden');
        userModal.setAttribute('aria-hidden', 'true');
        const form = document.getElementById('user-form');
        if (form) form.reset();
        this.editingUser = null;
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCancel) modalCancel.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && userModal && !userModal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Botón editar usuario seleccionado
    const editBtn = document.getElementById('edit-user-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (this.selectedUsername !== null) {
                this.editSelectedUser();
            }
        });
    }
    
    // Botón eliminar usuario seleccionado
    const deleteBtn = document.getElementById('delete-user-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (this.selectedUsername !== null) {
                this.deleteSelectedUser();
            }
        });
    }
}

// ... (mantener el resto del código de Users.js igual)
export function loadUsersTable() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const users = this.dataManager.getUsers();
    const currentUser = sessionStorage.getItem('currentUser');

    Object.entries(users).forEach(([username, userData]) => {
        const row = document.createElement('tr');
        const regDate = this.dataManager.getUserRegistrationDate(username);
        
        row.dataset.username = username;
        row.style.cursor = username === currentUser ? 'default' : 'pointer';

        row.innerHTML = `
            <td>${username} ${username === currentUser ? '(Tú)' : ''}</td>
            <td><span class="role-${userData.role}">${userData.role === 'admin' ? 'Administrador' : 'Usuario Normal'}</span></td>
            <td>${regDate}</td>
        `;
        
        // No permitir seleccionar el usuario actual
        if (username !== currentUser) {
            row.addEventListener('click', () => {
                // Quitar selección de todas las filas
                tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                
                // Seleccionar la fila actual
                row.classList.add('selected');
                this.selectedUsername = username;
                
                // Habilitar los botones de editar y eliminar
                const editBtn = document.getElementById('edit-user-btn');
                const deleteBtn = document.getElementById('delete-user-btn');
                if (editBtn) editBtn.disabled = false;
                if (deleteBtn) deleteBtn.disabled = false;
            });
        }
        
        tbody.appendChild(row);
    });
}

export function editUser(username) {
    const users = this.dataManager.getUsers();
    const userData = users[username];

    if (!userData) return;

    const editUsernameInput = document.getElementById('edit-username');
    editUsernameInput.readOnly = false;
    editUsernameInput.value = username;
    document.getElementById('edit-role').value = userData.role;
    document.getElementById('edit-password').value = '';
    document.getElementById('confirm-edit-password').value = '';

    this.editingUser = username;
    
    // Abrir el modal
    const modal = document.getElementById('user-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
    }
}

export function editSelectedUser() {
    if (this.selectedUsername === null) return;
    this.editUser(this.selectedUsername);
}

export function deleteUser(username) {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
        const users = this.dataManager.getUsers();
        const currentUser = sessionStorage.getItem('currentUser');
        
        if (username === currentUser) {
            this.showAlert('users-alert', 'No puedes eliminar tu propio usuario', 'error');
            return;
        }

        delete users[username];
        this.dataManager.saveUsers(users);
        this.deleteUserData(username);

        this.showAlert('users-alert', `Usuario "${username}" eliminado correctamente`, 'success');
        
        // Resetear selección
        this.selectedUsername = null;
        const editBtn = document.getElementById('edit-user-btn');
        const deleteBtn = document.getElementById('delete-user-btn');
        if (editBtn) editBtn.disabled = true;
        if (deleteBtn) deleteBtn.disabled = true;
        
        this.loadUsersTable();
    }
}

export function deleteSelectedUser() {
    if (this.selectedUsername === null) return;
    this.deleteUser(this.selectedUsername);
}

export function handleUserFormSubmit(e) {
    e.preventDefault();

    if (!this.editingUser) {
        this.showAlert('users-alert', 'No hay usuario seleccionado para editar', 'error');
        return;
    }

    const newUsername = document.getElementById('edit-username').value.trim();
    const newRole = document.getElementById('edit-role').value;
    const newPassword = document.getElementById('edit-password').value;
    const confirmPassword = document.getElementById('confirm-edit-password').value;

    const users = this.dataManager.getUsers();

    if (!users[this.editingUser]) {
        this.showAlert('users-alert', 'El usuario original no existe', 'error');
        return;
    }

    if (!newUsername) {
        this.showAlert('users-alert', 'El nombre de usuario no puede estar vacío', 'error');
        return;
    }

    if (newPassword && newPassword !== confirmPassword) {
        this.showAlert('users-alert', 'Las contraseñas no coinciden', 'error');
        return;
    }

    if (newUsername !== this.editingUser && users[newUsername]) {
        this.showAlert('users-alert', `El nombre de usuario "${newUsername}" ya existe`, 'error');
        return;
    }

    const userObj = users[this.editingUser];

    if (newPassword) {
        userObj.password = newPassword;
    }

    userObj.role = newRole;

    if (newUsername !== this.editingUser) {
        users[newUsername] = Object.assign({}, userObj, { name: newUsername });
        this.moveUserData(this.editingUser, newUsername);
        delete users[this.editingUser];
    } else {
        users[this.editingUser].name = newUsername;
    }

    this.dataManager.saveUsers(users);
    this.showAlert('users-alert', `Usuario "${newUsername}" actualizado correctamente`, 'success');
    
        // Cerrar modal
        const modal = document.getElementById('user-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
        }
    
        // Resetear selección
        this.selectedUsername = null;
        const editBtn = document.getElementById('edit-user-btn');
        const deleteBtn = document.getElementById('delete-user-btn');
        if (editBtn) editBtn.disabled = true;
        if (deleteBtn) deleteBtn.disabled = true;
    
        this.loadUsersTable();
    
        const userForm = document.getElementById('user-form');
        if (userForm) userForm.reset();
        this.editingUser = null;
}

export function deleteUserData(username) {
    const keysToRemove = [
        `financeData_${username}_accounts`,
        `financeData_${username}_transactions`,
        `financeData_${username}_nextAccountId`,
        `financeData_${username}_nextTransactionId`,
        `userRegDate_${username}`
    ];

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
}

export function moveUserData(oldUsername, newUsername) {
    const keysToMove = [
        '_accounts',
        '_transactions',
        '_nextAccountId',
        '_nextTransactionId'
    ];

    keysToMove.forEach(suffix => {
        const oldKey = `financeData_${oldUsername}${suffix}`;
        const newKey = `financeData_${newUsername}${suffix}`;
        const value = localStorage.getItem(oldKey);
        if (value !== null) {
            localStorage.setItem(newKey, value);
            localStorage.removeItem(oldKey);
        }
    });

    const oldRegKey = `userRegDate_${oldUsername}`;
    const newRegKey = `userRegDate_${newUsername}`;
    const regDate = localStorage.getItem(oldRegKey);
    if (regDate !== null) {
        localStorage.setItem(newRegKey, regDate);
        localStorage.removeItem(oldRegKey);
    }
}