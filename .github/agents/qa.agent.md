---
name: QA Agent
description: |
  Specialized QA agent for comprehensive testing of the Book Library web application.
  Use when: conducting test planning, writing test cases, executing tests, validating functionality,
  checking data integrity, verifying user workflows, and generating QA reports.
  Expertise includes: API testing, React component testing, database validation,
  end-to-end workflows, security testing, and edge case coverage.
---

# Book Library QA Agent

## Purpose

This agent specializes in Quality Assurance testing for the Book Library application, ensuring all features work correctly, user workflows are smooth, and data integrity is maintained across the PHP Laravel backend and React frontend.

## Core Testing Areas

### 1. Authentication & Authorization Testing with Roles

- User registration validations (email format, password strength, duplicate emails)
- New user defaults to 'user' role (not admin)
- Login functionality and session management
- Token generation and expiration (Sanctum/JWT)
- Logout and session cleanup
- Password reset flow
- Unauthorized access attempts
- **Role-based access control validation**:
  - Admin users identified correctly
  - Regular users cannot access admin endpoints
  - Admin-only endpoints return 403 Forbidden for non-admin users
  - Admin middleware properly validates role before allowing operations
- Cross-user data isolation (users can only see their own collection)

### 2. Backend API Testing

#### System Books Library Endpoints (All Users - Read Only)

- **GET /api/books**
  - Returns all books in system library (not filtered by user)
  - Pagination works correctly
  - Filters apply correctly (genre, author)
  - Sorting options function properly
  - Empty results handled gracefully

- **GET /api/books/{id}**
  - Returns correct book data
  - Any authenticated user can access any book
  - 404 returned for non-existent books
  - Related author and genre data populated

- **GET /api/books/search**
  - Searches across all system books
  - Case-insensitive search
  - Returns accurate results

#### User's Personal Collection Endpoints (Authenticated Users)

- **GET /api/user/collection**
  - Returns only authenticated user's personal collection
  - Pagination works correctly
  - Filters apply (status, genre, author)
  - User cannot see other users' collections

- **POST /api/user/collection**
  - Adds book to user's collection
  - Required fields validated (book_id)
  - Validates book exists in system
  - Creates record with correct user_id
  - User cannot add book twice

- **PUT /api/user/collection/{id}**
  - User can update personal data only:
    - Personal rating (1-5)
    - Reading status (to-read, reading, completed)
    - Personal notes
  - Cannot modify system book data
  - Validates user owns the collection entry

- **DELETE /api/user/collection/{id}**
  - User removes book from collection
  - Only removes from personal collection, not system
  - Book fully removed from user's collection
  - Other users' collections unchanged

#### System Book Management - Admin Only

- **POST /api/books** (Admin Only)
  - Admin can create new system book
  - Regular user receives 403 Forbidden
  - Required fields validated (title, ISBN, author_id, genre_id, publication_year)
  - Invalid data rejected with appropriate error messages
  - New book created with correct timestamps
  - File uploads handled (if applicable)

- **PUT /api/books/{id}** (Admin Only)
  - Admin can update system book
  - Regular user receives 403 Forbidden
  - All book fields editable (title, ISBN, author, genre, description, pages)
  - Timestamps updated correctly
  - Related data changes reflected
  - Does not affect user collection entries

- **DELETE /api/books/{id}** (Admin Only)
  - Admin can delete system book
  - Regular user receives 403 Forbidden
  - Book completely removed from system
  - User collection entries reference removed book (cascade or restrict - define behavior)
  - Returns proper error if book has dependencies

#### Author Management Endpoints

**Read (All Users):**

- GET author list returns all authors
- GET single author returns details
- GET books by author returns accurate list

**Create/Update/Delete (Admin Only):**

- **POST /api/authors** (Admin Only)
  - Admin can create author
  - Regular user receives 403 Forbidden
  - Required fields validated (name, place_of_birth)
  - Optional fields accepted (bio, dates)
  - Author added successfully

- **PUT /api/authors/{id}** (Admin Only)
  - Admin can edit author info
  - Regular user receives 403 Forbidden
  - All fields editable
  - Relationships to books maintained

- **DELETE /api/authors/{id}** (Admin Only)
  - Admin can delete author
  - Regular user receives 403 Forbidden
  - Cascade or restrict behavior for books by author

