# EventHub — Intelligent Event Discovery, Booking & Live Engagement Platform

> **Comprehensive Project Documentation & Technical Architecture Manual**  
> Incorporating Modular Web Architecture, Open-Source Geolocation, Relational Database Design, AI Event Concierge, and the SRS Quiz & Gamification System.

---

## 1. Quick Start: How to Run All Files at Once

You can run the entire EventHub platform with **one single command**!

### Method A: One-Click Windows Launcher (Easiest)
1. Navigate to the project root directory: `C:\EventHub\Event-Hub\`
2. Double-click the file **`run.bat`** (or `start-eventhub.bat`).
3. It will automatically initialize the database, launch your web browser, and start the local server on:
   **`http://localhost:3000`**

### Method B: Terminal / PowerShell Command (Python 3.13)
Open your terminal inside `C:\EventHub\Event-Hub\` and run:
```bash
python backend/server.py
```
Then open [http://localhost:3000](http://localhost:3000) in any web browser.

### Method C: Node.js (If Installed)
```bash
node backend/server.js
```

### Method D: Standalone Browser Opening (Zero Server Required)
Because all frontend JavaScript modules include built-in HTML5 LocalStorage synchronization, you can even double-click `frontend/index.html` directly in your file explorer to open it in Chrome, Edge, or Firefox!

---

## 2. Leaflet.js vs. Google Maps: Which is Suitable?

| Feature / Comparison Point | **Leaflet.js + OpenStreetMap (Recommended)** | **Google Maps JavaScript API** |
| :--- | :--- | :--- |
| **Cost & Billing** | **100% Free Forever** (Open-source) | Requires Credit Card / Google Cloud Billing account |
| **API Keys** | **No API key required** — works immediately | Mandatory API key with strict domain/referrer restrictions |
| **Localhost / Offline Demo** | Works seamlessly on `localhost:3000` and offline | Often throws `"For development purposes only"` watermark error |
| **Performance & Bundle Size** | Ultra-lightweight (**~40 KB**) | Heavy (**~1.5 MB** download with numerous background trackers) |
| **Custom Styling & Theming** | Fully compatible with dark luxury map tiles (CartoDB Dark Matter) | Styling requires JSON theme configuration in Cloud Console |
| **Academic / Viva Suitability** | **Ideal**: Evaluators can run it anywhere without API quotas | Risky: Can fail if billing quota is reached or key expires |

### Verdict & Recommendation
**Leaflet.js is far more suitable and reliable** for EventHub. We have fully integrated Leaflet.js with custom dark tiles, custom venue markers, auto-fit boundaries, popup event cards, and directions linking.

---

## 3. Modular File Architecture & Interlinking

Every module in EventHub is separated into its own HTML, CSS, and JS file, yet they are all interlinked through `js/app-core.js` and common CSS tokens:

```
Event-Hub/
├── backend/
│   ├── server.py              # Zero-dependency Python 3.13 server (Serves static + REST API)
│   ├── server.js              # Node.js server (Alternative)
│   ├── package.json           # Node configuration
│   └── data/database.json     # JSON database store
├── database/
│   ├── eventhub_schema.sql    # Relational SQL schema (MySQL & SQLite compatible)
│   ├── eventhub.db            # Pre-compiled binary SQLite database with 10 tables
│   ├── seed_database.py       # Python seeder script
│   └── README_DATABASE.md     # Setup guide for XAMPP / phpMyAdmin / DB Browser
├── frontend/
│   ├── index.html             # Landing & Discovery Home Page
│   ├── events.html            # Events Catalog with Sidebar Filters & Map Toggle
│   ├── event-detail.html      # Event Overview, Seat Booking & Digital QR Pass
│   ├── dashboard.html         # User, Organizer & Admin Management Dashboard
│   ├── login.html             # Split-screen Login & Registration
│   ├── quiz.html              # Live Event Trivia Arena (Matching SRS Specifications)
│   ├── ai-assistant.html      # EventGenie AI Concierge & Smart Recommender
│   ├── css/
│   │   ├── common.css         # Shared Luxury Heritage design tokens, navbar, buttons, toast
│   │   ├── home.css           # Hero section, glowing orbs, 3D card stack
│   │   ├── events.css         # Filter chips, grid/list toggles, map layout
│   │   ├── event-detail.css   # Hero banner, booking widget, ticket pass styling
│   │   ├── dashboard.css      # Sidebar nav, user avatar, metric cards, tables
│   │   ├── auth.css           # Auth split layout, floating shapes, password meter
│   │   ├── quiz.css           # Quiz cards, 20s timer, option buttons, results circle
│   │   └── ai-assistant.css   # Chat window, bubble avatars, prompt chips
│   └── js/
│       ├── app-core.js        # Shared database, auth sessions, formatters, toast alerts
│       ├── home.js            # Home page controller, category & featured renderers
│       ├── events.js          # Catalog filtering, live keyword search, sorting
│       ├── event-detail.js    # Single event view, registration modal, QR generator
│       ├── dashboard.js       # Role-based dashboard (Attendee / Organizer / Admin)
│       ├── auth.js            # Login / Signup validation, demo autofill
│       ├── map-module.js      # Leaflet.js controller (pins, popups, venue zoom)
│       ├── quiz.js            # Quiz engine implementing SRS specifications
│       └── ai-assistant.js    # EventGenie AI natural language intent parser
├── quiz_console.py            # Python CLI Quiz program (Page 2 of Quiz SRS)
├── run.bat                    # Windows One-Click Double-Clickable Launcher
├── start-eventhub.bat         # Alias Launcher
└── README.md                  # Project Documentation
```

---

## 4. Innovation: Standout New Features

To elevate EventHub beyond conventional event listing portals, the following innovative systems are implemented:

1. **EventGenie AI Concierge (`ai-assistant.html`)**:
   - A conversational AI assistant that understands natural language queries (e.g., *"Find free events"*, *"I want a music festival in Mumbai"*, *"Events under ₹500"*).
   - Generates instant event card embeds with one-click booking triggers.
   - Provides weekend itineraries and guideline explanations.

2. **Live Event Quiz & Gamification Arena (`quiz.html`)**:
   - **Directly satisfies the attached SRS document**:
     - *Welcome message & rules*: Clear introduction and scoring criteria.
     - *Input acceptance & validation*: Strict multi-choice validation (A, B, C, D).
     - *Score tracking & timer*: 20-second countdown with running points tally.
     - *Immediate feedback*: Real-time green/red answer reveal with educational explanation.
     - *Final result calculation*: Total score, percentage accuracy, and digital badge reward.
   - **Gamification reward**: Scoring &ge;80% unlocks an exclusive 20% discount coupon (`TRIVIA20`) for event ticket bookings!

3. **Digital QR Code Security Ticket Pass**:
   - Every confirmed registration generates a unique ticket code (`EH-SUNB-9918`) and a dynamic QR code for seamless venue scanning and check-in.

4. **Leaflet Geolocation & Venue Route Finder**:
   - Real-time venue mapping with interactive popup cards and direct links to Google Maps navigation.

---

## 5. Database Schema & Tool Selection

### Recommended Tools
1. **MySQL / MariaDB via XAMPP (phpMyAdmin)**:
   - Standard choice for web development and university viva submissions.
   - Import `database/eventhub_schema.sql` via phpMyAdmin in 3 clicks.
2. **DB Browser for SQLite**:
   - Zero-installation GUI to inspect the included `database/eventhub.db` file.
3. **Python Built-In `sqlite3`**:
   - Run `python database/seed_database.py` to regenerate the database anytime.

### Core Tables & Attributes

| Table | Primary Key | Foreign Keys | Key Attributes |
| :--- | :--- | :--- | :--- |
| `users` | `user_id` | - | `full_name`, `email`, `password_hash`, `role`, `status` |
| `categories` | `category_id` | - | `name`, `slug`, `icon`, `color_hex` |
| `venues` | `venue_id` | - | `name`, `address`, `city`, `latitude`, `longitude`, `capacity` |
| `events` | `event_id` | `category_id`, `organizer_id`, `venue_id` | `title`, `event_date`, `start_time`, `total_seats`, `available_seats`, `ticket_fee`, `status` |
| `registrations` | `registration_id` | `user_id`, `event_id` | `seats_count`, `total_paid`, `payment_status`, `transaction_ref` |
| `tickets` | `ticket_id` | `registration_id` | `ticket_code`, `qr_token`, `attendee_name`, `is_checked_in` |
| `quiz_categories` | `quiz_cat_id` | - | `title`, `description`, `icon` |
| `quiz_questions` | `question_id` | `quiz_cat_id` | `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation` |
| `quiz_attempts` | `attempt_id` | `user_id`, `quiz_cat_id` | `score`, `total_questions`, `percentage`, `completed_at` |
| `notifications` | `notification_id` | `user_id` | `title`, `message`, `type`, `is_read` |

---

## 6. Pre-Configured Demo Credentials

For quick evaluation and role testing:

- **Attendee Account**: `user@eventhub.com` / `user123`
- **Organizer Account**: `organizer@eventhub.com` / `org123`
- **Administrator Account**: `admin@eventhub.com` / `admin123`
