/* =============================================================================
   EventHub — events.js (Events Catalog, Filter & Search Controller)
   ============================================================================= */

let currentView = 'grid'; // 'grid' | 'list' | 'map'
let activeCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  EventHub.renderNavbar('events');

  // Read URL query parameters if redirected from home search
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  const cat = params.get('cat') || 'all';
  const city = params.get('city') || '';

  if (q) document.getElementById('filter-search').value = q;
  if (city) document.getElementById('filter-city').value = city;
  activeCategory = cat;

  renderCategoryChips();
  renderEvents();

  // Attach Filter Listeners
  document.getElementById('filter-search')?.addEventListener('input', renderEvents);
  document.getElementById('filter-city')?.addEventListener('input', renderEvents);
  document.getElementById('filter-sort')?.addEventListener('change', renderEvents);
  document.getElementById('filter-price')?.addEventListener('change', renderEvents);
});

function renderCategoryChips() {
  const container = document.getElementById('category-chips');
  if (!container) return;

  let html = `
    <button class="filter-chip ${activeCategory === 'all' ? 'active' : ''}" onclick="selectCategory('all')">
      All Categories
    </button>
  `;

  EventHub.CATEGORIES.forEach(c => {
    const isAct = activeCategory.toLowerCase() === c.name.toLowerCase();
    html += `
      <button class="filter-chip ${isAct ? 'active' : ''}" onclick="selectCategory('${c.name}')">
        <i class="${c.icon}"></i> ${c.name}
      </button>
    `;
  });

  container.innerHTML = html;
}

function selectCategory(cat) {
  activeCategory = cat;
  renderCategoryChips();
  renderEvents();
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`view-${view}`)?.classList.add('active');

  const gridContainer = document.getElementById('events-grid-view');
  const mapContainer = document.getElementById('events-map-view');

  if (view === 'map') {
    if (gridContainer) gridContainer.style.display = 'none';
    if (mapContainer) {
      mapContainer.style.display = 'block';
      EventMap.init('events-map');
      const filtered = getFilteredEvents();
      EventMap.renderEvents(filtered);
    }
  } else {
    if (mapContainer) mapContainer.style.display = 'none';
    if (gridContainer) {
      gridContainer.style.display = 'block';
      renderEvents();
    }
  }
}

function getFilteredEvents() {
  const query = (document.getElementById('filter-search')?.value || '').toLowerCase();
  const city = (document.getElementById('filter-city')?.value || '').toLowerCase();
  const price = document.getElementById('filter-price')?.value || 'all';
  const sort = document.getElementById('filter-sort')?.value || 'date';

  let events = EventHub.getEvents().filter(e => e.status === 'approved');

  // Filter Category
  if (activeCategory !== 'all') {
    events = events.filter(e => e.category.toLowerCase() === activeCategory.toLowerCase());
  }

  // Filter Search Keyword
  if (query) {
    events = events.filter(e => e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query));
  }

  // Filter Location
  if (city) {
    events = events.filter(e => e.location.toLowerCase().includes(city) || e.venue.toLowerCase().includes(city));
  }

  // Filter Price
  if (price === 'free') {
    events = events.filter(e => e.fee === 0);
  } else if (price === 'paid') {
    events = events.filter(e => e.fee > 0);
  }

  // Sorting
  if (sort === 'date') {
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sort === 'price-low') {
    events.sort((a, b) => a.fee - b.fee);
  } else if (sort === 'price-high') {
    events.sort((a, b) => b.fee - a.fee);
  } else if (sort === 'seats') {
    events.sort((a, b) => b.availableSeats - a.availableSeats);
  }

  return events;
}

