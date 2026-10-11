/* =============================================================================
   EventHub — ai-assistant.js (EventGenie AI Concierge Controller)
   Intelligent natural language query processing & event recommendations.
   ============================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  EventHub.renderNavbar('ai');

  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-user-input');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = (input.value || '').trim();
      if (!message) return;
      sendMessage(message);
      input.value = '';
    });
  }

  // Welcome message if chat empty
  const msgArea = document.getElementById('ai-messages-area');
  if (msgArea && msgArea.children.length === 0) {
    appendBotMessage(
      "Hello! I am **EventGenie AI**, your personalized Event Concierge for EventHub. 🌟\n\n" +
      "I can help you find curated events by city, budget, or mood, plan your weekend itinerary, or answer questions about venue guidelines. How can I assist you today?"
    );
  }
});

function sendPrompt(promptText) {
  const input = document.getElementById('ai-user-input');
  if (input) {
    input.value = promptText;
    sendMessage(promptText);
    input.value = '';
  }
}

function sendMessage(text) {
  appendUserMessage(text);

  // Show typing indicator
  const typingId = showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator(typingId);
    processAIResponse(text);
  }, 750);
}

function appendUserMessage(text) {
  const container = document.getElementById('ai-messages-area');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.innerHTML = `
    <div class="bubble-avatar"><i class="fa-solid fa-user"></i></div>
    <div class="bubble-content">${escapeHTML(text)}</div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function appendBotMessage(markdownText, recommendedEvents = []) {
  const container = document.getElementById('ai-messages-area');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';

  let eventCardsHtml = '';
  if (recommendedEvents.length > 0) {
    eventCardsHtml = recommendedEvents.map(ev => `
      <div class="chat-event-recommendation">
        <div>
          <h5>${ev.title}</h5>
          <div style="font-size:0.8rem; color:#c5a880;">
            <i class="fa-solid fa-location-dot"></i> ${ev.venue}, ${ev.location} • 
            <i class="fa-regular fa-calendar"></i> ${EventHub.formatDate(ev.date)}
          </div>
          <div style="font-size:0.82rem; font-weight:700; color:#F5D77F; margin-top:2px;">
            ${EventHub.formatCurrency(ev.fee)} • ${ev.availableSeats} seats left
          </div>
        </div>
        <a href="event-detail.html?id=${ev.id}" class="btn-primary-sm" style="text-decoration:none; margin-left:12px;">
          Book Now
        </a>
      </div>
    `).join('');
  }

  // Simple Markdown parser
  const formatted = markdownText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  bubble.innerHTML = `
    <div class="bubble-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
    <div class="bubble-content">
      <div>${formatted}</div>
      ${eventCardsHtml}
    </div>
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('ai-messages-area');
  if (!container) return null;

  const id = 'typing-' + Date.now();
  const bubble = document.createElement('div');
  bubble.id = id;
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = `
    <div class="bubble-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
    <div class="bubble-content" style="color:var(--muted-gold);">
      <i class="fa-solid fa-spinner fa-spin"></i> EventGenie is thinking...
    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

function processAIResponse(query) {
  const q = query.toLowerCase();
  const allEvents = EventHub.getEvents().filter(e => e.status === 'approved');

  // 1. Free Events Query
  if (q.includes('free') || q.includes('zero cost') || q.includes('no fee')) {
    const freeEvents = allEvents.filter(e => e.fee === 0);
    if (freeEvents.length > 0) {
      appendBotMessage(
        `I found **${freeEvents.length} Free Event(s)** currently open for registration! Check them out:`,
        freeEvents
      );
    } else {
      appendBotMessage("Currently all upcoming events have nominal registration fees, starting from ₹200!");
    }
    return;
  }

  // 2. City Specific Query
  const cities = ['mumbai', 'bangalore', 'delhi', 'chennai', 'pune', 'hyderabad'];
  const matchedCity = cities.find(c => q.includes(c));
  if (matchedCity) {
    const cityEvents = allEvents.filter(e => e.location.toLowerCase().includes(matchedCity));
    if (cityEvents.length > 0) {
      appendBotMessage(
        `Here are the premier experiences happening in **${matchedCity.toUpperCase()}**:`,
        cityEvents
      );
    } else {
      appendBotMessage(`I couldn't find events scheduled specifically in ${matchedCity.toUpperCase()} right now, but new listings are added daily!`);
    }
    return;
  }

  // 3. Category Queries (Music, Tech, Sports, Food, Art)
  const categories = ['music', 'tech', 'sport', 'food', 'art', 'business'];
  const matchedCat = categories.find(c => q.includes(c));
  if (matchedCat) {
    const catEvents = allEvents.filter(e => e.category.toLowerCase().includes(matchedCat));
    if (catEvents.length > 0) {
      appendBotMessage(
        `Great choice! Here are top curated **${matchedCat.toUpperCase()}** events you'll love:`,
        catEvents
      );
    } else {
      appendBotMessage(`I couldn't find events in that category today. Try exploring all events in our catalog!`);
    }
    return;
  }

  // 4. Budget Query
  if (q.includes('under') || q.includes('budget') || q.includes('cheap') || q.includes('below')) {
    const budgetEvents = allEvents.filter(e => e.fee <= 500);
    appendBotMessage(
      "Here are our most budget-friendly experiences (₹500 or below):",
      budgetEvents
    );
    return;
  }

  // 5. Quiz Query
  if (q.includes('quiz') || q.includes('trivia') || q.includes('discount')) {
    appendBotMessage(
      "Want to test your knowledge and win event discount vouchers? 🏆\n\n" +
      "You can visit our **Live Event Quiz Arena** to answer timed trivia in Tech, Music, and Sports! Score above 80% to earn the **Gold Master Badge** and 20% discount coupon.\n\n" +
      "👉 [Click here to enter Quiz Arena](quiz.html)"
    );
    return;
  }

  // Default Fallback
  appendBotMessage(
    "Based on current trends, here are our most popular upcoming events across music, tech, and sports:",
    allEvents.slice(0, 3)
  );
}

function escapeHTML(str) {
  const p = document.createElement('p');
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
}
