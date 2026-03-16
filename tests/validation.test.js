const { validateSubmission, stripHtml } = require('../server');

describe('stripHtml', () => {
  test('strips HTML tags', () => {
    expect(stripHtml('<b>Hello</b>')).toBe('Hello');
    expect(stripHtml('<script>alert(1)</script>')).toBe('alert(1)');
  });

  test('trims whitespace', () => {
    expect(stripHtml('  hello  ')).toBe('hello');
  });

  test('passes plain text unchanged', () => {
    expect(stripHtml('Alex Johnson')).toBe('Alex Johnson');
  });
});

describe('validateSubmission', () => {
  const valid = {
    full_name: 'Alex Johnson',
    email: 'alex@example.com',
    age_confirmed: true,
    willingness_to_pay: '8-12',
    drink_context: ['bars', 'parties'],
    referral_source: 'Instagram',
  };

  test('passes a valid submission', () => {
    expect(validateSubmission(valid)).toHaveLength(0);
  });

  test('requires full_name', () => {
    const errors = validateSubmission({ ...valid, full_name: '' });
    expect(errors.some((e) => e.includes('full_name'))).toBe(true);
  });

  test('requires valid email', () => {
    const errors = validateSubmission({ ...valid, email: 'notanemail' });
    expect(errors.some((e) => e.includes('email'))).toBe(true);
  });

  test('requires email present', () => {
    const errors = validateSubmission({ ...valid, email: '' });
    expect(errors.some((e) => e.includes('email'))).toBe(true);
  });

  test('requires age_confirmed = true', () => {
    const errors = validateSubmission({ ...valid, age_confirmed: false });
    expect(errors.some((e) => e.includes('age_confirmed'))).toBe(true);
  });

  test('rejects invalid willingness_to_pay', () => {
    const errors = validateSubmission({ ...valid, willingness_to_pay: 'free' });
    expect(errors.some((e) => e.includes('willingness_to_pay'))).toBe(true);
  });

  test('requires drink_context to be non-empty', () => {
    const errors = validateSubmission({ ...valid, drink_context: [] });
    expect(errors.some((e) => e.includes('drink_context'))).toBe(true);
  });

  test('rejects invalid drink_context values', () => {
    const errors = validateSubmission({ ...valid, drink_context: ['moon'] });
    expect(errors.some((e) => e.includes('drink_context'))).toBe(true);
  });

  test('email normalized lowercase still valid', () => {
    const errors = validateSubmission({ ...valid, email: 'ALEX@EXAMPLE.COM' });
    expect(errors).toHaveLength(0);
  });
});
