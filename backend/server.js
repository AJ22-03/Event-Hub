const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const sessions = new Map();

const seedData = {
  users: [
    { id: 'u1', name: 'Admin User', email: 'admin@eventhub.com', password: 'admin123', role: 'admin', mobile: '9000000001', status: 'active', createdAt: '2026-01-01' },
    { id: 'u2', name: 'Event Pro', email: 'organizer@eventhub.com', password: 'org123', role: 'organizer', mobile: '9000000002', status: 'active', createdAt: '2026-01-15' },
    { id: 'u3', name: 'John Doe', email: 'user@eventhub.com', password: 'user123', role: 'user', mobile: '9000000003', status: 'active', createdAt: '2026-02-10' }
  ],
  events: [
    { id: 'e1', title: 'Sunburn Festival 2026', category: 'Music', date: '2026-10-15', time: '18:00', endTime: '23:00', venue: 'DY Patil Stadium', location: 'Mumbai', lat: 19.076, lng: 72.8777, totalSeats: 2000, availableSeats: 1450, fee: 1500, description: 'India’s biggest electronic music festival returns!', organizerId: 'u2', organizerName: 'Event Pro', status: 'approved', createdAt: '2026-09-01' },
    { id: 'e2', title: 'TechFest India 2026', category: 'Tech', date: '2026-10-22', time: '09:00', endTime: '18:00', venue: 'Bangalore International Exhibition Centre', location: 'Bangalore', lat: 12.9716, lng: 77.5946, totalSeats: 500, availableSeats: 210, fee: 500, description: 'The biggest technology conference in South Asia.', organizerId: 'u2', organizerName: 'Event Pro', status: 'approved', createdAt: '2026-09-02' },
    { id: 'e3', title: 'Delhi Half Marathon 2026', category: 'Sports', date: '2026-11-05', time: '06:00', endTime: '12:00', venue: 'Jawaharlal Nehru Stadium', location: 'Delhi', lat: 28.6139, lng: 77.209, totalSeats: 3000, availableSeats: 2800, fee: 0, description: 'Run through the heart of Delhi in this iconic half marathon.', organizerId: 'u2', organizerName: 'Event Pro', status: 'approved', createdAt: '2026-09-03' },
    { id: 'e4', title: 'Chennai Food Carnival', category: 'Food', date: '2026-10-30', time: '11:00', endTime: '21:00', venue: 'Marina Beach Grounds', location: 'Chennai', lat: 13.0827, lng: 80.2707, totalSeats: 1000, availableSeats: 680, fee: 200, description: 'A celebration of South Indian cuisine and beyond.', organizerId: 'u2', organizerName: 'Event Pro', status: 'approved', createdAt: '2026-09-04' }
  ],
  registrations: [
    { id: 'r1', userId: 'u3', eventId: 'e1', status: 'registered', paymentStatus: 'pending', paymentProof: 'TXN123456', createdAt: '2026-09-07' },
    { id: 'r2', userId: 'u3', eventId: 'e3', status: 'registered', paymentStatus: 'free', paymentProof: '', createdAt: '2026-09-07' }
  ],
  notifications: [
    { id: 'n1', userId: 'u3', message: 'You have successfully registered for Sunburn Festival 2026!', type: 'success', read: false, createdAt: '2026-09-07T10:00:00Z' }
  ]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = String(stored).split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return expected.length === actual.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function loadDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const initial = clone(seedData);
    initial.users = initial.users.map((user) => ({ ...user, password: hashPassword(user.password) }));
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

let database = loadDatabase();

function saveDatabase() {
  const temporary = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(database, null, 2));
  fs.renameSync(temporary, DATA_FILE);
}

function send(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  response.end(JSON.stringify(body));
}

function fail(response, status, message) {
  send(response, status, { error: message });
}

function serveFrontend(url, response) {
  const requestedPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(FRONTEND_DIR, `.${requestedPath}`);
  if (!filePath.startsWith(`${path.resolve(FRONTEND_DIR)}${path.sep}`)) {
    return fail(response, 403, 'Forbidden');
  }

  fs.readFile(filePath, (error, content) => {
    if (error) return fail(response, error.code === 'ENOENT' ? 404 : 500, 'Frontend file not found');
    const contentTypes = {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8'
    };
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy(new Error('Request body is too large'));
    });
    request.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Request body must be valid JSON'));
      }
    });
    request.on('error', reject);
  });
}

function authenticate(request) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const userId = sessions.get(token);
  return userId ? database.users.find((user) => user.id === userId && user.status === 'active') : null;
}

function requireUser(request, response) {
  const user = authenticate(request);
  if (!user) fail(response, 401, 'Authentication required');
  return user;
}

function requireRole(user, response, roles) {
  if (!roles.includes(user.role)) {
    fail(response, 403, 'You do not have permission to perform this action');
    return false;
  }
  return true;
}

function id(prefix) {
  return `${prefix}${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`;
}

function validEventInput(input) {
  const required = ['title', 'category', 'date', 'time', 'venue', 'location'];
  return required.every((field) => typeof input[field] === 'string' && input[field].trim());
}

