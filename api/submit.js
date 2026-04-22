require('dotenv').config();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VALID_WTP = ['under-3', '3-4', '4-5', '5-6', 'over-6'];
const VALID_CONTEXT = ['bars', 'parties', 'home', 'events', 'tailgates'];

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip || '').digest('hex');
}

function stripHtml(str) {
  return String(str).replace(/<[^>]*>/g, '').trim();
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || '';
    const ipHash = hashIp(ip);

    const errors = validateSubmission(req.body);
    if (errors.length) {
      return res.status(400).json({ error: 'Invalid submission', details: errors });
    }

    const email = sanitize(req.body.email, 254).toLowerCase();

    // Duplicate email check
    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    const record = {
      timestamp: new Date().toISOString(),
      ip_hash: ipHash,
      full_name: sanitize(req.body.full_name, 100),
      email,
      age_confirmed: true,
      willingness_to_pay: req.body.willingness_to_pay,
      drink_context: req.body.drink_context.filter((c) => VALID_CONTEXT.includes(c)),
      referral_source: req.body.referral_source ? sanitize(req.body.referral_source, 200) : '',
    };

    const { error } = await supabase.from('submissions').insert(record);
    if (error) throw error;

    return res.status(200).json({ success: true, message: "You're on the list!" });
  } catch (err) {
    console.error('Submit error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
