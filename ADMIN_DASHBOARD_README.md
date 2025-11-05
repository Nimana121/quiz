# Admin Dashboard - Quiz Registration System

A comprehensive administrative dashboard for managing quiz registrations, schools, fees, and generating reports.

## Features

### 🔐 Authentication & Access Control
- Role-based login (Admin / Coordinator)
- Admin-only sections (Fee Settings)
- Demo credentials for testing:
  - Admin: `admin` / `admin123`
  - Coordinator: `coordinator` / `coord123`

**⚠️ Security Note:** This implementation uses client-side authentication for demonstration purposes only. In a production environment, authentication must be handled server-side with proper security measures.

### 📊 Dashboard Overview
- Real-time statistics cards
- Total registrations, active schools, revenue, pending payments
- Recent registrations table
- Payment status visualization

### 📈 Statistics & Analytics
- Per-school registration statistics
- Revenue tracking by school
- Payment status breakdown
- Book delivery tracking
- Participation analytics
- Filterable by school and date range

### 💰 Fee Management (Admin Only)
- Configure registration fee, book fee, late fee
- Set bulk discount percentage
- View fee change history
- All changes are logged in audit trail

### 🏢 School Management
- Add, edit, and delete schools
- Track coordinator information
- View contact details (email, phone)
- Manage school status (active/inactive)

### 👥 Registration Management
- View all student registrations
- Filter by school and payment status
- Search by student name
- Track payment and book delivery status
- Add/edit/delete individual registrations

### 📄 Reports & Export
- Export registrations as CSV
- Export payment reports
- Export school statistics
- Custom report generator with date ranges
- Download sample CSV templates

### 🕐 Audit Logs
- Complete activity tracking
- Filter by activity type, user, and date
- Tracks all actions:
  - Login/logout events
  - Fee changes
  - School operations
  - Registrations
  - Bulk uploads
  - Report exports

### 🔄 Bulk Operations
- CSV bulk upload for registrations
- CSV bulk upload for schools
- Bulk payment status updates
- Bulk book delivery updates
- Download sample CSV templates
- All operations require confirmation

## Technical Details

### Data Storage
- Uses browser localStorage for data persistence
- No backend required
- Sample data included for testing
- Data persists across sessions

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop and tablet
- Requires JavaScript enabled

### Files
- `admin-dashboard.html` - Main HTML structure and styling
- `admin-dashboard.js` - All JavaScript logic and functionality

### Key Technologies
- Pure JavaScript (ES6+)
- Inline CSS with responsive grid layout
- LocalStorage API for data persistence
- FileReader API for CSV processing
- Modal dialogs for forms
- Toast notifications for user feedback

## Getting Started

1. Open `admin-dashboard.html` in a web browser
2. Log in with demo credentials:
   - Username: `admin`
   - Password: `admin123`
   - Role: `Admin`
3. Explore the dashboard sections
4. Try adding schools, registrations, and generating reports

## User Guide

### Adding a School
1. Navigate to "Schools" section
2. Click "Add New School"
3. Fill in school details (name, location, coordinator, contact)
4. Click "Save"

### Adding a Registration
1. Navigate to "Registrations" section
2. Click "Add Registration"
3. Select school, enter student details
4. Set payment and delivery status
5. Click "Save"

### Exporting Reports
1. Navigate to "Reports & Export"
2. Choose report type (Registrations, Payments, or Schools)
3. Click "Export CSV"
4. File will download automatically

### Bulk Upload
1. Navigate to "Bulk Operations"
2. Choose operation type (Registrations or Schools)
3. Click "Download Sample" to see CSV format
4. Prepare your CSV file following the sample format
5. Upload CSV file
6. Review and confirm the upload

### Viewing Audit Logs
1. Navigate to "Audit Logs"
2. Use filters to narrow down activities
3. View timestamped log entries
4. All administrative actions are tracked

## Data Format

### Registration CSV Format
```csv
Student Name,School Name,Grade,Payment Status,Amount
John Doe,Guru Nanak Academy,8,paid,40.00
Jane Smith,Khalsa School,9,pending,40.00
```

### School CSV Format
```csv
School Name,Location,Coordinator,Email,Phone
Sample School,City, Province,John Doe,email@example.com,123-456-7890
```

## Features by Role

### Admin Access
- Full access to all sections
- Can modify fee structure
- Can manage schools and registrations
- Can view and export all reports
- Can perform bulk operations
- Full audit log access

### Coordinator Access
- Dashboard overview (read-only)
- View statistics
- View schools (read-only)
- View registrations (read-only)
- Export reports
- View audit logs
- Cannot modify fee settings

## Troubleshooting

### Login Issues
- Ensure credentials are entered correctly (case-sensitive)
- Check that JavaScript is enabled
- Try clearing browser cache and localStorage

### Data Not Persisting
- Check browser localStorage is not disabled
- Ensure you're using the same browser/profile
- Private/Incognito mode may clear data on exit

### CSV Upload Issues
- Verify CSV format matches sample template
- Check for proper comma separation
- Ensure no special characters in data
- School names must match exactly for registration uploads

## Future Enhancements

Potential improvements for production use:
- Server-side authentication and authorization
- Database backend for data persistence
- Email notifications for registrations
- Payment gateway integration
- Advanced reporting with charts and graphs
- Multi-tenant support for different organizations
- API endpoints for integrations
- Mobile app support

## Support

For issues or questions:
1. Check this README first
2. Review the audit logs for activity tracking
3. Try the demo credentials to reset
4. Contact system administrator

## License

This is a demonstration project. Refer to the main repository license.
