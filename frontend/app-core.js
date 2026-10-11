/* =============================================================================
   EventHub — app-core.js (Central State, Auth, Data Store & Utilities)
   Interlinked across all HTML modules.
   ============================================================================= */

const EventHub = (() => {
  'use strict';

  /* ── SEED DATA (Used for LocalStorage Fallback & Offline Standalone) ──── */
  const DEFAULT_EVENTS = [
    {
      id: 'e1',
      title: 'Sunburn Arena Electronic Fest 2026',
      category: 'Music',
      date: '2026-10-15',
      time: '18:00',
      endTime: '23:00',
      venue: 'DY Patil Sports Stadium',
      location: 'Mumbai',
      lat: 19.0760,
      lng: 72.8777,
      totalSeats: 2000,
      availableSeats: 1450,
      fee: 1500,
      description: 'India’s premier electronic music festival returns with international DJ headliners, immersive stage laser setups, and acoustic sound systems across multiple stages.',
      organizerId: 'u2',
      organizerName: 'Event Pro Productions',
      status: 'approved',
      createdAt: '2026-09-01'
    },
    {
      id: 'e2',
      title: 'TechFest India & AI Summit 2026',
      category: 'Tech',
      date: '2026-10-22',
      time: '09:00',
      endTime: '18:00',
      venue: 'Bangalore International Exhibition Centre',
      location: 'Bangalore',
      lat: 12.9716,
      lng: 77.5946,
      totalSeats: 500,
      availableSeats: 210,
      fee: 500,
      description: 'Premier South Asia technology conference featuring keynote sessions on generative AI, enterprise cloud engineering, quantum computing, and startup demos.',
      organizerId: 'u2',
      organizerName: 'Event Pro Productions',
      status: 'approved',
      createdAt: '2026-09-02'
    },
    {
      id: 'e3',
      title: 'Delhi Grand Half Marathon 2026',
      category: 'Sports',
      date: '2026-11-05',
      time: '06:00',
      endTime: '12:00',
      venue: 'Jawaharlal Nehru Stadium',
      location: 'Delhi',
      lat: 28.6139,
      lng: 77.2090,
      totalSeats: 3000,
      availableSeats: 2800,
      fee: 0,
      description: 'Scenic running course passing historical Delhi monuments with 5K, 10K, and 21K segments. Complete with timing chip, medals, and refreshments.',
      organizerId: 'u2',
      organizerName: 'Event Pro Productions',
      status: 'approved',
      createdAt: '2026-09-03'
    },
    {
      id: 'e4',
      title: 'Coastal Spice & Culinary Carnival',
      category: 'Food',
      date: '2026-10-30',
      time: '11:00',
      endTime: '21:00',
      venue: 'Marina Beach Grounds',
      location: 'Chennai',
      lat: 13.0827,
      lng: 80.2707,
      totalSeats: 1000,
      availableSeats: 680,
      fee: 200,
      description: 'Celebrating over 70 authentic regional kitchens, live cooking showdowns by masterchefs, artisanal bakeries, and live band music.',
      organizerId: 'u2',
      organizerName: 'Event Pro Productions',
      status: 'approved',
      createdAt: '2026-09-04'
    },
    {
      id: 'e5',
      title: 'Pune Contemporary Art Walk',
      category: 'Art',
      date: '2026-11-12',
      time: '10:00',
      endTime: '17:00',
      venue: 'Aga Khan Palace Heritage Grounds',
      location: 'Pune',
      lat: 18.5204,
      lng: 73.8567,
      totalSeats: 300,
      availableSeats: 120,
      fee: 300,
      description: 'Open-air contemporary art showcase with live sculpting, curated masterclasses, water-color pavilion, and emerging indie art stalls.',
      organizerId: 'u2',
      organizerName: 'Event Pro Productions',
      status: 'approved',
      createdAt: '2026-09-05'
    },
    {
      id: 'e6',
      title: 'Pan-India Startup Venture Summit',
      category: 'Business',
      date: '2026-11-20',
      time: '09:30',
      endTime: '17:30',
      venue: 'HICC Convention Centre',
      location: 'Hyderabad',
      lat: 17.3850,
      lng: 78.4867,
      totalSeats: 800,
      availableSeats: 800,
      fee: 999,
      description: 'Over 200 angel investors and founders gather for live speed pitching, venture capital panels, and high-impact networking workshops.',
      organizerId: 'u2',
      organizerName: 'Event Pro Productions',
      status: 'pending',
      createdAt: '2026-09-06'
    }
  ];

  const DEFAULT_USERS = [
    { id: 'u1', name: 'Admin User', email: 'admin@eventhub.com', password: 'admin123', role: 'admin', mobile: '9000000001', status: 'active', createdAt: '2026-01-01' },
    { id: 'u2', name: 'Event Pro Productions', email: 'organizer@eventhub.com', password: 'org123', role: 'organizer', mobile: '9000000002', status: 'active', createdAt: '2026-01-15' },
    { id: 'u3', name: 'John Doe', email: 'user@eventhub.com', password: 'user123', role: 'user', mobile: '9000000003', status: 'active', createdAt: '2026-02-10' }
  ];

  const DEFAULT_REGISTRATIONS = [
    { id: 'r1', userId: 'u3', eventId: 'e1', status: 'registered', paymentStatus: 'paid', paymentProof: 'TXN99182374', ticketCode: 'EH-SUNB-9918', createdAt: '2026-09-07' },
    { id: 'r2', userId: 'u3', eventId: 'e3', status: 'registered', paymentStatus: 'free', paymentProof: 'FREE-PASS-003', ticketCode: 'EH-DELM-4401', createdAt: '2026-09-07' }
  ];

  const CATEGORIES = [
    { name: 'Music', icon: 'fa-solid fa-music', color: '#B76E79', desc: 'Concerts & Festivals' },
    { name: 'Tech', icon: 'fa-solid fa-microchip', color: '#0EA5E9', desc: 'AI & Hackathons' },
    { name: 'Sports', icon: 'fa-solid fa-person-running', color: '#10B981', desc: 'Marathons & Fitness' },
    { name: 'Food', icon: 'fa-solid fa-utensils', color: '#F59E0B', desc: 'Food Carnivals' },
    { name: 'Art', icon: 'fa-solid fa-palette', color: '#8B5CF6', desc: 'Exhibitions & Theater' },
    { name: 'Business', icon: 'fa-solid fa-briefcase', color: '#D4AF37', desc: 'Startup Summits' }
  ];

  /* ── INITIALIZATION ─────────────────────────────────────────────────────── */
  function initStore() {
    if (!localStorage.getItem('eh_events')) {
      localStorage.setItem('eh_events', JSON.stringify(DEFAULT_EVENTS));
    }
    if (!localStorage.getItem('eh_users')) {
      localStorage.setItem('eh_users', JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem('eh_registrations')) {
      localStorage.setItem('eh_registrations', JSON.stringify(DEFAULT_REGISTRATIONS));
    }
  }
  initStore();

  /* ── DATA ACCESSORS ────────────────────────────────────────────────────── */
  function getEvents() {
    return JSON.parse(localStorage.getItem('eh_events') || '[]');
  }

  function saveEvents(events) {
    localStorage.setItem('eh_events', JSON.stringify(events));
  }

  function getEventById(id) {
    return getEvents().find(e => e.id === id) || null;
  }

  function getUsers() {
    return JSON.parse(localStorage.getItem('eh_users') || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem('eh_users', JSON.stringify(users));
  }

  function getRegistrations() {
    return JSON.parse(localStorage.getItem('eh_registrations') || '[]');
  }

  function saveRegistrations(regs) {
    localStorage.setItem('eh_registrations', JSON.stringify(regs));
  }

  function getUserRegistrations(userId) {
    return getRegistrations().filter(r => r.userId === userId);
  }

  /* ── AUTHENTICATION ─────────────────────────────────────────────────────── */
  function getCurrentUser() {
    const raw = localStorage.getItem('eh_session');
    return raw ? JSON.parse(raw) : null;
  }

  function setCurrentUser(user) {
    localStorage.setItem('eh_session', JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem('eh_session');
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
  }

  function login(email, password) {
    const users = getUsers();
    const candidate = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!candidate) return { success: false, error: 'Invalid email or password.' };
    if (candidate.status !== 'active') return { success: false, error: 'Account is deactivated. Contact admin.' };
    
    const session = {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
      mobile: candidate.mobile
    };
    setCurrentUser(session);
    return { success: true, user: session };
  }

  function register(name, email, mobile, password, role = 'user') {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, error: 'Email is already registered. Please login.' };
    }
    const newUser = {
      id: 'u' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      password: password,
      role: role,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    users.push(newUser);
    saveUsers(users);

    const session = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      mobile: newUser.mobile
    };
    setCurrentUser(session);
    return { success: true, user: session };
  }

  function requireAuth(allowedRoles = []) {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      showToast('Unauthorized access to this section', 'warning');
      window.location.href = 'dashboard.html';
      return null;
    }
    return user;
  }

  /* ── UI HELPERS & FORMATTERS ────────────────────────────────────────────── */
  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    if (num === 0) return 'Free';
    return '₹' + num.toLocaleString('en-IN');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${suffix}`;
  }

  function getCategoryColor(cat) {
    const found = CATEGORIES.find(c => c.name.toLowerCase() === (cat || '').toLowerCase());
    return found ? found.color : '#D4AF37';
  }

  function getCategoryIcon(cat) {
    const found = CATEGORIES.find(c => c.name.toLowerCase() === (cat || '').toLowerCase());
    return found ? `<i class="${found.icon}"></i>` : '<i class="fa-solid fa-calendar"></i>';
  }

  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = {
      success: 'fa-solid fa-circle-check',
      error: 'fa-solid fa-triangle-exclamation',
      warning: 'fa-solid fa-circle-exclamation',
      info: 'fa-solid fa-circle-info'
    };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.35s ease';
      setTimeout(() => toast.remove(), 350);
    }, 3800);
  }

  /* ── SHARED NAVBAR RENDERING ────────────────────────────────────────────── */
  function renderNavbar(activePage = '') {
    const user = getCurrentUser();
    const navMenu = document.getElementById('nav-menu');
    const navAuth = document.getElementById('nav-auth');
    if (!navMenu) return;

    // Mobile Hamburger Toggle
    const burger = document.getElementById('hamburger');
    if (burger) {
      burger.onclick = () => {
        navMenu.classList.toggle('active');
      };
    }

    if (navAuth) {
      if (user) {
        navAuth.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px;">
            <a href="dashboard.html" class="btn btn-outline-sm">
              <i class="fa-solid fa-user-circle"></i> ${user.name.split(' ')[0]}
            </a>
            <button onclick="EventHub.logout()" class="btn btn-danger-sm" title="Logout">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        `;
      } else {
        navAuth.innerHTML = `
          <div style="display:flex; gap:10px;">
            <a href="login.html" class="btn btn-outline-sm">Login</a>
            <a href="login.html#register" class="btn btn-primary-sm">Sign Up</a>
          </div>
        `;
      }
    }
  }

  // Public Interface
  return {
    CATEGORIES,
    getEvents,
    saveEvents,
    getEventById,
    getUsers,
    saveUsers,
    getRegistrations,
    saveRegistrations,
    getUserRegistrations,
    getCurrentUser,
    setCurrentUser,
    login,
    register,
    logout,
    requireAuth,
    formatCurrency,
    formatDate,
    formatTime,
    getCategoryColor,
    getCategoryIcon,
    showToast,
    renderNavbar
  };
})();
