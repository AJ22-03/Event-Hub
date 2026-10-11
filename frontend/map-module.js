/* =============================================================================
   EventHub — map-module.js (Leaflet.js Map Integration)
   Provides interactive map rendering, custom markers, bounds auto-fit & popups.
   ============================================================================= */

const EventMap = (() => {
  'use strict';

  let mapInstance = null;
  let markersLayer = null;

  /**
   * Initializes a Leaflet map in a target DOM element.
   * @param {string} elementId - The ID of the container element
   * @param {Array<number>} center - [lat, lng] default coordinates
   * @param {number} zoom - Default zoom level
   */
  function init(elementId, center = [20.5937, 78.9629], zoom = 5) {
    if (typeof L === 'undefined') {
      console.warn('Leaflet.js is not loaded on this page.');
      return null;
    }

    const container = document.getElementById(elementId);
    if (!container) return null;

    // Destroy existing instance if re-initializing
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }

    mapInstance = L.map(elementId, {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView(center, zoom);

    // Dark luxury themed CartoDB / OpenStreetMap tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
    return mapInstance;
  }

  /**
   * Renders an array of events as interactive markers on the map.
   * @param {Array<Object>} events - Event objects with lat, lng, title, etc.
   */
  function renderEvents(events) {
    if (!mapInstance || !markersLayer) return;

    markersLayer.clearLayers();
    const bounds = [];

    events.forEach(ev => {
      if (ev.lat && ev.lng) {
        bounds.push([ev.lat, ev.lng]);

        const marker = L.marker([ev.lat, ev.lng]).addTo(markersLayer);
        const popupContent = `
          <div>
            <h4>${ev.title}</h4>
            <div style="font-size:0.8rem; color:#c5a880; margin-bottom:4px;">
              <i class="fa-solid fa-location-dot"></i> ${ev.venue}, ${ev.location}
            </div>
            <div style="font-size:0.8rem; color:#fff; margin-bottom:6px;">
              <i class="fa-regular fa-calendar"></i> ${EventHub.formatDate(ev.date)} • ${EventHub.formatTime(ev.time)}
            </div>
            <div style="font-size:0.85rem; font-weight:700; color:#F5D77F; margin-bottom:8px;">
              Fee: ${EventHub.formatCurrency(ev.fee)}
            </div>
            <a href="event-detail.html?id=${ev.id}" class="btn-primary-sm" style="display:inline-block; text-decoration:none;">
              View Details & Book
            </a>
          </div>
        `;
        marker.bindPopup(popupContent);
      }
    });

    if (bounds.length > 0) {
      mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }

    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 150);
  }

  /**
   * Focuses the map on a single venue with a pin.
   */
  function focusVenue(elementId, lat, lng, venueName, address) {
    if (typeof L === 'undefined') return;
    const map = init(elementId, [lat, lng], 14);
    if (!map) return;

    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`
      <div>
        <h4>${venueName}</h4>
        <p style="font-size:0.82rem; color:#c4b5a0;">${address}</p>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" style="color:#D4AF37; font-size:0.8rem; text-decoration:underline;">
          Get Directions &rarr;
        </a>
      </div>
    `).openPopup();
  }

  return {
    init,
    renderEvents,
    focusVenue
  };
})();
