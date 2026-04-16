# Book Library Website - Project Plan

## Project Overview

A full-stack book library web application where users can manage their personal book collections. Users create accounts, add books with details, search through their library, and perform CRUD operations. The platform includes comprehensive book and author information.

---

## Technology Stack

### Backend

- **Framework**: PHP Laravel (latest stable)
- **Database**: SQLite
- **API Style**: RESTful API
- **Authentication**: Laravel Sanctum (or JWT)

### Frontend

- **Framework**: React.js (with hooks)
- **State Management**: Context API or Redux
- **HTTP Client**: Axios
- **UI Library**: Optional (Bootstrap, Material-UI, or Tailwind CSS)
- **Routing**: React Router

### Development Tools

- **Laravel Artisan** for migrations and models
- **npm/yarn** for React dependencies
- **Git** for version control
- **Build Tool**: Vite (for React frontend)
- **Testing Framework (Unit)**: Vitest (runs with Vite)
- **Testing Framework (E2E)**: Playwright (cross-browser testing)

---

## Database Schema

### Tables

#### Users

```
- id (PK)
- name
- email (unique)
- password (hashed)
- role (enum: 'user', 'admin')
- created_at
- updated_at
```

#### Books (System Library)

```
- id (PK)
- title
- isbn (optional)
- publication_year
- description
- genre_id (FK → Genres.id)
- author_id (FK → Authors.id)
- pages (optional)
- created_at (by admin)
- updated_at (by admin)
```

#### UserBooks (User's Personal Collection)

```
- id (PK)
- user_id (FK → Users.id)
- book_id (FK → Books.id)
- personal_rating (1-5, user's rating, optional)
- status (personal notes/reading status: to-read, reading, completed)
- notes (user's personal notes, optional)
- created_at
- updated_at
```

#### Authors

```
- id (PK)
- name
- date_of_birth (optional)
- date_of_death (optional, nullable)
- place_of_birth
- biography (optional)
- created_at
- updated_at
```

#### Genres

```
- id (PK)
- name (unique)
- description (optional)
- created_at
- updated_at
```

---

## Core Features

### 1. User Management (All Users)

- **Sign Up**: Register new account (email, password, name) - defaults to 'user' role
- **Login**: Authentication with session/token
- **Logout**: Clear session
- **Profile**: View and update user profile info
- **Password Reset**: Email-based password recovery
- **View Role**: Determine if current user is admin or regular user

### 2. User Book Collection Management (Regular Users)

Users can manage their personal collection from the system's book library:

- **Add to Collection**: Add existing books from system library to personal collection
- **View Personal Collection**: View all books in personal collection
  - Paginated book list
  - Book detail view
  - Filter by status/genre/author
- **Update Personal Book Info**: Edit only personal data
  - Personal rating (1-5)
  - Reading status (to-read, reading, completed)
  - Personal notes

- **Remove from Collection**: Remove book from personal collection

### 3. System Book Management (Admins Only)

**Admin-only CRUD operations on the system library:**

- **Create Book** (Admin Only):
  - Title, ISBN, Publication Year (required)
  - Genre selection/creation
  - Author selection/creation
  - Description, Page count
  - Only admins can add books to system

- **Read Books**: Browse all system books
  - View all books in system library
  - See book metadata and author info

- **Update Book** (Admin Only): Edit book metadata
  - Title, ISBN, Publication Year
  - Genre, Author, Description
  - Page count
  - Only admins can modify system data

- **Delete Book** (Admin Only): Remove book from system
  - Only admins can delete (affects all users)
  - Cascade or restrict logic for user collections

### 4. Author Management (Admins Only)

**Admin controls for author database:**

- **Author Fields**:
  - Name (required)
  - Date of Birth (optional)
  - Date of Death (optional, nullable)
  - Place of Birth (required)
  - Biography/Description (optional)
- **Admin Features**:
  - Create new authors (Admin Only)
  - Edit author information (Admin Only)
  - Delete authors (Admin Only)
  - View all authors in system
  - See books linked to each author

### 5. Genre Management (Admins Only)

**Admin controls for genre database:**

- **Genre Operations**:
  - Create new genres (Admin Only)
  - Edit genre names and descriptions (Admin Only)
  - Delete genres (Admin Only)
  - Ensure genre names are unique

### 6. Search & Filter (All Users)

- **Search Available Books**:
  - By title (fuzzy search)
  - By author name
  - By genre
  - Combined filters
  - Search within system library

- **Filter Personal Collection**:
  - By status (to-read, reading, completed)
  - By genre
  - By author
  - By personal rating

