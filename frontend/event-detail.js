/* =============================================================================
   EventHub — event-detail.js (Event Details, Booking & Ticket Pass Controller)
   ============================================================================= */

let currentEvent = null;

document.addEventListener('DOMContentLoaded', () => {
  EventHub.renderNavbar('events');

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('id');

  if (!eventId) {
    showNotFound();
    return;
  }

  currentEvent = EventHub.getEventById(eventId);
  if (!currentEvent) {
    showNotFound();
    return;
  }

  renderEventDetail(currentEvent);
});

function showNotFound() {
  const container = document.getElementById('detail-page-content');
  if (container) {
    container.innerHTML = `
      <div style="text-align:center; padding:100px 20px;">
        <h2 style="font-family:'Playfair Display',serif; color:var(--error); font-size:2.2rem; margin-bottom:16px;">
          Event Not Found
        </h2>
        <p style="color:var(--text-secondary); margin-bottom:24px;">The event you requested could not be located or has ended.</p>
        <a href="events.html" class="btn btn-primary">Browse Active Events</a>
      </div>
    `;
  }
}

function renderEventDetail(ev) {
  document.title = `${ev.title} — EventHub`;
  const seatsPct = Math.round((ev.availableSeats / ev.totalSeats) * 100);
  const user = EventHub.getCurrentUser();
  const existingReg = user ? EventHub.getUserRegistrations(user.id).find(r => r.eventId === ev.id) : null;

  const heroContainer = document.getElementById('event-hero-banner');
  if (heroContainer) {
    heroContainer.innerHTML = `
      <div class="container">
        <div style="margin-bottom:14px;">
          <a href="events.html" style="color:var(--muted-gold); font-size:0.85rem;">&larr; Back to Events</a>
        </div>
        <div style="display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap;">
          <span class="badge badge-gold">${EventHub.getCategoryIcon(ev.category)} ${ev.category}</span>
          <span class="badge ${ev.availableSeats > 0 ? 'badge-success' : 'badge-error'}">
            ${ev.availableSeats > 0 ? `${ev.availableSeats} Seats Available` : 'Sold Out'}
          </span>
        </div>
        <h1>${ev.title}</h1>
        <div style="display:flex; gap:24px; color:var(--muted-gold); font-size:0.95rem; flex-wrap:wrap;">
          <div><i class="fa-regular fa-calendar" style="color:var(--gold);"></i> ${EventHub.formatDate(ev.date)}</div>
          <div><i class="fa-regular fa-clock" style="color:var(--gold);"></i> ${EventHub.formatTime(ev.time)} - ${EventHub.formatTime(ev.endTime || '22:00')}</div>
          <div><i class="fa-solid fa-location-dot" style="color:var(--gold);"></i> ${ev.venue}, ${ev.location}</div>
        </div>
      </div>
    `;
  }

  const mainContainer = document.getElementById('event-detail-main');
  if (mainContainer) {
    mainContainer.innerHTML = `
      <!-- LEFT COLUMN -->
      <div class="detail-content-col">
        <div class="detail-card">
          <h3>About This Event</h3>
          <p style="color:var(--ivory); font-size:1.02rem; line-height:1.8; margin-bottom:20px; white-space:pre-line;">
            ${ev.description}
          </p>

          <h3 style="margin-top:35px;">Location & Directions</h3>
          <p style="color:var(--text-secondary); margin-bottom:12px;">
            <i class="fa-solid fa-map-pin" style="color:var(--gold);"></i> <strong>${ev.venue}</strong>, ${ev.location}
          </p>
          <div id="venue-detail-map"></div>
        </div>

        <div class="detail-card">
          <h3>Organized By</h3>
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="width:55px; height:55px; border-radius:50%; background:var(--gradient); color:#000; font-weight:700; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div>
              <h4 style="font-family:'Playfair Display',serif; color:var(--cream); font-size:1.15rem; margin-bottom:4px;">
                ${ev.organizerName || 'Verified Organizer'}
              </h4>
              <p style="font-size:0.85rem; color:var(--muted-gold);">Official Event Creator on EventHub</p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: BOOKING BOX -->
      <div class="detail-sidebar-col">
        <div class="booking-card">
          <div style="font-size:0.82rem; color:var(--muted-gold); text-transform:uppercase; letter-spacing:0.05em;">
            Ticket Price
          </div>
          <div class="price-tag">${EventHub.formatCurrency(ev.fee)}</div>

          <div style="margin-bottom:24px;">
            <div class="flex-between" style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:6px;">
              <span>Seat Availability</span>
              <span>${ev.availableSeats} of ${ev.totalSeats} remaining</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width:${seatsPct}%"></div>
            </div>
          </div>

          <div style="margin-bottom:28px;">
            <div class="booking-perk"><i class="fa-solid fa-qrcode"></i> Instant Digital QR Pass on confirmation</div>
            <div class="booking-perk"><i class="fa-solid fa-shield-halved"></i> Verified & Secure Venue Check-in</div>
            <div class="booking-perk"><i class="fa-solid fa-bell"></i> SMS & In-app reminder notifications</div>
          </div>

          ${
            existingReg
              ? `<button class="btn btn-outline btn-full" onclick="openTicketModal('${existingReg.ticketCode || 'EH-TKT-CONFIRMED'}')">
                   <i class="fa-solid fa-ticket"></i> View Your Ticket Pass
                 </button>`
              : ev.availableSeats <= 0
              ? `<button class="btn btn-outline btn-full" disabled style="opacity:0.6; cursor:not-allowed;">
                   Sold Out
                 </button>`
              : `<button class="btn btn-primary btn-full" onclick="openBookingModal()">
                   <i class="fa-solid fa-bolt"></i> Register Now
                 </button>`
          }
        </div>
      </div>
    `;

    // Initialize Leaflet map for venue
    if (ev.lat && ev.lng) {
      setTimeout(() => {
        EventMap.focusVenue('venue-detail-map', ev.lat, ev.lng, ev.venue, `${ev.venue}, ${ev.location}`);
      }, 100);
    }
  }
}

