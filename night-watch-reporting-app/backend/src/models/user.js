// Modèle utilisateur minimal utilisé pour les middlewares d'authentification
// Implémentation simple retournant un utilisateur factice pour les tests locaux.

const User = {
  findById: async (id) => {
    if (!id) return null;
    // Pour les tests locaux, l'utilisateur id=1 est admin
    return {
      id,
      isAdmin: Number(id) === 1,
    };
  }
};

module.exports = User;
