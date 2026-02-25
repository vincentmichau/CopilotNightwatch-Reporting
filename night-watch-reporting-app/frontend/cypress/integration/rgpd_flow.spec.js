describe('RGPD flow (login → rgpd → forget-me)', () => {
  it('logs in, sets consent and requests forget-me (using network stubs)', () => {
    // stub login (frontend posts to /api/login)
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: { token: 'test-token', user: { id: 1, username: 'adm' } }
    }).as('login');

    // stub get consent
    cy.intercept('GET', '/api/rgpd/consent', { statusCode: 200, body: { consent: null } }).as('getConsent');

    // stub set consent
    cy.intercept('POST', '/api/rgpd/consent', { statusCode: 200, body: { consent: true } }).as('setConsent');

    // stub forget-me
    cy.intercept('POST', '/api/rgpd/forget-me', { statusCode: 200, body: { message: 'Vos données ont été anonymisées.' } }).as('forgetMe');

    cy.visit('/login');

    // fill login form (match actual inputs: email + password)
    cy.get('input[type="email"]', { timeout: 10000 }).type('adm@example.com');
    cy.get('input[type="password"]', { timeout: 10000 }).type('pass');
    cy.get('button[type="submit"]').click();
    cy.wait('@login');

    // store token in localStorage as the app might use it
    cy.then(() => {
      window.localStorage.setItem('token', 'test-token');
    });

    cy.visit('/rgpd');
    cy.wait('@getConsent');
    cy.contains('Paramètres RGPD');

    // accept consent
    cy.contains('Accepter').click();
    cy.wait('@setConsent');

    // request forget-me and assert alert text
    cy.on('window:alert', (txt) => {
      expect(txt).to.contain("Demande d'effacement traitée");
    });
    cy.contains("Demande d'effacement").click();
    cy.wait('@forgetMe');
  });
});
