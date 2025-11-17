# 🎬 BookMyShow Clone — Full-Stack Movie Ticket Booking Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0-green)]()
[![React](https://img.shields.io/badge/React-18.x-blue)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)]()

> A production-ready **movie ticket booking platform** inspired by BookMyShow, built with the MERN stack. Features real-time seat selection, Stripe payments, TMDB integration, Redis caching, and automated email notifications.

**🚀 [Live Demo](#) | 📖 [Documentation](#) | 🎥 [Video Tour](#)**

---

## ✨ Key Features

### 🎥 Movie Management

- **TMDB Integration** — Auto-sync trending movies, now playing, cast, and posters
- **Real-time Updates** — Instant show availability and seat status
- **Smart Caching** — Redis-powered caching reduces API calls by 90%

### 🎫 Booking System

- **Interactive Seat Selection** — Visual seat layout (A-J rows, 10 seats/row)
- **Concurrent Booking Protection** — Prevents double-booking with seat locking
- **Smart Limits** — Maximum 5 seats per booking
- **Stripe Checkout** — Secure payment processing with webhook verification

### 🔐 Authentication & Authorization

- **Clerk Integration** — Google, GitHub, Email/Password authentication
- **Role-Based Access** — JWT-protected admin routes
- **Secure Sessions** — HTTP-only cookies for enhanced security

### ⚡ Performance & Reliability

- **Redis Caching (Upstash)** — 2× faster homepage load
  - Trending movies: 4h cache
  - Homepage trailers: 6h cache
  - TMDB details: 1h cache
- **Automatic Cache Invalidation** — Fresh data when admin adds shows
- **Connection Pooling** — Optimized TMDB API requests

### 📬 Email Automation (Inngest)

- **Booking Confirmations** — Instant email with QR code
- **Show Reminders** — 24h before show time
- **Admin Notifications** — Alert all users about new releases

### 🎨 Modern UI/UX

- **Responsive Design** — Mobile-first approach with TailwindCSS
- **Smooth Animations** — Motion-powered transitions
- **Toast Notifications** — Real-time user feedback
- **Loading States** — Skeleton screens and spinners

---

## 🖼️ Screenshots

| Home Page                       | Movie Details                         | Seat Selection                    | Admin Dashboard                   |
| ------------------------------- | ------------------------------------- | --------------------------------- | --------------------------------- |
| ![Home](./screenshots/home.png) | ![Details](./screenshots/details.png) | ![Seats](./screenshots/seats.png) | ![Admin](./screenshots/admin.png) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │ Context  │  │  Utils   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│                    Server (Express)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Routes   │→ │Controllers│→ │  Models  │→ │ MongoDB  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Redis   │  │  Stripe  │  │  TMDB    │  │ Inngest  │   │
│  │  Cache   │  │ Payments │  │   API    │  │  Email   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
📁 project-root/
├── 📁 client/                 # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI components
│   │   ├── 📁 pages/          # Route pages
│   │   ├── 📁 context/        # Global state (AppContext)
│   │   ├── 📁 types/          # TypeScript types
│   │   └── 📁 assets/         # Images, icons
│   └── package.json
│
└── 📁 server/                 # Express backend
    ├── 📁 src/
    │   ├── 📁 controllers/    # Request handlers
    │   ├── 📁 models/         # Mongoose schemas
    │   ├── 📁 routes/         # API routes
    │   ├── 📁 middleware/     # Auth, validation
    │   ├── 📁 inngest/        # Email job definitions
    │   ├── 📁 configs/        # DB, Redis, Stripe setup
    │   ├── 📁 utils/          # Cache, helpers
    │   └── server.ts          # Entry point
    └── package.json
```

---

## 🛠️ Tech Stack

### Frontend

| Technology          | Purpose               |
| ------------------- | --------------------- |
| **React 18**        | UI library with hooks |
| **TypeScript**      | Type safety           |
| **Vite**            | Fast build tool       |
| **TailwindCSS**     | Utility-first CSS     |
| **Clerk**           | Authentication        |
| **Axios**           | HTTP client           |
| **Framer Motion**   | Animations            |
| **React Router**    | Client-side routing   |
| **React Hot Toast** | Notifications         |

### Backend

| Technology             | Purpose                 |
| ---------------------- | ----------------------- |
| **Node.js + Express**  | REST API server         |
| **TypeScript**         | Type-safe backend       |
| **MongoDB + Mongoose** | Database & ODM          |
| **Stripe**             | Payment processing      |
| **Inngest**            | Background jobs & email |
| **Upstash Redis**      | Caching layer           |
| **TMDB API**           | Movie data source       |
| **Cloudinary**         | Image hosting           |

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0
MongoDB >= 8.0
pnpm (recommended) or npm
```

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/bookmyshow-clone.git
cd bookmyshow-clone
```

### 2️⃣ Install Dependencies

```bash
# Backend
cd server
pnpm install

# Frontend
cd ../client
pnpm install
```

### 3️⃣ Environment Setup

#### Backend (`server/.env`)

```env
# Server
PORT=3000

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/bookmyshow

# TMDB API
TMDB_ACCESS_TOKEN=your_tmdb_v4_bearer_token

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Inngest (Email Jobs)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

#### Frontend (`client/.env`)

```env
# API
VITE_BASE_URL=http://localhost:3000

# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Cloudinary
VITE_CLOUDINARY_BASE=https://res.cloudinary.com/your-cloud/
```

### 4️⃣ Run Development Servers

**Terminal 1 (Backend):**

```bash
cd server
pnpm dev
```

**Terminal 2 (Frontend):**

```bash
cd client
pnpm dev
```

**Terminal 3 (Inngest Dev Server):**

```bash
cd server
npx inngest-cli@latest dev
```

Access the app at `http://localhost:5173`

---

## 📡 API Reference

### Shows & Movies

#### `GET /api/show/trending`

Fetch trending movies (cached 4h)

```json
{
  "success": true,
  "movies": [
    {
      "id": 123,
      "title": "Movie Title",
      "poster_path": "/path.jpg",
      "vote_average": 8.5
    }
  ]
}
```

#### `GET /api/show/home-trailers`

Homepage trailers (cached 6h, ~80 movies → 8 trailers)

#### `GET /api/show/:movieId`

Movie details + available show times

```json
{
  "success": true,
  "movie": {
    /* movie data */
  },
  "dateTime": {
    "2025-11-20": [{ "time": "2025-11-20T14:30:00Z", "showId": "abc123" }]
  }
}
```

#### `POST /api/show/add` 🔒 Admin Only

Create new shows for a movie

```json
{
  "movieId": "123",
  "showsInput": [{ "date": "2025-11-20", "time": ["14:30", "18:00", "21:30"] }],
  "showPrice": 250
}
```

### Bookings

#### `POST /api/booking/create`

Initiate booking + Stripe checkout

```json
{
  "showId": "abc123",
  "seatNumbers": ["A1", "A2", "A3"]
}
```

Returns Stripe session URL

#### `GET /api/booking/seats/:showId`

Get occupied seats for show

```json
{
  "occupiedSeats": ["A1", "B5", "C3"]
}
```

### User

#### `GET /api/user/bookings` 🔒 Auth Required

User's booking history

#### `POST /api/user/update-favorite` 🔒 Auth Required

Toggle favorite movie

### Admin

#### `GET /api/admin/dashboard` 🔒 Admin Only

Revenue stats, active shows, total bookings

---

## 💳 Payment Flow

```
1. User selects seats
   ↓
2. POST /api/booking/create
   ↓
3. Backend validates availability
   ↓
4. Create Stripe Checkout session
   ↓
5. Redirect user to Stripe
   ↓
6. User completes payment
   ↓
7. Stripe webhook → POST /api/stripe
   ↓
8. Mark booking as paid (isPaid: true)
   ↓
9. Trigger Inngest email job
   ↓
10. Send confirmation email
```

---

## ⚡ Caching Strategy

| Resource           | Cache Key               | TTL     | Invalidation |
| ------------------ | ----------------------- | ------- | ------------ |
| Trending Movies    | `bms:movies:trending`   | 4 hours | Manual       |
| Homepage Trailers  | `bms:trailers:home`     | 6 hours | On show add  |
| TMDB Movie Details | `bms:tmdb:movie:{id}`   | 1 hour  | Never        |
| TMDB Credits       | `bms:tmdb:credits:{id}` | 1 hour  | Never        |

**Before Redis:** Homepage load ~3-5s (80+ API calls)
**After Redis:** Homepage load ~50-100ms (cache hit)

---

## 📬 Inngest Jobs

### `app/show.added`

**Trigger:** Admin adds new show
**Action:** Email all users about new movie availability

### `app/show.booked`

**Trigger:** Successful payment
**Action:** Send booking confirmation with QR code

### `app/show.reminder`

**Trigger:** 24h before show
**Action:** Reminder email to attendees

---

## 🧪 Testing

```bash
# Backend unit tests
cd server
pnpm test

# Frontend tests
cd client
pnpm test

# E2E tests
pnpm test:e2e
```

---

## 🚢 Deployment

### Frontend → Vercel

```bash
cd client
pnpm build

# Deploy to Vercel
vercel --prod
```

### Backend → Vercel

Backend is deployed as a serverless Express app:

Live URL:
➡️ https://bookmyshow-server-fawn.vercel.app

Add environment variables in Vercel settings.

```bash
cd server
pnpm build

# Set environment variables in platform
# Deploy via Git integration
```

**Important:** Set Stripe webhook URL to your production domain in Stripe Dashboard.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie data
- [Stripe](https://stripe.com/) for payment infrastructure
- [Clerk](https://clerk.com/) for authentication
- [Upstash](https://upstash.com/) for Redis hosting
- [Inngest](https://inngest.com/) for background jobs

---

## 📧 Contact

**Project Link:**:https://github.com/VIKRAMANR7/BookMyShow

---

<div align="center">

### ⭐ Star this repo if you found it helpful! ⭐

Made with ❤️ by Vikraman(https://github.com/VIKRAMANR7)

</div>
