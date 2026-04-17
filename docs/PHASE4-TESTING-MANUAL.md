# Phase 4: User Personal Collection Management - Manual Testing Guide

## Prerequisites
- Both backend (Laravel) and frontend (React) servers running
- Backend: `php artisan serve` (typically http://localhost:8000)
- Frontend: `npm run dev` (typically http://localhost:5173)
- Database migrations completed: `php artisan migrate`
- Seeded data (optional): `php artisan db:seed`

---

## Test Scenario 1: View Empty Collection

### Steps:
1. Navigate to http://localhost:5173
2. Click "Sign Up" to create a new test account
3. Fill in:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "Test@1234"
4. Click "Sign Up"
5. After signup, you should be logged in
6. In the header, click "Collection"

### Expected Results:
- ✅ Page title: "My Book Collection"
- ✅ Message displays: "Your collection is empty. Start adding books!"
- ✅ Statistics show: "0 books in collection"
- ✅ No pagination appears

---

## Test Scenario 2: Add Books to Collection

### Steps:
1. In the header, click "Books"
2. Browse the system library and view a book
3. Click on any book card to see details
4. On the book detail page, scroll down
5. Look for the button "+ Add to Collection"
6. Click it

### Expected Results:
- ✅ Alert appears: "Added to your collection!"
- ✅ Button changes to "✓ In Your Collection" and becomes disabled
- ✅ Navigate back to Collection page
- ✅ The book now appears in your collection

### Repeat:
- Add 3-4 different books to build a collection

---

## Test Scenario 3: View Collection

### Steps:
1. Navigate to http://localhost:5173/my-collection
2. Verify all previously added books appear

### Expected Results:
- ✅ Each book displays:
  - Title
  - Author name
  - Genre
  - "Not rated" status (if no rating set yet)
  - Edit and Remove buttons
- ✅ Statistics updated: "X books in collection"
- ✅ Grid layout shows all books

---

## Test Scenario 4: Edit Collection Item - Rate a Book

### Steps:
1. On My Collection page, find any book
2. Click the "Edit" button for that book
3. The item expands to show edit form
4. Look for the star rating selector (★★★★★)
5. Click on the 5th star (rightmost)
6. Click the "Save" button

### Expected Results:
- ✅ Edit form appears with:
  - Star rating selector
  - Status dropdown
  - Notes textarea
  - Save and Cancel buttons
- ✅ After clicking 5th star:
  - First 5 stars should appear filled/highlighted
- ✅ After clicking Save:
  - Form closes
  - Rating displays as "⭐ 5/5"
  - All other changes preserved

---

## Test Scenario 5: Edit Collection Item - Change Status

### Steps:
1. On My Collection page, click "Edit" on a book
2. Find the "Status" dropdown
3. Select "reading"
4. Click "Save"

### Expected Results:
- ✅ Dropdown shows three options:
  - "To Read"
  - "Reading"
  - "Completed"
- ✅ Selected value changes to "reading"
- ✅ After Save, the item displays:
  - "Status: reading"

---

## Test Scenario 6: Edit Collection Item - Add Notes

### Steps:
1. On My Collection page, click "Edit" on a book
2. Click in the "Notes" textarea
3. Type: "This book was amazing! The plot kept me engaged throughout."
4. Verify character count shows (e.g., "67/1000")
5. Click "Save"

### Expected Results:
- ✅ Textarea accepts input
- ✅ Character counter displays and updates as you type
- ✅ Maximum length: 1000 characters
- ✅ After Save:
  - Form closes
  - Notes display as: "This book was amazing! The plot kept me engaged throughout."
  - In italics inside a quote-like box

---

## Test Scenario 7: Edit All Fields at Once

### Steps:
1. Click "Edit" on any book
2. Click the 3rd star (3/5 rating)
3. Change status to "completed"
4. Add notes: "Good book"
5. Click "Save"

### Expected Results:
- ✅ All three fields update simultaneously:
  - Rating: "⭐ 3/5"
  - Status: "Status: completed"
  - Notes: "Good book" (displayed)

---

## Test Scenario 8: Cancel Edit Without Saving

### Steps:
1. Click "Edit" on any book
2. Change the rating to 1 star
3. Click "Cancel" button (don't click Save)
4. Verify the edit form closes

### Expected Results:
- ✅ Changes are NOT saved
- ✅ Original rating still displays
- ✅ Edit form disappears

---

## Test Scenario 9: Remove Book from Collection

### Steps:
1. On My Collection page, find any book
2. Click the "Remove" button

### Expected Results:
- ✅ Confirmation dialog appears: "Remove this book from collection?"
- ✅ Two options: "OK" and "Cancel"

### Confirm Removal:
1. Click "OK"

### Expected Results:
- ✅ Book is removed from the collection immediately
- ✅ Collection count decreases by 1
- ✅ Page updates without full reload

### Cancel Removal:
1. Click "Cancel" instead

### Expected Results:
- ✅ Dialog closes
- ✅ Book remains in collection

---

## Test Scenario 10: Pagination

### Prerequisites:
- Need at least 13 books in collection (triggers pagination at 12 per page)

### Steps:
1. Add 13+ books to collection
2. Go to My Collection page
3. Scroll to the bottom
4. Look for pagination buttons (1, 2, 3, etc.)

### Expected Results:
- ✅ Pagination appears at the bottom
- ✅ Current page button is highlighted/active
- ✅ Click page "2"
- ✅ Page 1 books disappear, page 2 books appear
- ✅ URL or page state updates

---

## Test Scenario 11: No Duplicate Books

### Steps:
1. Go to a book detail page
2. Click "Add to Collection"
3. Wait for success message
4. Click the button again (should now say "In Your Collection")

### Expected Results:
- ✅ First click: "Added to your collection!"
- ✅ Button becomes "✓ In Your Collection"
- ✅ Second click (if possible, usually disabled):
  - Alert: "Book already in your collection"
  - No duplicate entry created

---

## Test Scenario 12: Responsive Design

### Steps:
1. Open Collection page on different screen sizes:
   - Desktop (1920px)
   - Tablet (768px)
   - Mobile (375px)
2. Test on each:
   - Grid layout adjusts properly
   - Edit/Remove buttons visible and clickable
   - Pagination readable
   - Text readable

### Expected Results:
- ✅ Desktop: Multi-column grid (3+ columns)
- ✅ Tablet: 2-column grid
- ✅ Mobile: Single column, full width
- ✅ All text readable
- ✅ Buttons easily tappable on mobile

---

## Test Scenario 13: Authenticate -> Access Collection

### Steps:
1. Log out (click Logout button)
2. Try to access http://localhost:5173/my-collection directly

### Expected Results:
- ✅ Redirected to login page
- ✅ Cannot access collection without authentication

---

## Test Scenario 14: Verify Data Persistence

### Steps:
1. Add 2-3 books to collection
2. Rate and add notes to one book
3. Close browser completely
4. Reopen http://localhost:5173 and log in again
5. Navigate to Collection

### Expected Results:
- ✅ All previously added books still there
- ✅ Ratings and notes still saved
- ✅ Data persisted in database

---

## Automated Testing Commands

### Run Component Tests (Vitest)
```bash
cd bookstore-frontend
npm run test:unit
# or specifically
npm run test src/pages/MyCollection.test.jsx
npm run test src/components/CollectionItem.test.jsx
```

### Run E2E Tests (Cypress)
```bash
cd bookstore-frontend
npm run cypress:open
# OR headless
npm run cypress:run -- --spec="cypress/e2e/collection-management.cy.js"
```

### Backend Unit Tests
```bash
cd bookstore-api
php artisan test tests/Feature/UserCollectionTest.php
# All tests should PASS (10 tests)
```

---

## Common Issues & Solutions

### Issue 1: "Book already in collection" when adding new book
**Solution:** Books are deduplicated by user_id + book_id. Use a different book or different user account.

### Issue 2: Ratings not showing
**Reason:** Ratings are optional. If you don't set a rating, it shows "Not rated".

### Issue 3: Notes textarea too small
**Solution:** Text wraps. Continue typing - textarea expands. Max 1000 chars enforced by HTML maxLength.

### Issue 4: Pagination buttons not appearing
**Reason:** Pagination only shows when there are more than 12 books (default per_page). Add more books.

### Issue 5: API errors in console
**Solution:** 
- Ensure backend server is running: `php artisan serve`
- Check CORS is enabled in backend
- Verify token is stored in localStorage
- Check browser console for specific error message

---

## Checklist for Phase 4 Completion

- [ ] Empty collection displays correctly
- [ ] Can add books from system library
- [ ] All added books visible in collection
- [ ] Can rate books (1-5 stars)
- [ ] Can set reading status (to-read, reading, completed)
- [ ] Can add personal notes
- [ ] Can edit multiple fields and save
- [ ] Can cancel edit without losing data
- [ ] Can remove books from collection
- [ ] Pagination works with 13+ books
- [ ] No duplicate books allowed
- [ ] Responsive on mobile/tablet/desktop
- [ ] Requires authentication
- [ ] Data persists after logout/login
- [ ] All unit tests pass
- [ ] All E2E tests pass

---

## Performance Notes

- Collection page loads paginated (12 books per page)
- API uses with() eager loading to prevent N+1 queries
- Author and Genre relationships pre-loaded with books
- No unnecessary re-renders in React components

---

## Troubleshooting

If tests fail, try:
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Clear localStorage: Open DevTools → Application → Local Storage → Clear all
3. Restart backend: `Ctrl+C` then `php artisan serve`
4. Restart frontend: `Ctrl+C` then `npm run dev`
5. Reset database: `php artisan migrate:fresh --seed`

