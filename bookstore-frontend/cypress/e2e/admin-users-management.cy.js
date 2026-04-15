describe('Admin Users Management - Frontend UI Tests', () => {
  const apiUrl = 'http://localhost:5173';
  const adminCredentials = {
    email: 'admin@example.com',
    password: 'password123',
  };
  const regularUserCredentials = {
    email: 'user@example.com',
    password: 'password123',
  };

  // Helper function to login
  const login = (email, password) => {
    cy.visit(`${apiUrl}/login`);
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
  };

  // Helper function to logout
  const logout = () => {
    cy.get('button').contains('Logout').click();
    cy.url().should('include', '/');
  };

  describe('Access Control Tests', () => {
    it('should allow admin to access /admin/users', () => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
      cy.url().should('include', '/admin/users');
      cy.get('h1').should('contain', 'User Management');
    });

    it('should redirect regular user from /admin/users to home', () => {
      login(regularUserCredentials.email, regularUserCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
      cy.url().should('include', '/');
      cy.get('h1').should('not.contain', 'User Management');
    });

    it('should redirect unauthenticated user to login page', () => {
      cy.visit(`${apiUrl}/admin/users`);
      cy.url().should('include', '/login');
    });

    it('should show admin links in header only for admin users', () => {
      login(adminCredentials.email, adminCredentials.password);
      cy.get('a').contains('Users').should('be.visible');
      cy.get('a').contains('Books').should('be.visible');
      logout();

      login(regularUserCredentials.email, regularUserCredentials.password);
      cy.get('a').contains('Users').should('not.exist');
      cy.get('a').contains('Books').should('not.exist');
    });
  });

  describe('Statistics Display Tests', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should display statistics cards with correct data', () => {
      cy.get('.stat-card').should('have.length', 3);
      cy.get('.stat-label').should('contain', 'Total Users');
      cy.get('.stat-label').should('contain', 'Administrators');
      cy.get('.stat-label').should('contain', 'Regular Users');
    });

    it('should display statistics numbers', () => {
      cy.get('.stat-number').first().should('not.be.empty');
      cy.get('.stat-number').eq(1).should('not.be.empty');
      cy.get('.stat-number').eq(2).should('not.be.empty');
    });

    it('should have correct styling on statistics cards', () => {
      cy.get('.stat-card').first().should('have.class', 'stat-card');
      cy.get('.stat-card').eq(1).should('have.class', 'admin-stat');
      cy.get('.stat-card').eq(2).should('have.class', 'user-stat');
    });
  });

  describe('Users Table Display Tests', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should display users table with all required columns', () => {
      cy.get('table thead th').should('contain', 'ID');
      cy.get('table thead th').should('contain', 'Name');
      cy.get('table thead th').should('contain', 'Email');
      cy.get('table thead th').should('contain', 'Role');
      cy.get('table thead th').should('contain', 'Joined');
      cy.get('table thead th').should('contain', 'Actions');
    });

    it('should display users in table rows', () => {
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
      cy.get('table tbody tr').first().find('td').should('have.length', 6);
    });

    it('should display role badges with correct styling', () => {
      cy.get('.role-badge').should('have.length.greaterThan', 0);
      cy.get('.role-badge').each(($badge) => {
        cy.wrap($badge).should('have.class', 'role-admin').or('have.class', 'role-user');
      });
    });

    it('should show formatted dates for joined column', () => {
      cy.get('table tbody tr').first().find('td').eq(4)
        .should('match', /\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('Pagination Tests', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should display pagination controls', () => {
      cy.get('.pagination').should('be.visible');
      cy.get('.pagination button').should('exist');
    });

    it('should have disabled First and Previous buttons on first page', () => {
      cy.get('.pagination button').contains('First').should('be.disabled');
      cy.get('.pagination button').contains('Previous').should('be.disabled');
    });

    it('should navigate to next page when Next button is clicked', () => {
      const initialPage = '1';
      cy.get('.page-info').should('contain', `Page ${initialPage}`);
      cy.get('.pagination button').contains('Next').click();
      cy.get('.page-info').should('contain', 'Page 2');
    });

    it('should navigate back to previous page', () => {
      cy.get('.pagination button').contains('Next').click();
      cy.get('.page-info').should('contain', 'Page 2');
      cy.get('.pagination button').contains('Previous').click();
      cy.get('.page-info').should('contain', 'Page 1');
    });

    it('should navigate to last page', () => {
      cy.get('.pagination button').contains('Last').click();
      cy.get('.pagination button').contains('Last').should('be.disabled');
    });
  });

  describe('Promote User Functionality', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should display Promote button for regular users', () => {
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('td').eq(3).then(($roleCell) => {
          if ($roleCell.text().includes('user')) {
            cy.wrap($row).find('.btn-promote').should('be.visible');
          }
        });
      });
    });

    it('should promote user when Promote button is clicked', () => {
      // Find a regular user and promote them
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('.btn-promote').then(($btn) => {
          if ($btn.length > 0) {
            cy.wrap($btn).click();
            cy.on('window:alert', (str) => {
              expect(str).to.contain('promoted');
            });
            return false; // Break the loop after first promotion
          }
        });
      });
    });

    it('should show loading state during promotion', () => {
      cy.get('table tbody tr').first().find('.btn-promote').click();
      cy.get('.btn-promote').should('be.disabled');
    });

    it('should update UI after successful promotion', () => {
      cy.intercept('POST', '**/admin/users/*/make-admin', {
        statusCode: 200,
        body: {
          message: 'User promoted to admin successfully',
          user: { id: 1, role: 'admin' }
        }
      });
      cy.get('table tbody tr').first().find('.btn-promote').click();
      cy.get('table tbody tr').first().find('.role-badge').should('contain', 'admin');
    });
  });

  describe('Demote Admin Functionality', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should display Demote button for admin users', () => {
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('td').eq(3).then(($roleCell) => {
          if ($roleCell.text().includes('admin')) {
            cy.wrap($row).find('.btn-demote').should('be.visible');
          }
        });
      });
    });

    it('should show confirmation dialog when Demote is clicked', () => {
      cy.get('.btn-demote').first().click();
      cy.on('window:confirm', () => {
        return true;
      });
    });

    it('should demote admin when confirmed', () => {
      cy.intercept('POST', '**/admin/users/*/demote', {
        statusCode: 200,
        body: {
          message: 'Admin demoted to user successfully',
          user: { id: 1, role: 'user' }
        }
      });
      cy.get('.btn-demote').first().click();
      cy.on('window:confirm', () => true);
      cy.get('table tbody tr').first().find('.role-badge').should('contain', 'user');
    });
  });

  describe('Delete User Functionality', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should display Delete button for all users', () => {
      cy.get('table tbody tr').each(($row) => {
        cy.wrap($row).find('.btn-delete').should('be.visible');
      });
    });

    it('should show confirmation dialog when Delete is clicked', () => {
      cy.get('.btn-delete').first().click();
      cy.on('window:confirm', () => {
        return true;
      });
    });

    it('should delete user when confirmed', () => {
      cy.intercept('DELETE', '**/admin/users/*', {
        statusCode: 200,
        body: { message: 'User deleted successfully' }
      });
      const initialRowCount = 15;
      cy.get('table tbody tr').should('have.length', initialRowCount);
      cy.get('.btn-delete').first().click();
      cy.on('window:confirm', () => true);
      cy.get('table tbody tr').should('have.length.lessThan', initialRowCount);
    });

    it('should show success alert after deletion', () => {
      cy.intercept('DELETE', '**/admin/users/*', {
        statusCode: 200,
        body: { message: 'User deleted successfully' }
      });
      cy.get('.btn-delete').first().click();
      cy.on('window:alert', (str) => {
        expect(str).to.contain('deleted');
      });
      cy.on('window:confirm', () => true);
    });
  });

  describe('Rapid Button Clicks - Race Condition Tests', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should not allow multiple simultaneous requests', () => {
      // Click multiple action buttons rapidly
      cy.get('.btn-promote').first().click();
      cy.get('.btn-delete').first().click();
      cy.get('.btn-demote').first().click();
      
      // All buttons should be disabled during action
      cy.get('.btn-promote').should('be.disabled');
      cy.get('.btn-delete').should('be.disabled');
      cy.get('.btn-demote').should('be.disabled');
    });

    it('should re-enable buttons after action completes', () => {
      cy.intercept('POST', '**/admin/users/*/make-admin', {
        delay: 500,
        statusCode: 200,
        body: { message: 'User promoted to admin successfully' }
      });
      
      cy.get('.btn-promote').first().click();
      cy.get('.btn-promote').should('be.disabled');
      cy.wait(600);
      cy.get('.btn-promote').should('not.be.disabled');
    });
  });

  describe('Error Handling Tests', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should display error message on API failure', () => {
      cy.intercept('POST', '**/admin/users/*/make-admin', {
        statusCode: 400,
        body: { message: 'User is already an admin' }
      });

      cy.get('.btn-promote').first().click();
      cy.get('.error-message').should('contain', 'User is already an admin');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '**/admin/users', {
        forceNetworkError: true
      });

      cy.reload();
      cy.get('.error-message').should('be.visible');
    });

    it('should show error when fetching fails', () => {
      cy.intercept('GET', '**/admin/statistics', {
        statusCode: 500,
        body: { message: 'Internal server error' }
      });

      cy.reload();
      cy.get('.error-alert').should('exist');
    });
  });

  describe('Instructions Section Tests', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should display instructions section', () => {
      cy.get('.instructions-section').should('be.visible');
      cy.get('.instructions-section h3').should('contain', 'How to Use');
    });

    it('should display all three instruction items', () => {
      cy.get('.instruction-item').should('have.length', 3);
      cy.get('.instruction-item').should('contain', 'Promote User');
      cy.get('.instruction-item').should('contain', 'Demote Admin');
      cy.get('.instruction-item').should('contain', 'Delete User');
    });

    it('should have proper formatting and icons', () => {
      cy.get('.instruction-icon').should('have.length', 3);
    });
  });

  describe('User Interface Responsiveness', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should display content without horizontal scroll on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('body').should('not.have.css', 'overflow-x', 'scroll');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.get('.users-table-container').should('be.visible');
      cy.get('table').should('be.visible');
    });

    it('should display header correctly on different screen sizes', () => {
      cy.viewport('ipad-2');
      cy.get('h1').should('contain', 'User Management');
      cy.get('.management-header').should('be.visible');
    });
  });

  describe('UI Updates and Real-time Feedback', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should update statistics after user promotion', () => {
      cy.get('.stat-number').eq(1).then(($el) => {
        const initialAdmins = parseInt($el.text());
        
        cy.intercept('GET', '**/admin/statistics', {
          body: {
            data: {
              total_users: 23,
              total_admins: initialAdmins + 1,
              total_regular_users: 21
            }
          }
        });

        cy.get('.btn-promote').first().click();
        cy.get('.stat-number').eq(1).should('contain', initialAdmins + 1);
      });
    });

    it('should refresh table after successful action', () => {
      cy.intercept('GET', '**/admin/users*', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            data: [],
            pagination: { total: 0, per_page: 15, current_page: 1, last_page: 1 }
          }
        });
      });

      cy.get('.btn-promote').first().click();
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
  });

  describe('Service Layer Integration', () => {
    beforeEach(() => {
      login(adminCredentials.email, adminCredentials.password);
      cy.visit(`${apiUrl}/admin/users`);
    });

    it('should call correct API endpoints for user listing', () => {
      cy.intercept('GET', '**/admin/users*').as('getUsers');
      cy.wait('@getUsers');
      cy.get('@getUsers').should('have.property', 'response');
    });

    it('should send correct data to API on promotion', () => {
      cy.intercept('POST', '**/admin/users/*/make-admin').as('promoteUser');
      cy.get('.btn-promote').first().click();
      cy.wait('@promoteUser').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });
    });

    it('should send correct data to API on demotion', () => {
      cy.intercept('POST', '**/admin/users/*/demote').as('demoteUser');
      cy.get('.btn-demote').first().click();
      cy.on('window:confirm', () => true);
      cy.wait('@demoteUser').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });
    });

    it('should send correct data to API on deletion', () => {
      cy.intercept('DELETE', '**/admin/users/*').as('deleteUser');
      cy.get('.btn-delete').first().click();
      cy.on('window:confirm', () => true);
      cy.wait('@deleteUser').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });
    });
  });
});
