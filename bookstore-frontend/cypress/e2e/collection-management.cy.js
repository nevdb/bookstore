describe('Phase 4: User Personal Collection Management E2E Tests', () => {
  const testUser = {
    email: 'collection-test@example.com',
    password: 'Test@1234',
    name: 'Collection Tester'
  };

  before(() => {
    // Register a test user
    cy.visit('http://localhost:5173/signup');
    cy.get('input[name="name"]').type(testUser.name);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
  });

  beforeEach(() => {
    // Login before each test
    cy.visit('http://localhost:5173/login');
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
  });

  describe('Collection Navigation', () => {
    it('should display "Collection" link in header for authenticated users', () => {
      cy.contains('a', 'Collection').should('be.visible');
    });

    it('should navigate to My Collection page when clicking Collection link', () => {
      cy.contains('a', 'Collection').click();
      cy.url().should('include', '/my-collection');
      cy.get('h1').should('contain', 'My Book Collection');
    });

    it('should show empty collection message for new user', () => {
      cy.visit('http://localhost:5173/my-collection');
      cy.get('.empty-message').should('contain', 'Your collection is empty. Start adding books!');
    });
  });

  describe('Add Book to Collection', () => {
    it('should display "Add to Collection" button on book detail page', () => {
      // Navigate to books page and select a book
      cy.visit('http://localhost:5173/books');
      cy.get('[data-testid="book-card"]').first().click();
      
      cy.get('button').should('contain', 'Add to Collection').should('be.visible');
    });

    it('should add book to collection when clicking "Add to Collection" button', () => {
      // Navigate to books page
      cy.visit('http://localhost:5173/books');
      cy.get('[data-testid="book-card"]').first().click();
      
      // Get book title before adding
      cy.get('h1').invoke('text').then((bookTitle) => {
        // Add to collection
        cy.get('button').contains('Add to Collection').click();
        
        // Verify success message
        cy.contains('Added to your collection!').should('be.visible');
        
        // Navigate to collection
        cy.contains('a', 'Collection').click();
        
        // Verify book appears in collection
        cy.get('.collection-grid').should('contain', bookTitle);
      });
    });

    it('should show "In Your Collection" button for already added books', () => {
      // Add a book first
      cy.visit('http://localhost:5173/books');
      cy.get('[data-testid="book-card"]').first().click();
      cy.get('button').contains('Add to Collection').click();
      cy.contains('Added to your collection!').should('be.visible');
      
      // Navigate back to same book
      cy.go('back');
      cy.go('back');
      cy.get('[data-testid="book-card"]').first().click();
      
      // Button should show "In Your Collection"
      cy.get('button').should('contain', 'In Your Collection').should('be.disabled');
    });

    it('should not allow duplicate books in collection', () => {
      // Add a book
      cy.visit('http://localhost:5173/books');
      cy.get('[data-testid="book-card"]').first().click();
      cy.get('button').contains('Add to Collection').click();
      
      // Try to add same book again
      cy.get('button').contains('In Your Collection').click();
      cy.contains('Book already in your collection').should('be.visible');
    });
  });

  describe('View Collection', () => {
    it('should display all books in collection', () => {
      // Add multiple books
      cy.visit('http://localhost:5173/books');
      cy.get('[data-testid="book-card"]').eq(0).click();
      cy.get('button').contains('Add to Collection').click();
      cy.go('back');
      
      cy.get('[data-testid="book-card"]').eq(1).click();
      cy.get('button').contains('Add to Collection').click();
      cy.go('back');
      
      // View collection
      cy.contains('a', 'Collection').click();
      cy.get('.collection-item').should('have.length', 2);
    });

    it('should display correct book information', () => {
      // Add a book
      cy.visit('http://localhost:5173/books');
      cy.get('[data-testid="book-card"]').first().click();
      cy.get('h1').invoke('text').then((bookTitle) => {
        cy.get('button').contains('Add to Collection').click();
        
        // Navigate to collection
        cy.contains('a', 'Collection').click();
        
        // Verify book details
        cy.get('.book-info').should('contain', bookTitle);
        cy.get('.author').should('contain', 'by');
        cy.get('.genre').should('contain', /^[A-Z]/);
      });
    });

    it('should show pagination when collection has many books', () => {
      // This test assumes there are more than 12 books available
      // Add enough books to trigger pagination
      for (let i = 0; i < 13; i++) {
        cy.visit('http://localhost:5173/books');
        cy.get('[data-testid="book-card"]').eq(i % 5).click();
        cy.get('button').contains('Add to Collection').click();
        cy.go('back');
      }
      
      cy.contains('a', 'Collection').click();
      cy.get('.pagination').should('be.visible');
      cy.get('.pagination button').should('have.length.greaterThan', 1);
    });

    it('should display collection statistics', () => {
      cy.visit('http://localhost:5173/my-collection');
      cy.get('.collection-stats').should('contain', 'books in collection');
    });
  });

  describe('Edit Collection Items', () => {
    beforeEach(() => {
      // Ensure there's at least one book in collection
      cy.visit('http://localhost:5173/books');
      cy.get('[data-testid="book-card"]').first().click();
      cy.get('button').contains('Add to Collection').click();
      cy.contains('a', 'Collection').click();
    });

    it('should show Edit button on collection item', () => {
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Edit').should('be.visible');
      });
    });

    it('should switch to edit mode when clicking Edit button', () => {
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Edit').click();
      });
      
      cy.get('.edit-form').should('be.visible');
      cy.get('select').should('be.visible'); // status select
      cy.get('textarea').should('be.visible'); // notes textarea
    });

    it('should allow rating a book', () => {
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Edit').click();
      });
      
      // Click 5th star for 5-star rating
      cy.get('.rating-stars span').eq(4).click();
      cy.get('.rating-stars span').eq(4).should('have.class', 'filled');
      
      cy.get('button').contains('Save').click();
      cy.contains('⭐ 5/5').should('be.visible');
    });

    it('should allow changing reading status', () => {
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Edit').click();
      });
      
      cy.get('select').select('reading');
      cy.get('button').contains('Save').click();
      
      cy.get('.collection-item').first().within(() => {
        cy.get('.status').should('contain', 'reading');
      });
    });

    it('should allow adding notes', () => {
      const testNote = 'This is an excellent book with great characters!';
      
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Edit').click();
      });
      
      cy.get('textarea').clear().type(testNote);
      cy.get('button').contains('Save').click();
      
      cy.get('.notes').should('contain', testNote);
    });

    it('should update multiple fields at once', () => {
      const testNote = 'Updated note for this book';
      
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Edit').click();
      });
      
      // Change rating
      cy.get('.rating-stars span').eq(3).click();
      
      // Change status
      cy.get('select').select('completed');
      
      // Add notes
      cy.get('textarea').clear().type(testNote);
      
      cy.get('button').contains('Save').click();
      
      // Verify all changes
      cy.get('.collection-item').first().within(() => {
        cy.get('.rating').should('contain', '4/5');
        cy.get('.status').should('contain', 'completed');
        cy.get('.notes').should('contain', testNote);
      });
    });

    it('should cancel edit without saving changes', () => {
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Edit').click();
        cy.get('textarea').type('This should not be saved');
        cy.get('button').contains('Cancel').click();
      });
      
      // Verify edit form is gone and original state is displayed
      cy.get('.edit-form').should('not.exist');
      cy.get('.notes').should('not.contain', 'This should not be saved');
    });
  });

  describe('Remove from Collection', () => {
    beforeEach(() => {
      // Ensure there are books in collection
      cy.visit('http://localhost:5173/books');
      cy.get('[data-testid="book-card"]').first().click();
      cy.get('button').contains('Add to Collection').click();
      cy.contains('a', 'Collection').click();
    });

    it('should show Remove button on collection item', () => {
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Remove').should('be.visible');
      });
    });

    it('should remove book from collection when confirmed', () => {
      const initialCount = cy.get('.collection-item').length;
      
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Remove').click();
      });
      
      // Confirm removal
      cy.on('window:confirm', () => true);
      
      // Verify book is removed
      cy.get('.collection-item').should('have.length.lessThan', initialCount);
    });

    it('should show confirmation dialog before removing', () => {
      cy.get('.collection-item').first().within(() => {
        cy.get('button').contains('Remove').click();
      });
      
      cy.on('window:confirm', (message) => {
        expect(message).to.contain('Remove this book');
        return false; // Don't actually remove
      });
      
      // Book should still be there
      cy.get('.collection-item').should('have.length.greaterThan', 0);
    });
  });

  describe('Error Handling', () => {
    it('should display error message if API fails', () => {
      // This test requires mocking or stubbing API responses
      // Mock the collection fetch to fail
      cy.intercept('GET', '/api/user/collection*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      });
      
      cy.visit('http://localhost:5173/my-collection');
      cy.get('.error').should('contain', 'Failed to load collection');
    });

    it('should require authentication to access collection', () => {
      // Clear auth token
      cy.clearCookies();
      localStorage.clear();
      
      cy.visit('http://localhost:5173/my-collection');
      // Should redirect to login or show error
      cy.url().should('not.include', '/my-collection');
    });
  });
});
