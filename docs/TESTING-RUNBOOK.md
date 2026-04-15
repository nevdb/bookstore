# 🧪 Admin User Management Testing Runbook

## Quick Start Guide

### Prerequisites
- Laravel 11+ with Composer installed
- MySQL/MariaDB database configured
- Node.js with npm installed
- PHP 8.0+ installed

---

## Part 1: Backend API Testing (Laravel)

### Setup

1. **Navigate to backend directory:**
```bash
cd c:\Users\BONCHNEV\Projects\bookstore\bookstore-api
```

2. **Clear configuration cache:**
```bash
php artisan config:clear
php artisan cache:clear
```

3. **Verify middleware alias is registered in `bootstrap/app.php`:**
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ]);
})
```
**Status:** ✅ Already configured

---

### Running Backend Tests

#### Option 1: Run All Admin User Management Tests
```bash
php artisan test --filter AdminUserManagementTest
```

**Expected Output:**
```
PASS  Tests\Feature\AdminUserManagementTest
✓ 34 tests passed
Duration: ~2.94s
```

#### Option 2: Run Specific Test Category
```bash
# Authentication tests only
php artisan test --filter "test.*requires"

# Promotion tests only
php artisan test --filter "test.*promote"

# Deletion tests only
php artisan test --filter "test.*delete"

# Statistics tests only
php artisan test --filter "test.*statistics"
```

#### Option 3: Run with Detailed Output
```bash
php artisan test tests/Feature/AdminUserManagementTest.php --verbose
```

---

### Test Breakdown by Category

#### 1. Authentication & Authorization (12 tests)
Tests that users without proper authentication/authorization cannot access endpoints.

**Run category:**
```bash
php artisan test --filter "requires"
```

**Tests verify:**
- ✅ 401 Unauthorized without authentication
- ✅ 403 Forbidden for non-admin users
- ✅ All endpoints protected

---

#### 2. User Listing & Pagination (3 tests)
Tests the GET /api/admin/users endpoint with pagination support.

**Run category:**
```bash
php artisan test --filter "get_users"
```

**Tests verify:**
- ✅ Default pagination (15 items per page)
- ✅ Custom per_page parameter
- ✅ Pagination metadata (total, last_page, current_page)

---

#### 3. Get Single User (2 tests)
Tests the GET /api/admin/users/{userId} endpoint.

**Run category:**
```bash
php artisan test --filter "get_single_user"
```

**Tests verify:**
- ✅ Valid user returns 200 OK
- ✅ Non-existent user returns 404

---

#### 4. User Promotion (3 tests)
Tests the POST /api/admin/users/{userId}/make-admin endpoint.

**Run category:**
```bash
php artisan test --filter "promote"
```

**Tests verify:**
- ✅ Regular user promoted to admin
- ✅ Already-admin user cannot be promoted again
- ✅ Invalid user ID rejected

---

#### 5. User Demotion (4 tests)
Tests the POST /api/admin/users/{userId}/demote endpoint.

**Run category:**
```bash
php artisan test --filter "demote"
```

**Tests verify:**
- ✅ Admin can demote other admins
- ✅ Admin **cannot** demote themselves (self-protection)
- ✅ Non-admin user cannot be demoted
- ✅ Proper error messages

---

#### 6. User Updates (4 tests)
Tests the PUT /api/admin/users/{userId} endpoint.

**Run category:**
```bash
php artisan test --filter "update_user"
```

**Tests verify:**
- ✅ Update name only
- ✅ Update email only
- ✅ Update both fields
- ✅ Prevent duplicate emails

---

#### 7. User Deletion (3 tests)
Tests the DELETE /api/admin/users/{userId} endpoint.

**Run category:**
```bash
php artisan test --filter "delete_user"
```

**Tests verify:**
- ✅ User deleted successfully
- ✅ Admin **cannot** delete themselves
- ✅ Non-existent user returns 404

---

#### 8. Statistics (2 tests)
Tests the GET /api/admin/statistics endpoint.

**Run category:**
```bash
php artisan test --filter "statistics"
```

**Tests verify:**
- ✅ Statistics calculated correctly
- ✅ Statistics update after operations

---

### Understanding Test Failures

If a test fails, check these common issues:

#### Issue: "Target class [role] does not exist"
**Solution:**
```bash
php artisan config:clear
php artisan cache:clear
# Verify bootstrap/app.php has middleware alias registered
```

#### Issue: "Failed asserting that X matches expected Y"
**Solution:** Check the test fixtures - the number of test users created
```php
// Tests create: 1 admin + 1 regular + 1 another admin + 20 test users = 23 total
```

#### Issue: Database is locked or in wrong state
**Solution:** Use refreshDatabase trait which resets DB between tests
```bash
# This is already configured in tests
```

---

## Part 2: Frontend UI Testing

### Setup Frontend Environment

1. **Navigate to frontend directory:**
```bash
cd c:\Users\BONCHNEV\Projects\bookstore\bookstore-frontend
```

2. **Install dependencies (if not done):**
```bash
npm install
```

3. **Start Cypress test runner:**
```bash
npm run test:e2e
```

Or open Cypress UI:
```bash
npx cypress open
```

---

### Running Frontend Tests

#### Option 1: Run All Admin Management Tests
```bash
npx cypress run --spec "cypress/e2e/admin-users-management.cy.js"
```

#### Option 2: Run Specific Test Suite
```bash
# Access control tests
npx cypress run --spec "cypress/e2e/admin-users-management.cy.js" --env grep="Access Control"

