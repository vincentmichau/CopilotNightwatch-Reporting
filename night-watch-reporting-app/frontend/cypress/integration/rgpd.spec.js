describe('RGPD page e2e', () => {
  it('visits the RGPD page', () => {
    cy.visit('/rgpd');
    cy.contains('Paramètres RGPD');
  });
});
