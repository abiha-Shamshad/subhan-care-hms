import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// authenticate() re-checks the caller's role/active-status against the DB on every
// request instead of trusting the JWT payload (so a demotion/deactivation takes
// effect immediately rather than waiting for the token to expire). That means this
// middleware unit test needs a User.findById stand-in rather than a live database;
// the mock derives the role straight from the token's `sub` claim, which tokenFor()
// encodes as `user:<role>`.
jest.unstable_mockModule('../src/models/User.js', () => ({
  default: {
    findById: (id) => ({
      select: async () => {
        const role = String(id).split(':')[1];
        return role ? { role, isActive: true } : null;
      },
    }),
  },
}));

const { authenticate, authorize, requireFull, requireRole } = await import('../src/middleware/auth.js');

const buildApp = () => {
  const app = express();
  app.get('/whoami', authenticate, (req, res) => res.json({ user: req.user }));
  app.get('/inventory', authenticate, authorize('inventory'), (req, res) => res.json({ ok: true }));
  app.post('/inventory', authenticate, requireFull('inventory'), (req, res) => res.json({ ok: true }));
  app.post('/dispense', authenticate, requireRole('pharmacist'), (req, res) => res.json({ ok: true }));
  return app;
};

const tokenFor = (role) => jwt.sign({ sub: `user:${role}`, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('authenticate', () => {
  const app = buildApp();

  it('rejects requests with no token', async () => {
    const res = await request(app).get('/whoami');
    expect(res.status).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const res = await request(app).get('/whoami').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('accepts a valid token and attaches req.user', async () => {
    const res = await request(app).get('/whoami').set('Authorization', `Bearer ${tokenFor('admin')}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 'user:admin', role: 'admin' });
  });

  it('rejects a token whose user the DB no longer recognizes (deleted/deactivated)', async () => {
    // 'sub' has no ':<role>' suffix, so the User.findById mock resolves to null.
    const token = jwt.sign({ sub: 'ghost', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/whoami').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});

describe('authorize', () => {
  const app = buildApp();

  it('403s a role with no access to the module', async () => {
    const res = await request(app).get('/inventory').set('Authorization', `Bearer ${tokenFor('billing')}`);
    expect(res.status).toBe(403);
  });

  it('allows a role with read/limited/full access to the module', async () => {
    const res = await request(app).get('/inventory').set('Authorization', `Bearer ${tokenFor('pharmacist')}`);
    expect(res.status).toBe(200);
  });
});

describe('requireFull', () => {
  const app = buildApp();

  it('403s a role without full access', async () => {
    // 'admin' has full access to inventory per PERMISSIONS, so use a role that only has read/limited/none.
    const res = await request(app).post('/inventory').set('Authorization', `Bearer ${tokenFor('billing')}`);
    expect(res.status).toBe(403);
  });

  it('allows a role with full access', async () => {
    const res = await request(app).post('/inventory').set('Authorization', `Bearer ${tokenFor('admin')}`);
    expect(res.status).toBe(200);
  });
});

describe('requireRole', () => {
  const app = buildApp();

  it('403s a role not in the allowed list', async () => {
    const res = await request(app).post('/dispense').set('Authorization', `Bearer ${tokenFor('admin')}`);
    expect(res.status).toBe(403);
  });

  it('allows a role in the allowed list', async () => {
    const res = await request(app).post('/dispense').set('Authorization', `Bearer ${tokenFor('pharmacist')}`);
    expect(res.status).toBe(200);
  });
});
