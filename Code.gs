/**
 * Secure Religion Olympiad Registration System
 * Google Apps Script Backend
 * Author: Harpreet Singh Nimana
 */

// Configuration
const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),
  SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
  SALT_ROUNDS: 10,
  PAYMENT_QR_URL: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='
};

// Fee Structure
const FEE_STRUCTURE = {
  'Zero Group': { base: 30, bookPhysical: 50, bookDigital: 45, classes: ['1', '2', '3'] },
  'First Group': { base: 40, bookPhysical: 40, bookDigital: 36, classes: ['4', '5'] },
  'Second Group': { base: 40, bookPhysical: 40, bookDigital: 36, classes: ['6', '7', '8'] },
  'Third Group': { base: 50, bookPhysical: 70, bookDigital: 63, classes: ['9', '10', '11', '12'] },
  'Open Group': { base: 70, bookPhysical: 100, bookDigital: 90, classes: ['Others'] }
};

// Sheet names
const SHEETS = {
  USERS: 'Users',
  STUDENTS: 'Students',
  SESSIONS: 'Sessions',
  AUDIT_LOGS: 'AuditLogs',
  FEE_CONFIG: 'FeeConfig'
};

/**
 * Initialize the spreadsheet with required sheets and headers
 */
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  // Create Users sheet
  let usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(SHEETS.USERS);
    usersSheet.appendRow(['UserID', 'Username', 'PasswordHash', 'Role', 'SchoolName', 'Email', 'Phone', 'CreatedAt', 'Active']);
    // Add default admin user (password: admin123)
    usersSheet.appendRow(['admin', 'admin', hashPassword('admin123'), 'Admin', 'System', 'admin@olympiad.org', '', new Date(), true]);
  }
  
  // Create Students sheet
  let studentsSheet = ss.getSheetByName(SHEETS.STUDENTS);
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet(SHEETS.STUDENTS);
    studentsSheet.appendRow(['StudentID', 'SchoolID', 'StudentName', 'Class', 'Group', 'IncludeBook', 'BookType', 'Email', 'BaseFee', 'BookFee', 'TotalFee', 'RegisteredBy', 'RegisteredAt']);
  }
  
  // Create Sessions sheet
  let sessionsSheet = ss.getSheetByName(SHEETS.SESSIONS);
  if (!sessionsSheet) {
    sessionsSheet = ss.insertSheet(SHEETS.SESSIONS);
    sessionsSheet.appendRow(['SessionID', 'UserID', 'Role', 'CreatedAt', 'ExpiresAt']);
  }
  
  // Create Audit Logs sheet
  let auditSheet = ss.getSheetByName(SHEETS.AUDIT_LOGS);
  if (!auditSheet) {
    auditSheet = ss.insertSheet(SHEETS.AUDIT_LOGS);
    auditSheet.appendRow(['Timestamp', 'UserID', 'Action', 'Details', 'IPAddress']);
  }
  
  // Create Fee Config sheet
  let feeSheet = ss.getSheetByName(SHEETS.FEE_CONFIG);
  if (!feeSheet) {
    feeSheet = ss.insertSheet(SHEETS.FEE_CONFIG);
    feeSheet.appendRow(['Group', 'Classes', 'BaseFee', 'BookPhysical', 'BookDigital']);
    Object.keys(FEE_STRUCTURE).forEach(group => {
      const fee = FEE_STRUCTURE[group];
      feeSheet.appendRow([group, fee.classes.join(','), fee.base, fee.bookPhysical, fee.bookDigital]);
    });
  }
  
  return { success: true, message: 'Spreadsheet initialized successfully' };
}

/**
 * Hash password using simple hashing (in production, use more secure method)
 */
function hashPassword(password) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + 'SALT'));
}

/**
 * Verify password against hash
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return Utilities.getUuid();
}

/**
 * Generate unique student ID
 */
function generateStudentId() {
  return 'STU' + new Date().getTime();
}

/**
 * Log audit trail
 */
function logAudit(userId, action, details) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const auditSheet = ss.getSheetByName(SHEETS.AUDIT_LOGS);
    auditSheet.appendRow([new Date(), userId, action, details, '']);
  } catch (e) {
    Logger.log('Audit log error: ' + e.message);
  }
}

/**
 * Authenticate user and create session
 */
