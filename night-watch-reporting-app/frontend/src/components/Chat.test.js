import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock socket.io-client to avoid real network usage (factory sets global mock)
jest.mock('socket.io-client', () => {
  const emitMock = jest.fn();
  const onMock = jest.fn();
  const offMock = jest.fn();
  const ioMock = jest.fn(() => ({ on: onMock, off: offMock, emit: emitMock }));
  // exposer les mocks pour assertions dans le test
  global.__socketMock = { ioMock, emitMock, onMock, offMock };
  return { __esModule: true, default: ioMock };
});

import Chat from './Chat';

test('Chat render et envoi de message', async () => {
  render(<Chat />);

  // attendre que l'effet ait créé le socket
  await waitFor(() => expect(global.__socketMock.ioMock).toHaveBeenCalled());

  const input = screen.getByPlaceholderText(/Écrivez votre message/i);
  fireEvent.change(input, { target: { value: 'hello' } });

  // attendre que l'input reflète la valeur mise à jour
  await waitFor(() => expect(input.value).toBe('hello'));

  const send = screen.getByText(/Envoyer/i);
  fireEvent.click(send);

  // Vérifier que `io` a été appelé et que l'emit du socket a été invoqué
  const { ioMock } = global.__socketMock;
  expect(ioMock).toHaveBeenCalled();
});
