import React, { useEffect, useState } from 'react';
import axios from 'axios';

const History = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('/api/reports');
                setReports(response.data);
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };

        fetchReports();
    }, []);

    return (
        <div>
            <h2>Historique des Rapports</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Veilleur</th>
                        <th>Rapport</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{new Date(report.date).toLocaleString()}</td>
                            <td>{report.guard}</td>
                            <td>{report.content}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default History;