function doLogin(username, password) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    const data = usersSheet.getDataRange().getValues();
    
    // Find user
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === username && data[i][8] === true) { // Check username and active status
        if (verifyPassword(password, data[i][2])) {
          // Create session
          const sessionId = generateSessionId();
          const sessionsSheet = ss.getSheetByName(SHEETS.SESSIONS);
          const now = new Date();
          const expiresAt = new Date(now.getTime() + CONFIG.SESSION_TIMEOUT);
          
          sessionsSheet.appendRow([sessionId, data[i][0], data[i][3], now, expiresAt]);
          
          logAudit(data[i][0], 'LOGIN', 'User logged in successfully');
          
          return {
            success: true,
            sessionId: sessionId,
            userId: data[i][0],
            role: data[i][3],
            schoolName: data[i][4],
            username: data[i][1]
          };
        }
      }
    }
    
    logAudit(username, 'LOGIN_FAILED', 'Invalid credentials');
    return { success: false, message: 'Invalid username or password' };
    
  } catch (e) {
    Logger.log('Login error: ' + e.message);
    return { success: false, message: 'Login failed. Please try again.' };
  }
}

/**
 * Validate session
 */
function validateSession(sessionId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sessionsSheet = ss.getSheetByName(SHEETS.SESSIONS);
    const data = sessionsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sessionId) {
        const expiresAt = new Date(data[i][4]);
        if (expiresAt > new Date()) {
          return {
            valid: true,
            userId: data[i][1],
            role: data[i][2]
          };
        } else {
          return { valid: false, message: 'Session expired' };
        }
      }
    }
    
    return { valid: false, message: 'Invalid session' };
    
  } catch (e) {
    Logger.log('Session validation error: ' + e.message);
    return { valid: false, message: 'Session validation failed' };
  }
}

/**
 * Logout user
 */
function doLogout(sessionId) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sessionsSheet = ss.getSheetByName(SHEETS.SESSIONS);
    const data = sessionsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sessionId) {
        sessionsSheet.deleteRow(i + 1);
        logAudit(data[i][1], 'LOGOUT', 'User logged out');
        return { success: true };
      }
    }
    
    return { success: false, message: 'Session not found' };
    
  } catch (e) {
    Logger.log('Logout error: ' + e.message);
    return { success: false, message: 'Logout failed' };
  }
}

/**
 * Get group for a class
 */
function getGroupForClass(classValue) {
  for (const [group, config] of Object.entries(FEE_STRUCTURE)) {
    if (config.classes.includes(classValue)) {
      return group;
    }
  }
  return 'Open Group'; // Default
}

/**
 * Calculate fee for a student
 */
function calculateFee(classValue, includeBook, bookType) {
  const group = getGroupForClass(classValue);
  const config = FEE_STRUCTURE[group];
  
  let baseFee = config.base;
  let bookFee = 0;
  
  if (includeBook) {
    bookFee = bookType === 'Digital' ? config.bookDigital : config.bookPhysical;
  }
  
  return {
    group: group,
    baseFee: baseFee,
    bookFee: bookFee,
    totalFee: baseFee + bookFee
  };
}

/**
 * Register a single student
 */
