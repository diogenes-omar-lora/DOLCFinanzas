import { formatDate, formatCurrency } from '../utils/Formatters.js';
import { getTodayDateString } from '../utils/Helpers.js';

export function initializeTransactionsModule() {
    console.log('💸 Inicializando módulo de transacciones...');
    
    // ✅ ASIGNAR EXPLÍCITAMENTE TODOS LOS MÉTODOS
    this.loadTransactionsTable = loadTransactionsTable;
    this.deleteTransaction = deleteTransaction;
    this.deleteSelectedTransaction = deleteSelectedTransaction;
    this.updateAfterTransactionChange = updateAfterTransactionChange;
    this.sortTransactionsByDate = sortTransactionsByDate;
    this.updateAccountBalance = updateAccountBalance;
    this.revertTransactionEffect = revertTransactionEffect;
    this.scrollTableToTop = scrollTableToTop;
    
    // Variable para almacenar la transacción seleccionada
    this.selectedTransactionId = null;
    
    // Cargar datos iniciales
    this.loadTransactionsTable();
    
    // Botón abrir modal de nueva transacción
    const openAddBtn = document.getElementById('open-add-transaction-modal-btn');
    const transactionModal = document.getElementById('transaction-modal');
    const modalClose = document.getElementById('transaction-modal-close');
    const modalCancel = document.getElementById('transaction-modal-cancel');
    const modalOverlay = transactionModal ? transactionModal.querySelector('.modal-overlay') : null;

    const openModal = () => {
        if (!transactionModal) return;
        transactionModal.classList.remove('hidden');
        transactionModal.setAttribute('aria-hidden', 'false');
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) setTimeout(() => dateInput.focus(), 0);
    };

    const closeModal = () => {
        if (!transactionModal) return;
        transactionModal.classList.add('hidden');
        transactionModal.setAttribute('aria-hidden', 'true');
        const form = document.getElementById('transaction-form');
        if (form) {
            form.reset();
            document.getElementById('transaction-date').value = getTodayDateString();
        }
    };

    if (openAddBtn) openAddBtn.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCancel) modalCancel.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && transactionModal && !transactionModal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Botón toggle filtros
    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    const filtersSection = document.getElementById('filters-section');
    if (toggleFiltersBtn && filtersSection) {
        toggleFiltersBtn.addEventListener('click', () => {
            filtersSection.classList.toggle('hidden');
            toggleFiltersBtn.textContent = filtersSection.classList.contains('hidden') ? 'Filtros' : 'Ocultar filtros';
        });
    }
    
    // Botón eliminar transacción seleccionada
    const deleteBtn = document.getElementById('delete-transaction-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (this.selectedTransactionId !== null) {
                this.deleteSelectedTransaction();
            }
        });
    }
}

export function handleTransactionSubmit(e) {
    e.preventDefault();
    console.log('💸 Procesando formulario de transacción...');
    
    const date = document.getElementById('transaction-date').value;
    console.log(`📅 Fecha capturada del formulario: ${date}`);
    
    const description = document.getElementById('transaction-description').value;
    const category = document.getElementById('transaction-category').value;
    const type = document.getElementById('transaction-type').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const accountId = parseInt(document.getElementById('transaction-account').value);
    
    const newTransaction = {
        id: this.dataManager.getNextTransactionId(),
        date,
        timestamp: this.dataManager.getCurrentDateTime(),
        description,
        category,
        type,
        amount,
        accountId
    };
    
    console.log(`✅ Transacción creada con fecha: ${newTransaction.date}`);
    
    this.transactions.push(newTransaction);
    this.dataManager.saveTransactions(this.transactions);
    this.updateAccountBalance(accountId, type, amount);
    
    this.showAlert('transactions-alert', 'Transacción agregada exitosamente', 'success');
    this.updateAfterTransactionChange();
    e.target.reset();
    
    // Restablecer la fecha al día actual
    document.getElementById('transaction-date').value = getTodayDateString();
    
    // Cerrar modal si está abierto
    const modal = document.getElementById('transaction-modal');
    if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }
}

