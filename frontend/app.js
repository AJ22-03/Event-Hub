/* =========================================================
   EventHub — app.js  (shared across all pages)
   ========================================================= */
const EventHub = (() => {

  /* ── SAMPLE DATA ───────────────────────────────────────── */
  const SAMPLE_EVENTS = [
    { id:'e1', title:'Sunburn Festival 2026', category:'Music', date:'2026-10-15', time:'18:00', endTime:'23:00', venue:'DY Patil Stadium', location:'Mumbai', lat:19.0760, lng:72.8777, totalSeats:2000, availableSeats:1450, fee:1500, description:'India\'s biggest electronic music festival returns! Experience world-class DJs, stunning light shows, and an unforgettable night of music under the stars. Featuring international artists and local legends across three stages.', organizerId:'u2', organizerName:'Event Pro', status:'approved', createdAt:'2026-09-01' },
    { id:'e2', title:'TechFest India 2026', category:'Tech', date:'2026-10-22', time:'09:00', endTime:'18:00', venue:'Bangalore International Exhibition Centre', location:'Bangalore', lat:12.9716, lng:77.5946, totalSeats:500, availableSeats:210, fee:500, description:'Join the biggest technology conference in South Asia. Two days of keynotes, workshops, hackathons, and networking with India\'s top tech leaders. Topics include AI/ML, Cloud Computing, Web3, and Startups.', organizerId:'u2', organizerName:'Event Pro', status:'approved', createdAt:'2026-09-02' },
    { id:'e3', title:'Delhi Half Marathon 2026', category:'Sports', date:'2026-11-05', time:'06:00', endTime:'12:00', venue:'Jawaharlal Nehru Stadium', location:'Delhi', lat:28.6139, lng:77.2090, totalSeats:3000, availableSeats:2800, fee:0, description:'Run through the heart of Delhi in this iconic half marathon! Routes pass through major monuments. Open to all fitness levels — choose from 5K, 10K, or 21K distances. Medals and refreshments provided.', organizerId:'u2', organizerName:'Event Pro', status:'approved', createdAt:'2026-09-03' },
    { id:'e4', title:'Chennai Food Carnival', category:'Food', date:'2026-10-30', time:'11:00', endTime:'21:00', venue:'Marina Beach Grounds', location:'Chennai', lat:13.0827, lng:80.2707, totalSeats:1000, availableSeats:680, fee:200, description:'A celebration of South Indian cuisine and beyond! Over 60 stalls featuring authentic regional dishes, live cooking demonstrations by celebrity chefs, food competitions, and cultural performances.', organizerId:'u2', organizerName:'Event Pro', status:'approved', createdAt:'2026-09-04' },
    { id:'e5', title:'Pune Art Walk 2026', category:'Art', date:'2026-11-12', time:'10:00', endTime:'17:00', venue:'Aga Khan Palace Grounds', location:'Pune', lat:18.5204, lng:73.8567, totalSeats:300, availableSeats:120, fee:300, description:'An immersive open-air art exhibition featuring over 100 contemporary Indian artists. Walk through curated installations, interactive art zones, workshops, and live painting sessions. Perfect for art enthusiasts of all ages.', organizerId:'u2', organizerName:'Event Pro', status:'approved', createdAt:'2026-09-05' },
    { id:'e6', title:'Startup India Summit', category:'Business', date:'2026-11-20', time:'09:30', endTime:'17:30', venue:'Hyderabad International Convention Centre', location:'Hyderabad', lat:17.3850, lng:78.4867, totalSeats:800, availableSeats:800, fee:999, description:'Connect with top investors, mentors, and fellow entrepreneurs. Pitch competitions, investor panels, and masterclass sessions. A must-attend for startup founders and aspiring entrepreneurs.', organizerId:'u2', organizerName:'Event Pro', status:'pending', createdAt:'2026-09-06' },
  ];

  const SAMPLE_USERS = [
    { id:'u1', name:'Admin User', email:'admin@eventhub.com', password:'admin123', role:'admin', mobile:'9000000001', status:'active', createdAt:'2026-01-01' },
    { id:'u2', name:'Event Pro', email:'organizer@eventhub.com', password:'org123', role:'organizer', mobile:'9000000002', status:'active', createdAt:'2026-01-15' },
    { id:'u3', name:'John Doe', email:'user@eventhub.com', password:'user123', role:'user', mobile:'9000000003', status:'active', createdAt:'2026-02-10' },
  ];

  const SAMPLE_REGISTRATIONS = [
    { id:'r1', userId:'u3', eventId:'e1', status:'registered', paymentStatus:'pending', paymentProof:'TXN123456', createdAt:'2026-09-07' },
    { id:'r2', userId:'u3', eventId:'e3', status:'registered', paymentStatus:'free', paymentProof:'', createdAt:'2026-09-07' },
  ];

  const SAMPLE_NOTIFICATIONS = [
    { id:'n1', userId:'u3', message:'You have successfully registered for Sunburn Festival 2026!', type:'success', read:false, createdAt:'2026-09-07T10:00:00' },
    { id:'n2', userId:'u3', message:'Your registration for Delhi Half Marathon 2026 is confirmed.', type:'success', read:true, createdAt:'2026-09-07T11:00:00' },
    { id:'n3', userId:'u2', message:'Your event "TechFest India 2026" has been approved!', type:'success', read:false, createdAt:'2026-09-06T09:00:00' },
  ];

  /* ── INIT ──────────────────────────────────────────────── */
  function _init() {
    if (!localStorage.getItem('eh_events'))         localStorage.setItem('eh_events', JSON.stringify(SAMPLE_EVENTS));
    if (!localStorage.getItem('eh_users'))          localStorage.setItem('eh_users',  JSON.stringify(SAMPLE_USERS));
    if (!localStorage.getItem('eh_registrations'))  localStorage.setItem('eh_registrations', JSON.stringify(SAMPLE_REGISTRATIONS));
    if (!localStorage.getItem('eh_notifications'))  localStorage.setItem('eh_notifications', JSON.stringify(SAMPLE_NOTIFICATIONS));
  }
  _init();

  /* ── DATA ACCESS ───────────────────────────────────────── */
  function getEvents()               { return JSON.parse(localStorage.getItem('eh_events') || '[]'); }
  function saveEvents(e)             { localStorage.setItem('eh_events', JSON.stringify(e)); }
  function getUsers()                { return JSON.parse(localStorage.getItem('eh_users') || '[]'); }
  function saveUsers(u)              { localStorage.setItem('eh_users', JSON.stringify(u)); }
  function getRegistrations()        { return JSON.parse(localStorage.getItem('eh_registrations') || '[]'); }
  function saveRegistrations(r)      { localStorage.setItem('eh_registrations', JSON.stringify(r)); }
  function getCurrentUser()          { const s=localStorage.getItem('eh_session'); return s?JSON.parse(s):null; }
  function setCurrentUser(u)         { localStorage.setItem('eh_session', JSON.stringify(u)); }
  function clearCurrentUser()        { localStorage.removeItem('eh_session'); }
  function getNotifications()        { return JSON.parse(localStorage.getItem('eh_notifications') || '[]'); }
  function saveNotifications(n)      { localStorage.setItem('eh_notifications', JSON.stringify(n)); }

  /* ── AUTH ──────────────────────────────────────────────── */
  function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return null;
    if (user.status === 'inactive') return { error: 'Account is deactivated. Contact admin.' };
    const session = { id:user.id, name:user.name, email:user.email, role:user.role, mobile:user.mobile };
    setCurrentUser(session);
    return session;
  }

  function register(name, email, mobile, password, role) {
    const users = getUsers();
    if (users.find(u => u.email === email)) return { success:false, error:'Email already registered.' };
    const newUser = { id:'u'+Date.now(), name, email, mobile, password, role: role||'user', status:'active', createdAt: new Date().toISOString().split('T')[0] };
    users.push(newUser);
    saveUsers(users);
    const session = { id:newUser.id, name:newUser.name, email:newUser.email, role:newUser.role, mobile:newUser.mobile };
    setCurrentUser(session);
    return { success:true, user:session };
  }

  function logout() {
    clearCurrentUser();
    window.location.href = 'login.html';
  }

  function requireAuth(roles=[]) {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    if (roles.length && !roles.includes(user.role)) { window.location.href = 'dashboard.html'; return null; }
    return user;
  }

  /* ── EVENTS ────────────────────────────────────────────── */
  function searchEvents(query='', category='', location='', date='', priceFilter='') {
    const events = getEvents().filter(e => e.status === 'approved');
    return events.filter(e => {
      const matchQ    = !query    || e.title.toLowerCase().includes(query.toLowerCase()) || e.description.toLowerCase().includes(query.toLowerCase());
      const matchC    = !category || e.category === category;
      const matchL    = !location || e.location.toLowerCase().includes(location.toLowerCase());
      const matchD    = !date     || e.date === date;
      const matchP    = !priceFilter || priceFilter==='all' || (priceFilter==='free' && e.fee===0) || (priceFilter==='paid' && e.fee>0);
      return matchQ && matchC && matchL && matchD && matchP;
    });
  }

  function getEventById(id) { return getEvents().find(e => e.id === id) || null; }

  function createEvent(data) {
    const events = getEvents();
    const ev = { id:'e'+Date.now(), ...data, status:'pending', createdAt: new Date().toISOString().split('T')[0], availableSeats: parseInt(data.totalSeats) };
    events.push(ev);
    saveEvents(events);
    return ev;
  }

  function updateEvent(id, data) {
    const events = getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...data };
    saveEvents(events);
    return events[idx];
  }

  function deleteEvent(id) {
    const events = getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return false;
    events[idx].status = 'cancelled';
    saveEvents(events);
    return true;
  }

  function approveEvent(id) {
    const ev = updateEvent(id, { status:'approved' });
    if (ev) addNotification(ev.organizerId, `Your event "${ev.title}" has been approved! It is now live.`, 'success');
    return ev;
  }

  function rejectEvent(id) {
    const ev = updateEvent(id, { status:'rejected' });
    if (ev) addNotification(ev.organizerId, `Your event "${ev.title}" was not approved. Please review and resubmit.`, 'warning');
    return ev;
  }

  /* ── REGISTRATIONS ─────────────────────────────────────── */
  function registerForEvent(userId, eventId) {
    const events = getEvents();
    const evIdx = events.findIndex(e => e.id === eventId);
    if (evIdx === -1) return { success:false, error:'Event not found.' };
    if (events[evIdx].availableSeats <= 0) return { success:false, error:'No seats available.' };
    const regs = getRegistrations();
    if (regs.find(r => r.userId===userId && r.eventId===eventId && r.status!=='cancelled'))
      return { success:false, error:'Already registered for this event.' };
    const reg = { id:'r'+Date.now(), userId, eventId, status:'registered', paymentStatus: events[evIdx].fee===0?'free':'pending', paymentProof:'', createdAt: new Date().toISOString() };
    regs.push(reg);
    saveRegistrations(regs);
    events[evIdx].availableSeats--;
    saveEvents(events);
    addNotification(userId, `Successfully registered for "${events[evIdx].title}"!`, 'success');
    return { success:true, registration:reg };
  }

  function cancelRegistration(regId) {
    const regs = getRegistrations();
    const idx = regs.findIndex(r => r.id === regId);
    if (idx === -1) return false;
    const reg = regs[idx];
    if (reg.status === 'cancelled') return false;
    regs[idx].status = 'cancelled';
    saveRegistrations(regs);
    const events = getEvents();
    const evIdx = events.findIndex(e => e.id === reg.eventId);
    if (evIdx !== -1) { events[evIdx].availableSeats++; saveEvents(events); }
    addNotification(reg.userId, `Your registration has been cancelled.`, 'info');
    return true;
  }

  function getUserRegistrations(userId) {
    const regs = getRegistrations().filter(r => r.userId === userId);
    return regs.map(r => ({ ...r, event: getEventById(r.eventId) }));
  }

  function getEventRegistrations(eventId) {
    const regs = getRegistrations().filter(r => r.eventId === eventId);
    const users = getUsers();
    return regs.map(r => ({ ...r, user: users.find(u=>u.id===r.userId) }));
  }

  function submitPaymentProof(regId, proof) {
    const regs = getRegistrations();
    const idx = regs.findIndex(r => r.id === regId);
    if (idx === -1) return false;
    regs[idx].paymentProof = proof;
    regs[idx].paymentStatus = 'pending';
    saveRegistrations(regs);
    return true;
  }

  function verifyPayment(regId, decision) {
    const regs = getRegistrations();
    const idx = regs.findIndex(r => r.id === regId);
    if (idx === -1) return false;
    regs[idx].paymentStatus = decision; // 'verified' or 'rejected'
    saveRegistrations(regs);
    const reg = regs[idx];
    const ev = getEventById(reg.eventId);
    const msg = decision==='verified'
      ? `Your payment for "${ev?.title}" has been verified! ✅`
      : `Your payment for "${ev?.title}" was rejected. Please resubmit.`;
    addNotification(reg.userId, msg, decision==='verified'?'success':'warning');
    return true;
  }

  /* ── NOTIFICATIONS ─────────────────────────────────────── */
  function addNotification(userId, message, type='info') {
    const notifs = getNotifications();
    notifs.unshift({ id:'n'+Date.now(), userId, message, type, read:false, createdAt: new Date().toISOString() });
    saveNotifications(notifs);
  }

  function getUserNotifications(userId) { return getNotifications().filter(n => n.userId === userId); }

  function markNotificationRead(notifId) {
    const notifs = getNotifications();
    const idx = notifs.findIndex(n => n.id === notifId);
    if (idx !== -1) { notifs[idx].read = true; saveNotifications(notifs); }
  }

  function markAllNotificationsRead(userId) {
    const notifs = getNotifications().map(n => n.userId===userId ? {...n,read:true} : n);
    saveNotifications(notifs);
  }

  /* ── REPORTS ───────────────────────────────────────────── */
  function generateReport(type) {
    if (type === 'events') {
      const events = getEvents();
      const byCategory = {};
      events.forEach(e => { byCategory[e.category] = (byCategory[e.category]||0)+1; });
      return { total:events.length, approved:events.filter(e=>e.status==='approved').length, pending:events.filter(e=>e.status==='pending').length, rejected:events.filter(e=>e.status==='rejected').length, byCategory };
    }
    if (type === 'users') {
      const users = getUsers();
      return { total:users.length, admins:users.filter(u=>u.role==='admin').length, organizers:users.filter(u=>u.role==='organizer').length, attendees:users.filter(u=>u.role==='user').length, active:users.filter(u=>u.status==='active').length };
    }
    if (type === 'registrations') {
      const regs = getRegistrations();
      return { total:regs.length, active:regs.filter(r=>r.status==='registered').length, cancelled:regs.filter(r=>r.status==='cancelled').length, paymentPending:regs.filter(r=>r.paymentStatus==='pending').length, paymentVerified:regs.filter(r=>r.paymentStatus==='verified').length };
    }
  }

  /* ── UI UTILITIES ──────────────────────────────────────── */
  function showToast(message, type='success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:90px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(container);
    }
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const colors = { success:'#10b981', error:'#ef4444', warning:'#f59e0b', info:'#7c3aed' };
    const toast = document.createElement('div');
    toast.style.cssText = `background:#1e1e3a;color:#f1f5f9;padding:14px 20px;border-radius:12px;border-left:4px solid ${colors[type]};box-shadow:0 10px 40px rgba(0,0,0,0.4);max-width:320px;font-family:Poppins,sans-serif;font-size:14px;display:flex;align-items:center;gap:10px;animation:slideInRight 0.3s ease;`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation='slideOutRight 0.3s ease forwards'; setTimeout(()=>toast.remove(),300); }, 4000);
  }

  function showModal(title, content, onConfirm) {
    let overlay = document.getElementById('eh-modal-overlay');
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.id = 'eh-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:10000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:#1a1a2e;border:1px solid rgba(124,58,237,0.3);border-radius:16px;padding:32px;max-width:420px;width:90%;color:#f1f5f9;font-family:Poppins,sans-serif;">
        <h3 style="margin:0 0 12px;font-size:20px;">${title}</h3>
        <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">${content}</p>
        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button onclick="document.getElementById('eh-modal-overlay').remove()" style="padding:10px 20px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#f1f5f9;cursor:pointer;font-family:Poppins,sans-serif;">Cancel</button>
          <button id="eh-modal-confirm" style="padding:10px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;cursor:pointer;font-family:Poppins,sans-serif;font-weight:600;">Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('eh-modal-confirm').onclick = () => { overlay.remove(); if(onConfirm) onConfirm(); };
    overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
  }

  function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { weekday:'short', year:'numeric', month:'long', day:'numeric' });
  }

  function formatCurrency(amount) {
    if (!amount || amount === 0) return 'FREE';
    return '₹' + Number(amount).toLocaleString('en-IN');
  }

  function formatTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  }

  function timeAgo(dateString) {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff/60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  }

  const CATEGORY_COLORS = {
    Music:'linear-gradient(135deg,#7c3aed,#ec4899)',
    Tech:'linear-gradient(135deg,#0ea5e9,#7c3aed)',
    Sports:'linear-gradient(135deg,#10b981,#0ea5e9)',
    Food:'linear-gradient(135deg,#f59e0b,#ef4444)',
    Art:'linear-gradient(135deg,#ec4899,#f59e0b)',
    Business:'linear-gradient(135deg,#1e40af,#7c3aed)',
    Education:'linear-gradient(135deg,#0ea5e9,#10b981)',
    Health:'linear-gradient(135deg,#10b981,#f59e0b)',
  };

  const CATEGORY_ICONS = {
    Music:'🎵', Tech:'💻', Sports:'⚽', Food:'🍔', Art:'🎨', Business:'💼', Education:'📚', Health:'🏥'
  };

  function getCategoryColor(cat) { return CATEGORY_COLORS[cat] || 'linear-gradient(135deg,#7c3aed,#ec4899)'; }
  function getCategoryIcon(cat)  { return CATEGORY_ICONS[cat] || '🎪'; }

  function initNavbar() {
    const user = getCurrentUser();
    const authArea = document.getElementById('nav-auth');
    if (!authArea) return;
    if (user) {
      const unread = getUserNotifications(user.id).filter(n=>!n.read).length;
      authArea.innerHTML = `
        <a href="dashboard.html" class="nav-link">Dashboard</a>
        <a href="dashboard.html" class="nav-user-chip">
          <span class="nav-avatar">${user.name.charAt(0).toUpperCase()}</span>
          <span>${user.name.split(' ')[0]}</span>
          ${unread ? `<span class="nav-badge">${unread}</span>` : ''}
        </a>
        <button onclick="EventHub.logout()" class="btn btn-outline-sm">Logout</button>`;
    } else {
      authArea.innerHTML = `
        <a href="login.html" class="btn btn-outline-sm">Login</a>
        <a href="login.html#register" class="btn btn-primary-sm">Sign Up</a>`;
    }
    // hamburger
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => { navMenu.classList.toggle('open'); });
    }
    // active link highlight
    const links = document.querySelectorAll('.nav-link');
    links.forEach(l => { if (l.href && window.location.href.includes(l.getAttribute('href'))) l.classList.add('active'); });
  }

  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  /* ── PUBLIC API ────────────────────────────────────────── */
  return {
    getEvents, saveEvents, getUsers, saveUsers, getRegistrations, saveRegistrations,
    getCurrentUser, setCurrentUser, clearCurrentUser, getNotifications, saveNotifications,
    login, register, logout, requireAuth,
    searchEvents, getEventById, createEvent, updateEvent, deleteEvent, approveEvent, rejectEvent,
    registerForEvent, cancelRegistration, getUserRegistrations, getEventRegistrations,
    submitPaymentProof, verifyPayment,
    addNotification, getUserNotifications, markNotificationRead, markAllNotificationsRead,
    generateReport,
    showToast, showModal, formatDate, formatCurrency, formatTime, timeAgo,
    getCategoryColor, getCategoryIcon, initNavbar, initScrollReveal,
  };
})();