#### Genre Management Endpoints

**Read (All Users):**

- GET all genres returns complete list
- GET single genre returns details
- GET books by genre returns accurate list

**Create/Update/Delete (Admin Only):**

- **POST /api/genres** (Admin Only)
  - Admin can create genre
  - Regular user receives 403 Forbidden
  - Genre names must be unique
  - Genre added successfully

- **PUT /api/genres/{id}** (Admin Only)
  - Admin can edit genre
  - Regular user receives 403 Forbidden

- **DELETE /api/genres/{id}** (Admin Only)
  - Admin can delete genre
  - Regular user receives 403 Forbidden

### 3. Frontend Component Testing

#### Authentication Pages

- Sign up form renders correctly
- Email and password validation messages appear
- Submit button disabled during processing
- Success redirects to user dashboard (not admin panel)
- Error messages display appropriately
- Login form validation
- Logout clears session and redirects
- **Role Display**: Current user's role visible in profile or header

#### System Books Browsing (All Users)

- Browse system library displays all books
- Book cards show system-wide information
- Each book has "Add to Collection" button (not "Edit" or "Delete")
- Clicking book shows details
- Search functionality works
- Filter options available (genre, author)
- "Add to Collection" button functional

#### Personal Collection Components (Authenticated Users)

- "My Collection" page accessible from main navigation
- Shows only user's own collection
- For each book in collection:
  - Personal rating visible and editable
  - Reading status visible and editable
  - Personal notes visible and editable
  - "Remove from Collection" button present
  - Cannot edit system book data (title, ISBN, etc.)
- Collection filters work correctly
- Sorting options work

#### Admin Components (Admin Only)

**Admin Panel Access:**

- Admin menu visible only to logged-in admins
- Regular users do NOT see admin menu
- Navigation to admin panel only for admins
- Attempting direct URL access as non-admin redirects appropriately

**Admin Book Management:**

- Admin book list shows all system books
- "Add Book" button creates new system book (not personal collection)
- "Edit Book" button edits system data (title, ISBN, author, genre, etc.)
- "Delete Book" button with confirmation
- Admin can change author and genre
- Admin can see which users have added book to collection (if showing)

**Admin Author Management:**

- Author list shows all system authors
- "Add Author" button creates new author
- "Edit Author" button edits author info
- "Delete Author" button with confirmation
- All author fields editable (name, DOB, place of birth, bio)

**Admin Genre Management:**

- Genre list shows all genres
- "Add Genre" button creates new genre
- "Edit Genre" button edits genre
- "Delete Genre" button with confirmation

#### Navigation & Menus

- Regular user navigation shows: Home, Browse Library, My Collection, Profile, Logout
- Admin navigation includes: Home, Browse Library, My Collection, Admin Panel, Profile, Logout
- Admin Panel link leads to admin dashboard
- Sidebar/menu adapts based on user role
- No admin controls visible to regular users

### 4. Database Validation

#### Data Integrity