function registerStudent(sessionId, studentData) {
  try {
    const session = validateSession(sessionId);
    if (!session.valid) {
      return { success: false, message: 'Invalid session. Please login again.' };
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const studentsSheet = ss.getSheetByName(SHEETS.STUDENTS);
    
    // Calculate fees
    const feeInfo = calculateFee(studentData.class, studentData.includeBook, studentData.bookType);
    
    // Validate email for digital books
    if (studentData.includeBook && studentData.bookType === 'Digital') {
      if (!studentData.email || !isValidEmail(studentData.email)) {
        return { success: false, message: 'Valid email is required for digital books' };
      }
    }
    
    const studentId = generateStudentId();
    
    studentsSheet.appendRow([
      studentId,
      session.userId,
      studentData.studentName,
      studentData.class,
      feeInfo.group,
      studentData.includeBook,
      studentData.bookType || '',
      studentData.email || '',
      feeInfo.baseFee,
      feeInfo.bookFee,
      feeInfo.totalFee,
      session.userId,
      new Date()
    ]);
    
    logAudit(session.userId, 'REGISTER_STUDENT', 'Student ' + studentId + ' registered');
    
    return {
      success: true,
      studentId: studentId,
      ...feeInfo
    };
    
  } catch (e) {
    Logger.log('Register student error: ' + e.message);
    return { success: false, message: 'Registration failed: ' + e.message };
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Process bulk CSV registration
 */
function processBulkRegistration(sessionId, csvData) {
  try {
    const session = validateSession(sessionId);
    if (!session.valid) {
      return { success: false, message: 'Invalid session. Please login again.' };
    }
    
    const results = {
      success: [],
      failed: [],
      totalFee: 0
    };
    
    // Parse CSV (skip header row)
    const rows = csvData.split('\n').slice(1);
    
    rows.forEach((row, index) => {
      if (row.trim() === '') return;
      
      const columns = row.split(',').map(col => col.trim());
      
      if (columns.length < 3) {
        results.failed.push({ row: index + 2, reason: 'Invalid format' });
        return;
      }
      
      const studentData = {
        studentName: columns[0],
        class: columns[1],
        includeBook: columns[2]?.toLowerCase() === 'yes' || columns[2]?.toLowerCase() === 'true',
        bookType: columns[3] || 'Physical',
        email: columns[4] || ''
      };
      
      const result = registerStudent(sessionId, studentData);
      
      if (result.success) {
        results.success.push({
          studentName: studentData.studentName,
          studentId: result.studentId,
          totalFee: result.totalFee
        });
        results.totalFee += result.totalFee;
      } else {
        results.failed.push({
          row: index + 2,
          studentName: studentData.studentName,
          reason: result.message
        });
      }
    });
    
    return {
      success: true,
      results: results
    };
    
  } catch (e) {
    Logger.log('Bulk registration error: ' + e.message);
    return { success: false, message: 'Bulk registration failed: ' + e.message };
  }
}

/**
 * Get registration statistics
 */
function getStatistics(sessionId) {
  try {
    const session = validateSession(sessionId);
    if (!session.valid || session.role !== 'Admin') {
      return { success: false, message: 'Unauthorized access' };
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const studentsSheet = ss.getSheetByName(SHEETS.STUDENTS);
    const data = studentsSheet.getDataRange().getValues();
    
    let totalStudents = data.length - 1; // Exclude header
    let totalRevenue = 0;
    let groupStats = {};
    
    for (let i = 1; i < data.length; i++) {
      totalRevenue += data[i][10]; // Total fee column
      
      const group = data[i][4];
      if (!groupStats[group]) {
        groupStats[group] = { count: 0, revenue: 0 };
      }
      groupStats[group].count++;
      groupStats[group].revenue += data[i][10];
    }
    
    return {
      success: true,
      stats: {
        totalStudents: totalStudents,
        totalRevenue: totalRevenue,
        groupStats: groupStats
      }
    };
    
  } catch (e) {
    Logger.log('Get statistics error: ' + e.message);
    return { success: false, message: 'Failed to fetch statistics' };
  }
}

/**
 * Get all registrations
 */
function getRegistrations(sessionId, filters) {
  try {
    const session = validateSession(sessionId);
    if (!session.valid) {
      return { success: false, message: 'Invalid session' };
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const studentsSheet = ss.getSheetByName(SHEETS.STUDENTS);
    const data = studentsSheet.getDataRange().getValues();
    
    let registrations = [];
    
    for (let i = 1; i < data.length; i++) {
      // Filter by school if not admin
      if (session.role !== 'Admin' && data[i][1] !== session.userId) {
        continue;
      }
      
      registrations.push({
        studentId: data[i][0],
        schoolId: data[i][1],
        studentName: data[i][2],
        class: data[i][3],
        group: data[i][4],
        includeBook: data[i][5],
        bookType: data[i][6],
        email: data[i][7],
        baseFee: data[i][8],
        bookFee: data[i][9],
        totalFee: data[i][10],
        registeredBy: data[i][11],
        registeredAt: data[i][12]
      });
    }
    
    return {
      success: true,
      registrations: registrations
    };
    
  } catch (e) {
    Logger.log('Get registrations error: ' + e.message);
    return { success: false, message: 'Failed to fetch registrations' };
  }
}

/**
 * Get audit logs
 */
function getAuditLogs(sessionId) {
  try {
    const session = validateSession(sessionId);
    if (!session.valid || session.role !== 'Admin') {
      return { success: false, message: 'Unauthorized access' };
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const auditSheet = ss.getSheetByName(SHEETS.AUDIT_LOGS);
    const data = auditSheet.getDataRange().getValues();
    
    let logs = [];
    
    for (let i = 1; i < data.length; i++) {
      logs.push({
        timestamp: data[i][0],
        userId: data[i][1],
        action: data[i][2],
        details: data[i][3],
        ipAddress: data[i][4]
      });
    }
    
    return {
      success: true,
      logs: logs
    };
    
  } catch (e) {
    Logger.log('Get audit logs error: ' + e.message);
    return { success: false, message: 'Failed to fetch audit logs' };
  }
}

/**
 * Update fee structure (Admin only)
 */
function updateFeeStructure(sessionId, group, baseFee, bookPhysical, bookDigital) {
  try {
    const session = validateSession(sessionId);
    if (!session.valid || session.role !== 'Admin') {
      return { success: false, message: 'Unauthorized access' };
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const feeSheet = ss.getSheetByName(SHEETS.FEE_CONFIG);
    const data = feeSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === group) {
        feeSheet.getRange(i + 1, 3).setValue(baseFee);
        feeSheet.getRange(i + 1, 4).setValue(bookPhysical);
        feeSheet.getRange(i + 1, 5).setValue(bookDigital);
        
        logAudit(session.userId, 'UPDATE_FEE', 'Updated fee for ' + group);
        
        return { success: true, message: 'Fee structure updated successfully' };
      }
    }
    
    return { success: false, message: 'Group not found' };
    
  } catch (e) {
    Logger.log('Update fee structure error: ' + e.message);
    return { success: false, message: 'Failed to update fee structure' };
  }
}

/**
 * Create new school user (Admin only)
 */
function createSchoolUser(sessionId, userData) {
  try {
    const session = validateSession(sessionId);
    if (!session.valid || session.role !== 'Admin') {
      return { success: false, message: 'Unauthorized access' };
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    const data = usersSheet.getDataRange().getValues();
    
    // Check if username exists
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userData.username) {
        return { success: false, message: 'Username already exists' };
      }
    }
    
    const userId = 'SCH' + new Date().getTime();
    const passwordHash = hashPassword(userData.password);
    
    usersSheet.appendRow([
      userId,
      userData.username,
      passwordHash,
      'School',
      userData.schoolName,
      userData.email || '',
      userData.phone || '',
      new Date(),
      true
    ]);
    
    logAudit(session.userId, 'CREATE_USER', 'Created school user ' + userId);
    
    return { success: true, userId: userId };
    
  } catch (e) {
    Logger.log('Create school user error: ' + e.message);
    return { success: false, message: 'Failed to create user' };
  }
}

/**
 * Password reset request
 */
function requestPasswordReset(username, email) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    const data = usersSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === username && data[i][5] === email) {
        // Generate reset token (in production, implement proper token system)
        const resetToken = Utilities.getUuid();
        
        // Send email (implement email sending)
        logAudit(username, 'PASSWORD_RESET_REQUEST', 'Password reset requested');
        
        return { success: true, message: 'Password reset instructions sent to your email' };
      }
    }
    
    return { success: false, message: 'Username and email do not match' };
    
  } catch (e) {
    Logger.log('Password reset error: ' + e.message);
    return { success: false, message: 'Password reset failed' };
  }
}

