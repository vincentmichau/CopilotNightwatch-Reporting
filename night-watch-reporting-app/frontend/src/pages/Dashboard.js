import React from 'react';
import { Link } from 'react-router-dom';
import Chat from '../components/Chat';
import History from '../components/History';
import Planning from '../components/Planning';
import ReportForm from '../components/ReportForm';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <h1>Tableau de Bord des Veilleurs de Nuit</h1>
            <nav>
                <ul>
                    <li><Link to="/reports">Rapports</Link></li>
                    <li><Link to="/planning">Planning</Link></li>
                    <li><Link to="/history">Historique</Link></li>
                    <li><Link to="/admin">Administration</Link></li>
                </ul>
            </nav>
            <div className="report-section">
                <h2>Créer un Rapport</h2>
                <ReportForm />
            </div>
            <div className="history-section">
                <h2>Historique des Rapports</h2>
                <History />
            </div>
            <div className="planning-section">
                <h2>Planning des Veilleurs</h2>
                <Planning />
            </div>
            <div className="chat-section">
                <h2>Chat</h2>
                <Chat />
            </div>
        </div>
    );
};

export default Dashboard;