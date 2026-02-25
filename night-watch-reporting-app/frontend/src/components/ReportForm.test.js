import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportForm from './ReportForm';
import axios from 'axios';

test('ReportForm soumet les données et appelle onSubmit', async () => {
  const onSubmit = jest.fn();
  axios.post.mockResolvedValue({ data: { id: 1, title: 'T', description: 'D', date: '2026-02-24' } });

  const { container } = render(<ReportForm onSubmit={onSubmit} />);

  const inputs = container.querySelectorAll('input');
  const textarea = container.querySelector('textarea');

  // Titre is first input, date is second input (type=date)
  const titleInput = inputs[0];
  const dateInput = inputs[1];

  fireEvent.change(titleInput, { target: { value: 'T' } });
  fireEvent.change(textarea, { target: { value: 'D' } });
  fireEvent.change(dateInput, { target: { value: '2026-02-24' } });

  fireEvent.click(screen.getByText(/Soumettre/i));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ id: 1 })));
});
