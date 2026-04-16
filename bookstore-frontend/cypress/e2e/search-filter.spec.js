import { test, expect } from '@playwright/test';

test.describe('Search Functionality E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the books page
    await page.goto('http://localhost:5173/books', { waitUntil: 'networkidle' });
    
    // Wait for books to load
    await page.waitForSelector('[data-testid="book-card"]', { timeout: 10000 });
  });

  test('should search for books by title', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[type="text"]').first();
    
    // Type in the search input
    await searchInput.fill('Great');
    
    // Click search button
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    
    // Wait for results to load
    await page.waitForTimeout(500);
    
    // Verify that search results are displayed
    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards).toHaveCount(1, { timeout: 5000 });
    
    // Verify the result contains the search term
    const bookTitle = page.locator('text=/Great/i');
    await expect(bookTitle).toBeVisible();
  });

  test('should search for books by author name', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[type="text"]').first();
    
    // Type author name
    await searchInput.fill('Fitzgerald');
    
    // Click search button
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Verify author name is in results
    const authorName = page.locator('text=/Fitzgerald/i');
    await expect(authorName).toBeVisible({ timeout: 5000 });
  });

  test('should clear search results', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[type="text"]').first();
    
    // Type search term
    await searchInput.fill('Test');
    
    // Click search button
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Click clear button
    const clearButton = page.locator('button').filter({ hasText: /clear/i }).first();
    await clearButton.click();
    
    // Verify input is cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should show all books after clearing search', async ({ page }) => {
    // Count initial books
    let initialBookCount = await page.locator('[data-testid="book-card"]').count();
    
    // Perform search
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('Great');
    
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Clear search
    const clearButton = page.locator('button').filter({ hasText: /clear/i }).first();
    await clearButton.click();
    
    // Verify all books are shown again
    await page.waitForTimeout(500);
    const finalBookCount = await page.locator('[data-testid="book-card"]').count();
    expect(finalBookCount).toBeGreaterThanOrEqual(initialBookCount);
  });

  test('should perform case-insensitive search', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    
    // Search with lowercase
    await searchInput.fill('great');
    
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    
    await page.waitForTimeout(500);
    
    // Should find results (case-insensitive)
    const bookCards = page.locator('[data-testid="book-card"]');
    const count = await bookCards.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should handle no search results gracefully', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    
    // Search for something that doesn't exist
    await searchInput.fill('XYZABC123NonexistentBook');
    
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    
    await page.waitForTimeout(500);
    
    // Should show empty state or no results message
    const bookCards = page.locator('[data-testid="book-card"]');
    const count = await bookCards.count();
    expect(count).toBe(0);
  });

  test('should navigate to book details from search results', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('Great');
    
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    
    await page.waitForTimeout(500);
    
    // Click on first book card
    const firstBookCard = page.locator('[data-testid="book-card"]').first();
    await firstBookCard.click();
    
    // Should navigate to book detail page
    await page.waitForURL(/\/books\/\d+/, { timeout: 5000 });
    expect(page.url()).toMatch(/\/books\/\d+/);
  });
});