async function handle(request, response) {
  if (request.method === 'OPTIONS') return send(response, 204, {});
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const parts = url.pathname.split('/').filter(Boolean);
  const body = ['POST', 'PUT', 'PATCH'].includes(request.method) ? await readBody(request) : {};

  if (!url.pathname.startsWith('/api/')) return serveFrontend(url, response);
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return send(response, 200, { status: 'ok', service: 'event-hub-api' });
  }
  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const user = database.users.find((candidate) => candidate.email.toLowerCase() === String(body.email || '').toLowerCase());
    if (!user || !verifyPassword(String(body.password || ''), user.password) || user.status !== 'active') {
      return fail(response, 401, 'Invalid email or password');
    }
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, user.id);
    return send(response, 200, { token, user: publicUser(user) });
  }
  if (request.method === 'POST' && url.pathname === '/api/auth/register') {
    if (!body.name || !body.email || !body.password || !body.mobile) return fail(response, 400, 'Name, email, mobile, and password are required');
    if (database.users.some((user) => user.email.toLowerCase() === String(body.email).toLowerCase())) return fail(response, 409, 'Email already registered');
    const user = { id: id('u'), name: String(body.name).trim(), email: String(body.email).trim().toLowerCase(), mobile: String(body.mobile).trim(), password: hashPassword(String(body.password)), role: body.role === 'organizer' ? 'organizer' : 'user', status: 'active', createdAt: new Date().toISOString().slice(0, 10) };
    database.users.push(user);
    saveDatabase();
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, user.id);
    return send(response, 201, { token, user: publicUser(user) });
  }
  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    const token = (request.headers.authorization || '').replace(/^Bearer /, '');
    sessions.delete(token);
    return send(response, 200, { message: 'Logged out' });
  }
  if (request.method === 'GET' && url.pathname === '/api/auth/me') {
    const user = requireUser(request, response);
    return user ? send(response, 200, { user: publicUser(user) }) : undefined;
  }

  if (parts[0] === 'api' && parts[1] === 'events') {
    if (request.method === 'GET' && parts.length === 2) {
      const status = url.searchParams.get('status') || 'approved';
      const events = database.events.filter((event) => status === 'all' ? true : event.status === status);
      return send(response, 200, { events });
    }
    if (request.method === 'GET' && parts.length === 3) {
      const event = database.events.find((candidate) => candidate.id === parts[2]);
      return event ? send(response, 200, { event }) : fail(response, 404, 'Event not found');
    }
    const user = requireUser(request, response);
    if (!user) return;
    if (request.method === 'POST' && parts.length === 2) {
      if (!requireRole(user, response, ['admin', 'organizer'])) return;
      if (!validEventInput(body)) return fail(response, 400, 'Title, category, date, time, venue, and location are required');
      const event = { ...body, id: id('e'), organizerId: user.id, organizerName: user.name, status: user.role === 'admin' ? 'approved' : 'pending', totalSeats: Number(body.totalSeats || 0), availableSeats: Number(body.totalSeats || 0), fee: Number(body.fee || 0), createdAt: new Date().toISOString().slice(0, 10) };
      database.events.push(event);
      saveDatabase();
      return send(response, 201, { event });
    }
    const event = database.events.find((candidate) => candidate.id === parts[2]);
    if (!event) return fail(response, 404, 'Event not found');
    if (event.organizerId !== user.id && !requireRole(user, response, ['admin'])) return;
    if (request.method === 'PUT') {
      Object.assign(event, body, { id: event.id, organizerId: event.organizerId, organizerName: event.organizerName, availableSeats: Math.min(event.availableSeats, Number(body.totalSeats || event.totalSeats)) });
      saveDatabase();
      return send(response, 200, { event });
    }
    if (request.method === 'DELETE') {
      database.events = database.events.filter((candidate) => candidate.id !== event.id);
      saveDatabase();
      return send(response, 200, { message: 'Event deleted' });
    }
  }

  if (parts[0] === 'api' && parts[1] === 'registrations') {
    const user = requireUser(request, response);
    if (!user) return;
    if (request.method === 'GET') {
      const registrations = user.role === 'admin' ? database.registrations : database.registrations.filter((registration) => registration.userId === user.id);
      return send(response, 200, { registrations });
    }
    if (request.method === 'POST') {
      const event = database.events.find((candidate) => candidate.id === body.eventId && candidate.status === 'approved');
      if (!event) return fail(response, 404, 'Approved event not found');
      if (event.availableSeats < 1) return fail(response, 409, 'This event is sold out');
      if (database.registrations.some((registration) => registration.eventId === event.id && registration.userId === user.id && registration.status === 'registered')) return fail(response, 409, 'You are already registered for this event');
      const registration = { id: id('r'), userId: user.id, eventId: event.id, status: 'registered', paymentStatus: event.fee > 0 ? 'pending' : 'free', paymentProof: String(body.paymentProof || ''), createdAt: new Date().toISOString() };
      event.availableSeats -= 1;
      database.registrations.push(registration);
      database.notifications.push({ id: id('n'), userId: user.id, message: `You have successfully registered for ${event.title}!`, type: 'success', read: false, createdAt: new Date().toISOString() });
      saveDatabase();
      return send(response, 201, { registration });
    }
  }

  if (parts[0] === 'api' && parts[1] === 'notifications' && request.method === 'GET') {
    const user = requireUser(request, response);
    if (!user) return;
    return send(response, 200, { notifications: database.notifications.filter((notification) => notification.userId === user.id) });
  }
  return fail(response, 404, 'Route not found');
}

const server = http.createServer((request, response) => {
  handle(request, response).catch((error) => {
    console.error(error);
    fail(response, error.message === 'Request body must be valid JSON' ? 400 : 500, error.message);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`EventHub API running at http://${HOST}:${PORT}`);
});