function openBookingModal() {
  const user = EventHub.getCurrentUser();
  if (!user) {
    EventHub.showToast('Please login to complete your registration.', 'warning');
    setTimeout(() => {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
    }, 1000);
    return;
  }

  document.getElementById('booking-modal-title').innerText = `Register for ${currentEvent.title}`;
  document.getElementById('booking-attendee-name').value = user.name;
  document.getElementById('booking-attendee-email').value = user.email;
  document.getElementById('booking-seats-count').value = 1;
  document.getElementById('booking-total-price').innerText = EventHub.formatCurrency(currentEvent.fee);

  document.getElementById('modal-booking').classList.add('active');
}

function closeBookingModal() {
  document.getElementById('modal-booking')?.classList.remove('active');
}

function updateBookingTotal() {
  const seats = parseInt(document.getElementById('booking-seats-count').value, 10) || 1;
  const total = (currentEvent.fee || 0) * seats;
  document.getElementById('booking-total-price').innerText = EventHub.formatCurrency(total);
}

function submitBooking(event) {
  event.preventDefault();
  const user = EventHub.getCurrentUser();
  if (!user) return;

  const seats = parseInt(document.getElementById('booking-seats-count').value, 10) || 1;
  if (seats > currentEvent.availableSeats) {
    EventHub.showToast(`Only ${currentEvent.availableSeats} seats remaining!`, 'error');
    return;
  }

  const btn = document.getElementById('btn-submit-booking');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirming Reservation...';

  setTimeout(() => {
    // Deduct seats
    const allEvents = EventHub.getEvents();
    const evIndex = allEvents.findIndex(e => e.id === currentEvent.id);
    if (evIndex !== -1) {
      allEvents[evIndex].availableSeats -= seats;
      EventHub.saveEvents(allEvents);
      currentEvent = allEvents[evIndex];
    }

    // Create Registration Record
    const regs = EventHub.getRegistrations();
    const ticketCode = `EH-${currentEvent.category.slice(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReg = {
      id: 'r' + Date.now().toString(36),
      userId: user.id,
      eventId: currentEvent.id,
      seatsCount: seats,
      totalPaid: currentEvent.fee * seats,
      status: 'registered',
      paymentStatus: currentEvent.fee > 0 ? 'paid' : 'free',
      ticketCode: ticketCode,
      createdAt: new Date().toISOString()
    };
    regs.push(newReg);
    EventHub.saveRegistrations(regs);

    closeBookingModal();
    EventHub.showToast('Registration Confirmed! Ticket Generated.', 'success');
    renderEventDetail(currentEvent);
    openTicketModal(ticketCode);
  }, 800);
}

function openTicketModal(ticketCode) {
  const user = EventHub.getCurrentUser();
  document.getElementById('ticket-modal-code').innerText = ticketCode;
  document.getElementById('ticket-modal-event').innerText = currentEvent.title;
  document.getElementById('ticket-modal-holder').innerText = user ? user.name : 'Attendee';
  document.getElementById('ticket-modal-date').innerText = `${EventHub.formatDate(currentEvent.date)} @ ${EventHub.formatTime(currentEvent.time)}`;
  document.getElementById('ticket-modal-venue').innerText = currentEvent.venue;

  // Generate QR pattern
  const qrBox = document.getElementById('ticket-qr-box');
  if (qrBox) {
    const encoded = encodeURIComponent(`https://eventhub.com/verify?code=${ticketCode}`);
    qrBox.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encoded}" alt="QR Pass" style="width:130px;height:130px;" />`;
  }

  document.getElementById('modal-ticket').classList.add('active');
}

function closeTicketModal() {
  document.getElementById('modal-ticket')?.classList.remove('active');
}