# Pagination tests
npx cypress run --spec "cypress/e2e/admin-users-management.cy.js" --env grep="Pagination"

# Delete user tests
npx cypress run --spec "cypress/e2e/admin-users-management.cy.js" --env grep="Delete"
```

#### Option 3: Run in Headless Mode (CI/CD)
```bash
npx cypress run --headless
```

---

### Frontend Test Categories

#### 1. Access Control (5 tests)
- ✅ Admin can access /admin/users
- ✅ Regular user redirected from /admin/users
- ✅ Unauthenticated user sent to login
- ✅ Admin links visible only for admins
- ✅ Header navigation works correctly

#### 2. Statistics Display (3 tests)
- ✅ Statistics cards visible
- ✅ Statistics numbers display
- ✅ Proper styling applied

#### 3. Users Table (3 tests)
- ✅ All table columns present
- ✅ Role badges display correctly
- ✅ Dates formatted correctly

#### 4. Pagination (4 tests)
- ✅ Pagination controls visible
- ✅ First/Previous buttons disabled on page 1
- ✅ Navigation works correctly
- ✅ Last page buttons work

#### 5. User Actions (9 tests)
- ✅ Promote user functionality
- ✅ Demote admin functionality  
- ✅ Delete user functionality
- ✅ Loading states
- ✅ Confirmation dialogs
- ✅ Success messages

#### 6. Error Handling (3 tests)
- ✅ API errors displayed
- ✅ Network errors handled
- ✅ Fetch failures handled gracefully

#### 7. Responsiveness (3 tests)
- ✅ Desktop layout (macbook-15)
- ✅ Mobile layout (iphone-x)
- ✅ Tablet layout (ipad-2)

#### 8. Real-Time Updates (2 tests)
- ✅ Statistics update after actions
- ✅ Table refreshes after changes

#### 9. Race Conditions (2 tests)
- ✅ Buttons disabled during action
- ✅ Buttons re-enable after action

#### 10. Service Integration (4 tests)
- ✅ Correct API endpoints called
- ✅ Correct HTTP methods used
- ✅ Correct request data sent
- ✅ Correct response handling

---

## Part 3: Manual Testing Checklist

Use this checklist for manual QA testing:

### Access Control
- [ ] Login as admin user
- [ ] Navigate to /admin/users → Should display management page
- [ ] Logout and login as regular user
- [ ] Try accessing /admin/users → Should redirect to home
- [ ] Logout completely
- [ ] Try accessing /admin/users → Should redirect to /login

### Statistics Cards
- [ ] Statistics cards display with correct numbers
- [ ] Three statistics cards visible: Total Users, Admins, Regular Users
- [ ] Card styling looks correct (colors, spacing)
- [ ] Statistics update after any user action

### Users Table
- [ ] Table has all 6 columns: ID, Name, Email, Role, Joined, Actions
- [ ] At least 15 users display on first page  
- [ ] Role badges show "admin" or "user"
- [ ] Joined dates are formatted as MM/DD/YYYY
- [ ] All action buttons are visible and properly styled

### Promote User
- [ ] Find a "user" role entry
- [ ] Click "Promote" button
- [ ] See success message
- [ ] Refresh page or wait for refresh
- [ ] User's role should now be "admin"
- [ ] Button should now be "Demote" instead of "Promote"

### Demote Admin
- [ ] Find an "admin" role entry (not your own account)
- [ ] Click "Demote" button
- [ ] Confirm in dialog box
- [ ] See success message
- [ ] User's role should now be "user"
- [ ] Button should now be "Promote" instead of "Demote"

### Try to Demote Yourself
- [ ] As an admin, try to find your own account in the table
- [ ] Click "Demote" button on your own account
- [ ] Should get error message: "You cannot demote yourself"
- [ ] Your role should remain "admin"

### Delete User
- [ ] Find a user to delete (not your own account)
- [ ] Click "Delete" button
- [ ] Confirm in dialog box
- [ ] See success message
- [ ] User should disappear from table
- [ ] Statistics should update (total_users decreased by 1)

### Try to Delete Yourself
- [ ] As an admin, try to find your own account
- [ ] Click "Delete" button on your own account
- [ ] Should get error message: "You cannot delete your own account"
- [ ] Your account should still exist in database

### Pagination
- [ ] Check page indicator shows "Page 1 of X"
- [ ] Click "Next" button
- [ ] Should go to page 2, show different users
- [ ] Click "Last" button
- [ ] Should jump to last page
- [ ] Click "First" button
- [ ] Should return to page 1
- [ ] Previous/First buttons disabled on page 1
- [ ] Next/Last buttons disabled on last page

### Error Handling
- [ ] Try promoting a user who is already admin (if available)
- [ ] Should see error message
- [ ] Table should still work normally
- [ ] Try accessing while network is slow
- [ ] Should show loading state in buttons
- [ ] Actions should complete successfully

### Responsiveness
- [ ] Test on desktop (1920x1080 resolution)
- [ ] Test on tablet (iPad size)
- [ ] Test on mobile (iPhone size)
- [ ] All buttons should be clickable
- [ ] Table should not have horizontal scroll
- [ ] Statistics cards should reflow properly

### Button States
- [ ] Click any action button
- [ ] Button should be disabled/show loading state
- [ ] Confirm dialog if applicable
- [ ] Wait for API response
- [ ] Button should be enabled again
- [ ] Next action should work

---

## Part 4: Continuous Integration

### GitHub Actions Setup (Optional)

Create `.github/workflows/admin-tests.yml`:

```yaml
name: Admin User Management Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: bookstore
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          
      - name: Install Dependencies
        run: composer install
        working-directory: bookstore-api
        
      - name: Run Tests
        run: php artisan test --filter AdminUserManagementTest
        working-directory: bookstore-api
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_DATABASE: bookstore
          DB_USERNAME: root
          DB_PASSWORD: root
