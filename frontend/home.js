/* =============================================================================
   EventHub — home.js (Home / Landing Page Controller)
   ============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Render Navigation
  EventHub.renderNavbar('home');

  // Load Categories Grid
  renderCategories();

  // Load Featured Events Showcase
  renderFeaturedEvents();

  // Initialize Leaflet Mini-Map Showcase
  initHomeMap();

  // Attach Search Event Handler
  const searchBtn = document.getElementById('btn-hero-search');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleHeroSearch);
  }
  const searchInput = document.getElementById('hero-keyword');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleHeroSearch();
    });
  }
});

function handleHeroSearch() {
  const keyword = (document.getElementById('hero-keyword')?.value || '').trim();
  const category = document.getElementById('hero-category')?.value || '';
  const city = (document.getElementById('hero-city')?.value || '').trim();

  const params = new URLSearchParams();
  if (keyword) params.append('q', keyword);
  if (category) params.append('cat', category);
  if (city) params.append('city', city);

  window.location.href = `events.html?${params.toString()}`;
}

function renderCategories() {
  const container = document.getElementById('category-grid');
  if (!container) return;

  container.innerHTML = EventHub.CATEGORIES.map(cat => `
    <div class="card category-card" onclick="window.location.href='events.html?cat=${encodeURIComponent(cat.name)}'">
      <div class="category-icon">
        <i class="${cat.icon}"></i>
      </div>
      <h3 style="font-size:1.15rem; color:var(--cream); margin-bottom:6px;">${cat.name}</h3>
      <p style="font-size:0.82rem; color:var(--text-secondary);">${cat.desc}</p>
    </div>
  `).join('');
}

function renderFeaturedEvents() {
  const container = document.getElementById('featured-events-grid');
  if (!container) return;

  const events = EventHub.getEvents().filter(e => e.status === 'approved').slice(0, 3);
  if (events.length === 0) {
    container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-secondary);">No events found.</div>';
    return;
  }

  container.innerHTML = events.map(ev => {
    const seatsPct = Math.round((ev.availableSeats / ev.totalSeats) * 100);
    const bg = EventHub.getCategoryColor(ev.category);
    return `
      <div class="card event-card" onclick="window.location.href='event-detail.html?id=${ev.id}'" style="cursor:pointer;">
        <div class="event-card-header" style="background:${bg}">
          <span class="badge" style="background:rgba(26,26,26,0.75); color:var(--gold-light); border:1px solid rgba(212,175,55,0.4); backdrop-filter:blur(8px);">
            ${EventHub.getCategoryIcon(ev.category)} ${ev.category}
          </span>
        </div>

        <div class="event-card-body">
          <h3>${ev.title}</h3>
          <div class="event-meta">
            <i class="fa-regular fa-calendar" style="color:var(--gold);"></i> ${EventHub.formatDate(ev.date)} • ${EventHub.formatTime(ev.time)}
          </div>
          <div class="event-meta">
            <i class="fa-solid fa-location-dot" style="color:var(--gold);"></i> ${ev.venue}, ${ev.location}
          </div>

          <div class="progress-bar mt-4">
            <div class="progress-bar-fill" style="width:${seatsPct}%"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--muted-gold); display:flex; justify-content:space-between; margin-top:4px;">
            <span>${ev.availableSeats} seats left</span>
            <span>${seatsPct}% remaining</span>
          </div>

          <p class="mt-4" style="color:var(--text-secondary); font-size:0.88rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${ev.description}
          </p>
        </div>

        <div class="event-card-footer">
          <div>
            <div style="font-size:0.72rem; color:var(--muted-gold);">Registration Fee</div>
            <div style="font-weight:700; font-size:1.15rem; color:var(--gold-light); font-family:'Playfair Display',serif;">
              ${EventHub.formatCurrency(ev.fee)}
            </div>
          </div>
          <button class="btn btn-primary-sm">
            <span>Details</span> <i class="fa-solid fa-arrow-right" style="font-size:0.75rem;"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function initHomeMap() {
  const mapEl = document.getElementById('home-mini-map');
  if (!mapEl) return;
  EventMap.init('home-mini-map');
  const events = EventHub.getEvents().filter(e => e.status === 'approved');
  EventMap.renderEvents(events);
}