export function deleteTransaction(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
        const transaction = this.transactions.find(t => t.id === id);
        
        if (transaction) {
            this.revertTransactionEffect(transaction);
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.dataManager.saveTransactions(this.transactions);
            this.updateAfterTransactionChange();
        }
    }
}

export function deleteSelectedTransaction() {
    if (this.selectedTransactionId === null) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
        const transaction = this.transactions.find(t => t.id === this.selectedTransactionId);
        
        if (transaction) {
            this.revertTransactionEffect(transaction);
            this.transactions = this.transactions.filter(t => t.id !== this.selectedTransactionId);
            this.dataManager.saveTransactions(this.transactions);
            this.selectedTransactionId = null;
            
            // Deshabilitar el botón de eliminar
            const deleteBtn = document.getElementById('delete-transaction-btn');
            if (deleteBtn) deleteBtn.disabled = true;
            
            this.showAlert('transactions-alert', 'Transacción eliminada exitosamente', 'success');
            this.updateAfterTransactionChange();
        }
    }
}

export function loadTransactionsTable(transactionsToShow = null) {
    console.log('💸 Cargando tabla de transacciones...');
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) {
        console.error('❌ No se encontró tbody para transactions-table');
        return;
    }
    
    tbody.innerHTML = '';
    
    const transactions = transactionsToShow || this.transactions;
    const sortedTransactions = this.sortTransactionsByDate(transactions);
    
    sortedTransactions.forEach(transaction => {
        const account = this.accounts.find(a => a.id === transaction.accountId);
        const row = document.createElement('tr');
        row.dataset.transactionId = transaction.id;
        row.style.cursor = 'pointer';
        
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
            <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">$${formatCurrency(transaction.amount)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>${account ? account.name : 'N/A'}</td>
        `;
        
        // Agregar evento de clic para seleccionar la fila
        row.addEventListener('click', (e) => {
            
            // Quitar selección de todas las filas
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            
            // Seleccionar la fila actual
            row.classList.add('selected');
            this.selectedTransactionId = transaction.id;
            
            // Habilitar el botón de eliminar
            const deleteBtn = document.getElementById('delete-transaction-btn');
            if (deleteBtn) deleteBtn.disabled = false;
        });
        
        tbody.appendChild(row);
    });
    
    this.scrollTableToTop('.transactions-table-wrapper');
    console.log(`✅ Tabla de transacciones cargada con ${sortedTransactions.length} transacciones`);
}

export function sortTransactionsByDate(transactions) {
    return [...transactions].sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : this.dataManager.parseDateLocal(a.date);
        const dateB = b.timestamp ? new Date(b.timestamp) : this.dataManager.parseDateLocal(b.date);
        return dateB - dateA;
    });
}

export function updateAccountBalance(accountId, type, amount) {
    const account = this.accounts.find(a => a.id === accountId);
    if (account) {
        if (type === 'income') {
            account.balance += amount;
        } else {
            account.balance -= amount;
        }
        this.dataManager.saveAccounts(this.accounts);
    }
}

export function revertTransactionEffect(transaction) {
    const account = this.accounts.find(a => a.id === transaction.accountId);
    if (account) {
        if (transaction.type === 'income') {
            account.balance -= transaction.amount;
        } else {
            account.balance += transaction.amount;
        }
        this.dataManager.saveAccounts(this.accounts);
    }
}

export function updateAfterTransactionChange() {
    console.log('🔄 Actualizando después de cambio en transacciones...');
    this.loadTransactionsTable();
    this.loadAccountsTable();
    this.updateDashboard();
    this.updateAccountSelects();
}

export function scrollTableToTop(selector) {
    const wrapper = document.querySelector(selector);
    if (wrapper) wrapper.scrollTop = 0;
}