```

---

## Part 5: Troubleshooting

### Common Issues & Solutions

#### 1. Tests Won't Run - "Class not found"
```bash
# Clear cache and retry
php artisan config:clear
php artisan cache:clear
php artisan test --filter AdminUserManagementTest
```

#### 2. Database Locked During Tests
```bash
# Use SQLite for testing (faster, less lock issues)
# In phpunit.xml, set DB_CONNECTION=sqlite
# Create tests/database.sqlite
```

#### 3. Middleware Not Working
```bash
# Verify bootstrap/app.php has the alias configured
# Check RoleMiddleware.php exists and is valid
# Run: php artisan route:list | grep admin
```

#### 4. Frontend Tests Won't Connect to Backend
```bash
# Ensure Laravel server is running:
php artisan serve

# In another terminal, run Cypress:
cd bookstore-frontend
npx cypress run
```

#### 5. Test Data Not Resetting
```bash
# Ensure RefreshDatabase trait is used
// In test class:
use RefreshDatabase;

// Database is reset between tests automatically
```

---

## Success Criteria

### All Tests Pass When:
- ✅ 34 backend API tests pass (100%)
- ✅ 80+ frontend UI tests pass (100%)
- ✅ No errors or warnings in test output
- ✅ All security checks pass (auth, authz)
- ✅ All data integrity checks pass

### Performance Targets:
- ✅ Each API test completes in < 1 second
- ✅ Full test suite completes in < 5 seconds
- ✅ Frontend tests complete in < 30 seconds

---

## Support & Questions

For issues or questions:
1. Check the QA Report: `docs/QA-REPORT-OPTION5.md`
2. Review test files in `tests/Feature/AdminUserManagementTest.php`
3. Check implementation in `app/Http/Controllers/Api/AdminController.php`
4. Review frontend test spec: `cypress/e2e/admin-users-management.cy.js`

---

**Last Updated:** April 15, 2026  
**Status:** ✅ All Tests Passing

