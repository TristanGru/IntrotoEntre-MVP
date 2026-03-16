/**
 * Export all Supabase submissions to data/submissions.txt (one JSON per line).
 * Run with: node scripts/export.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'submissions.txt');

async function main() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Failed to fetch submissions:', error.message);
    process.exit(1);
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const lines = data.map((row) => JSON.stringify(row)).join('\n');
  fs.writeFileSync(OUTPUT_FILE, lines + (data.length ? '\n' : ''));

  console.log(`Exported ${data.length} submission(s) to ${OUTPUT_FILE}`);
}

main();
