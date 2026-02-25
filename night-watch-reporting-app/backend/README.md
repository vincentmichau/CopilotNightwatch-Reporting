# Night Watch Reporting App

## Description
L'application de reporting des veilleurs de nuit permet de gérer les rapports, la planification, la sécurité, l'historique, le chat et l'administration. Elle est conçue pour être conforme au RGPD et inclut des fonctionnalités robustes pour les utilisateurs et les administrateurs.

## Technologies Utilisées
- **Backend**: Node.js, Express, MySQL
- **Frontend**: React
- **Base de données**: MySQL

## Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- MySQL (version 5.7 ou supérieure)
- npm (version 6 ou supérieure)

### Étapes d'installation
1. Clonez le dépôt:
   ```
   git clone <url-du-dépôt>
   cd night-watch-reporting-app
   ```

2. Installez les dépendances du backend:
   ```
   cd backend
   npm install
   ```

3. Configurez la base de données:
   - Créez une base de données MySQL et importez le schéma depuis `database/schema.sql`.

4. Démarrez le serveur backend:
   ```
   npm start
   ```

5. Installez les dépendances du frontend:
   ```
   cd ../frontend
   npm install
   ```

6. Démarrez l'application frontend:
   ```
   npm start
   ```

## Fonctionnalités
- **Gestion des rapports**: Création, lecture, mise à jour et suppression des rapports.
- **Planification**: Interface pour gérer les horaires des veilleurs de nuit.
- **Sécurité**: Authentification et autorisation des utilisateurs.
- **Historique**: Consultation de l'historique des rapports et événements.
- **Chat**: Communication en temps réel entre les utilisateurs.
- **Administration**: Gestion des utilisateurs et des paramètres de l'application.

## Conformité RGPD
L'application inclut des fonctionnalités pour assurer la conformité avec le RGPD, telles que le cryptage des données et la gestion des consentements.

## Aide et Support
Pour toute question ou problème, veuillez ouvrir une issue sur le dépôt GitHub ou contacter l'équipe de développement.

## License
Ce projet est sous licence MIT.