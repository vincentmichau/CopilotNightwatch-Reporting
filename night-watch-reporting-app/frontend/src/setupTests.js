// Configuration Jest pour React Testing Library
import '@testing-library/jest-dom/extend-expect';

// Mocker axios globalement en s'appuyant sur le mock manuel placé dans
// `frontend/__mocks__/axios.js` (Jest utilisera automatiquement ce mock).
jest.mock('axios');
