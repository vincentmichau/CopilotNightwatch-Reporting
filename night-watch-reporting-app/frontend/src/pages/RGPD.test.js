import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RGPD from './RGPD';

jest.mock('../services/api', () => ({
  getConsent: jest.fn(),
  setConsent: jest.fn(),
  forgetMe: jest.fn()
}));

import { getConsent, setConsent, forgetMe } from '../services/api';

describe('RGPD page', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  test('renders and toggles consent and calls forgetMe', async () => {
    localStorage.setItem('token', 'tok');
    getConsent.mockResolvedValue({ consent: true });
    setConsent.mockResolvedValue({ consent: false });
    forgetMe.mockResolvedValue({ message: 'ok' });

    window.alert = jest.fn();

    render(<RGPD />);

    await waitFor(() => expect(getConsent).toHaveBeenCalledWith('tok'));
    expect(screen.getByText(/Consentement/i)).toBeInTheDocument();

    // Click Refuser
    fireEvent.click(screen.getByText('Refuser'));
    await waitFor(() => expect(setConsent).toHaveBeenCalledWith('tok', false));

    // Click forget-me
    fireEvent.click(screen.getByText("Demande d'effacement"));
    await waitFor(() => expect(forgetMe).toHaveBeenCalledWith('tok'));
    expect(window.alert).toHaveBeenCalled();
  });
});