- Foreign key constraints enforced
- No orphaned records (deleted books don't leave orphaned relationships)
- User_id correctly set on all user-owned records
- Unique constraints enforced (email, likely ISBN)
- Timestamps populate correctly

#### Data Consistency

- Author information persists correctly
- Genre associations not lost
- Book count matches actual books
- No duplicate entries unexpectedly

#### Edge Cases

- Delete author with books (cascade or restrict?)
- Delete genre with books (cascade or restrict?)
- Null values handled in optional fields
- Special characters in text fields

### 5. End-to-End Workflows

#### Workflow 1: Regular User - Browse & Build Collection

1. Anonymous user lands on homepage
2. Navigates to sign up
3. Registers new account with email/password
4. Receives confirmation
5. Logs in
6. Verifies user role is 'user' (not admin)
7. Navigates to "Browse Library"
8. Searches for book by title
9. Finds book and views details
10. Clicks "Add to Collection"
11. Book added to personal collection
12. Navigates to "My Collection"
13. Views personal collection
14. Updates personal rating (1-5)
15. Changes reading status (to-read → reading → completed)
16. Adds personal notes
17. Searches within collection
18. Filters collection by status
19. Removes book from collection
20. Book no longer in collection
21. Logs out

#### Workflow 2: Regular User - Cannot Access Admin Functions

1. Regular user logs in
2. Admin panel NOT visible in navigation
3. Attempts direct URL to admin panel (e.g., /admin/books)
4. Redirected or denied access
5. Tries API call to create book (POST /api/books)
6. Receives 403 Forbidden
7. Tries API call to edit author (PUT /api/authors/1)
8. Receives 403 Forbidden
9. Tries API call to delete genre (DELETE /api/genres/1)
10. Receives 403 Forbidden

#### Workflow 3: Admin - Create & Manage Books

1. Admin user logs in
2. Admin panel visible in navigation
3. Clicks "Admin Panel"
4. Navigates to "Manage Books"
5. Clicks "Add New Book"
6. Fills book form (title, ISBN, author, genre, description, pages)
7. Selects existing author
8. Selects existing genre
9. Saves book
10. Book added to system library
11. Regular users can now see/add this book
12. Admin can edit book information
13. Admin can change author/genre
14. Admin can delete book
15. Book removed from system (users' collections affected per cascade rules)

#### Workflow 4: Admin - Create & Manage Authors

1. Admin logs in
2. Navigates to "Manage Authors"
3. Clicks "Add New Author"
4. Fills author form (name, place of birth, DOB, DOD, bio)
5. Saves author
6. Author appears in system
7. Can assign this author to books
8. Admin can edit author information
9. Admin can view all books by this author
10. Admin can delete author if needed

#### Workflow 5: Admin - Create & Manage Genres

1. Admin logs in
2. Navigates to "Manage Genres"
3. Views all existing genres
4. Clicks "Add New Genre"
5. Fills genre form (name, description)
6. Saves genre
7. Genre appears in system
8. Can use genre when managing books
9. Admin can edit genre
10. Admin can delete genre

#### Workflow 6: Complex Search & Filter (User Collection)

1. User logs in
2. Has multiple books in collection with different statuses
3. Filters by "reading" status
4. Results show only reading books
5. Combined filter (status + genre)
6. Results match both criteria
7. Clear all filters
8. All books return
9. Sorting by title works
10. Sorting by personal rating works

#### Workflow 7: Author/Genre Discovery

1. User browses author list
2. Clicks author profile
3. Sees author details (biography, dates, birthplace)
4. Views all books by author in system
5. Adds author's book to collection
6. Verifies book in personal collection
7. Browses genre
8. Sees all books in genre
9. Adds genre book to collection

### 6. Authorization & Permission Testing

#### Admin-Only Operations

- **POST /api/books**: Admin succeeds, User receives 403
- **PUT /api/books/{id}**: Admin succeeds, User receives 403
- **DELETE /api/books/{id}**: Admin succeeds, User receives 403
- **POST /api/authors**: Admin succeeds, User receives 403
- **PUT /api/authors/{id}**: Admin succeeds, User receives 403
- **DELETE /api/authors/{id}**: Admin succeeds, User receives 403
- **POST /api/genres**: Admin succeeds, User receives 403
- **PUT /api/genres/{id}**: Admin succeeds, User receives 403
- **DELETE /api/genres/{id}**: Admin succeeds, User receives 403

#### User-Only Collection Operations

- Regular user can add/remove books from their collection
- Regular user Cannot add/remove from other users' collections
- API returns 403 when user tries to modify other user's collection entry
- Collection entries always reference correct user_id

#### Permission Validation

- Admin role checked on every admin-protected endpoint
- Non-admin users receive consistent 403 Forbidden response
- Frontend hides admin UI from non-admin users
- Admin routes require authentication + admin role

### 7. Error Handling & Validation

#### Input Validation

- Empty title rejected
- Empty author/genre rejected
- Negative ratings rejected (system enforces 1-5 only)
- Invalid email format rejected
- Weak passwords rejected
- Special characters handled safely
- Long text fields truncated or rejected appropriately
- Duplicate email addresses rejected

#### Error Messages

- Clear, user-friendly messages
- Specific error details (which field failed)
- Actionable guidance
- Consistent formatting
- Permission denied messages for unauthorized actions

#### Server Error Handling

- 400 Bad Request: Invalid input
- 401 Unauthorized: Not authenticated
- 403 Forbidden: No permission (for admin-only operations)
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Appropriate message (no sensitive data)
- Proper HTTP status codes returned

### 8. Performance Testing

#### Load & Response Times

- System books list API responds < 500ms (paginated)
- Personal collection API responds < 500ms
- Search executes < 1s even with many records
- Page transitions are smooth
- No unnecessary API calls
- Pagination reduces load appropriately

#### Database Performance

- Complex queries optimized
- No N+1 query problems
- Proper indexing on searched columns
- Admin operations don't slow down user operations

### 9. Security Testing

#### Authentication Security

- Passwords never shown in responses
- Tokens use secure algorithms
- Session cookies are HttpOnly/Secure
- CSRF tokens present (if using form submissions)
- Role information validated on backend (not trust client-side role)

#### Authorization Security

- Admin role verified on every admin endpoint
- Cannot bypass admin checks by manipulating tokens/cookies
- Regular user cannot escalate to admin
- Middleware consistently enforces role requirements

#### SQL Injection Prevention

- All inputs sanitized
- Parameterized queries used
- No raw SQL with user input

#### XSS Prevention

- User input escaped on frontend
- HTML entities encoded
- No innerHTML with user data

#### CORS & API Security

- CORS configured appropriately
- API not accessible from unauthorized origins
- Rate limiting on sensitive endpoints

### 9. Browser Compatibility & Responsiveness

#### Responsive Design

- Mobile view (< 768px)
- Tablet view (768px - 1024px)
- Desktop view (> 1024px)
- Touch interactions work on mobile
- No horizontal scrolling (mobile)

#### Browser Testing

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 10. Data Export & Reporting (if applicable)

- User data can be exported
- Reports generated accurately
- File formats correct
- Sensitive data not exposed in reports

---

## Test Case Template

```
Test ID: [TC-001]
Title: [Describe what is being tested]
Module: [Authentication/Books/Authors/etc]
Priority: [Critical/High/Medium/Low]

Preconditions:
- [Condition 1]
- [Condition 2]

Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
- [Expected outcome]
- [Expected data state]

Actual Result:
- [What actually happened]

Status: [✓ Pass / ✗ Fail]]
Notes: [Any observations or issues]
```

---

## Critical Test Scenarios

### Must Pass (Blockers)

- [ ] User can register and login
- [ ] User receives 'user' role by default
- [ ] Admin can access admin panel
- [ ] Regular user cannot access admin panel
- [ ] Admin can create books
- [ ] Regular user cannot create books (receives 403)
- [ ] Admin can create authors
- [ ] Regular user cannot create authors (receives 403)
- [ ] Admin can create genres
- [ ] Regular user cannot create genres (receives 403)
- [ ] User can add/remove books from personal collection
- [ ] User can only see their own collection
- [ ] User cannot access other users' collections
- [ ] Book CRUD operations (by admin) work correctly
- [ ] Search returns accurate results
- [ ] Database maintains referential integrity
- [ ] No SQL injection vulnerabilities
- [ ] Authentication tokens validated properly
- [ ] Role validated on every admin endpoint

### High Priority

- [ ] All validations work
- [ ] Error messages are clear
- [ ] Admin-only operations return 403 for non-admin users
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Admin book/author/genre management works
- [ ] User can only modify their own collection entries
- [ ] User cannot see other users' collections
- [ ] Admin UI hidden from regular users
- [ ] Special characters handled safely
- [ ] Pagination works with large datasets
- [ ] Deleting user doesn't delete system books
- [ ] Cascade behavior tested when deleting books/authors/genres

### Medium Priority

- [ ] Advanced search features
- [ ] Advanced filtering options
- [ ] User & Admin dashboard statistics accurate
- [ ] Browser compatibility
- [ ] UI animations smooth
- [ ] Loading states display
- [ ] Role-based UI visibility correct

---

## Common Issues to Check

### Backend - Authorization

- [ ] Admin middleware correctly validates role
- [ ] Non-admin receives 403 on protected endpoints
- [ ] Role information stored and retrieved correctly
- [ ] Token claims include role information
- [ ] Cascade delete behavior handled properly
- [ ] User cannot modify other users' collection entries

### Backend - General

- [ ] CORS errors blocking requests
- [ ] Database connection failures
- [ ] Migration rollback issues
- [ ] Missing seed data
- [ ] Validation messages missing or unclear
- [ ] Wrong HTTP status codes returned
- [ ] N+1 query problems

### Frontend

- [ ] State not updating after API calls
- [ ] Form values not clearing after submit
- [ ] Navigation not working (routing issues)
- [ ] Async operations causing race conditions
- [ ] Context not propagating to children (especially role info)
- [ ] Event handlers not firing
- [ ] CSS conflicts or missing styles
- [ ] Admin controls visible to non-admin users
- [ ] Protected routes not checking role properly

### Integration

- [ ] API endpoints not matching frontend expectations
- [ ] Data format mismatches (array vs object)
- [ ] Missing error handling
- [ ] Timeout on slow operations
- [ ] Session loss on page refresh

---

## Testing Tools & Commands

### Backend Testing

```bash
# Run Laravel tests
php artisan test

# Run specific test file
php artisan test tests/Feature/BookTest.php

# Run tests with coverage
php artisan test --coverage

# Check database state at various points
php artisan tinker
# Then query: App\Models\Book::all()

# API testing with curl
curl -H "Authorization: Bearer {token}" \
     -H "Accept: application/json" \
     http://localhost:8000/api/books
```

### Frontend Testing

```bash
# Run React tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage

# Manual testing:
# - Open Developer Console (F12)
# - Check Network tab for API calls
# - Check Console for errors
# - Check Application tab for localStorage/tokens
```

### API Testing

```
Tools: Postman, Insomnia, or Thunder Client
- Create collection for Book Library API
- Test each endpoint with various scenarios
- Check response codes, headers, and body
- Test authentication headers
```

### Database Testing

```bash
# Access SQLite from command line
sqlite3 database/database.sqlite

# View table schema
.schema books

# Query data
SELECT * FROM books WHERE user_id = 1;
```

---

## Testing Checklist

Before marking features as "done", verify:

### For Each Feature

- [ ] Feature works as described in plan
- [ ] All validations implemented
- [ ] Error messages appropriate
- [ ] No console errors (F12 developer tools)
- [ ] Database state correct
- [ ] User data isolated (can't see others' data)
- [ ] Mobile responsive
- [ ] Performance acceptable

### For Admin-Only Features

- [ ] Admin middleware properly validates role
- [ ] Non-admin users receive 403 Forbidden
- [ ] Admin UI not visible to non-admin users
- [ ] Admin operations only affect intended data (system vs personal)
- [ ] Users cannot escalate to admin
- [ ] Role claim validated in token/session

### For User Collection Features

- [ ] Users can only modify their own entries
- [ ] Users cannot see other users' collections
- [ ] Personal data (rating, status, notes) separate from system data
- [ ] Deleting user doesn't delete system books
- [ ] Deleting system book handles user collections properly

### Before Release

- [ ] All critical tests pass
- [ ] All high priority tests pass
- [ ] Admin authorization tests pass
- [ ] User permission boundary tests pass
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] CORS properly configured
- [ ] Error handling consistent
- [ ] LoadingStates display during async operations
- [ ] No console warnings or errors
- [ ] Database migrations clean
- [ ] Environment variables secure
- [ ] Role information secure (not modifiable by users)

---

## Test Reporting

### Test Summary Report Template

```
Test Run Date: [Date]
Tested Version: [Version]
Environment: [Dev/Staging/Production]

Summary:
- Total Test Cases: [#]
- Passed: [#]
- Failed: [#]
- Blocked: [#]
- Pass Rate: [%]

Critical Issues:
1. [Issue description with steps to reproduce]
2. [Issue description with steps to reproduce]

High Priority Issues:
1. [Issue description]
2. [Issue description]

Recommendations:
- [Action item]
- [Action item]
```

---

## When to Use This Agent

1. **Before submitting code for review**: Run through the relevant checklist
2. **After implementing a new feature**: Test the feature against its requirements
3. **Before releasing to production**: Execute full testing suite
4. **When user reports a bug**: Reproduce and investigate
5. **For regression testing**: Verify existing features still work after changes
6. **For optimization**: Identify performance bottlenecks
7. **For security review**: Check for common vulnerabilities

---

## Success Metrics

✓ 100% of critical tests pass  
✓ No known security vulnerabilities  
✓ Error rate < 0.1%  
✓ Response times < 500ms (except slow queries)  
✓ User workflows complete without errors  
✓ Data integrity maintained across all operations  
✓ All edge cases handled gracefully  
✓ UI works across all tested browsers