- **Sorting**:
  - By title (A-Z)
  - By publication year
  - By rating (personal)
  - By date added to collection

---

## API Endpoints (Laravel Backend)

### Authentication (Public)

```
POST    /api/auth/register          - Create user account (user role by default)
POST    /api/auth/login             - User login
POST    /api/auth/logout            - User logout (Authenticated)
POST    /api/auth/forgot-password   - Request password reset
POST    /api/auth/reset-password    - Reset password with token
```

### User Profile (Authenticated)

```
GET     /api/user/profile           - Get current user info (includes role)
PUT     /api/user/profile           - Update user profile
GET     /api/user/books             - Get user's personal collection (paginated)
```

### System Books Library (Public/Authenticated)

```
GET     /api/books                  - List all books in system library
GET     /api/books/{id}             - Get book details
GET     /api/books/search           - Search system library
GET     /api/books/filter           - Filter system library results

POST    /api/books                  - Create new book (Admin Only)
PUT     /api/books/{id}             - Update book (Admin Only)
DELETE  /api/books/{id}             - Delete book (Admin Only)
```

### User's Personal Collection (Authenticated)

```
GET     /api/user/collection        - Get user's personal book collection
POST    /api/user/collection        - Add book to collection
PUT     /api/user/collection/{id}   - Update personal book info (rating, status, notes)
DELETE  /api/user/collection/{id}   - Remove book from collection
```

### Authors (All Users - Read; Admin - Write)

```
GET     /api/authors                - List all authors
GET     /api/authors/{id}           - Get author details
GET     /api/authors/{id}/books     - Get books by author

POST    /api/authors                - Create author (Admin Only)
PUT     /api/authors/{id}           - Update author (Admin Only)
DELETE  /api/authors/{id}           - Delete author (Admin Only)
```

### Genres (All Users - Read; Admin - Write)

```
GET     /api/genres                 - List all genres
GET     /api/genres/{id}            - Get genre details
GET     /api/genres/{id}/books      - Get books in genre

POST    /api/genres                 - Create genre (Admin Only)
PUT     /api/genres/{id}            - Update genre (Admin Only)
DELETE  /api/genres/{id}            - Delete genre (Admin Only)
```

---

## React Components Structure

```
src/
├── vite.config.js
├── vitest.config.js
├── playwright.config.js
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx (Admin-only access)
│   ├── Books/
│   │   ├── SystemBooks/
│   │   │   ├── BookBrowser.jsx (All books in system)
│   │   │   ├── BookCard.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   ├── BookSearch.jsx
│   │   │   └── BookFilter.jsx
│   │   └── UserCollection/
│   │       ├── MyCollection.jsx (Personal books)
│   │       ├── BookInCollection.jsx
│   │       ├── UpdatePersonalBook.jsx
│   │       ├── CollectionFilter.jsx
│   │       └── CollectionSort.jsx
│   ├── AdminPanel/
│   │   ├── AdminDashboard.jsx
│   │   ├── BookManagement/
│   │   │   ├── CreateBook.jsx (Admin only)
│   │   │   ├── EditBook.jsx (Admin only)
│   │   │   ├── DeleteBook.jsx (Admin only)
│   │   │   └── BooksList.jsx (Admin view)
│   │   ├── AuthorManagement/
│   │   │   ├── CreateAuthor.jsx (Admin only)
│   │   │   ├── EditAuthor.jsx (Admin only)
│   │   │   ├── DeleteAuthor.jsx (Admin only)
│   │   │   └── AuthorsList.jsx (Admin view)
│   │   └── GenreManagement/
│   │       ├── CreateGenre.jsx (Admin only)
│   │       ├── EditGenre.jsx (Admin only)
│   │       ├── DeleteGenre.jsx (Admin only)
│   │       └── GenresList.jsx (Admin view)
│   ├── Authors/
│   │   ├── AuthorProfile.jsx
│   │   ├── AuthorCard.jsx
│   │   ├── AuthorBrowser.jsx
│   │   └── AuthorBooks.jsx
│   ├── Genres/
│   │   ├── GenreList.jsx
│   │   ├── GenreCard.jsx
│   │   └── GenreBrowser.jsx
│   ├── Dashboard/
│   │   ├── UserDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── LibraryStats.jsx
│   ├── Navigation/
│   │   ├── Header.jsx
│   │   ├── Navbar.jsx (shows admin/user menu)
│   │   └── Sidebar.jsx
│   └── Common/
│       ├── Modal.jsx
│       ├── Pagination.jsx
│       ├── LoadingSpinner.jsx
│       └── ErrorMessage.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── UserDashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── MyCollectionPage.jsx
│   ├── SystemBooksPage.jsx
│   ├── BookDetailPage.jsx
│   ├── AuthorPage.jsx
│   ├── AdminBooksManagement.jsx
│   ├── AdminAuthorsManagement.jsx
│   ├── AdminGenresManagement.jsx
│   └── NotFoundPage.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useIsAdmin.js (Check if user is admin)
│   ├── useSystemBooks.js
│   ├── useUserCollection.js
│   ├── useFetch.js
│   └── useSearch.js
├── context/
│   ├── AuthContext.jsx (includes role info)
│   ├── BooksContext.jsx
│   └── AdminContext.jsx
├── services/
│   ├── api.js (Axios instance)
│   ├── authService.js
│   ├── bookService.js (system library)
│   ├── collectionService.js (user collection)
│   ├── authorService.js
│   ├── genreService.js
│   └── adminService.js
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── roleCheck.js (Admin permission helpers)
├── styles/
│   ├── global.css
│   └── components/
├── App.jsx
└── index.js
```