function renderEvents() {
  const container = document.getElementById('events-grid-view');
  const countLabel = document.getElementById('events-count');
  if (!container) return;

  const events = getFilteredEvents();
  if (countLabel) countLabel.innerText = `${events.length} Events Found`;

  if (events.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:60px 20px;">
        <i class="fa-solid fa-calendar-xmark" style="font-size:3rem; color:var(--muted-gold); margin-bottom:16px;"></i>
        <h3 style="font-family:'Playfair Display',serif; color:var(--cream); margin-bottom:8px;">No matching events</h3>
        <p style="color:var(--text-secondary); margin-bottom:20px;">Try adjusting your filters or search keywords.</p>
        <button class="btn btn-outline" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  if (currentView === 'grid') {
    container.className = 'grid-3';
    container.innerHTML = events.map(ev => {
      const bg = EventHub.getCategoryColor(ev.category);
      const seatsPct = Math.round((ev.availableSeats / ev.totalSeats) * 100);
      return `
        <div class="card event-card" onclick="window.location.href='event-detail.html?id=${ev.id}'" style="cursor:pointer;">
          <div class="event-card-header" style="background:${bg}">
            <span class="badge" style="background:rgba(26,26,26,0.75); color:var(--gold-light); border:1px solid rgba(212,175,55,0.4); backdrop-filter:blur(8px);">
              ${EventHub.getCategoryIcon(ev.category)} ${ev.category}
            </span>
          </div>
          <div class="event-card-body">
            <h3>${ev.title}</h3>
            <div class="event-meta"><i class="fa-regular fa-calendar" style="color:var(--gold);"></i> ${EventHub.formatDate(ev.date)} • ${EventHub.formatTime(ev.time)}</div>
            <div class="event-meta"><i class="fa-solid fa-location-dot" style="color:var(--gold);"></i> ${ev.venue}, ${ev.location}</div>
            
            <div class="progress-bar mt-4">
              <div class="progress-bar-fill" style="width:${seatsPct}%"></div>
            </div>
            <div style="font-size:0.75rem; color:var(--muted-gold); display:flex; justify-content:space-between; margin-top:4px;">
              <span>${ev.availableSeats} seats left</span>
              <span>${seatsPct}% remaining</span>
            </div>
          </div>
          <div class="event-card-footer">
            <div style="font-weight:700; font-size:1.15rem; color:var(--gold-light); font-family:'Playfair Display',serif;">
              ${EventHub.formatCurrency(ev.fee)}
            </div>
            <button class="btn btn-primary-sm">Details</button>
          </div>
        </div>
      `;
    }).join('');
  } else if (currentView === 'list') {
    container.className = 'events-list-wrapper';
    container.innerHTML = events.map(ev => {
      const bg = EventHub.getCategoryColor(ev.category);
      return `
        <div class="events-list-item" onclick="window.location.href='event-detail.html?id=${ev.id}'">
          <div class="list-item-color" style="background:${bg}"></div>
          <div class="list-item-body">
            <div class="flex-between">
              <h3 style="font-family:'Playfair Display',serif; color:var(--cream);">${ev.title}</h3>
              <div style="font-weight:700; font-size:1.2rem; color:var(--gold-light); font-family:'Playfair Display',serif;">
                ${EventHub.formatCurrency(ev.fee)}
              </div>
            </div>
            <div style="display:flex; gap:20px; margin-top:10px; font-size:0.85rem; color:var(--text-secondary); flex-wrap:wrap;">
              <div><i class="fa-regular fa-calendar" style="color:var(--gold);"></i> ${EventHub.formatDate(ev.date)}</div>
              <div><i class="fa-solid fa-clock" style="color:var(--gold);"></i> ${EventHub.formatTime(ev.time)}</div>
              <div><i class="fa-solid fa-location-dot" style="color:var(--gold);"></i> ${ev.venue}, ${ev.location}</div>
              <div><i class="fa-solid fa-ticket" style="color:var(--gold);"></i> ${ev.availableSeats} seats available</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function resetFilters() {
  document.getElementById('filter-search').value = '';
  document.getElementById('filter-city').value = '';
  document.getElementById('filter-price').value = 'all';
  document.getElementById('filter-sort').value = 'date';
  activeCategory = 'all';
  renderCategoryChips();
  renderEvents();
}
