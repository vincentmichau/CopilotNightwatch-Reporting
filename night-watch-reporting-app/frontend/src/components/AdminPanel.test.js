import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminPanel from './AdminPanel';
import axios from 'axios';

test('AdminPanel affiche les utilisateurs et permet la suppression', async () => {
  axios.get.mockResolvedValue({ data: [ { id: 1, name: 'User1', email: 'u1@example.com' } ] });
  axios.delete.mockResolvedValue({ data: {} });

  render(<AdminPanel />);

  await waitFor(() => expect(screen.getByText(/User1/)).toBeInTheDocument());

  fireEvent.click(screen.getByText(/Delete/i));

  await waitFor(() => expect(screen.queryByText(/User1/)).not.toBeInTheDocument());
});