---

## User Workflows

### Workflow 1: Regular User - Browse & Build Collection

1. User lands on homepage
2. Clicks "Sign Up" (registers with default user role)
3. Fills registration form (email, password, name)
4. Receives confirmation
5. Redirected to user dashboard
6. Browses system library (all available books)
7. Clicks "Add to Collection" on a book
8. Book added to personal collection
9. Navigates to "My Collection"
10. Views their personal collection
11. Updates personal rating for book
12. Changes status (to-read → reading → completed)
13. Adds personal notes
14. Searches/filters their collection
15. Logs out

### Workflow 2: Regular User - Search System Library

1. User logs in
2. Navigates to "Browse Library"
3. Uses search bar to find book by title
4. Filters by author or genre
5. Views book details
6. Sees book information and author bio
7. Decides to add to collection
8. Book now in personal collection
9. Can view all books by this author
10. Can view all books in this genre

### Workflow 3: Administrator - Add & Manage Authors

1. Admin logs in
2. Navigates to Admin Panel
3. Clicks "Manage Authors"
4. Clicks "Add New Author"
5. Fills author form:
   - Name (required)
   - Date of Birth
   - Place of Birth (required)
   - Date of Death (if applicable)
   - Biography
6. Saves author
7. Author added to system
8. Can edit author info later
9. Can view books by this author
10. Can delete author if needed

### Workflow 4: Administrator - Add & Manage Books

1. Admin logs in
2. Navigates to Admin Panel
3. Clicks "Manage Books"
4. Clicks "Add New Book"
5. Fills book form:
   - Title (required)
   - ISBN (optional)
   - Publication Year (required)
   - Author selection (existing or create new)
   - Genre selection (existing or create new)
   - Description
   - Page count
6. Saves book
7. Book added to system library for all users
8. Can edit book information anytime
9. Can delete book (affects all users)
10. Can view which users have added book to collection

### Workflow 5: Administrator - Manage Genres

1. Admin logs in
2. Navigates to Admin Panel
3. Clicks "Manage Genres"
4. Views all genres
5. Can add new genre
6. Can edit genre name/description
7. Can delete genre if no books in it (or with cascade)
8. Uses genres when managing books and authors

---

## Development Phases

### Phase 1: Project Setup

- [x] Initialize Laravel project with SQLite
- [x] Setup database migrations and seeders
- [x] Create User (with role field), Book, Author, Genre, UserBooks models
- [x] Setup Laravel Sanctum authentication with role support
- [x] Create Role middleware (admin vs user)
- [x] Initialize React project with Create React App or Vite
- [x] Configure Axios and environment variables
- [x] Setup folder structure and components (basic auth scaffold complete)

### Phase 2: Authentication & User Management with Roles

- [x] Backend: User registration/login API (set default user role)
- [x] Backend: Password reset functionality
- [x] Backend: Get current user info including role
- [x] Frontend: Login/Signup forms and pages
- [x] Frontend: Authentication context and hooks (include role)
- [x] Frontend: Protected routes and admin routes
- [x] Frontend: Role-aware navigation (display different menus for admin/user)
- [x] Testing: Auth flow testing with role checks

### Phase 3: System Books Library (Admin & User Read)

- [x] Backend: Book list API (all books in system)
- [x] Backend: Book detail API
- [ ] Backend: Book search and filter API
- [ ] Frontend: System books browser component
- [ ] Frontend: Book details view
- [ ] Frontend: Search and filter for system books
- [ ] Testing: Search and filter accuracy

