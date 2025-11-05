# Religion Olympiad Registration System

A complete web-based registration system for Religion Olympiad events with Google Apps Script backend integration.

## 🌟 Features

### For School Coordinators
- **Single Student Registration**: Register students one at a time with real-time fee calculation
- **Bulk CSV Upload**: Upload multiple student registrations via CSV file
- **Registration Management**: View all registered students
- **Payment Summary**: Generate payment summaries with QR codes
- **Print Support**: Print-friendly payment receipts

### For Administrators
- **Dashboard Analytics**: View system-wide statistics and metrics
- **School Management**: Add and manage school coordinator accounts
- **Fee Structure Management**: Update registration fees for different groups
- **Reports & Analytics**: Generate various reports and analytics
- **Audit Logs**: Track all system activities
- **Export Data**: Export registrations to CSV

## 📋 System Components

### 1. Backend (Code.gs)
Google Apps Script backend that handles:
- User authentication and session management
- Student registration with automatic fee calculation
- Database operations using Google Sheets
- Bulk CSV processing
- Audit logging
- Password reset functionality

### 2. Frontend Pages

#### Login Page (login.html)
- Secure login for Admin and School Coordinator users
- Password reset functionality
- Session management
- Responsive Bootstrap 5 design

**Demo Credentials:**
- Admin: `admin` / `admin123`
- School: `school` / `school123`

#### Student Registration Dashboard (dashboard.html)
School coordinators can:
- Register individual students
- Upload bulk registrations via CSV
- View registration history
- Generate payment summaries
- Print receipts

#### Admin Dashboard (admin.html)
Administrators can:
- View system statistics
- Manage all registrations
- Add/edit school accounts
- Update fee structures
- Generate reports
- View audit logs

## 💰 Fee Structure

| Group | Classes | Base Fee | Physical Book | Digital Book |
|-------|---------|----------|---------------|--------------|
| Zero Group | 1-3 | ₹30 | ₹50 | ₹45 |
| First Group | 4-5 | ₹40 | ₹40 | ₹36 |
| Second Group | 6-8 | ₹40 | ₹40 | ₹36 |
| Third Group | 9-12 | ₹50 | ₹70 | ₹63 |
| Open Group | Others | ₹70 | ₹100 | ₹90 |

**Notes:**
- Base fee is mandatory for all students
- Book fee applies only if "Include Book" is selected
- Digital books require a valid email address
- Fees are automatically calculated based on class selection

## 🚀 Setup Instructions

### Prerequisites
- Google Account
- Google Apps Script access
- Google Sheets for database

### Installation Steps

1. **Create Google Spreadsheet**
   - Create a new Google Spreadsheet
   - Note the Spreadsheet ID from the URL

2. **Setup Google Apps Script**
   - In Google Sheets, go to Extensions > Apps Script
   - Copy the contents of `Code.gs` into the script editor
   - Set Script Properties:
     - Key: `SPREADSHEET_ID`, Value: `[Your Spreadsheet ID]`

3. **Initialize Database**
   - Run the `initializeSpreadsheet()` function from the script editor
   - This creates all required sheets and default data

4. **Deploy Web App**
   - Click Deploy > New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Copy the Web App URL

5. **Update HTML Files**
   - In each HTML file (login.html, dashboard.html, admin.html)
   - Replace the `SCRIPT_URL` constant with your Web App URL
   - Uncomment the actual API call code in production

6. **Host Frontend Files**
   - Upload HTML files to your web hosting service
   - Or use Google Apps Script HTML Service

## 📝 Usage Guide

### For School Coordinators

#### Single Student Registration
1. Login with your school credentials
2. Navigate to "Single Registration"
3. Fill in student details:
   - Student Name (required)
   - Class (required)
   - Include Book (optional)
   - Book Type: Physical or Digital
   - Email (required for digital books)
4. View calculated fees in real-time
5. Click "Register Student"

#### Bulk Registration via CSV
1. Navigate to "Bulk Registration"
2. Download the sample CSV template
3. Fill in student data following the format:
   ```
   Student Name, Class, Include Book, Book Type, Email
   John Doe, 5, Yes, Physical,
   Jane Smith, 10, Yes, Digital, jane@example.com
   ```
4. Upload the CSV file
5. Review the preview
6. Click "Process Bulk Registration"

#### Payment Summary
1. Navigate to "Payment Summary"
2. View total students and amount
3. Scan QR code or use UPI details for payment
4. Click "Print Summary" for physical receipt

### For Administrators

#### Managing Schools
1. Login with admin credentials
2. Navigate to "Schools Management"
3. Click "Add New School"
4. Fill in school details and credentials
5. Save to create school account

#### Updating Fee Structure
1. Navigate to "Fee Structure"
2. Modify base fee or book fees for any group
3. Click "Update" to save changes

#### Generating Reports
1. Navigate to "Reports"
2. Select report type:
   - All Registrations
   - Group-wise Report
   - School-wise Report
   - Revenue Report
3. View or download the report

## 🔒 Security Features

- Password hashing for user credentials
- Session-based authentication
- Role-based access control (Admin/School)
- Input validation on all forms
- SQL injection prevention
- XSS protection
- Audit logging for all actions

## 🎨 Design Features

- Fully responsive design (mobile, tablet, desktop)
- Modern gradient UI with Bootstrap 5
- Real-time form validation
- Interactive fee calculator
- Print-friendly layouts
- Loading states and error handling
- Smooth animations and transitions

## 📊 Database Schema

### Users Sheet
- UserID, Username, PasswordHash, Role, SchoolName, Email, Phone, CreatedAt, Active

### Students Sheet
- StudentID, SchoolID, StudentName, Class, Group, IncludeBook, BookType, Email, BaseFee, BookFee, TotalFee, RegisteredBy, RegisteredAt

### Sessions Sheet
- SessionID, UserID, Role, CreatedAt, ExpiresAt

### AuditLogs Sheet
- Timestamp, UserID, Action, Details, IPAddress

### FeeConfig Sheet
- Group, Classes, BaseFee, BookPhysical, BookDigital

## 🐛 Troubleshooting

### Common Issues

**Login not working:**
- Check if session storage is enabled in browser
- Verify credentials are correct
- Clear browser cache and cookies

**Fee calculation not updating:**
- Ensure JavaScript is enabled
- Refresh the page
- Check browser console for errors

**CSV upload failing:**
- Verify CSV format matches template
- Check for special characters in names
- Ensure email format is valid for digital books

**Session expired:**
- Sessions expire after 1 hour of inactivity
- Simply login again to create new session

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 🔄 Future Enhancements

- Email notifications for successful registrations
- SMS integration for payment confirmations
- Advanced reporting with charts
- Multi-language support
- Payment gateway integration
- Certificate generation
- Mobile app version

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the audit logs for error details
- Contact system administrator

## 📄 License

© 2024 Religion Olympiad Registration System. All rights reserved.

## 👨‍💻 Author

Harpreet Singh Nimana

---

**Version:** 1.0.0  
**Last Updated:** January 2024