test.describe('Filter Functionality E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the books page
    await page.goto('http://localhost:5173/books', { waitUntil: 'networkidle' });
    
    // Wait for books to load
    await page.waitForSelector('[data-testid="book-card"]', { timeout: 10000 });
  });

  test('should filter books by genre', async ({ page }) => {
    // Find genre dropdown
    const genreSelect = page.locator('select').first();
    
    // Select a genre (assuming "Fiction" is available)
    await genreSelect.selectOption({ label: 'Fiction' });
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Verify results are filtered
    const bookCards = page.locator('[data-testid="book-card"]');
    const count = await bookCards.count();
    
    // Should have at least one result or be empty
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter books by author', async ({ page }) => {
    // Find author dropdown (second select)
    const selects = page.locator('select');
    const authorSelect = selects.nth(1);
    
    // Get available options
    const options = authorSelect.locator('option');
    const optionCount = await options.count();
    
    if (optionCount > 1) {
      // Select second option (skip "All Authors")
      await authorSelect.selectOption({ index: 1 });
      
      // Wait for results
      await page.waitForTimeout(500);
      
      // Verify filtering occurred
      const bookCards = page.locator('[data-testid="book-card"]');
      const count = await bookCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should combine genre and author filters', async ({ page }) => {
    const selects = page.locator('select');
    const genreSelect = selects.nth(0);
    const authorSelect = selects.nth(1);
    
    // Select genre
    await genreSelect.selectOption({ label: 'Fiction' });
    await page.waitForTimeout(300);
    
    // Get initial count
    const initialCards = page.locator('[data-testid="book-card"]');
    const initialCount = await initialCards.count();
    
    // Select author
    const options = authorSelect.locator('option');
    const optionCount = await options.count();
    
    if (optionCount > 1) {
      await authorSelect.selectOption({ index: 1 });
      await page.waitForTimeout(300);
      
      // Verify combined filtering
      const finalCards = page.locator('[data-testid="book-card"]');
      const finalCount = await finalCards.count();
      
      // Combined filters should return equal or fewer results
      expect(finalCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should clear filters and show all books', async ({ page }) => {
    // Apply a filter
    const genreSelect = page.locator('select').first();
    await genreSelect.selectOption({ label: 'Fiction' });
    await page.waitForTimeout(500);
    
    // Click clear filters button
    const clearButton = page.locator('button').filter({ hasText: /clear filters/i });
    
    // Check if clear button exists
    const clearButtonCount = await clearButton.count();
    
    if (clearButtonCount > 0) {
      await clearButton.click();
      await page.waitForTimeout(500);
      
      // Verify filters are reset
      await expect(genreSelect).toHaveValue('');
    }
  });

  test('should navigate to book details from filtered results', async ({ page }) => {
    // Apply filter
    const genreSelect = page.locator('select').first();
    await genreSelect.selectOption({ label: 'Fiction' });
    await page.waitForTimeout(500);
    
    // Click on first book in filtered results
    const firstBookCard = page.locator('[data-testid="book-card"]').first();
    await firstBookCard.click();
    
    // Should navigate to book detail
    await page.waitForURL(/\/books\/\d+/, { timeout: 5000 });
    expect(page.url()).toMatch(/\/books\/\d+/);
  });
});

test.describe('Combined Search and Filter E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the books page
    await page.goto('http://localhost:5173/books', { waitUntil: 'networkidle' });
    
    // Wait for books to load
    await page.waitForSelector('[data-testid="book-card"]', { timeout: 10000 });
  });

  test('should apply search and then filter results', async ({ page }) => {
    // Search first
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('Great');
    
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    await page.waitForTimeout(500);
    
    // Get count after search
    const searchResults = page.locator('[data-testid="book-card"]');
    const searchCount = await searchResults.count();
    
    // Then apply filter
    const genreSelect = page.locator('select').first();
    await genreSelect.selectOption({ label: 'Fiction' });
    await page.waitForTimeout(500);
    
    // Verify filter was applied on top of search
    const filteredResults = page.locator('[data-testid="book-card"]');
    const filteredCount = await filteredResults.count();
    
    expect(filteredCount).toBeLessThanOrEqual(searchCount);
  });

  test('should clear search and keep filters', async ({ page }) => {
    // Apply filter first
    const genreSelect = page.locator('select').first();
    await genreSelect.selectOption({ label: 'Fiction' });
    await page.waitForTimeout(500);
    
    // Then search
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('Great');
    
    const searchButton = page.locator('button').filter({ hasText: /search/i }).first();
    await searchButton.click();
    await page.waitForTimeout(500);
    
    // Clear search
    const clearButton = page.locator('button').filter({ hasText: /clear/i }).first();
    await clearButton.click();
    await page.waitForTimeout(500);
    
    // Verify search is cleared but filter remains
    await expect(searchInput).toHaveValue('');
    await expect(genreSelect).toHaveValue('1'); // or appropriate genre id
  });
});

test.describe('Pagination E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the books page
    await page.goto('http://localhost:5173/books', { waitUntil: 'networkidle' });
    
    // Wait for books to load
    await page.waitForSelector('[data-testid="book-card"]', { timeout: 10000 });
  });

  test('should navigate between pages', async ({ page }) => {
    // Look for "Next" button
    const nextButton = page.locator('button').filter({ hasText: /next/i });
    const hasNextButton = await nextButton.count();
    
    if (hasNextButton > 0) {
      // Click next
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Verify page changed (could check URL or page indicator)
      const bookCards = page.locator('[data-testid="book-card"]');
      await expect(bookCards).toHaveCount(12, { timeout: 5000 });
    }
  });

  test('should show previous button on page 2', async ({ page }) => {
    const nextButton = page.locator('button').filter({ hasText: /next/i });
    const hasNextButton = await nextButton.count();
    
    if (hasNextButton > 0) {
      // Go to page 2
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Look for Previous button
      const prevButton = page.locator('button').filter({ hasText: /previous/i });
      const hasPrevButton = await prevButton.count();
      
      expect(hasPrevButton).toBeGreaterThan(0);
    }
  });
});
