import { DataManager } from './DataManager.js';
import { setupForms, setDefaultDates } from '../ui/DOMController.js'; // ✅ SOLO estas importaciones
import { applyTheme } from '../ui/ThemeManager.js';
import { initializeAccountsModule } from '../modules/Accounts.js';
import { initializeTransactionsModule } from '../modules/Transactions.js';
import { initializeTransfersModule } from '../modules/Transfers.js';
import { initializeUsersModule } from '../modules/Users.js';
import { initializeReportsModule } from '../modules/Reports.js';

export default class FinanceApp {
    constructor() {
        console.log('🔄 Constructor de FinanceApp llamado');
        
        this.dataManager = new DataManager();
        this.accounts = this.dataManager.getAccounts();
        this.transactions = this.dataManager.getTransactions();
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isMobileMenuOpen = false;
        this.isMoreSubmenuOpen = false;
        
        this.financeChart = null;
        this.expensesChart = null;
        this.incomeExpenseChart = null;
        
        // ✅ ASIGNAR MÉTODOS DIRECTAMENTE
        this.setDefaultDates = setDefaultDates;
        this.applyTheme = applyTheme;
        
        this.initializeApp();
    }

    initializeApp() {
        try {
            console.log('🔄 Inicializando aplicación...');
            
            // ✅ 1. CONFIGURAR DOM PRIMERO
            this.setupDOMElements();
            
            // ✅ 2. CONFIGURAR EVENT LISTENERS DIRECTAMENTE
            this.setupEventListeners();
            
            // ✅ 3. CONFIGURAR FORMULARIOS
            setupForms.call(this);
            
            // ✅ 4. INICIALIZAR MÓDULOS
            initializeAccountsModule.call(this);
            initializeTransactionsModule.call(this);
            initializeTransfersModule.call(this);
            initializeUsersModule.call(this);
            initializeReportsModule.call(this);
            
            // ✅ 5. CONFIGURACIÓN ADICIONAL
            this.initMonthSelector();
            this.applyTheme(this.currentTheme);
            
            // ✅ 6. MOSTRAR APLICACIÓN
            this.appScreen.classList.remove('hidden');

            // ✅ 7. Establecer sección activa en data-attribute del body (para estilos responsivos por sección)
            const activeLink = document.querySelector('.nav-link.active');
            const initialSection = activeLink ? activeLink.getAttribute('data-section') : 'dashboard';
            document.body.dataset.section = initialSection;
            
            console.log('✅ Aplicación inicializada correctamente');

        } catch (error) {
            console.error('Error in initializeApp:', error);
            throw error;
        }
    }

    setupDOMElements() {
        console.log('🔧 Configurando elementos DOM...');
        
        this.appScreen = document.getElementById('app-screen');
        this.logoutBtn = document.getElementById('logout-btn');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        this.sectionTitle = document.getElementById('section-title');
        this.moreMenuToggle = document.getElementById('more-menu-toggle');
        this.moreSubmenu = document.getElementById('more-submenu');
        this.menuOverlay = document.querySelector('.menu-overlay');
        
        console.log(`📊 Enlaces de navegación encontrados: ${this.navLinks.length}`);
        
        this.setupSidebarUser();
        this.checkAdminAccess();
    }

