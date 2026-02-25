import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Planning = () => {
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await axios.get('/api/schedules');
                setSchedules(response.data);
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
        };

        fetchSchedules();
    }, []);

    return (
        <div>
            <h1>Planning des Veilleurs de Nuit</h1>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Veilleur</th>
                        <th>Heure de début</th>
                        <th>Heure de fin</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.map((schedule) => (
                        <tr key={schedule.id}>
                            <td>{schedule.date}</td>
                            <td>{schedule.guard}</td>
                            <td>{schedule.startTime}</td>
                            <td>{schedule.endTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Planning;