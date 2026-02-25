import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Planning from './Planning';
import axios from 'axios';

test('Planning affiche les horaires récupérés depuis l\'API', async () => {
  // Forcer le mock axios.get pour ce test
  axios.get.mockResolvedValue({ data: [ { id: 1, date: '2026-02-24', guard: 'Alice', startTime: '22:00', endTime: '06:00' } ] });

  render(<Planning />);

  // Le titre doit être présent
  expect(screen.getByText(/Planning des Veilleurs de Nuit/i)).toBeInTheDocument();

  // Attendre que la table affiche une ligne provenant du mock
  await waitFor(() => {
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });
});
