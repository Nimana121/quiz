// Admin Dashboard JavaScript
// 
// IMPORTANT SECURITY NOTE:
// This is a demo implementation using client-side authentication with hard-coded credentials.
// In a production environment, authentication MUST be handled server-side with proper
// password hashing, session management, and secure credential storage.
// The current implementation is for demonstration purposes only.
//
// Data Storage Keys
const STORAGE_KEYS = {
    CURRENT_USER: 'currentUser',
    SCHOOLS: 'schools',
    REGISTRATIONS: 'registrations',
    FEE_SETTINGS: 'feeSettings',
    AUDIT_LOGS: 'auditLogs',
    FEE_HISTORY: 'feeHistory'
};

// Initialize data structures
let currentUser = null;
let schools = [];
let registrations = [];
let feeSettings = null;
let auditLogs = [];
let feeHistory = [];

// Toast notification system
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
        warning: '⚠'
    }[type] || 'ℹ';
    
    toast.innerHTML = `<strong>${icon}</strong><span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    checkLogin();
    initializeEventListeners();
});

// Load data from localStorage
function loadData() {
    schools = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOLS)) || [];
    registrations = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) || [];
    feeSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEE_SETTINGS)) || {
        registrationFee: 25.00,
        bookFee: 15.00,
        lateFee: 10.00,
        bulkDiscount: 10
    };
    auditLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || [];
    feeHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEE_HISTORY)) || [];
    
    // Initialize with sample data if empty
    if (schools.length === 0) {
        initializeSampleData();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    localStorage.setItem(STORAGE_KEYS.FEE_SETTINGS, JSON.stringify(feeSettings));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    localStorage.setItem(STORAGE_KEYS.FEE_HISTORY, JSON.stringify(feeHistory));
}

// Initialize sample data
function initializeSampleData() {
    schools = [
        {
            id: 1,
            name: 'Guru Nanak Academy',
            location: 'Vancouver, BC',
            coordinator: 'John Singh',
            email: 'john@gurunanakacademy.com',
            phone: '604-555-0100',
            status: 'active',
            createdDate: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Khalsa School',
            location: 'Surrey, BC',
            coordinator: 'Preet Kaur',
            email: 'preet@khalsaschool.com',
            phone: '604-555-0200',
            status: 'active',
            createdDate: new Date().toISOString()
        },
        {
            id: 3,
            name: 'Sikh Heritage School',
            location: 'Brampton, ON',
            coordinator: 'Rajinder Singh',
            email: 'rajinder@sikhheritage.com',
            phone: '905-555-0300',
            status: 'active',
            createdDate: new Date().toISOString()
        }
    ];
    
    registrations = [
        {
            id: 1,
            studentName: 'Amrit Singh',
            schoolId: 1,
            grade: '8',
            paymentStatus: 'paid',
            bookDelivery: 'delivered',
            amount: 40.00,
            registrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            studentName: 'Simran Kaur',
            schoolId: 1,
            grade: '9',
            paymentStatus: 'pending',
            bookDelivery: 'pending',
            amount: 40.00,
            registrationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            studentName: 'Harpreet Singh',
            schoolId: 2,
            grade: '10',
            paymentStatus: 'paid',
            bookDelivery: 'delivered',
            amount: 40.00,
            registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 4,
            studentName: 'Jasleen Kaur',
            schoolId: 2,
            grade: '7',
            paymentStatus: 'paid',
            bookDelivery: 'pending',
            amount: 40.00,
            registrationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 5,
            studentName: 'Gurpreet Singh',
            schoolId: 3,
            grade: '11',
            paymentStatus: 'overdue',
            bookDelivery: 'pending',
            amount: 40.00,
            registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    saveData();
    addAuditLog('system', 'Sample data initialized', 'system');
}

// Check login status
function checkLogin() {
    currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    
    if (!currentUser) {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    } else {
        setupDashboard();
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.id === 'logoutBtn') return;
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // Fee settings form
    document.getElementById('feeSettingsForm').addEventListener('submit', handleFeeUpdate);
    
    // School form
    document.getElementById('schoolForm').addEventListener('submit', function(e) {
        e.preventDefault();
    });
    
    // Registration form
    document.getElementById('registrationForm').addEventListener('submit', function(e) {
        e.preventDefault();
    });
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    // Simple authentication (in production, this would be server-side)
    const validCredentials = {
        admin: { username: 'admin', password: 'admin123', role: 'admin' },
        coordinator: { username: 'coordinator', password: 'coord123', role: 'coordinator' }
    };
    
    const credentials = validCredentials[role];
    
    if (credentials && username === credentials.username && password === credentials.password) {
        currentUser = { username, role };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        
        addAuditLog('login', `User ${username} logged in as ${role}`, username);
        
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        setupDashboard();
        showToast(`Welcome ${username}!`, 'success');
    } else {
        showToast('Invalid credentials. Please try again.', 'error');
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        addAuditLog('logout', `User ${currentUser.username} logged out`, currentUser.username);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        location.reload();
    }
}

// Setup dashboard after login
function setupDashboard() {
    // Set user info
    document.getElementById('userInfo').textContent = `${currentUser.username} (${currentUser.role})`;
    
    // Hide admin-only sections for coordinators
    if (currentUser.role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Load all sections
    updateDashboard();
    updateStatistics();
    updateFeeSettings();
    updateSchools();
    updateRegistrations();
    updateAuditLogs();
    populateFilters();
}

// Navigate to section
function navigateToSection(section) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Refresh section data
    switch(section) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'statistics':
            updateStatistics();
            break;
        case 'fees':
            updateFeeSettings();
            break;
        case 'schools':
            updateSchools();
            break;
        case 'registrations':
            updateRegistrations();
            break;
        case 'audit':
            updateAuditLogs();
            break;
    }
}

// Update Dashboard
function updateDashboard() {
    // Update stat cards
    document.getElementById('totalRegistrations').textContent = registrations.length;
    document.getElementById('totalSchools').textContent = schools.filter(s => s.status === 'active').length;
    
    const totalRevenue = registrations
        .filter(r => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + r.amount, 0);
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    
    const pendingPayments = registrations.filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'overdue').length;
    document.getElementById('pendingPayments').textContent = pendingPayments;
    
    // Update recent registrations
    const recentRegs = registrations
        .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
        .slice(0, 5);
    
    const recentTable = document.getElementById('recentRegistrations');
    if (recentRegs.length === 0) {
        recentTable.innerHTML = '<tr><td colspan="3" class="text-center">No registrations yet</td></tr>';
    } else {
        recentTable.innerHTML = recentRegs.map(reg => {
            const school = schools.find(s => s.id === reg.schoolId);
            return `
                <tr>
                    <td>${reg.studentName}</td>
                    <td>${school ? school.name : 'N/A'}</td>
                    <td>${new Date(reg.registrationDate).toLocaleDateString()}</td>
                </tr>
            `;
        }).join('');
    }
    
    // Update payment status chart (simple text-based)
    const paymentStats = {
        paid: registrations.filter(r => r.paymentStatus === 'paid').length,
        pending: registrations.filter(r => r.paymentStatus === 'pending').length,
        overdue: registrations.filter(r => r.paymentStatus === 'overdue').length
    };
    
    document.getElementById('paymentStatusChart').innerHTML = `
        <div class="mb-2">
            <strong>Paid:</strong> ${paymentStats.paid} (${registrations.length > 0 ? ((paymentStats.paid / registrations.length) * 100).toFixed(1) : 0}%)
            <div class="progress">
                <div class="progress-bar bg-success" style="width: ${registrations.length > 0 ? (paymentStats.paid / registrations.length) * 100 : 0}%"></div>
            </div>
        </div>
        <div class="mb-2">
            <strong>Pending:</strong> ${paymentStats.pending} (${registrations.length > 0 ? ((paymentStats.pending / registrations.length) * 100).toFixed(1) : 0}%)
            <div class="progress">
                <div class="progress-bar bg-warning" style="width: ${registrations.length > 0 ? (paymentStats.pending / registrations.length) * 100 : 0}%"></div>
            </div>
        </div>
        <div class="mb-2">
            <strong>Overdue:</strong> ${paymentStats.overdue} (${registrations.length > 0 ? ((paymentStats.overdue / registrations.length) * 100).toFixed(1) : 0}%)
            <div class="progress">
                <div class="progress-bar bg-danger" style="width: ${registrations.length > 0 ? (paymentStats.overdue / registrations.length) * 100 : 0}%"></div>
            </div>
        </div>
    `;
}

// Update Statistics
function updateStatistics() {
    const statsTable = document.getElementById('schoolStatsTable');
    
    if (schools.length === 0) {
        statsTable.innerHTML = '<tr><td colspan="6" class="text-center">No data available</td></tr>';
        return;
    }
    
    statsTable.innerHTML = schools.map(school => {
        const schoolRegs = registrations.filter(r => r.schoolId === school.id);
        const revenue = schoolRegs
            .filter(r => r.paymentStatus === 'paid')
            .reduce((sum, r) => sum + r.amount, 0);
        const paid = schoolRegs.filter(r => r.paymentStatus === 'paid').length;
        const pending = schoolRegs.filter(r => r.paymentStatus !== 'paid').length;
        const delivered = schoolRegs.filter(r => r.bookDelivery === 'delivered').length;
        
        return `
            <tr>
                <td>${school.name}</td>
                <td>${schoolRegs.length}</td>
                <td>$${revenue.toFixed(2)}</td>
                <td><span class="badge bg-success">${paid}</span></td>
                <td><span class="badge bg-warning">${pending}</span></td>
                <td><span class="badge bg-info">${delivered}/${schoolRegs.length}</span></td>
            </tr>
        `;
    }).join('');
    
    // Update participation analytics
    const totalStudents = registrations.length;
    const activeSchools = schools.filter(s => s.status === 'active').length;
    const avgPerSchool = activeSchools > 0 ? (totalStudents / activeSchools).toFixed(1) : 0;
    
    document.getElementById('participationAnalytics').innerHTML = `
        <div class="mb-3">
            <h5>Total Participants: ${totalStudents}</h5>
            <p class="text-muted">Across ${activeSchools} active schools</p>
        </div>
        <div class="mb-3">
            <h5>Average per School: ${avgPerSchool}</h5>
            <p class="text-muted">Students per school</p>
        </div>
        <div class="mb-3">
            <h5>Participation Rate: ${schools.length > 0 ? ((activeSchools / schools.length) * 100).toFixed(1) : 0}%</h5>
            <p class="text-muted">Active schools</p>
        </div>
    `;
    
    // Update book delivery status
    const booksDelivered = registrations.filter(r => r.bookDelivery === 'delivered').length;
    const booksPending = registrations.filter(r => r.bookDelivery === 'pending').length;
    
    document.getElementById('bookDeliveryStatus').innerHTML = `
        <div class="mb-3">
            <h5 class="text-success">Delivered: ${booksDelivered}</h5>
            <div class="progress mb-2">
                <div class="progress-bar bg-success" style="width: ${totalStudents > 0 ? (booksDelivered / totalStudents) * 100 : 0}%"></div>
            </div>
        </div>
        <div class="mb-3">
            <h5 class="text-warning">Pending: ${booksPending}</h5>
            <div class="progress">
                <div class="progress-bar bg-warning" style="width: ${totalStudents > 0 ? (booksPending / totalStudents) * 100 : 0}%"></div>
            </div>
        </div>
    `;
}

// Apply statistics filter
function applyStatsFilter() {
    const schoolFilter = document.getElementById('statsSchoolFilter').value;
    const dateFrom = document.getElementById('statsDateFrom').value;
    const dateTo = document.getElementById('statsDateTo').value;
    
    let filteredRegs = [...registrations];
    
    if (schoolFilter) {
        filteredRegs = filteredRegs.filter(r => r.schoolId === parseInt(schoolFilter));
    }
    
    if (dateFrom) {
        filteredRegs = filteredRegs.filter(r => new Date(r.registrationDate) >= new Date(dateFrom));
    }
    
    if (dateTo) {
        filteredRegs = filteredRegs.filter(r => new Date(r.registrationDate) <= new Date(dateTo));
    }
    
    showToast(`Filter applied: ${filteredRegs.length} registrations match the criteria.`, 'info');
}

// Update Fee Settings
function updateFeeSettings() {
    document.getElementById('registrationFee').value = feeSettings.registrationFee;
    document.getElementById('bookFee').value = feeSettings.bookFee;
    document.getElementById('lateFee').value = feeSettings.lateFee;
    document.getElementById('bulkDiscount').value = feeSettings.bulkDiscount;
    
    // Update fee history table
    const historyTable = document.getElementById('feeHistoryTable');
    if (feeHistory.length === 0) {
        historyTable.innerHTML = '<tr><td colspan="5" class="text-center">No changes recorded</td></tr>';
    } else {
        historyTable.innerHTML = feeHistory.map(record => `
            <tr>
                <td>${new Date(record.date).toLocaleString()}</td>
                <td>${record.user}</td>
                <td>${record.field}</td>
                <td>$${record.oldValue}</td>
                <td>$${record.newValue}</td>
            </tr>
        `).join('');
    }
}

// Handle fee update
function handleFeeUpdate(e) {
    e.preventDefault();
    
    if (!confirm('Are you sure you want to update the fee structure? This action will be logged.')) {
        return;
    }
    
    const newSettings = {
        registrationFee: parseFloat(document.getElementById('registrationFee').value),
        bookFee: parseFloat(document.getElementById('bookFee').value),
        lateFee: parseFloat(document.getElementById('lateFee').value),
        bulkDiscount: parseInt(document.getElementById('bulkDiscount').value)
    };
    
    // Record changes
    Object.keys(newSettings).forEach(key => {
        if (feeSettings[key] !== newSettings[key]) {
            feeHistory.push({
                date: new Date().toISOString(),
                user: currentUser.username,
                field: key,
                oldValue: feeSettings[key],
                newValue: newSettings[key]
            });
            
            addAuditLog('fee_change', `Fee ${key} changed from $${feeSettings[key]} to $${newSettings[key]}`, currentUser.username);
        }
    });
    
    feeSettings = newSettings;
    saveData();
    updateFeeSettings();
    
    showToast('Fee structure updated successfully!', 'success');
}

// Update Schools
function updateSchools() {
    const schoolsTable = document.getElementById('schoolsTable');
    
    if (schools.length === 0) {
        schoolsTable.innerHTML = '<tr><td colspan="6" class="text-center">No schools registered</td></tr>';
        return;
    }
    
    schoolsTable.innerHTML = schools.map(school => `
        <tr>
            <td>${school.name}</td>
            <td>${school.location}</td>
            <td>${school.coordinator}</td>
            <td>${school.email}<br><small>${school.phone}</small></td>
            <td><span class="badge bg-${school.status === 'active' ? 'success' : 'secondary'}">${school.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editSchool(${school.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSchool(${school.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Open school modal
function openSchoolModal(schoolId = null) {
    if (schoolId) {
        const school = schools.find(s => s.id === schoolId);
        document.getElementById('schoolModalTitle').textContent = 'Edit School';
        document.getElementById('schoolId').value = school.id;
        document.getElementById('schoolName').value = school.name;
        document.getElementById('schoolLocation').value = school.location;
        document.getElementById('schoolCoordinator').value = school.coordinator;
        document.getElementById('schoolEmail').value = school.email;
        document.getElementById('schoolPhone').value = school.phone;
        document.getElementById('schoolStatus').value = school.status;
    } else {
        document.getElementById('schoolModalTitle').textContent = 'Add School';
        document.getElementById('schoolForm').reset();
        document.getElementById('schoolId').value = '';
    }
}

// Save school
function saveSchool() {
    const form = document.getElementById('schoolForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const schoolId = document.getElementById('schoolId').value;
    const schoolData = {
        name: document.getElementById('schoolName').value,
        location: document.getElementById('schoolLocation').value,
        coordinator: document.getElementById('schoolCoordinator').value,
        email: document.getElementById('schoolEmail').value,
        phone: document.getElementById('schoolPhone').value,
        status: document.getElementById('schoolStatus').value
    };
    
    if (schoolId) {
        // Update existing school
        const index = schools.findIndex(s => s.id === parseInt(schoolId));
        schools[index] = { ...schools[index], ...schoolData };
        addAuditLog('school', `School "${schoolData.name}" updated`, currentUser.username);
    } else {
        // Add new school
        const newSchool = {
            id: schools.length > 0 ? Math.max(...schools.map(s => s.id)) + 1 : 1,
            ...schoolData,
            createdDate: new Date().toISOString()
        };
        schools.push(newSchool);
        addAuditLog('school', `School "${schoolData.name}" added`, currentUser.username);
    }
    
    saveData();
    updateSchools();
    populateFilters();
    bootstrap.Modal.getInstance(document.getElementById('schoolModal')).hide();
}

// Edit school
function editSchool(schoolId) {
    openSchoolModal(schoolId);
    const modal = new bootstrap.Modal(document.getElementById('schoolModal'));
    modal.show();
}

// Delete school
function deleteSchool(schoolId) {
    if (!confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
        return;
    }
    
    const school = schools.find(s => s.id === schoolId);
    schools = schools.filter(s => s.id !== schoolId);
    
    addAuditLog('school', `School "${school.name}" deleted`, currentUser.username);
    
    saveData();
    updateSchools();
    populateFilters();
}

// Update Registrations
function updateRegistrations() {
    const regsTable = document.getElementById('registrationsTable');
    
    if (registrations.length === 0) {
        regsTable.innerHTML = '<tr><td colspan="7" class="text-center">No registrations found</td></tr>';
        return;
    }
    
    regsTable.innerHTML = registrations.map(reg => {
        const school = schools.find(s => s.id === reg.schoolId);
        return `
            <tr>
                <td>${reg.studentName}</td>
                <td>${school ? school.name : 'N/A'}</td>
                <td>${reg.grade}</td>
                <td><span class="badge bg-${getPaymentBadgeColor(reg.paymentStatus)}">${reg.paymentStatus}</span></td>
                <td><span class="badge bg-${reg.bookDelivery === 'delivered' ? 'success' : 'warning'}">${reg.bookDelivery}</span></td>
                <td>${new Date(reg.registrationDate).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editRegistration(${reg.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRegistration(${reg.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get payment badge color
function getPaymentBadgeColor(status) {
    switch(status) {
        case 'paid': return 'success';
        case 'pending': return 'warning';
        case 'overdue': return 'danger';
        default: return 'secondary';
    }
}

// Apply registration filter
function applyRegistrationFilter() {
    const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
    const schoolFilter = document.getElementById('filterSchool').value;
    const paymentFilter = document.getElementById('filterPaymentStatus').value;
    
    let filtered = [...registrations];
    
    if (searchTerm) {
        filtered = filtered.filter(r => r.studentName.toLowerCase().includes(searchTerm));
    }
    
    if (schoolFilter) {
        filtered = filtered.filter(r => r.schoolId === parseInt(schoolFilter));
    }
    
    if (paymentFilter) {
        filtered = filtered.filter(r => r.paymentStatus === paymentFilter);
    }
    
    // Temporarily update display with filtered data
    const regsTable = document.getElementById('registrationsTable');
    regsTable.innerHTML = filtered.map(reg => {
        const school = schools.find(s => s.id === reg.schoolId);
        return `
            <tr>
                <td>${reg.studentName}</td>
                <td>${school ? school.name : 'N/A'}</td>
                <td>${reg.grade}</td>
                <td><span class="badge bg-${getPaymentBadgeColor(reg.paymentStatus)}">${reg.paymentStatus}</span></td>
                <td><span class="badge bg-${reg.bookDelivery === 'delivered' ? 'success' : 'warning'}">${reg.bookDelivery}</span></td>
                <td>${new Date(reg.registrationDate).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editRegistration(${reg.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRegistration(${reg.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Open registration modal
function openRegistrationModal(regId = null) {
    if (regId) {
        const reg = registrations.find(r => r.id === regId);
        document.getElementById('registrationModalTitle').textContent = 'Edit Registration';
        document.getElementById('registrationId').value = reg.id;
        document.getElementById('studentName').value = reg.studentName;
        document.getElementById('studentSchool').value = reg.schoolId;
        document.getElementById('studentGrade').value = reg.grade;
        document.getElementById('paymentStatus').value = reg.paymentStatus;
        document.getElementById('bookDelivery').value = reg.bookDelivery;
        document.getElementById('registrationAmount').value = reg.amount;
    } else {
        document.getElementById('registrationModalTitle').textContent = 'Add Registration';
        document.getElementById('registrationForm').reset();
        document.getElementById('registrationId').value = '';
        document.getElementById('registrationAmount').value = feeSettings.registrationFee + feeSettings.bookFee;
    }
}

// Save registration
function saveRegistration() {
    const form = document.getElementById('registrationForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const regId = document.getElementById('registrationId').value;
    const regData = {
        studentName: document.getElementById('studentName').value,
        schoolId: parseInt(document.getElementById('studentSchool').value),
        grade: document.getElementById('studentGrade').value,
        paymentStatus: document.getElementById('paymentStatus').value,
        bookDelivery: document.getElementById('bookDelivery').value,
        amount: parseFloat(document.getElementById('registrationAmount').value)
    };
    
    if (regId) {
        // Update existing registration
        const index = registrations.findIndex(r => r.id === parseInt(regId));
        registrations[index] = { ...registrations[index], ...regData };
        addAuditLog('registration', `Registration for "${regData.studentName}" updated`, currentUser.username);
    } else {
        // Add new registration
        const newReg = {
            id: registrations.length > 0 ? Math.max(...registrations.map(r => r.id)) + 1 : 1,
            ...regData,
            registrationDate: new Date().toISOString()
        };
        registrations.push(newReg);
        addAuditLog('registration', `Registration for "${regData.studentName}" added`, currentUser.username);
    }
    
    saveData();
    updateRegistrations();
    updateDashboard();
    bootstrap.Modal.getInstance(document.getElementById('registrationModal')).hide();
}

// Edit registration
function editRegistration(regId) {
    openRegistrationModal(regId);
    const modal = new bootstrap.Modal(document.getElementById('registrationModal'));
    modal.show();
}

// Delete registration
function deleteRegistration(regId) {
    if (!confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
        return;
    }
    
    const reg = registrations.find(r => r.id === regId);
    registrations = registrations.filter(r => r.id !== regId);
    
    addAuditLog('registration', `Registration for "${reg.studentName}" deleted`, currentUser.username);
    
    saveData();
    updateRegistrations();
    updateDashboard();
}

// Export report
function exportReport(type) {
    let data = [];
    let filename = '';
    let headers = [];
    
    switch(type) {
        case 'registrations':
            headers = ['Student Name', 'School', 'Grade', 'Payment Status', 'Book Delivery', 'Amount', 'Registration Date'];
            data = registrations.map(reg => {
                const school = schools.find(s => s.id === reg.schoolId);
                return [
                    reg.studentName,
                    school ? school.name : 'N/A',
                    reg.grade,
                    reg.paymentStatus,
                    reg.bookDelivery,
                    reg.amount,
                    new Date(reg.registrationDate).toLocaleDateString()
                ];
            });
            filename = 'registrations_report.csv';
            break;
            
        case 'payments':
            headers = ['Student Name', 'School', 'Amount', 'Payment Status', 'Date'];
            data = registrations.map(reg => {
                const school = schools.find(s => s.id === reg.schoolId);
                return [
                    reg.studentName,
                    school ? school.name : 'N/A',
                    reg.amount,
                    reg.paymentStatus,
                    new Date(reg.registrationDate).toLocaleDateString()
                ];
            });
            filename = 'payments_report.csv';
            break;
            
        case 'schools':
            headers = ['School Name', 'Location', 'Coordinator', 'Email', 'Phone', 'Status', 'Registrations'];
            data = schools.map(school => {
                const regCount = registrations.filter(r => r.schoolId === school.id).length;
                return [
                    school.name,
                    school.location,
                    school.coordinator,
                    school.email,
                    school.phone,
                    school.status,
                    regCount
                ];
            });
            filename = 'schools_report.csv';
            break;
    }
    
    downloadCSV([headers, ...data], filename);
    addAuditLog('export', `Exported ${type} report`, currentUser.username);
}

// Generate custom report
function generateCustomReport() {
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    let message = `Custom ${reportType} report generated`;
    if (startDate && endDate) {
        message += ` for period ${startDate} to ${endDate}`;
    }
    
    addAuditLog('export', message, currentUser.username);
    showToast('Custom report generated successfully!', 'success');
}

// Update Audit Logs
function updateAuditLogs() {
    const container = document.getElementById('auditLogsContainer');
    
    if (auditLogs.length === 0) {
        container.innerHTML = '<div class="text-center">No audit logs available</div>';
        return;
    }
    
    const sortedLogs = [...auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = sortedLogs.map(log => `
        <div class="audit-log-entry">
            <div class="d-flex justify-content-between">
                <strong>${log.type.toUpperCase()}</strong>
                <small class="text-muted">${new Date(log.timestamp).toLocaleString()}</small>
            </div>
            <div>${log.description}</div>
            <small class="text-muted">User: ${log.user}</small>
        </div>
    `).join('');
}

// Apply audit filter
function applyAuditFilter() {
    const typeFilter = document.getElementById('auditTypeFilter').value;
    const userFilter = document.getElementById('auditUserFilter').value.toLowerCase();
    const dateFrom = document.getElementById('auditDateFrom').value;
    const dateTo = document.getElementById('auditDateTo').value;
    
    let filtered = [...auditLogs];
    
    if (typeFilter) {
        filtered = filtered.filter(log => log.type === typeFilter);
    }
    
    if (userFilter) {
        filtered = filtered.filter(log => log.user.toLowerCase().includes(userFilter));
    }
    
    if (dateFrom) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(dateFrom));
    }
    
    if (dateTo) {
        filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(dateTo));
    }
    
    const container = document.getElementById('auditLogsContainer');
    const sortedLogs = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = sortedLogs.map(log => `
        <div class="audit-log-entry">
            <div class="d-flex justify-content-between">
                <strong>${log.type.toUpperCase()}</strong>
                <small class="text-muted">${new Date(log.timestamp).toLocaleString()}</small>
            </div>
            <div>${log.description}</div>
            <small class="text-muted">User: ${log.user}</small>
        </div>
    `).join('');
}

// Clear audit filter
function clearAuditFilter() {
    document.getElementById('auditTypeFilter').value = '';
    document.getElementById('auditUserFilter').value = '';
    document.getElementById('auditDateFrom').value = '';
    document.getElementById('auditDateTo').value = '';
    updateAuditLogs();
}

// Add audit log
function addAuditLog(type, description, user) {
    auditLogs.push({
        type,
        description,
        user,
        timestamp: new Date().toISOString()
    });
    saveData();
}

// Bulk operations
function processBulkRegistration() {
    const fileInput = document.getElementById('bulkRegistrationFile');
    if (!fileInput.files.length) {
        showToast('Please select a CSV file', 'warning');
        return;
    }
    
    if (!confirm('Are you sure you want to process this bulk upload? This will add multiple registrations.')) {
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        let successCount = 0;
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const [studentName, schoolName, grade, paymentStatus, amount] = line.split(',');
            
            const school = schools.find(s => s.name.trim() === schoolName.trim());
            if (!school) continue;
            
            const newReg = {
                id: registrations.length > 0 ? Math.max(...registrations.map(r => r.id)) + 1 : 1,
                studentName: studentName.trim(),
                schoolId: school.id,
                grade: grade.trim(),
                paymentStatus: paymentStatus.trim().toLowerCase(),
                bookDelivery: 'pending',
                amount: parseFloat(amount),
                registrationDate: new Date().toISOString()
            };
            
            registrations.push(newReg);
            successCount++;
        }
        
        saveData();
        updateRegistrations();
        updateDashboard();
        addAuditLog('bulk_upload', `Bulk registration upload: ${successCount} records added`, currentUser.username);
        showToast(`Successfully uploaded ${successCount} registrations!`, 'success');
        fileInput.value = '';
    };
    
    reader.readAsText(file);
}

function processBulkSchool() {
    const fileInput = document.getElementById('bulkSchoolFile');
    if (!fileInput.files.length) {
        showToast('Please select a CSV file', 'warning');
        return;
    }
    
    if (!confirm('Are you sure you want to process this bulk upload? This will add multiple schools.')) {
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        let successCount = 0;
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const [name, location, coordinator, email, phone] = line.split(',');
            
            const newSchool = {
                id: schools.length > 0 ? Math.max(...schools.map(s => s.id)) + 1 : 1,
                name: name.trim(),
                location: location.trim(),
                coordinator: coordinator.trim(),
                email: email.trim(),
                phone: phone.trim(),
                status: 'active',
                createdDate: new Date().toISOString()
            };
            
            schools.push(newSchool);
            successCount++;
        }
        
        saveData();
        updateSchools();
        populateFilters();
        addAuditLog('bulk_upload', `Bulk school upload: ${successCount} records added`, currentUser.username);
        showToast(`Successfully uploaded ${successCount} schools!`, 'success');
        fileInput.value = '';
    };
    
    reader.readAsText(file);
}

function processBulkPayment() {
    const schoolId = document.getElementById('bulkPaymentSchool').value;
    const status = document.getElementById('bulkPaymentStatus').value;
    
    if (!confirm(`Are you sure you want to update payment status to "${status}" for ${schoolId ? 'selected school' : 'all schools'}?`)) {
        return;
    }
    
    let count = 0;
    registrations.forEach(reg => {
        if (!schoolId || reg.schoolId === parseInt(schoolId)) {
            reg.paymentStatus = status;
            count++;
        }
    });
    
    saveData();
    updateRegistrations();
    updateDashboard();
    addAuditLog('bulk_upload', `Bulk payment update: ${count} records updated to ${status}`, currentUser.username);
    showToast(`Successfully updated ${count} registrations!`, 'success');
}

function processBulkDelivery() {
    const schoolId = document.getElementById('bulkDeliverySchool').value;
    const status = document.getElementById('bulkDeliveryStatus').value;
    
    if (!confirm(`Are you sure you want to update delivery status to "${status}" for ${schoolId ? 'selected school' : 'all schools'}?`)) {
        return;
    }
    
    let count = 0;
    registrations.forEach(reg => {
        if (!schoolId || reg.schoolId === parseInt(schoolId)) {
            reg.bookDelivery = status;
            count++;
        }
    });
    
    saveData();
    updateRegistrations();
    updateDashboard();
    addAuditLog('bulk_upload', `Bulk delivery update: ${count} records updated to ${status}`, currentUser.username);
    showToast(`Successfully updated ${count} registrations!`, 'success');
}

// Download sample CSV
function downloadSampleCSV(type) {
    let headers = [];
    let sampleData = [];
    let filename = '';
    
    if (type === 'registrations') {
        headers = ['Student Name', 'School Name', 'Grade', 'Payment Status', 'Amount'];
        sampleData = [
            ['John Smith', 'Guru Nanak Academy', '8', 'paid', '40.00'],
            ['Jane Doe', 'Khalsa School', '9', 'pending', '40.00']
        ];
        filename = 'sample_registrations.csv';
    } else {
        headers = ['School Name', 'Location', 'Coordinator', 'Email', 'Phone'];
        sampleData = [
            ['Sample School', 'City, Province', 'Coordinator Name', 'email@example.com', '123-456-7890']
        ];
        filename = 'sample_schools.csv';
    }
    
    downloadCSV([headers, ...sampleData], filename);
}

// Utility: Download CSV
function downloadCSV(data, filename) {
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Populate filters
function populateFilters() {
    // Populate school filters
    const schoolSelects = [
        'statsSchoolFilter',
        'filterSchool',
        'studentSchool',
        'bulkPaymentSchool',
        'bulkDeliverySchool'
    ];
    
    schoolSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const currentValue = select.value;
        const hasAllOption = select.querySelector('option[value=""]');
        
        select.innerHTML = hasAllOption ? '<option value="">All Schools</option>' : '<option value="">Select School</option>';
        
        schools.forEach(school => {
            const option = document.createElement('option');
            option.value = school.id;
            option.textContent = school.name;
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    });
}
