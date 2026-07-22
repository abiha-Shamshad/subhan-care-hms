// Fails fast at boot instead of letting the app come up and error out on the
// first request that touches a missing critical variable (e.g. JWT_SECRET,
// which jsonwebtoken only complains about when something tries to sign/verify).
const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) {
    missing.push('CLIENT_ORIGIN');
  }

  if (missing.length) {
    console.error(
      `Refusing to start: missing required environment variable(s): ${missing.join(', ')}.\n` +
        'Copy backend/.env.example to backend/.env and fill in real values.'
    );
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error('Refusing to start: JWT_SECRET is too short (need 32+ characters of randomness).');
    process.exit(1);
  }
};
