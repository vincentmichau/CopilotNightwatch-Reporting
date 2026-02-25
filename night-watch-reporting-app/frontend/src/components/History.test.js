import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import History from './History';
import axios from 'axios';

test('History affiche les rapports récupérés depuis l\'API', async () => {
  axios.get.mockResolvedValue({ data: [ { id: 1, date: '2026-02-24T23:00:00Z', guard: 'Bob', content: 'Patrouille OK' } ] });

  render(<History />);

  expect(screen.getByText(/Historique des Rapports/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(screen.getByText(/Patrouille OK/)).toBeInTheDocument();
  });
});
