import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, requireFull, requireRole } from '../src/middleware/auth.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const buildApp = () => {
  const app = express();
  app.get('/whoami', authenticate, (req, res) => res.json({ user: req.user }));
  app.get('/inventory', authenticate, authorize('inventory'), (req, res) => res.json({ ok: true }));
  app.post('/inventory', authenticate, requireFull('inventory'), (req, res) => res.json({ ok: true }));
  app.post('/dispense', authenticate, requireRole('pharmacist'), (req, res) => res.json({ ok: true }));
  return app;
};

const tokenFor = (role) => jwt.sign({ sub: 'user-1', role }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
    expect(res.body.user).toMatchObject({ id: 'user-1', role: 'admin' });
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
