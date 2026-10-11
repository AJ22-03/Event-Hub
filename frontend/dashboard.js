/* =============================================================================
   EventHub — dashboard.js (User, Organizer & Admin Dashboard Controller)
   ============================================================================= */

let currentUser = null;
let currentTab = 'overview';

document.addEventListener('DOMContentLoaded', () => {
  EventHub.renderNavbar('dashboard');
  currentUser = EventHub.requireAuth();
  if (!currentUser) return;

  renderUserHeader();
  renderSidebarMenu();
  switchTab('overview');
});

function renderUserHeader() {
  const nameEl = document.getElementById('dash-user-name');
  const roleEl = document.getElementById('dash-user-role');
  const avatarEl = document.getElementById('dash-avatar-letter');

  if (nameEl) nameEl.innerText = currentUser.name;
  if (roleEl) roleEl.innerText = currentUser.role.toUpperCase();
  if (avatarEl) avatarEl.innerText = currentUser.name.charAt(0).toUpperCase();
}

function renderSidebarMenu() {
  const container = document.getElementById('sidebar-menu-items');
  if (!container) return;

  let items = [
    { id: 'overview', label: 'Overview', icon: 'fa-solid fa-chart-pie' },
    { id: 'tickets', label: 'My Bookings', icon: 'fa-solid fa-ticket' }
  ];

  if (currentUser.role === 'organizer' || currentUser.role === 'admin') {
    items.push({ id: 'manage-events', label: 'Created Events', icon: 'fa-solid fa-calendar-check' });
    items.push({ id: 'create-event', label: 'Host New Event', icon: 'fa-solid fa-circle-plus' });
  }

  if (currentUser.role === 'admin') {
    items.push({ id: 'admin-users', label: 'Manage Users', icon: 'fa-solid fa-users-gear' });
  }

  container.innerHTML = items.map(item => `
    <div class="sidebar-item ${item.id === currentTab ? 'active' : ''}" onclick="switchTab('${item.id}')">
      <i class="${item.icon}"></i> <span>${item.label}</span>
    </div>
  `).join('');
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  renderSidebarMenu();

  const titleEl = document.getElementById('dashboard-view-title');
  const contentEl = document.getElementById('dashboard-view-content');
  if (!contentEl) return;

  if (tabId === 'overview') {
    if (titleEl) titleEl.innerText = 'Platform Overview';
    renderOverview(contentEl);
  } else if (tabId === 'tickets') {
    if (titleEl) titleEl.innerText = 'My Event Registrations';
    renderBookings(contentEl);
  } else if (tabId === 'manage-events') {
    if (titleEl) titleEl.innerText = 'Manage Hosted Events';
    renderManageEvents(contentEl);
  } else if (tabId === 'create-event') {
    if (titleEl) titleEl.innerText = 'Host a New Event';
    renderCreateEventForm(contentEl);
  } else if (tabId === 'admin-users') {
    if (titleEl) titleEl.innerText = 'System Users';
    renderAdminUsers(contentEl);
  }
}

