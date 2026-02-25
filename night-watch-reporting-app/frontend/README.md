# Night Watch Reporting App

## Description
Cette application permet de gérer les rapports des veilleurs de nuit, incluant des fonctionnalités de planification, de sécurité, d'historique, de chat, et d'administration. Elle est conçue pour respecter le RGPD et faciliter l'installation automatique sur Windows 11.

## Technologies Utilisées
- **Backend**: Node.js, Express, MySQL
- **Frontend**: React
- **Base de données**: MySQL

## Installation
Pour installer l'application, exécutez le script `windows-installer.bat` situé dans le dossier `install`. Ce script installera toutes les dépendances nécessaires pour le bon fonctionnement de l'application.

## Structure du Projet
```
night-watch-reporting-app
├── backend
│   ├── src
│   ├── package.json
│   └── README.md
├── frontend
│   ├── public
│   ├── src
│   ├── package.json
│   └── README.md
├── database
│   └── schema.sql
├── install
│   └── windows-installer.bat
└── README.md
```

## Fonctionnalités
- **Gestion des rapports**: Création, lecture, mise à jour et suppression des rapports.
- **Planification**: Affichage et gestion du planning des veilleurs de nuit.
- **Sécurité**: Authentification et autorisation des utilisateurs.
- **Historique**: Consultation de l'historique des rapports et événements.
- **Chat**: Interface de chat pour la communication entre utilisateurs.
- **Administration**: Gestion des utilisateurs et des sites.

## Conformité RGPD
Des mesures ont été prises pour assurer la conformité avec le RGPD, notamment en ce qui concerne le traitement et le stockage des données personnelles.

## Aide et Support
Pour toute question ou problème, veuillez consulter le fichier `README.md` dans le dossier `backend` ou `frontend` pour des informations spécifiques à chaque partie de l'application.