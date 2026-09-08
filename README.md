# EventHub backend

## Run locally

Requires Node.js 18 or newer. No external packages are required.

```bash
npm start
```

The API runs at `http://127.0.0.1:3000`.

## API

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/events?status=approved`
- `GET /api/events/:id`
- `POST /api/events` (organizer/admin)
- `PUT /api/events/:id` (event owner/admin)
- `DELETE /api/events/:id` (event owner/admin)
- `GET /api/registrations`
- `POST /api/registrations`
- `GET /api/notifications`

Send the login token as `Authorization: Bearer <token>`. Data is persisted in
`data/database.json`, which is created automatically on first run.

Demo accounts:

- `admin@eventhub.com` / `admin123`
- `organizer@eventhub.com` / `org123`
- `user@eventhub.com` / `user123`
