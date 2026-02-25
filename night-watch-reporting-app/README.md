# Night Watch Reporting Application

## Description
L'application de reporting des veilleurs de nuit permet de gérer les rapports, la planification, la sécurité, l'historique, le chat et l'administration. Elle est conçue pour être conforme au RGPD et inclut des fonctionnalités robustes pour les utilisateurs et les administrateurs.

## Technologies Utilisées
- **Backend**: Node.js, Express, MySQL
- **Frontend**: React
- **Base de données**: MySQL

## Structure du Projet
```
night-watch-reporting-app
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── config
│   │   │   └── db.js
│   │   ├── controllers
│   │   │   └── index.js
│   │   ├── middleware
│   │   │   └── auth.js
│   │   ├── models
│   │   │   └── report.js
│   │   ├── routes
│   │   │   └── index.js
│   │   ├── services
│   │   │   └── chatService.js
│   │   └── utils
│   │       └── rgpd.js
│   ├── package.json
│   └── README.md
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── App.js
│   │   ├── components
│   │   │   ├── AdminPanel.js
│   │   │   ├── Chat.js
│   │   │   ├── History.js
│   │   │   ├── Login.js
│   │   │   ├── Planning.js
│   │   │   └── ReportForm.js
│   │   ├── pages
│   │   │   ├── Dashboard.js
│   │   │   └── NotFound.js
│   │   ├── services
│   │   │   └── api.js
│   │   └── utils
│   │       └── rgpd.js
│   ├── package.json
│   └── README.md
├── database
│   └── schema.sql
├── install
│   └── windows-installer.bat
└── README.md
```

## Installation
Pour installer l'application, exécutez le script `windows-installer.bat` situé dans le dossier `install`. Ce script installera toutes les dépendances nécessaires pour le backend et le frontend.

## Utilisation
1. Démarrez le serveur backend en exécutant `node backend/src/app.js`.
2. Lancez l'application frontend avec `npm start` dans le dossier `frontend`.

## Conformité RGPD
L'application inclut des fonctionnalités pour assurer la conformité avec le RGPD, notamment le cryptage des données et la gestion des consentements.

## Aide et Support
Pour toute question ou problème, veuillez consulter la documentation dans les fichiers `README.md` du backend et du frontend, ou contacter l'équipe de développement.