const request  = require('supertest');
const path     = require('path');
const fs       = require('fs');
const { app, ipCooldowns, seenEmails }  = require('../server');

const TEST_DATA_DIR  = path.join(__dirname, '..', 'data');
const TEST_FILE      = path.join(TEST_DATA_DIR, 'submissions.txt');

// Reset in-memory state + file between tests for clean isolation
beforeEach(() => {
  ipCooldowns.clear();
  seenEmails.clear();
  if (fs.existsSync(TEST_FILE)) {
    try { fs.unlinkSync(TEST_FILE); } catch (_) {}
  }
});

afterEach(() => {
  if (fs.existsSync(TEST_FILE)) {
    try { fs.unlinkSync(TEST_FILE); } catch (_) {}
  }
});

const validBody = () => ({
  full_name:          'Test User',
  email:              `test_${Date.now()}@example.com`,
  age_confirmed:      true,
  willingness_to_pay: '8-12',
  drink_context:      ['bars', 'parties'],
  referral_source:    'Testing',
});

/* ── POST /api/submit — happy path ─────────────────────────── */
describe('POST /api/submit — valid', () => {
  test('200 with success message', async () => {
    const res = await request(app).post('/api/submit').send(validBody());
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBeTruthy();
  });

  test('writes a valid JSON line to submissions.txt', async () => {
    const payload = validBody();
    await request(app).post('/api/submit').send(payload);
    expect(fs.existsSync(TEST_FILE)).toBe(true);
    const line = fs.readFileSync(TEST_FILE, 'utf8').trim().split('\n').pop();
    const record = JSON.parse(line);
    expect(record.email).toBe(payload.email.toLowerCase());
    expect(record.full_name).toBe(payload.full_name);
    expect(record.age_confirmed).toBe(true);
    expect(record.id).toBeTruthy();
    expect(record.timestamp).toBeTruthy();
    expect(record.ip_hash).toBeTruthy();
  });

  test('email is normalized to lowercase', async () => {
    const payload = { ...validBody(), email: 'UPPER@EXAMPLE.COM' };
    await request(app).post('/api/submit').send(payload);
    const line = fs.readFileSync(TEST_FILE, 'utf8').trim();
    const record = JSON.parse(line);
    expect(record.email).toBe('upper@example.com');
  });

  test('HTML stripped from name field', async () => {
    const payload = { ...validBody(), full_name: '<b>Hacker</b>' };
    await request(app).post('/api/submit').send(payload);
    const line = fs.readFileSync(TEST_FILE, 'utf8').trim();
    const record = JSON.parse(line);
    expect(record.full_name).toBe('Hacker');
  });
});

/* ── POST /api/submit — validation errors ───────────────────── */
describe('POST /api/submit — validation', () => {
  test('400 when full_name missing', async () => {
    const res = await request(app).post('/api/submit').send({ ...validBody(), full_name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  test('400 when email missing', async () => {
    const res = await request(app).post('/api/submit').send({ ...validBody(), email: '' });
    expect(res.status).toBe(400);
  });

  test('400 when email is invalid format', async () => {
    const res = await request(app).post('/api/submit').send({ ...validBody(), email: 'notanemail' });
    expect(res.status).toBe(400);
  });

  test('400 when age_confirmed is false', async () => {
    const res = await request(app).post('/api/submit').send({ ...validBody(), age_confirmed: false });
    expect(res.status).toBe(400);
  });

  test('400 when willingness_to_pay is invalid', async () => {
    const res = await request(app).post('/api/submit').send({ ...validBody(), willingness_to_pay: 'bogus' });
    expect(res.status).toBe(400);
  });

  test('400 when drink_context is empty', async () => {
    const res = await request(app).post('/api/submit').send({ ...validBody(), drink_context: [] });
    expect(res.status).toBe(400);
  });
});

/* ── POST /api/submit — duplicate email ─────────────────────── */
describe('POST /api/submit — duplicate email', () => {
  test('409 on second submission with same email', async () => {
    const payload = validBody();
    await request(app).post('/api/submit').send(payload);
    const res2 = await request(app).post('/api/submit').send({ ...validBody(), email: payload.email });
    expect(res2.status).toBe(409);
    expect(res2.body.error).toMatch(/already registered/i);
  });
});
