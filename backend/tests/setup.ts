process.env.NODE_ENV ??= 'test';
process.env.MONGODB_URI ??= 'mongodb://localhost:27017/support-tickets-test';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
process.env.JWT_SECRET ??= 'test-jwt-secret-with-at-least-32-characters';
process.env.SEED_DEFAULT_PASSWORD ??= 'Password123!';
