import React, { useState } from 'react';
import axios from 'axios';

const ReportForm = ({ report, onSubmit }) => {
    const [title, setTitle] = useState(report ? report.title : '');
    const [description, setDescription] = useState(report ? report.description : '');
    const [date, setDate] = useState(report ? report.date : '');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('/api/reports', { title, description, date });
            onSubmit(response.data);
        } catch (err) {
            setError('Une erreur est survenue lors de la soumission du rapport.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{report ? 'Modifier le rapport' : 'Créer un nouveau rapport'}</h2>
            {error && <p className="error">{error}</p>}
            <div>
                <label>Titre:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Description:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Date:</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>
            <button type="submit">{report ? 'Mettre à jour' : 'Soumettre'}</button>
        </form>
    );
};

export default ReportForm;