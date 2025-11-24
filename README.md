
# ✨ BookMyShow Clone — Production Ready MERN + Vite + Stripe + Inngest (2025)

<p align="center">
  <img src="client/public/screenshots/homepage.png" width="800"/>
</p>

---

## 🌟 Overview

This is a **production‑grade BookMyShow Clone**, engineered with a modern, enterprise‑level stack combining **React 19**, **Vite**, **TypeScript**, **Express.js**, **MongoDB**, **Clerk Authentication**, **Stripe Checkout**, and **Inngest serverless workflows**.

The goal of this project is to replicate a **real‑world ticket booking platform**, complete with:

✔ Real‑time seat locking  
✔ Automatic seat release for unpaid bookings  
✔ Full admin panel  
✔ Live payment confirmation using Stripe Webhooks  
✔ Trending movies & trailers from TMDB  
✔ Favorite movie system using Clerk metadata  
✔ Production-ready code structure  

---

# 🧭 Table of Contents

1. 🔥 Features  
2. 🏗 Architecture Overview  
3. 🗂 Project Folder Structure  
4. ☁️ Backend Architecture  
5. 🎨 Frontend Architecture  
6. ⚙️ API Endpoints  
7. 🔑 Environment Variables  
8. 🛠 Installation & Setup  
9. 🚀 Deployment Guide (Vercel + Render)  
10. 🖼 Screenshots  
11. 🧪 Workflows (Seat Locking, Inngest, Stripe)  
12. 🙌 Credits  

---

# 🔥 1. Features

## 🎬 User Features
- Browse trending movies (TMDB API)
- Watch trailers
- Detailed movie view (with cast, genre, runtime)
- Select show date
- Select showtime
- Seat layout with real‑time occupied seats
- Seat selection limits
- Stripe payment flow
- Auto-redirect loading screen after Stripe return
- Booking history (paid + unpaid)
- “Pay now” for unpaid bookings
- Add/remove favorites using Clerk private metadata
- Fully responsive UI

## 🛠 Admin Features
- Add shows (multiple dates/times)
- Fetch “Now Playing” movies from TMDB
- Admin authentication middleware
- View all active shows
- View all bookings
- Dashboard with:
  - Total revenue
  - Total bookings
  - Active shows
  - Total users
- Real-time seat occupancy per show

## ⚡ System Features
- Auto‑expire booking after 10 minutes (Inngest)
- Release seats back to show
- Email confirmation (Nodemailer + Brevo SMTP)
- In-memory caching for TMDB trending + trailers
- Performance optimized React 19 + Vite build
- Clean, scalable folder structure

---

# 🏗 2. Architecture Diagram

```
                           ┌─────────────────────────────┐
                           │           CLIENT             │
                           │  React 19 + Vite + TS        │
                           │  TailwindCSS + Clerk Auth    │
                           └───────────────┬──────────────┘
                                           │ HTTPS
                                           ▼
                           ┌─────────────────────────────┐
                           │         EXPRESS API         │
                           │ Node.js + TypeScript        │
                           ├───────────┬─────────────────┤
                           │           │                 │
                           ▼           ▼                 ▼
                   Movie/Show      Booking API       Admin API
                   Controller      Seat Locking      Dashboards
                     TMDB API      Stripe Checkout    Analytics

                           ┌─────────────────────────────┐
                           │        MONGO DB (Atlas)      │
                           │  Users / Movies / Shows      │
                           │  Bookings / Seat Maps        │
                           └──────────────────────────────┘

                           ┌─────────────────────────────┐
                           │          STRIPE             │
                           │  Webhooks → payment update  │
                           └─────────────────────────────┘

                           ┌─────────────────────────────┐
                           │          INNGEST            │
                           │  Delayed Jobs:              │
                           │  - Release seats            │
                           │  - Delete expired bookings  │
                           │  - Send confirmation email   │
                           └──────────────────────────────┘
```

---

# 🗂 3. Project Folder Structure

```
project/
│── client/
│   ├── public/
│   │   └── screenshots/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── assets/
│   │   ├── types/
│   │   └── App.tsx
│   └── vite.config.ts
│
│── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── inngest/
│   │   ├── utils/
│   │   ├── routes/
│   │   ├── configs/
│   │   └── index.ts
│   └── package.json
│
└── README.md
```

