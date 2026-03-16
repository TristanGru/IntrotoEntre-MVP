/* =============================================================
   form.js — Client-side validation + fetch POST to /api/submit
   ============================================================= */

(function () {
  'use strict';

  var form       = document.getElementById('interestForm');
  var formWrap   = document.getElementById('interest-form');
  var successBox = document.getElementById('formSuccess');
  var submitBtn  = document.getElementById('submitBtn');
  var formMsg    = document.getElementById('form-message');

  if (!form) return;

  /* ── Field helpers ──────────────────────────────────────── */
  function getInput(name)    { return document.getElementById(name); }
  function getError(suffix)  { return document.getElementById(suffix + '-error'); }

  function showError(errEl, input, msg) {
    if (errEl) errEl.textContent = msg;
    if (input) input.classList.add('is-error');
  }
  function clearError(errEl, input) {
    if (errEl) errEl.textContent = '';
    if (input) input.classList.remove('is-error');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ── Client-side validation ─────────────────────────────── */
  function validate() {
    var ok = true;

    // Full name
    var nameInput = getInput('full_name');
    var nameErr   = getError('full_name');
    if (!nameInput.value.trim()) {
      showError(nameErr, nameInput, 'Full name is required.');
      ok = false;
    } else {
      clearError(nameErr, nameInput);
    }

    // Email
    var emailInput = getInput('email');
    var emailErr   = getError('email');
    if (!emailInput.value.trim()) {
      showError(emailErr, emailInput, 'Email address is required.');
      ok = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      showError(emailErr, emailInput, 'Please enter a valid email address.');
      ok = false;
    } else {
      clearError(emailErr, emailInput);
    }

    // Willingness to pay (radio)
    var wtpSelected = form.querySelector('input[name="willingness_to_pay"]:checked');
    var wtpErr = getError('wtp');
    if (!wtpSelected) {
      if (wtpErr) wtpErr.textContent = 'Please select a price range.';
      ok = false;
    } else {
      if (wtpErr) wtpErr.textContent = '';
    }

    // Drink context (checkbox — at least one)
    var ctxChecked = Array.from(form.querySelectorAll('input[name="drink_context"]:checked'));
    var ctxErr = getError('context');
    if (ctxChecked.length === 0) {
      if (ctxErr) ctxErr.textContent = 'Please select at least one option.';
      ok = false;
    } else {
      if (ctxErr) ctxErr.textContent = '';
    }

    // Age confirmation
    var ageInput = getInput('age_confirmed');
    var ageErr   = getError('age');
    if (!ageInput.checked) {
      showError(ageErr, null, 'You must confirm you are 21 or older.');
      ok = false;
    } else {
      clearError(ageErr, null);
    }

    return ok;
  }

  /* ── UI state helpers ───────────────────────────────────── */
  function setLoading(on) {
    var label   = submitBtn.querySelector('.btn__label');
    var spinner = submitBtn.querySelector('.btn__spinner');
    submitBtn.disabled = on;
    if (label)   label.hidden   = on;
    if (spinner) spinner.hidden = !on;
  }

  function showFormMessage(msg, type) {
    formMsg.textContent = msg;
    formMsg.className = 'form-message form-message--' + type;
    formMsg.hidden = false;
  }
  function clearFormMessage() {
    formMsg.textContent = '';
    formMsg.hidden = true;
  }

  /* ── Submit handler ─────────────────────────────────────── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearFormMessage();

    if (!validate()) return;

    // Disable button immediately (EC-008)
    setLoading(true);

    var wtpSelected = form.querySelector('input[name="willingness_to_pay"]:checked');
    var ctxChecked  = Array.from(form.querySelectorAll('input[name="drink_context"]:checked'));

    var payload = {
      full_name:          getInput('full_name').value.trim(),
      email:              getInput('email').value.trim(),
      age_confirmed:      getInput('age_confirmed').checked,
      willingness_to_pay: wtpSelected ? wtpSelected.value : '',
      drink_context:      ctxChecked.map(function (cb) { return cb.value; }),
      referral_source:    getInput('referral_source') ? getInput('referral_source').value.trim() : '',
    };

    fetch('/api/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { status: res.status, data: data };
        });
      })
      .then(function (result) {
        setLoading(false);

        if (result.status === 200 && result.data.success) {
          // Show success, hide form (FR-009)
          form.hidden = true;
          successBox.hidden = false;
          // Scroll to success message
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        // Handle known error statuses
        if (result.status === 409) {
          showFormMessage('This email is already on our list. You\'re good!', 'info');
        } else if (result.status === 429) {
          showFormMessage('Too many attempts. Please try again in an hour.', 'error');
        } else if (result.status === 400 && result.data.details) {
          showFormMessage(result.data.details.join(' · '), 'error');
        } else {
          showFormMessage('Something went wrong. Please try again.', 'error');
        }
      })
      .catch(function () {
        // Network error (EC-007)
        setLoading(false);
        showFormMessage('Network error. Please check your connection and try again.', 'error');
      });
  });

  /* ── Live validation on blur ────────────────────────────── */
  var nameInput  = getInput('full_name');
  var emailInput = getInput('email');

  if (nameInput) {
    nameInput.addEventListener('blur', function () {
      var err = getError('full_name');
      if (!nameInput.value.trim()) {
        showError(err, nameInput, 'Full name is required.');
      } else {
        clearError(err, nameInput);
      }
    });
  }
  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      var err = getError('email');
      if (!emailInput.value.trim()) {
        showError(err, emailInput, 'Email address is required.');
      } else if (!validateEmail(emailInput.value.trim())) {
        showError(err, emailInput, 'Please enter a valid email address.');
      } else {
        clearError(err, emailInput);
      }
    });
  }

}());
