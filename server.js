/* eslint-disable no-param-reassign */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ─── Constants ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const BRAND = process.env.BRAND_NAME || 'Hydra';
const DATA_DIR = path.join(__dirname, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.txt');
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour
const VALID_WTP = ['under-5', '5-8', '8-12', '12-plus'];
const VALID_CONTEXT = ['bars', 'parties', 'home', 'events', 'tailgates'];

// ─── In-memory state ──────────────────────────────────────────────────────────
const ipCooldowns = new Map();   // ip_hash → timestamp
const seenEmails = new Set();    // normalized emails (loaded from file on start)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function log(level, message, ctx = {}) {
  const ts = new Date().toISOString();
  const extra = Object.keys(ctx).length ? ` ${JSON.stringify(ctx)}` : '';
  console.log(`[${ts}] [${level}] ${message}${extra}`);
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip || '').digest('hex');
}

function stripHtml(str) {
  return String(str).replace(/<[^>]*>/g, '').trim();
}

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

function sanitize(value, maxLen) {
  return stripHtml(value).substring(0, maxLen);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSubmission(body) {
  const errors = [];
  if (!body.full_name || typeof body.full_name !== 'string' || !body.full_name.trim()) {
    errors.push('full_name is required');
  }
  if (!body.email || typeof body.email !== 'string' || !validateEmail(body.email.trim())) {
    errors.push('email must be a valid email address');
  }
  if (body.age_confirmed !== true) {
    errors.push('age_confirmed must be true');
  }
  if (!VALID_WTP.includes(body.willingness_to_pay)) {
    errors.push(`willingness_to_pay must be one of: ${VALID_WTP.join(', ')}`);
  }
  if (
    !Array.isArray(body.drink_context) ||
    body.drink_context.length === 0 ||
    !body.drink_context.every((c) => VALID_CONTEXT.includes(c))
  ) {
    errors.push(`drink_context must be a non-empty array of: ${VALID_CONTEXT.join(', ')}`);
  }
  return errors;
}

// ─── Startup: ensure data dir + load seen emails ──────────────────────────────
function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadSeenEmails() {
  if (!fs.existsSync(SUBMISSIONS_FILE)) return;
  try {
    const lines = fs.readFileSync(SUBMISSIONS_FILE, 'utf8').split('\n').filter(Boolean);
    lines.forEach((line) => {
      try {
        const record = JSON.parse(line);
        if (record.email) seenEmails.add(record.email.toLowerCase());
      } catch (_) { /* ignore malformed lines */ }
    });
    log('INFO', `Loaded ${seenEmails.size} existing email(s) from submissions file`);
  } catch (err) {
    log('WARN', 'Could not read submissions file on startup', { error: err.message });
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net',
        "'unsafe-inline'",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
    },
  },
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// ─── POST /api/submit ─────────────────────────────────────────────────────────
app.post('/api/submit', (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';
    const ipHash = hashIp(ip);
    const now = Date.now();

    // Validate first (returns 400 — no state side-effects)
    const errors = validateSubmission(req.body);
    if (errors.length) {
      log('WARN', 'Validation failed', { errors });
      return res.status(400).json({ error: 'Invalid submission', details: errors });
    }

    const email = sanitize(req.body.email, 254).toLowerCase();

    // Duplicate email check (409 — user should know they're already on the list)
    if (seenEmails.has(email)) {
      log('WARN', 'Duplicate email', { ip_hash: ipHash });
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    // Rate limit: 1 per IP per hour (after dupe check so returning users see 409)
    if (ipCooldowns.has(ipHash)) {
      const lastTime = ipCooldowns.get(ipHash);
      if (now - lastTime < RATE_LIMIT_MS) {
        log('WARN', 'Rate limit exceeded', { ip_hash: ipHash });
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
    }

    // Build record
    const record = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ip_hash: ipHash,
      full_name: sanitize(req.body.full_name, 100),
      email,
      age_confirmed: true,
      willingness_to_pay: req.body.willingness_to_pay,
      drink_context: req.body.drink_context.filter((c) => VALID_CONTEXT.includes(c)),
      referral_source: req.body.referral_source ? sanitize(req.body.referral_source, 200) : '',
    };

    // Write to file
    ensureDataDir();
    fs.appendFileSync(SUBMISSIONS_FILE, `${JSON.stringify(record)}\n`);

    // Update in-memory state
    seenEmails.add(email);
    ipCooldowns.set(ipHash, now);

    log('INFO', 'Submission saved', { ip_hash: ipHash, outcome: 'success' });
    return res.status(200).json({ success: true, message: "You're on the list!" });
  } catch (err) {
    log('ERROR', 'Submission handler error', { error: err.message, stack: err.stack });
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ─── Serve SPA fallback ───────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

// ─── Start (only when run directly, not when required by tests) ───────────────
ensureDataDir();
loadSeenEmails();

if (require.main === module) {
  app.listen(PORT, () => {
    log('INFO', `${BRAND} MVP server started`, { port: PORT, env: process.env.NODE_ENV || 'development' });
  });
}

module.exports = { app, validateSubmission, stripHtml, ipCooldowns, seenEmails };