### Phase 4: User Personal Collection Management

- [ ] Backend: Add book to collection API
- [ ] Backend: Get user's collection API (paginated)
- [ ] Backend: Update personal book info (rating, status, notes)
- [ ] Backend: Remove book from collection API
- [ ] Frontend: My Collection page
- [ ] Frontend: Add to collection button
- [ ] Frontend: Update personal book info form
- [ ] Frontend: Remove from collection confirmation
- [ ] Testing: Collection management operations

### Phase 5: Admin Book Management (Create, Update, Delete)

- [ ] Backend: Create book API (admin only)
- [ ] Backend: Update book API (admin only)
- [ ] Backend: Delete book API (admin only)
- [ ] Backend: Admin-only middleware for book operations
- [ ] Frontend: Admin book management page
- [ ] Frontend: Create book form (with author/genre selection or creation)
- [ ] Frontend: Edit book form
- [ ] Frontend: Delete book confirmation
- [ ] Frontend: Admin-only route protection
- [ ] Testing: Admin-only permission checks

### Phase 6: Admin Author Management (Create, Update, Delete)

- [ ] Backend: Create author API (admin only)
- [ ] Backend: Update author API (admin only)
- [ ] Backend: Delete author API (admin only)
- [ ] Frontend: Admin author management page
- [ ] Frontend: Create author form
- [ ] Frontend: Edit author form
- [ ] Frontend: Delete author confirmation
- [ ] Testing: Author CRUD permissions

### Phase 7: Admin Genre Management (Create, Update, Delete)

- [ ] Backend: Create genre API (admin only)
- [ ] Backend: Update genre API (admin only)
- [ ] Backend: Delete genre API (admin only)
- [ ] Frontend: Admin genre management page
- [ ] Frontend: Create/edit/delete genre operations
- [ ] Testing: Genre management permissions

### Phase 8: Search & Filter (System-wide & Collection)

- [ ] Backend: Search system books (title, author, genre)
- [ ] Backend: Filter system books
- [ ] Backend: Search/filter user collection
- [ ] Frontend: Search component for system books
- [ ] Frontend: Search/filter for personal collection
- [ ] Frontend: Sorting options
- [ ] Testing: Search accuracy and edge cases

### Phase 9: Dashboards (User & Admin)

- [ ] Backend: User statistics endpoint (collection size, genres, etc.)
- [ ] Backend: Admin statistics endpoint (total books, authors, users, genres)
- [ ] Frontend: User dashboard (collection stats, quick actions)
- [ ] Frontend: Admin dashboard (system stats, recent activities)
- [ ] Frontend: Quick navigation to management areas
- [ ] Testing: Dashboard data accuracy

### Phase 10: UI Polish & Optimization

- [ ] Styling and responsive design
- [ ] Role-based UI visibility (hide admin controls from regular users)
- [ ] Performance optimization
- [ ] Error handling and validation messages
- [ ] Loading states and spinners
- [ ] Accessibility improvements
- [ ] SEO basics

### Phase 11: Testing & Deployment

**Unit Tests (Frontend - Vitest)**

- [ ] Setup Vitest with Vite
- [ ] Write unit tests for React components (Components, Pages, Hooks)
- [ ] Test utilities (validators, formatters, roleCheck)
- [ ] Test context providers (AuthContext, BooksContext)
- [ ] Test custom hooks (useAuth, useIsAdmin, useSystemBooks, useUserCollection)
- [ ] Aim for 70%+ code coverage

**End-to-End Tests (Playwright)**

- [ ] Setup Playwright with multiple browsers (Chrome, Firefox, Safari)
- [ ] Test user workflows:
  - [ ] User signup and login
  - [ ] Browse system library
  - [ ] Add/remove books from collection
  - [ ] Update personal book info (rating, status, notes)
  - [ ] Search and filter personal collection
- [ ] Test admin workflows:
  - [ ] Admin login with role verification
  - [ ] Create/edit/delete books (admin only)
  - [ ] Create/edit/delete authors (admin only)
  - [ ] Create/edit/delete genres (admin only)
- [ ] Test role-based access (verify regular users cannot access admin functions)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Test responsive design

**Backend Unit Tests (Laravel)**

- [ ] Setup PHPUnit test environment
- [ ] Model tests (relationships, validations)
- [ ] API endpoint tests (all routes in API Endpoints section)
- [ ] Authorization/permission tests (admin vs user operations)
- [ ] Database migration tests
- [ ] Aim for 80%+ coverage on critical APIs