function renderOverview(container) {
  const myRegs = EventHub.getUserRegistrations(currentUser.id);
  const allEvents = EventHub.getEvents();
  const hostedEvents = allEvents.filter(e => e.organizerId === currentUser.id);

  container.innerHTML = `
    <!-- STATS CARDS -->
    <div class="grid-3 mb-6">
      <div class="stat-card">
        <div class="stat-icon"><i class="fa-solid fa-ticket"></i></div>
        <div>
          <div class="stat-value">${myRegs.length}</div>
          <div class="stat-label">My Registered Events</div>
        </div>
      </div>

      ${
        currentUser.role !== 'user'
          ? `
          <div class="stat-card">
            <div class="stat-icon"><i class="fa-solid fa-calendar-days"></i></div>
            <div>
              <div class="stat-value">${currentUser.role === 'admin' ? allEvents.length : hostedEvents.length}</div>
              <div class="stat-label">${currentUser.role === 'admin' ? 'Total Active Events' : 'Events Hosted'}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fa-solid fa-indian-rupee-sign"></i></div>
            <div>
              <div class="stat-value">₹${hostedEvents.reduce((acc, ev) => acc + (ev.fee * (ev.totalSeats - ev.availableSeats)), 0).toLocaleString('en-IN')}</div>
              <div class="stat-label">Gross Revenue</div>
            </div>
          </div>
        `
          : `
          <div class="stat-card" style="cursor:pointer;" onclick="window.location.href='quiz.html'">
            <div class="stat-icon"><i class="fa-solid fa-brain"></i></div>
            <div>
              <div class="stat-value">Quiz Arena</div>
              <div class="stat-label">Play & Earn Discounts</div>
            </div>
          </div>
          <div class="stat-card" style="cursor:pointer;" onclick="window.location.href='ai-assistant.html'">
            <div class="stat-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            <div>
              <div class="stat-value">AI Concierge</div>
              <div class="stat-label">Personalized Recommendations</div>
            </div>
          </div>
        `
      }
    </div>

    <!-- RECENT REGISTRATIONS SECTION -->
    <div class="card" style="padding:28px;">
      <h3 style="font-family:'Playfair Display',serif; color:var(--gold-light); margin-bottom:18px;">
        Recent Registrations
      </h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Ticket Code</th>
            </tr>
          </thead>
          <tbody>
            ${
              myRegs.length === 0
                ? '<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">No event bookings yet. <a href="events.html" style="color:var(--gold);">Explore events now</a>.</td></tr>'
                : myRegs.map(r => {
                    const ev = EventHub.getEventById(r.eventId);
                    return `
                      <tr>
                        <td><strong>${ev ? ev.title : 'Event Unavailable'}</strong></td>
                        <td>${ev ? EventHub.formatDate(ev.date) : 'N/A'}</td>
                        <td><span class="badge badge-success">${r.status}</span></td>
                        <td><span class="badge badge-gold">${r.paymentStatus.toUpperCase()}</span></td>
                        <td><code style="color:var(--gold-light);">${r.ticketCode || 'EH-CONFIRMED'}</code></td>
                      </tr>
                    `;
                  }).join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBookings(container) {
  const myRegs = EventHub.getUserRegistrations(currentUser.id);

  if (myRegs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px;">
        <i class="fa-solid fa-ticket-simple" style="font-size:3rem; color:var(--muted-gold); margin-bottom:16px;"></i>
        <h3 style="color:var(--cream); font-family:'Playfair Display',serif;">You have no active bookings</h3>
        <p style="color:var(--text-secondary); margin-bottom:20px;">Browse upcoming music festivals, tech hackathons, and sports events.</p>
        <a href="events.html" class="btn btn-primary">Find Events</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid-3">
      ${myRegs.map(r => {
        const ev = EventHub.getEventById(r.eventId);
        if (!ev) return '';
        return `
          <div class="card" style="padding:22px;">
            <div class="flex-between mb-4">
              <span class="badge badge-gold">${ev.category}</span>
              <span class="badge badge-success">Confirmed</span>
            </div>
            <h3 style="font-family:'Playfair Display',serif; color:var(--cream); margin-bottom:12px;">${ev.title}</h3>
            <div style="font-size:0.85rem; color:var(--muted-gold); margin-bottom:6px;">
              <i class="fa-regular fa-calendar" style="color:var(--gold);"></i> ${EventHub.formatDate(ev.date)} • ${EventHub.formatTime(ev.time)}
            </div>
            <div style="font-size:0.85rem; color:var(--muted-gold); margin-bottom:16px;">
              <i class="fa-solid fa-location-dot" style="color:var(--gold);"></i> ${ev.venue}
            </div>

            <div class="ticket-pass" style="padding:14px; margin-bottom:16px;">
              <div style="font-size:0.75rem; color:var(--muted-gold);">Ticket Pass Code</div>
              <div style="font-size:1.1rem; font-weight:700; color:var(--gold-light);">${r.ticketCode || 'EH-VALID'}</div>
            </div>

            <div style="display:flex; gap:10px;">
              <button class="btn btn-outline-sm btn-full" onclick="window.location.href='event-detail.html?id=${ev.id}'">
                View Event
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderManageEvents(container) {
  const allEvents = EventHub.getEvents();
  const hostedEvents = currentUser.role === 'admin'
    ? allEvents
    : allEvents.filter(e => e.organizerId === currentUser.id);

  container.innerHTML = `
    <div class="card" style="padding:28px;">
      <div class="flex-between mb-6">
        <h3 style="font-family:'Playfair Display',serif; color:var(--gold-light);">Hosted Events Directory</h3>
        <button class="btn btn-primary-sm" onclick="switchTab('create-event')">
          <i class="fa-solid fa-plus"></i> Host New Event
        </button>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Seats</th>
              <th>Ticket Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${
              hostedEvents.length === 0
                ? '<tr><td colspan="7" style="text-align:center; color:var(--text-secondary);">No events created yet.</td></tr>'
                : hostedEvents.map(ev => `
                    <tr>
                      <td><strong>${ev.title}</strong></td>
                      <td>${ev.category}</td>
                      <td>${EventHub.formatDate(ev.date)}</td>
                      <td>${ev.availableSeats} / ${ev.totalSeats}</td>
                      <td>${EventHub.formatCurrency(ev.fee)}</td>
                      <td><span class="badge ${ev.status === 'approved' ? 'badge-success' : 'badge-warning'}">${ev.status}</span></td>
                      <td>
                        <button class="btn btn-danger-sm" onclick="deleteEvent('${ev.id}')">Delete</button>
                      </td>
                    </tr>
                  `).join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCreateEventForm(container) {
  container.innerHTML = `
    <div class="card" style="padding:32px; max-width:750px; margin:0 auto;">
      <h3 style="font-family:'Playfair Display',serif; color:var(--gold-light); margin-bottom:24px;">
        Publish an Event on EventHub
      </h3>

      <form id="form-create-event" onsubmit="handleCreateEvent(event)">
        <div class="form-group">
          <label>Event Title</label>
          <input type="text" id="ev-title" class="form-control" placeholder="e.g., Mumbai Indie Music Sunset" required />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-group">
            <label>Category</label>
            <select id="ev-category" class="form-control" required>
              <option value="Music">Music & Concerts</option>
              <option value="Tech">Tech & Hackathons</option>
              <option value="Sports">Sports & Marathons</option>
              <option value="Food">Food & Culinary</option>
              <option value="Art">Arts & Heritage</option>
              <option value="Business">Business & Startups</option>
            </select>
          </div>
          <div class="form-group">
            <label>City / Location</label>
            <input type="text" id="ev-location" class="form-control" placeholder="e.g., Mumbai" required />
          </div>
        </div>

        <div class="form-group">
          <label>Venue Name & Full Address</label>
          <input type="text" id="ev-venue" class="form-control" placeholder="e.g., Mehboob Studio, Bandra West" required />
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="ev-date" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Start Time</label>
            <input type="time" id="ev-time" class="form-control" required />
          </div>
          <div class="form-group">
            <label>End Time</label>
            <input type="time" id="ev-endtime" class="form-control" required />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-group">
            <label>Total Seats Capacity</label>
            <input type="number" id="ev-seats" class="form-control" placeholder="500" min="1" required />
          </div>
          <div class="form-group">
            <label>Ticket Fee (₹) — 0 for Free</label>
            <input type="number" id="ev-fee" class="form-control" placeholder="0" min="0" required />
          </div>
        </div>

        <div class="form-group">
          <label>Event Description</label>
          <textarea id="ev-desc" class="form-control" rows="4" placeholder="Detail the agenda, artists, guidelines, and highlights..." required></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-full mt-4">
          <i class="fa-solid fa-calendar-check"></i> Submit & Publish Event
        </button>
      </form>
    </div>
  `;
}

function handleCreateEvent(event) {
  event.preventDefault();

  const title = document.getElementById('ev-title').value.trim();
  const category = document.getElementById('ev-category').value;
  const location = document.getElementById('ev-location').value.trim();
  const venue = document.getElementById('ev-venue').value.trim();
  const date = document.getElementById('ev-date').value;
  const time = document.getElementById('ev-time').value;
  const endTime = document.getElementById('ev-endtime').value;
  const seats = parseInt(document.getElementById('ev-seats').value, 10);
  const fee = parseFloat(document.getElementById('ev-fee').value);
  const description = document.getElementById('ev-desc').value.trim();

  const newEvent = {
    id: 'e' + Date.now().toString(36),
    title,
    category,
    location,
    venue,
    lat: 19.0760, // Default coordinates
    lng: 72.8777,
    date,
    time,
    endTime,
    totalSeats: seats,
    availableSeats: seats,
    fee,
    description,
    organizerId: currentUser.id,
    organizerName: currentUser.name,
    status: currentUser.role === 'admin' ? 'approved' : 'approved',
    createdAt: new Date().toISOString().slice(0, 10)
  };

  const events = EventHub.getEvents();
  events.unshift(newEvent);
  EventHub.saveEvents(events);

  EventHub.showToast('Event created successfully!', 'success');
  switchTab('manage-events');
}

function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  let events = EventHub.getEvents();
  events = events.filter(e => e.id !== eventId);
  EventHub.saveEvents(events);
  EventHub.showToast('Event removed.', 'info');
  switchTab('manage-events');
}

function renderAdminUsers(container) {
  const users = EventHub.getUsers();

  container.innerHTML = `
    <div class="card" style="padding:28px;">
      <h3 style="font-family:'Playfair Display',serif; color:var(--gold-light); margin-bottom:20px;">
        Registered User Accounts
      </h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>${u.mobile || 'N/A'}</td>
                <td><span class="badge badge-gold">${u.role.toUpperCase()}</span></td>
                <td><span class="badge badge-success">${u.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
