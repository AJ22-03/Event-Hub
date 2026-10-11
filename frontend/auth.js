/* =============================================================================
   EventHub — auth.js (Authentication: Login & Registration Controller)
   ============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard
  if (EventHub.getCurrentUser()) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Check URL hash for tab
  if (window.location.hash === '#register') {
    switchTab('register');
  }

  // Bind password meter
  const regPwInput = document.getElementById('reg-pw');
  if (regPwInput) {
    regPwInput.addEventListener('input', updatePasswordStrength);
  }
});

function switchTab(tab) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (tab === 'login') {
    tabLogin?.classList.add('active');
    tabRegister?.classList.remove('active');
    if (formLogin) formLogin.style.display = 'block';
    if (formRegister) formRegister.style.display = 'none';
  } else {
    tabRegister?.classList.add('active');
    tabLogin?.classList.remove('active');
    if (formLogin) formLogin.style.display = 'none';
    if (formRegister) formRegister.style.display = 'block';
  }
}

function togglePassword(inputId, iconEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    iconEl.classList.remove('fa-eye');
    iconEl.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    iconEl.classList.remove('fa-eye-slash');
    iconEl.classList.add('fa-eye');
  }
}

function autofillDemo(email, password) {
  switchTab('login');
  const emailInput = document.getElementById('login-email');
  const pwInput = document.getElementById('login-pw');

  if (emailInput) emailInput.value = email;
  if (pwInput) pwInput.value = password;

  EventHub.showToast(`Auto-filled credentials for ${email}`, 'info');
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const pw = document.getElementById('login-pw').value;
  const btn = document.getElementById('btn-login');

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

  setTimeout(() => {
    const res = EventHub.login(email, pw);
    if (res.success) {
      EventHub.showToast(`Welcome back, ${res.user.name}!`, 'success');
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || 'dashboard.html';
      setTimeout(() => {
        window.location.href = redirect;
      }, 700);
    } else {
      EventHub.showToast(res.error || 'Authentication failed', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Sign In to Account';
    }
  }, 600);
}

function updatePasswordStrength() {
  const val = document.getElementById('reg-pw')?.value || '';
  const fill = document.getElementById('pw-strength-fill');
  const label = document.getElementById('pw-strength-label');
  if (!fill || !label) return;

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  if (score === 0) {
    fill.style.width = '0%';
    label.innerText = '';
  } else if (score <= 2) {
    fill.style.width = '33%';
    fill.style.backgroundColor = 'var(--error)';
    label.innerText = 'Weak password';
    label.style.color = 'var(--error)';
  } else if (score <= 4) {
    fill.style.width = '66%';
    fill.style.backgroundColor = 'var(--warning)';
    label.innerText = 'Moderate password';
    label.style.color = 'var(--warning)';
  } else {
    fill.style.width = '100%';
    fill.style.backgroundColor = 'var(--success)';
    label.innerText = 'Strong password';
    label.style.color = 'var(--success)';
  }
}

function handleRegisterSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const mobile = document.getElementById('reg-mobile').value;
  const pw = document.getElementById('reg-pw').value;
  const pwConfirm = document.getElementById('reg-pw-confirm').value;
  const role = document.getElementById('reg-role').value;

  if (pw !== pwConfirm) {
    EventHub.showToast('Passwords do not match!', 'error');
    return;
  }

  const btn = document.getElementById('btn-register');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';

  setTimeout(() => {
    const res = EventHub.register(name, email, mobile, pw, role);
    if (res.success) {
      EventHub.showToast('Account created successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } else {
      EventHub.showToast(res.error, 'error');
      btn.disabled = false;
      btn.innerHTML = 'Create Account';
    }
  }, 700);
}