**Integration Tests**

- [ ] Backend + Frontend API communication
- [ ] Full workflow tests (auth → browse → add to collection → update)
- [ ] Data consistency across requests

**QA Testing**

- [ ] Comprehensive QA testing using QA agent
- [ ] Functionality testing (all features)
- [ ] Edge case testing
- [ ] Permission and authorization testing
- [ ] Data integrity validation
- [ ] User acceptance testing

**Security & Performance**

- [ ] Security review (SQL injection, XSS, CSRF, role-based access)
- [ ] Performance testing (load times, API response times)
- [ ] Database query optimization

**Deployment**

- [ ] Deployment to staging environment
- [ ] Final UAT on staging
- [ ] Deployment to production

---

## Key Learning Objectives

### PHP/Laravel

- RESTful API design
- Database migrations and models
- Authentication and authorization
- Query optimization
- Error handling
- API validation

### React.js

- Component composition and reusability
- State management with Context API
- Hooks (useState, useEffect, useContext, useReducer)
- API integration
- Routing
- Form handling and validation
- Performance optimization

### Database (SQLite)

- Schema design and relationships
- Foreign keys and constraints
- Query optimization
- Index creation
- Data integrity

---

## Additional Considerations

### Security

- Password hashing (bcrypt)
- CSRF protection
- SQL injection prevention (use prepared statements)
- XSS prevention
- Rate limiting on authentication endpoints
- Secure password storage

### Performance

- Database indexing on frequently searched columns
- API pagination for large datasets
- React component memoization
- Lazy loading for routes
- Caching strategies

### Error Handling

- Graceful error messages
- Validation feedback
- API error responses with proper HTTP codes
- Try-catch blocks in critical operations

### Testing Strategy

- **Unit Tests (Vitest)**: Test individual components, hooks, utilities, and services in isolation. Runs in Vite environment for fast feedback.
- **E2E Tests (Playwright)**: Automate complete user workflows across the full application stack. Tests real browser behavior and cross-browser compatibility.
- **Backend Tests (PHPUnit)**: Unit and integration tests for Laravel APIs, models, and authorization logic.
- **Test Coverage Goals**:
  - Frontend: 70%+ code coverage with Vitest
  - Backend APIs: 80%+ coverage for critical endpoints
  - E2E: All major user workflows and admin operations
- **CI/CD Integration**: Run all test suites on every commit before deployment
- **Test Data**: Use database seeders for consistent test data

### Documentation

- API documentation (Postman, Swagger)
- Code comments for complex logic
- README for setup instructions
- Basic deployment guide

---

## Success Criteria

**User Role - Book Collection Management:**
✓ Users can register and login securely  
✓ Users receive 'user' role by default  
✓ Users can browse all system books  
✓ Users can add/remove books from personal collection  
✓ Users can only see and manage their own book collection  
✓ Users can update personal book info (rating, status, notes)  
✓ Users can search and filter personal collection  
✓ Users cannot access admin functions

**Administrator Role - System Management:**
✓ Admins can add new books to the system library  
✓ Admins can edit book information (title, ISBN, author, genre, etc.)  
✓ Admins can delete books from system (affects all users)  
✓ Admins can add, edit, and delete authors  
✓ Admins can add, edit, and delete genres  
✓ Only admins can access admin panel and management pages  
✓ Users cannot perform admin operations (API rejects non-admin requests)

**Data Integrity & Architecture:**
✓ Books table contains only system-wide book data (no user_id)  
✓ UserBooks table properly links users to system books  
✓ User personal ratings/status stored only in UserBooks table  
✓ Author info (birth/death dates, birthplace) stored and displayed correctly  
✓ Each user sees only their own collection  
✓ Deleting a user keeps system books intact  
✓ SQLite database maintains referential integrity

**Search & Filter:**
✓ Search functionality works on system library  
✓ Search accuracy on title, author, and genre  
✓ Filter and sort in personal collection  
✓ Combined filtering produces correct results

**Frontend & UX:**
✓ UI is responsive and user-friendly  
✓ Admin controls hidden from regular users  
✓ Role-based navigation displays correct menu items  
✓ Clear distinction between system books and personal collection  
✓ Admin panel accessible only to admins

**Code Quality:**
✓ Code is organized and maintainable  
✓ Role-based middleware implemented in backend  
✓ Permission checks on all admin endpoints  
✓ Clear separation of admin and user components  
✓ QA testing covers all major workflows including admin operations