---

# ☁️ 4. Backend Architecture

### **Express + MongoDB + Stripe + Inngest**

### 📌 Booking Flow (Core Logic)
```
User selects seats
↓
System checks if seats are free
↓
Booking document created (status: unpaid)
↓
Seats locked in show.occupiedSeats
↓
Stripe checkout session created
↓
Redirect user to Stripe
↓
Stripe webhook → Mark booking as paid
↓
Inngest job → Send confirmation email
```

### 📌 Unpaid Booking Auto-Expiry (Inngest)
```
Booking created
↓
Inngest schedules job 10 mins later
↓
If booking.isPaid === false:
    - release all seats
    - delete booking
```

---

# 🎨 5. Frontend Architecture

### Built with:
- React 19
- Context API
- TailwindCSS
- React Router
- Clerk Authentication
- Axios (shared instance)

### Important Concepts:
- AppContext handles:
  - userId / email
  - admin check
  - movies
  - favorites
  - token getter
- Pages split into:
  - User pages
  - Admin pages
- Components:
  - MovieCard
  - HeroSection
  - TrailersSection
  - AdminSidebar
  - DateSelect
  - SeatLayout

---

# ⚙️ 6. API Endpoints (Overview)

### **User**
```
GET /api/user/bookings
GET /api/user/favorites
POST /api/user/update-favorite
```

### **Shows**
```
GET /api/show/trending
GET /api/show/home-trailers
GET /api/show/all
GET /api/show/:movieId
POST /api/show/add (admin)
GET /api/show/now-playing (admin)
```

### **Booking**
```
POST /api/booking/create
GET /api/booking/seats/:showId
```

### **Admin**
```
GET /api/admin/is-admin
GET /api/admin/dashboard
GET /api/admin/all-shows
GET /api/admin/all-bookings
```

---

# 🔑 7. Environment Variables

### **Client (`client/.env`)**
```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BASE_URL=http://localhost:5000
VITE_CURRENCY=₹
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

### **Server (`server/.env`)**
```
MONGODB_URI=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
TMDB_ACCESS_TOKEN=
SMTP_USER=
SMTP_PASS=
SENDER_EMAIL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

# 🛠 8. Installation & Setup

### **Clone Repo**
```
git clone yourrepo.git
cd project
```

### **Client Setup**
```
cd client
pnpm install
pnpm dev
```

### **Server Setup**
```
cd server
pnpm install
pnpm dev
```

---

# 🚀 9. Deployment Guide

### **Frontend — Vercel**
- Vite supported natively
- Add env vars
- Set output = `dist`
- Add vercel.json rewrite

### **Backend — Render / Railway**
- Set build command:
```
pnpm install
pnpm build
pnpm start
```
- Add env vars
- Enable Webhooks publicly

---

# 🖼 10. Screenshots

### 🏠 Homepage
![](client/public/screenshots/homepage.png)

### 🎬 Movies List
![](client/public/screenshots/movies-list.png)

### 🎞 Movie Details
![](client/public/screenshots/movie-details.png)

### 🎟 Seat Selection
![](client/public/screenshots/seat-selection.png)

### 💳 Stripe Checkout
![](client/public/screenshots/stripe-checkout.png)

### ⭐ Favorites
![](client/public/screenshots/my-bookings.png)

### 📊 Admin Dashboard
![](client/public/screenshots/admin-dashboard.png)

### ➕ Add Shows
![](client/public/screenshots/admin-add-shows.png)

### 📚 All Bookings
![](client/public/screenshots/admin-all-bookings.png)

---

# 📡 11. Workflow Deep Dive

## A) Real-Time Seat Selection
- Seats locked immediately when booking created
- Prevents double-booking race conditions
- Locked seats stored in `show.occupiedSeats`

## B) Stripe Webhook
```
checkout.session.completed →
update booking →
clear paymentLink →
trigger Inngest event
```

## C) Inngest Seat Release
- Uses delayed jobs
- Ensures unpaid seats aren’t stuck
- Auto cleans abandoned bookings

## D) Email Notification
- Sent when Stripe confirms payment
- Shows title + time + date

---

# 🙌 12. Credits

Built by **Vikraman R**  
Designed as a **full-scale production replica** of BookMyShow.

---

If you like this project, consider ⭐ starring the repository!
