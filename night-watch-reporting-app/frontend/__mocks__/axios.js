const mockSchedules = [
  { id: 1, date: '2026-02-24', guard: 'Alice', startTime: '22:00', endTime: '06:00' }
];

const mock = {
  get: jest.fn((url) => {
    if (url === '/api/schedules') return Promise.resolve({ data: mockSchedules });
    if (url === '/api/reports') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
};

module.exports = mock;
module.exports.default = mock;
