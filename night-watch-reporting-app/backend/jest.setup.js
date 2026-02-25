// Jest setup: ensure mock database is used and other globals
process.env.USE_MOCK_DB = 'true';
// Optionally, disable real SMTP env for tests
process.env.SMTP_USER = 'test@example.com';