    setupEventListeners() {
        console.log('🎯 Configurando event listeners directamente...');
        
        // ✅ NAVEGACIÓN - CONFIGURAR DIRECTAMENTE
        if (this.navLinks && this.navLinks.length) {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => this.handleNavigation(e));
            });
        }

        // ✅ BOTÓN DE TEMA
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // ✅ BOTÓN DE MENÚ MÓVIL
        const menuToggleBtn = document.getElementById('menu-toggle');
        if (menuToggleBtn) {
            menuToggleBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // ✅ BOTÓN CERRAR SIDEBAR
        const closeSidebarBtn = document.getElementById('close-sidebar');
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => this.closeMobileMenu());
        }

        // ✅ OVERLAY
        const menuOverlay = this.menuOverlay || document.querySelector('.menu-overlay');
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
                this.closeMoreSubmenu();
            });
        }

        // ✅ LOGOUT
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // ✅ FILTROS Y EXPORTACIÓN
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Exportar (botón dentro de Reportes)
        const reportsExportBtn = document.getElementById('reports-export-btn');
        if (reportsExportBtn) {
            reportsExportBtn.addEventListener('click', () => this.exportToCSV());
        }

        // Botón "Mes actual" dentro de Reportes
        const reportsCurrentMonthBtn = document.getElementById('reports-current-month-btn');
        if (reportsCurrentMonthBtn) {
            reportsCurrentMonthBtn.addEventListener('click', () => this.setCurrentMonth());
        }

        // ✅ Toggle "Más" (submenú móvil)
        if (this.moreMenuToggle) {
            this.moreMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMoreSubmenu();
            });
            this.moreMenuToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMoreSubmenu();
                }
                if (e.key === 'Escape') this.closeMoreSubmenu();
            });
        }

        // ✅ Items del submenú
        if (this.moreSubmenu) {
            this.moreSubmenu.addEventListener('keydown', (e) => this.handleSubmenuKeydown(e));
            const submenuItems = this.moreSubmenu.querySelectorAll('.submenu-item');
            submenuItems.forEach(item => {
                item.addEventListener('click', (e) => this.handleSubmenuItemClick(e));
            });
        }

        // ✅ RESIZE
        window.addEventListener('resize', () => this.handleResize());

        console.log('✅ Event listeners configurados directamente');
    }

    // ✅ MÉTODO DE NAVEGACIÓN DIRECTAMENTE EN LA CLASE
    handleNavigation(e) {
        e.preventDefault();
        console.log('🔄 Manejando navegación...');

        const link = e.currentTarget || e.target.closest('.nav-link');
        if (!link) {
            console.error('❌ No se pudo encontrar el enlace clickeado');
            return;
        }

        const sectionId = link.getAttribute('data-section');
        console.log(`🔗 Navegando a: ${sectionId}`);

        // Bloquear navegación a Usuarios si no es admin (especialmente en móvil)
        if (sectionId === 'users') {
            const role = sessionStorage.getItem('userRole');
            if (role !== 'admin') {
                console.warn('⛔ Acceso a Usuarios bloqueado para rol no admin');
                return;
            }
        }

        if (sectionId === 'logout') {
            this.handleLogout();
            return;
        }

        // Actualizar navegación activa
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Mostrar sección
        this.sections.forEach(section => {
            section.classList.add('hidden');
            if (section.id === `${sectionId}-section`) {
                section.classList.remove('hidden');
                const titleText = link.textContent.trim();
                if (this.sectionTitle) {
                    this.sectionTitle.textContent = titleText;
                }
                console.log(`✅ Sección ${sectionId} mostrada`);
            }
        });

        // Guardar sección activa en el body para estilos condicionales
        document.body.dataset.section = sectionId;

    // Actualizar controles de UI SIEMPRE (móvil y desktop)
    this.toggleMonthSelector(sectionId);
    this.toggleExportButton(sectionId);
    this.toggleThemeButton(sectionId);
    this.toggleHeaderCurrentMonthBtn(sectionId);
    // Cerrar menú móvil y submenú si aplica
        this.closeMobileMenu();
    this.closeMoreSubmenu();

        // Actualizar contenido de la sección
        this.updateSectionContent(sectionId);
    }

    toggleMonthSelector(sectionId) {
        const monthSelector = document.querySelector('.month-selector');
        if (monthSelector) {
            monthSelector.style.display = (sectionId === 'dashboard' || sectionId === 'reports') ? 'inline-flex' : 'none';
        }
    }

    toggleExportButton(sectionId) {
        // Ya no usamos el botón del header; el botón de Reportes está dentro de la sección
        const headerExportBtn = document.getElementById('export-csv-btn');
        if (headerExportBtn) headerExportBtn.style.display = 'none';
        const reportsExportBtn = document.getElementById('reports-export-btn');
        if (reportsExportBtn) {
            reportsExportBtn.style.display = sectionId === 'reports' ? 'inline-flex' : 'none';
        }
    }

    toggleThemeButton(sectionId) {
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (!themeToggleBtn) return;
        // Mostrar el botón de tema solo en Dashboard
        themeToggleBtn.style.display = sectionId === 'dashboard' ? 'flex' : 'none';
    }

    toggleHeaderCurrentMonthBtn(sectionId) {
        const currentBtn = document.getElementById('dashboard-current-month-btn');
        if (!currentBtn) return;
        // En Reportes solo se muestra el campo; el botón se mueve a la toolbar
        currentBtn.style.display = sectionId === 'reports' ? 'none' : 'inline-flex';
    }

    updateSectionContent(sectionId) {
        console.log(`🔄 Actualizando contenido de: ${sectionId}`);
        
        const sectionActions = {
            'dashboard': () => this.updateDashboard(),
            'reports': () => this.updateReports(),
            'transfers': () => this.loadTransfersTable(),
            'users': () => this.loadUsersTable()
        };

        const action = sectionActions[sectionId];
        if (action) action();
    }

    // ✅ MÉTODO TOGGLE THEME DIRECTAMENTE EN LA CLASE
    toggleTheme() {
        console.log('🎨 Cambiando tema...');
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    // ✅ MÉTODOS MOBILE DIRECTAMENTE EN LA CLASE
    toggleMobileMenu() {
        console.log('📱 Alternando menú móvil...');
        if (window.innerWidth <= 767) return;
        
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        this.updateMobileMenu();
    }

    closeMobileMenu() {
        console.log('❌ Cerrando menú móvil...');
        if (window.innerWidth <= 767) return;
        
        this.isMobileMenuOpen = false;
        this.updateMobileMenu();
    }

    updateMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = this.menuOverlay || document.querySelector('.menu-overlay');
        const menuIcon = document.querySelector('.menu-toggle-btn i');

        if (window.innerWidth <= 767) {
            if (sidebar) {
                sidebar.style.display = 'block';
                sidebar.style.position = 'fixed';
                sidebar.style.bottom = '0';
                sidebar.style.top = 'auto';
            }
            return;
        }

        if (sidebar) {
            sidebar.classList.toggle('mobile-open', this.isMobileMenuOpen);
        }

        if (overlay) {
            // Mostrar overlay si menú lateral o submenú están abiertos
            const shouldShow = this.isMobileMenuOpen || this.isMoreSubmenuOpen;
            overlay.style.display = shouldShow ? 'block' : 'none';
        }

        if (menuIcon) {
            menuIcon.className = this.isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars';
        }

        document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
    }

    handleResize() {
        // Re-evaluar visibilidad de controles en cualquier tamaño
        const activeLink = document.querySelector('.nav-link.active');
        const sectionId = activeLink ? activeLink.getAttribute('data-section') : 'dashboard';
        this.toggleMonthSelector(sectionId);
        this.toggleExportButton(sectionId);
        this.toggleThemeButton(sectionId);
        this.toggleHeaderCurrentMonthBtn(sectionId);

        // Cerrar menú si se expandió a escritorio
        if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Cerrar submenú en escritorio o al cambiar layout
        if (window.innerWidth >= 768 && this.isMoreSubmenuOpen) {
            this.closeMoreSubmenu();
        }
    }

    setupSidebarUser() {
        try {
            const sidebarUsernameEl = document.getElementById('sidebar-username');
            const sidebarUserContainer = document.getElementById('sidebar-user');
            const currentUser = sessionStorage.getItem('currentUser');
            
            if (sidebarUsernameEl && sidebarUserContainer && currentUser) {
                const users = this.dataManager.getUsers();
                let displayName = currentUser;
                if (users && users[currentUser] && users[currentUser].name) {
                    displayName = users[currentUser].name;
                }
                sidebarUsernameEl.textContent = displayName;
                sidebarUserContainer.classList.remove('hidden');
            }
        } catch (err) {
            console.warn('No se pudo mostrar el nombre en la barra lateral:', err);
        }
    }

    checkAdminAccess() {
        const userRole = sessionStorage.getItem('userRole');
    const usersNavLink = document.getElementById('users-nav-link');
        const usersSection = document.getElementById('users-section');
        const body = document.body;
    const usersNavItem = usersNavLink ? usersNavLink.closest('li') : null;

        if (usersNavLink) {
            if (userRole === 'admin') {
                usersNavLink.style.display = 'block';
                if (body) body.classList.add('is-admin');
                if (usersNavItem) usersNavItem.style.display = '';
                console.log('✅ Usuario admin - mostrando enlace de usuarios');
            } else {
                // Ocultar siempre para usuarios no admin (móvil y desktop)
                usersNavLink.style.display = 'none';
                if (usersSection) usersSection.classList.add('hidden');
                if (body) body.classList.remove('is-admin');
                if (usersNavItem) usersNavItem.style.display = 'none';

                // Si por alguna razón estaba activa la sección de usuarios, volver a dashboard
                const activeLink = document.querySelector('.nav-link.active');
                if (activeLink && activeLink.getAttribute('data-section') === 'users') {
                    const dashboardLink = document.querySelector('.nav-link[data-section="dashboard"]');
                    if (dashboardLink) {
                        activeLink.classList.remove('active');
                        dashboardLink.classList.add('active');
                        this.sectionTitle.textContent = dashboardLink.textContent.trim();
                        this.sections.forEach(sec => {
                            sec.classList.add('hidden');
                            if (sec.id === 'dashboard-section') sec.classList.remove('hidden');
                        });
                    }
                }
            }
        }
    }

    showAlert(elementId, message, type) {
        const alert = document.getElementById(elementId);
        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        alert.classList.remove('hidden');
        
        setTimeout(() => {
            alert.classList.add('hidden');
        }, 3000);
    }

    handleLogout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('userRole');
        window.location.href = 'login.html';
    }

    initMonthSelector() {
        const monthPicker = document.getElementById('dashboard-month-picker');
        const currentBtn = document.getElementById('dashboard-current-month-btn');
        const monthSelector = document.querySelector('.month-selector');

        if (!monthPicker) return;

        if (monthSelector) {
            const currentSection = document.querySelector('.nav-link.active');
            const sectionId = currentSection ? currentSection.getAttribute('data-section') : 'dashboard';
            monthSelector.style.display = (sectionId === 'dashboard' || sectionId === 'reports') ? 'inline-flex' : 'none';
        }

        const today = new Date();
        const pad = (v) => v.toString().padStart(2, '0');
        monthPicker.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
        this.selectedYear = today.getFullYear();
        this.selectedMonth = today.getMonth();

        monthPicker.addEventListener('change', () => {
            const val = monthPicker.value;
            if (!val) return;
            const parts = val.split('-');
            if (parts.length < 2) return;
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            this.selectedYear = y;
            this.selectedMonth = m;
            this.updateDashboard();
            this.updateReports();
        });

        if (currentBtn) currentBtn.addEventListener('click', () => this.setCurrentMonth());
    }

    setCurrentMonth() {
        const monthPicker = document.getElementById('dashboard-month-picker');
        if (!monthPicker) return;
        const t = new Date();
        const pad = (v) => v.toString().padStart(2, '0');
        monthPicker.value = `${t.getFullYear()}-${pad(t.getMonth() + 1)}`;
        this.selectedYear = t.getFullYear();
        this.selectedMonth = t.getMonth();
        this.updateDashboard();
        this.updateReports();
    }

    // ===== Submenú móvil ("Más") =====
    toggleMoreSubmenu(force) {
        const open = typeof force === 'boolean' ? force : !this.isMoreSubmenuOpen;
        if (open) return this.openMoreSubmenu();
        return this.closeMoreSubmenu();
    }

    openMoreSubmenu() {
        if (!this.moreSubmenu || !this.moreMenuToggle) return;
        this.isMoreSubmenuOpen = true;
        this.moreSubmenu.classList.remove('hidden');
        this.moreSubmenu.classList.add('open');
        this.moreSubmenu.setAttribute('aria-hidden', 'false');
        this.moreMenuToggle.setAttribute('aria-expanded', 'true');

        // Mostrar overlay mientras está abierto
        const overlay = this.menuOverlay || document.querySelector('.menu-overlay');
        if (overlay) overlay.style.display = 'block';

        // Enfocar el primer ítem
        const firstItem = this.moreSubmenu.querySelector('.submenu-item');
        if (firstItem) firstItem.focus();
    }

    closeMoreSubmenu() {
        if (!this.moreSubmenu || !this.moreMenuToggle) return;
        this.isMoreSubmenuOpen = false;
        this.moreSubmenu.classList.remove('open');
        this.moreSubmenu.classList.add('hidden');
        this.moreSubmenu.setAttribute('aria-hidden', 'true');
        this.moreMenuToggle.setAttribute('aria-expanded', 'false');

        // Ocultar overlay solo si el menú lateral tampoco está abierto
        const overlay = this.menuOverlay || document.querySelector('.menu-overlay');
        if (overlay && !this.isMobileMenuOpen) overlay.style.display = 'none';

        // Devolver foco al toggle
        this.moreMenuToggle.focus();
    }

    handleSubmenuItemClick(e) {
        e.preventDefault();
        const item = e.currentTarget;
        const targetSection = item.getAttribute('data-target-section');
        if (!targetSection) return;

        this.closeMoreSubmenu();

        if (targetSection === 'logout') {
            this.handleLogout();
            return;
        }

        // Buscar enlace principal y simular click para reutilizar navegación
        const mainLink = document.querySelector(`.nav-link[data-section="${targetSection}"]`);
        if (mainLink) {
            mainLink.click();
        }
    }

    handleSubmenuKeydown(e) {
        const items = Array.from(this.moreSubmenu.querySelectorAll('.submenu-item'));
        if (!items.length) return;
        const currentIndex = items.indexOf(document.activeElement);
        let nextIndex = -1;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (currentIndex + 1 + items.length) % items.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = (currentIndex - 1 + items.length) % items.length;
                break;
            case 'Home':
                nextIndex = 0; break;
            case 'End':
                nextIndex = items.length - 1; break;
            case 'Escape':
                this.closeMoreSubmenu();
                return;
            default:
                return; // Dejar que otras teclas fluyan
        }

        if (nextIndex >= 0) {
            e.preventDefault();
            items[nextIndex].focus();
        }
    }

    // Métodos placeholder que serán sobreescritos por los módulos
    updateDashboard() { console.log('📊 updateDashboard placeholder'); }
    updateReports() { console.log('📈 updateReports placeholder'); }
    loadAccountsTable() { console.log('💳 loadAccountsTable placeholder'); }
    updateAccountSelects() { console.log('🔧 updateAccountSelects placeholder'); }
    loadTransactionsTable() { console.log('💸 loadTransactionsTable placeholder'); }
    loadTransfersTable() { console.log('🔄 loadTransfersTable placeholder'); }
    loadUsersTable() { console.log('👥 loadUsersTable placeholder'); }
    applyFilters() { console.log('🔍 applyFilters placeholder'); }
    clearFilters() { console.log('🧹 clearFilters placeholder'); }
    exportToCSV() { console.log('📤 exportToCSV placeholder'); }
    cancelEdit() { console.log('❌ cancelEdit placeholder'); }
    editUser() { console.log('✏️ editUser placeholder'); }
    deleteUser() { console.log('🗑️ deleteUser placeholder'); }
}