# EventHub — Database Documentation & Tool Guide

This directory contains the complete relational database design for the **EventHub** project, supporting Events, Venues, Users, Registrations, Tickets, QR Codes, and the Quiz Gamification module.

---

## 1. Recommended Database Tools

Depending on your academic requirements or local setup, choose one of these tools:

### Option A: MySQL / MariaDB via XAMPP (phpMyAdmin) — *Most Common for College Projects*
1. Download & Install [XAMPP](https://www.apachefriends.org/).
2. Open XAMPP Control Panel and start **Apache** and **MySQL**.
3. Open your browser and navigate to: `http://localhost/phpmyadmin`
4. Click **New** on the left sidebar and name the database: `eventhub_db`.
5. Click on the **Import** tab at the top.
6. Choose the file `database/eventhub_schema.sql` and click **Import** (or **Go**).
7. All 10 tables, relationships, and seed data will be populated automatically!

### Option B: DB Browser for SQLite — *Zero-Configuration & Portable*
1. Download [DB Browser for SQLite](https://sqlitebrowser.org/).
2. Click **Open Database** and select the pre-built file: `database/eventhub.db`.
3. You can visually inspect, run queries, and edit records instantly with zero server setup!

### Option C: Python Built-In SQLite3 — *Already Installed & Pre-Built!*
- Python includes `sqlite3` in its standard library.
- To re-generate or reset the database at any time, run:
  ```bash
  python database/seed_database.py
  ```

---

## 2. Database Schema Overview

| Table Name | Description | Key Attributes |
| :--- | :--- | :--- |
| `users` | User credentials, roles & profile | `user_id` (PK), `email`, `role`, `status` |
| `categories` | Event types (Music, Tech, Sports, etc.) | `category_id` (PK), `name`, `icon`, `color_hex` |
| `venues` | Physical locations with Geo coordinates | `venue_id` (PK), `latitude`, `longitude`, `capacity` |
| `events` | Event schedules, pricing & seat counts | `event_id` (PK), `organizer_id` (FK), `venue_id` (FK) |
| `registrations` | User ticket reservations & payment state | `registration_id` (PK), `user_id` (FK), `event_id` (FK) |
| `tickets` | Unique attendee digital passes & QR tokens | `ticket_id` (PK), `ticket_code`, `qr_token` |
| `quiz_categories` | Quiz subjects (Tech, Music, Sports) | `quiz_cat_id` (PK), `title`, `icon` |
| `quiz_questions` | Question bank with 4 options & answers | `question_id` (PK), `quiz_cat_id` (FK), `correct_option` |
| `quiz_attempts` | Attendee quiz scores & percentages | `attempt_id` (PK), `user_id` (FK), `score`, `percentage` |
| `notifications` | In-app alerts and booking updates | `notification_id` (PK), `user_id` (FK), `message` |

---

## 3. Entity Relationship (ER) Summary
```
[users] ──< [registrations] >── [events] >── [venues]
                 │                 │
                 └──< [tickets]    └──< [categories]

[users] ──< [quiz_attempts] >── [quiz_categories] ──< [quiz_questions]
```
