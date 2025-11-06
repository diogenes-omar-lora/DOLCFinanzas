import { formatDate, formatCurrency } from '../utils/Formatters.js';

export function initializeAccountsModule() {
    console.log('💳 Inicializando módulo de cuentas...');
    
    // ✅ ASIGNAR EXPLÍCITAMENTE TODOS LOS MÉTODOS
    this.loadAccountsTable = loadAccountsTable;
    this.updateAccountSelects = updateAccountSelects;
    this.deleteAccount = deleteAccount;
    this.updateAfterAccountChange = updateAfterAccountChange;
    
    // Cargar datos iniciales
    this.loadAccountsTable();
    this.updateAccountSelects();

    // Botón eliminar cuenta seleccionada
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const tbody = document.querySelector('#accounts-table tbody');
            const selectedRow = tbody ? tbody.querySelector('tr.selected') : null;
            if (!selectedRow) {
                alert('Selecciona una cuenta para eliminar.');
                return;
            }
            const id = parseInt(selectedRow.getAttribute('data-account-id'));
            if (!isNaN(id)) this.deleteAccount(id);
        });
    }

    // Botón abrir modal de nueva cuenta
    const openAddBtn = document.getElementById('open-add-account-modal-btn');
    const accountModal = document.getElementById('account-modal');
    const modalClose = document.getElementById('account-modal-close');
    const modalCancel = document.getElementById('account-modal-cancel');
    const modalOverlay = accountModal ? accountModal.querySelector('.modal-overlay') : null;

    const openModal = () => {
        if (!accountModal) return;
        accountModal.classList.remove('hidden');
        accountModal.setAttribute('aria-hidden', 'false');
        // focus primer campo
        const nameInput = document.getElementById('account-name');
        if (nameInput) setTimeout(() => nameInput.focus(), 0);
    };

    const closeModal = () => {
        if (!accountModal) return;
        accountModal.classList.add('hidden');
        accountModal.setAttribute('aria-hidden', 'true');
        const form = document.getElementById('account-form');
        if (form) form.reset();
    };

    if (openAddBtn) openAddBtn.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCancel) modalCancel.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

export function handleAccountSubmit(e) {
    e.preventDefault();
    console.log('💳 Procesando formulario de cuenta...');
    
    const name = document.getElementById('account-name').value;
    const type = document.getElementById('account-type').value;
    const balance = parseFloat(document.getElementById('account-balance').value);
    
    const newAccount = {
        id: this.dataManager.getNextAccountId(),
        name,
        type,
        balance
    };
    
    this.accounts.push(newAccount);
    this.dataManager.saveAccounts(this.accounts);
    
    this.showAlert('accounts-alert', 'Cuenta agregada exitosamente', 'success');
    this.updateAfterAccountChange();
    e.target.reset();
    // Cerrar modal si está abierto
    const modal = document.getElementById('account-modal');
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }
}

export function deleteAccount(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
        const hasTransactions = this.transactions.some(t => t.accountId === id);
        
        if (hasTransactions) {
            alert('No puedes eliminar una cuenta que tiene transacciones asociadas.');
            return;
        }
        
        this.accounts = this.accounts.filter(account => account.id !== id);
        this.dataManager.saveAccounts(this.accounts);
        this.updateAfterAccountChange();
    }
}

export function loadAccountsTable() {
    console.log('💳 Cargando tabla de cuentas...');
    const tbody = document.querySelector('#accounts-table tbody');
    if (!tbody) {
        console.error('❌ No se encontró tbody para accounts-table');
        return;
    }
    
    tbody.innerHTML = '';
    
    this.accounts.forEach(account => {
        const row = document.createElement('tr');
        row.setAttribute('data-account-id', account.id);
        row.innerHTML = `
            <td>${account.name}</td>
            <td>${account.type}</td>
            <td>$${formatCurrency(account.balance)}</td>
        `;
        // Selección de fila
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            const btn = document.getElementById('delete-account-btn');
            if (btn) btn.disabled = false;
        });
        tbody.appendChild(row);
    });
    
    // Deshabilitar botón si no hay selección o no hay cuentas
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) deleteBtn.disabled = !tbody.querySelector('tr.selected');

    console.log(`✅ Tabla de cuentas cargada con ${this.accounts.length} cuentas`);
}

export function updateAccountSelects() {
    console.log('🔧 Actualizando selects de cuentas...');
    const accountSelects = document.querySelectorAll('#transaction-account, #transfer-from, #transfer-to, #filter-account');
    
    accountSelects.forEach(select => {
        select.innerHTML = '<option value="">Selecciona una cuenta</option>';
        
        this.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.name} ($${formatCurrency(account.balance)})`;
            select.appendChild(option);
        });
    });
}

export function updateAfterAccountChange() {
    console.log('🔄 Actualizando después de cambio en cuentas...');
    this.loadAccountsTable();
    this.updateAccountSelects();
    this.updateDashboard();
}