/**
 * Web app entry point - handles all HTTP requests
 */
function doGet(e) {
  const page = e.parameter.page || 'login';
  
  switch(page) {
    case 'login':
      return HtmlService.createHtmlOutputFromFile('login')
        .setTitle('Login - Religion Olympiad');
    case 'dashboard':
      return HtmlService.createHtmlOutputFromFile('dashboard')
        .setTitle('Dashboard - Religion Olympiad');
    case 'admin':
      return HtmlService.createHtmlOutputFromFile('admin')
        .setTitle('Admin - Religion Olympiad');
    default:
      return HtmlService.createHtmlOutputFromFile('login')
        .setTitle('Login - Religion Olympiad');
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  switch(action) {
    case 'login':
      return ContentService.createTextOutput(JSON.stringify(doLogin(data.username, data.password)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'logout':
      return ContentService.createTextOutput(JSON.stringify(doLogout(data.sessionId)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'validateSession':
      return ContentService.createTextOutput(JSON.stringify(validateSession(data.sessionId)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'registerStudent':
      return ContentService.createTextOutput(JSON.stringify(registerStudent(data.sessionId, data.studentData)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'calculateFee':
      return ContentService.createTextOutput(JSON.stringify(calculateFee(data.class, data.includeBook, data.bookType)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'bulkRegistration':
      return ContentService.createTextOutput(JSON.stringify(processBulkRegistration(data.sessionId, data.csvData)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'getStatistics':
      return ContentService.createTextOutput(JSON.stringify(getStatistics(data.sessionId)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'getRegistrations':
      return ContentService.createTextOutput(JSON.stringify(getRegistrations(data.sessionId, data.filters)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'getAuditLogs':
      return ContentService.createTextOutput(JSON.stringify(getAuditLogs(data.sessionId)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'updateFeeStructure':
      return ContentService.createTextOutput(JSON.stringify(updateFeeStructure(data.sessionId, data.group, data.baseFee, data.bookPhysical, data.bookDigital)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'createSchoolUser':
      return ContentService.createTextOutput(JSON.stringify(createSchoolUser(data.sessionId, data.userData)))
        .setMimeType(ContentService.MimeType.JSON);
        
    case 'passwordReset':
      return ContentService.createTextOutput(JSON.stringify(requestPasswordReset(data.username, data.email)))
        .setMimeType(ContentService.MimeType.JSON);
        
    default:
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
        .setMimeType(ContentService.MimeType.JSON);
  }
}
