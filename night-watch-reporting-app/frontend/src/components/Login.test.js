import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import Login from './Login';
import axios from 'axios';

test('Login redirige sur succès', async () => {
  const history = createMemoryHistory();
  axios.post.mockResolvedValue({ data: { success: true } });

  const { container } = render(
    <Router history={history}>
      <Login />
    </Router>
  );

  // Récupérer les inputs (email est le premier, password le second)
  const inputs = container.querySelectorAll('input');
  const emailInput = inputs[0];
  const passwordInput = inputs[1];

  fireEvent.change(emailInput, { target: { value: 'a@a.com' } });
  fireEvent.change(passwordInput, { target: { value: 'secret' } });
  fireEvent.click(screen.getByText(/Se connecter/i));

  await waitFor(() => {
    expect(history.location.pathname).toBe('/dashboard');
  });
});
