import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // URL de base de l'API backend
    timeout: 1000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fonction pour récupérer tous les rapports
export const getReports = async () => {
    try {
        const response = await api.get('/reports');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des rapports:', error);
        throw error;
    }
};

// Fonction pour créer un nouveau rapport
export const createReport = async (reportData) => {
    try {
        const response = await api.post('/reports', reportData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création du rapport:', error);
        throw error;
    }
};

// Fonction pour mettre à jour un rapport existant
export const updateReport = async (reportId, reportData) => {
    try {
        const response = await api.put(`/reports/${reportId}`, reportData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du rapport:', error);
        throw error;
    }
};

// Fonction pour supprimer un rapport
export const deleteReport = async (reportId) => {
    try {
        const response = await api.delete(`/reports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression du rapport:', error);
        throw error;
    }
};

// Fonction pour récupérer l'historique des rapports
export const getReportHistory = async () => {
    try {
        const response = await api.get('/reports/history');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des rapports:', error);
        throw error;
    }
};

// Fonction pour gérer l'authentification
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        throw error;
    }
};

// Fonction pour gérer la déconnexion
export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
    }
};