# 🎬 BookMyShow Clone - Production Ready MERN Stack

<p align="center">
  <img src="client/public/screenshots/homepage.png" width="800" alt="BookMyShow Clone Homepage"/>
</p>

<p align="center">
  <strong>A full-stack ticket booking platform built with modern technologies</strong>
</p>

<p align="center">
  <a href="https://book-my-show-green-seven.vercel.app/">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🛠️ Tech Stack</a> •
  <a href="#getting-started">🚀 Getting Started</a>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Workflows](#workflows)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

A **production-grade movie ticket booking platform** inspired by BookMyShow, featuring real-time seat management, secure payments, and automated workflows. Built with enterprise-level architecture and modern development practices.

### Key Highlights

- 🔒 **Real-time Seat Locking** - Prevents double bookings with instant seat reservations
- ⏰ **Smart Expiry System** - Auto-releases unpaid bookings after 10 minutes
- 💳 **Secure Payments** - Stripe integration with webhook confirmations
- 📧 **Email Notifications** - Automated booking confirmations via Nodemailer
- 🎥 **Live Movie Data** - Integration with TMDB API for trending movies and trailers
- 👤 **User Favorites** - Personalized movie collections using Clerk metadata
- 🛡️ **Admin Dashboard** - Complete show management and analytics
- 📱 **Fully Responsive** - Optimized for all device sizes

---

## 🌐 Live Demo

**Frontend:** [https://book-my-show-green-seven.vercel.app/](https://book-my-show-green-seven.vercel.app/)
**Backend API:** [https://bookmyshow-server-fawn.vercel.app/](https://bookmyshow-server-fawn.vercel.app/)

> **Note:** The backend may take a moment to wake up on first request (Vercel cold start).

---

## ✨ Features

### 🎟️ User Features

- Browse trending and now-playing movies from TMDB
- Watch movie trailers directly in the app
- View detailed movie information (cast, genre, runtime, ratings)
- Select show dates and times
- Interactive seat selection with live availability
- Configurable seat selection limits
- Secure Stripe payment checkout
- Booking confirmation page with auto-redirect
- Comprehensive booking history (paid and unpaid)
- One-click payment for pending bookings
- Add/remove movies to favorites
- Responsive design for mobile and desktop

### 🎛️ Admin Features

- Add new shows with multiple dates and times
- Fetch "Now Playing" movies directly from TMDB
- Role-based authentication middleware
- View and manage all active shows
- Monitor all bookings across the platform
- Comprehensive dashboard with:
  - Total revenue analytics
  - Booking statistics
  - Active shows count
  - User metrics
- Real-time seat occupancy tracking per show

### ⚙️ System Features

- Automated booking expiry (10-minute timeout via Inngest)
- Intelligent seat release mechanism
- Email confirmations using Nodemailer + Brevo SMTP
- In-memory caching for TMDB data (trending movies & trailers)
- Optimized React 19 build with Vite
- Type-safe development with TypeScript
- Clean, scalable architecture

---

## 🛠️ Tech Stack

### Frontend

- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Clerk** - Authentication and user management
- **Axios** - HTTP client with interceptors

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type safety on the backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Stripe** - Payment processing
- **Inngest** - Serverless workflow engine
- **Nodemailer** - Email service
- **TMDB API** - Movie data integration

### DevOps & Tools

- **Vercel** - Frontend and backend deployment
- **MongoDB Atlas** - Cloud database
- **Clerk** - Authentication service
- **Brevo (Sendinblue)** - SMTP email service
- **Upstash Redis** - Caching layer

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                  React 19 + Vite + TypeScript               │
│                  TailwindCSS + Clerk Auth                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTPS (Axios)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      EXPRESS API LAYER                       │
│                 Node.js + TypeScript + Express              │
├────────────────┬─────────────────┬──────────────────────────┤
│                │                 │                          │
│  Movie/Show    │   Booking API   │      Admin API          │
│  Controller    │  Seat Locking   │    Dashboard & Analytics│
│  TMDB API      │  Stripe         │    Show Management      │
└────────────────┴─────────────────┴──────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MONGODB    │  │    STRIPE    │  │   INNGEST    │
│              │  │              │  │              │
│ Users        │  │ Webhooks →   │  │ Delayed Jobs:│
│ Movies       │  │ Payment      │  │ • Seat Expiry│
│ Shows        │  │ Confirmation │  │ • Emails     │
│ Bookings     │  │              │  │ • Cleanup    │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Data Flow: Booking Process

```mermaid
sequenceDiagram
    User->>+Frontend: Select seats
    Frontend->>+Backend: POST /api/booking/create
    Backend->>+MongoDB: Check seat availability
    MongoDB-->>-Backend: Seats available
    Backend->>MongoDB: Lock seats & create booking
    Backend->>+Stripe: Create checkout session
    Stripe-->>-Backend: Return session URL
    Backend-->>-Frontend: Redirect to Stripe
    Frontend->>+Stripe: User completes payment
    Stripe->>+Backend: Webhook: payment_success
    Backend->>MongoDB: Update booking status
    Backend->>+Inngest: Trigger email event
    Inngest->>Email Service: Send confirmation
    Backend-->>-Stripe: 200 OK
    Stripe-->>-Frontend: Redirect to success page
```

---

## 📁 Project Structure

```
bookmyshow-clone/
├── client/                          # Frontend application
│   ├── public/
│   │   └── screenshots/             # App screenshots
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── MovieCard.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── SeatLayout.tsx
│   │   │   └── ...
│   │   ├── pages/                   # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── MovieDetails.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   ├── admin/               # Admin pages
│   │   │   └── ...
│   │   ├── context/                 # React Context
│   │   │   └── AppContext.tsx
│   │   ├── lib/                     # Utilities & configs
│   │   │   ├── axios.ts
│   │   │   └── utils.ts
│   │   ├── types/                   # TypeScript types
│   │   ├── assets/                  # Static assets
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.js           # TailwindCSS config
│   └── package.json
│
├── server/                          # Backend application
│   ├── src/
│   │   ├── controllers/             # Route controllers
│   │   │   ├── userController.ts
│   │   │   ├── showController.ts
│   │   │   ├── bookingController.ts
│   │   │   └── adminController.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts
│   │   │   └── adminAuth.ts
│   │   ├── models/                  # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Show.ts
│   │   │   └── Booking.ts
│   │   ├── routes/                  # API routes
│   │   │   ├── userRoutes.ts
│   │   │   ├── showRoutes.ts
│   │   │   ├── bookingRoutes.ts
│   │   │   └── adminRoutes.ts
│   │   ├── inngest/                 # Inngest workflows
│   │   │   ├── client.ts
│   │   │   └── functions.ts
│   │   ├── configs/                 # Configuration files
│   │   │   ├── database.ts
│   │   │   ├── stripe.ts
│   │   │   └── tmdb.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── email.ts
│   │   │   └── cache.ts
│   │   └── index.ts                 # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Clerk account for authentication
- Stripe account for payments
- TMDB API key
- Brevo account for emails (optional)
- pnpm, npm, or yarn package manager

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/bookmyshow-clone.git
cd bookmyshow-clone
```

2. **Install dependencies**

**Frontend:**

```bash
cd client
pnpm install
```

**Backend:**

```bash
cd server
pnpm install
```

3. **Set up environment variables**

Create `.env` files in both `client` and `server` directories. See [Environment Variables](#environment-variables) section.

4. **Start development servers**

**Frontend:**

```bash
cd client
pnpm dev
```

**Backend:**

```bash
cd server
pnpm dev
```

The application will be available at:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 🔑 Environment Variables

### Client `.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
VITE_BASE_URL=http://localhost:5000
VITE_CURRENCY=₹
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

### Server `.env`

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookmyshow

# Authentication
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Payment
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# External APIs
TMDB_ACCESS_TOKEN=xxxxxxxxxxxxx

# Email Service (Brevo/Sendinblue)
SMTP_USER=your-email@example.com
SMTP_PASS=xxxxxxxxxxxxx
SENDER_EMAIL=noreply@yourdomain.com

# Caching (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxx

# Server
PORT=5000
NODE_ENV=development
```

---

## 📡 API Documentation

### User Routes

| Method | Endpoint                    | Description                | Auth |
| ------ | --------------------------- | -------------------------- | ---- |
| GET    | `/api/user/bookings`        | Get user's booking history | ✅   |
| GET    | `/api/user/favorites`       | Get user's favorite movies | ✅   |
| POST   | `/api/user/update-favorite` | Add/remove favorite movie  | ✅   |

### Show Routes

| Method | Endpoint                  | Description           | Auth     |
| ------ | ------------------------- | --------------------- | -------- |
| GET    | `/api/show/trending`      | Get trending movies   | ❌       |
| GET    | `/api/show/home-trailers` | Get featured trailers | ❌       |
| GET    | `/api/show/all`           | Get all active shows  | ❌       |
| GET    | `/api/show/:movieId`      | Get shows for a movie | ❌       |
| POST   | `/api/show/add`           | Create new show       | 🔐 Admin |
| GET    | `/api/show/now-playing`   | Fetch from TMDB       | 🔐 Admin |

### Booking Routes

| Method | Endpoint                     | Description            | Auth |
| ------ | ---------------------------- | ---------------------- | ---- |
| POST   | `/api/booking/create`        | Create new booking     | ✅   |
| GET    | `/api/booking/seats/:showId` | Get occupied seats     | ✅   |
| POST   | `/api/booking/webhook`       | Stripe webhook handler | ❌   |

### Admin Routes

| Method | Endpoint                  | Description         | Auth     |
| ------ | ------------------------- | ------------------- | -------- |
| GET    | `/api/admin/is-admin`     | Check admin status  | ✅       |
| GET    | `/api/admin/dashboard`    | Get dashboard stats | 🔐 Admin |
| GET    | `/api/admin/all-shows`    | Get all shows       | 🔐 Admin |
| GET    | `/api/admin/all-bookings` | Get all bookings    | 🔐 Admin |

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure build settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
4. Add environment variables
5. Deploy

**Production URL:** [https://book-my-show-green-seven.vercel.app/](https://book-my-show-green-seven.vercel.app/)

### Backend Deployment (Vercel)

1. Import backend project in Vercel
2. Configure build settings:
   - **Root Directory:** `server`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`
3. Add environment variables
4. Enable webhooks with public URL
5. Deploy

**Production URL:** [https://bookmyshow-server-fawn.vercel.app/](https://bookmyshow-server-fawn.vercel.app/)

### Post-Deployment Configuration

1. **Update Stripe Webhook URL:**

   ```
   https://bookmyshow-server-fawn.vercel.app/api/booking/webhook
   ```

2. **Update Clerk Redirect URLs:**

   - Add production frontend URL to allowed origins

3. **Update CORS Settings:**

   - Whitelist production frontend URL

4. **Test Payment Flow:**
   - Use Stripe test cards
   - Verify webhook delivery

---

## 📸 Screenshots

### 🏠 Homepage

![Homepage](client/public/screenshots/homepage.png)
_Browse trending movies and featured trailers_

### 🎬 Movies List

![Movies List](client/public/screenshots/movies-list.png)
_Explore all available movies_

### 🎞️ Movie Details

![Movie Details](client/public/screenshots/movie-details.png)
_View detailed information, cast, and available shows_

### 🎟️ Seat Selection

![Seat Selection](client/public/screenshots/seat-selection.png)
_Interactive seat layout with real-time availability_

### 💳 Stripe Checkout

![Stripe Checkout](client/public/screenshots/stripe-checkout.png)
_Secure payment processing_

### 📋 My Bookings

![My Bookings](client/public/screenshots/my-bookings.png)
_View booking history and pending payments_

### 📊 Admin Dashboard

![Admin Dashboard](client/public/screenshots/admin-dashboard.png)
_Comprehensive analytics and metrics_

### ➕ Add Shows

![Add Shows](client/public/screenshots/admin-add-shows.png)
_Create and manage show schedules_

### 📚 All Bookings

![All Bookings](client/public/screenshots/admin-all-bookings.png)
_Monitor all platform bookings_

---

## 🔄 Workflows

### 1. Real-Time Seat Locking

**Problem:** Prevent multiple users from booking the same seats simultaneously.

**Solution:**

- Seats are locked immediately when a booking is created
- Locked seats are stored in `show.occupiedSeats` array
- Transaction-safe MongoDB operations prevent race conditions
- Seats remain locked until payment or expiry

```javascript
// Pseudo-code
const booking = await Booking.create({
  seats: selectedSeats,
  status: "unpaid",
});

await Show.updateOne({ _id: showId }, { $push: { occupiedSeats: { $each: selectedSeats } } });
```

### 2. Stripe Payment Flow

**Process:**

1. User completes seat selection
2. Backend creates Stripe checkout session
3. User redirects to Stripe
4. User completes payment
5. Stripe sends webhook to backend
6. Backend updates booking status to 'paid'
7. Inngest triggers email confirmation

```javascript
// Webhook handler
stripe.webhooks.constructEvent(payload, signature, secret);
if (event.type === "checkout.session.completed") {
  await Booking.updateOne({ paymentLink: session.url }, { isPaid: true, paymentLink: null });
  await inngest.send({
    name: "booking/confirmed",
    data: { bookingId, userEmail },
  });
}
```

### 3. Automated Seat Release (Inngest)

**Problem:** Unpaid bookings block seats indefinitely.

**Solution:**

- Inngest schedules a delayed job 10 minutes after booking creation
- Job checks if booking is still unpaid
- If unpaid: releases seats and deletes booking
- If paid: job completes without action

```javascript
// Inngest function
export const releaseUnpaidSeats = inngest.createFunction(
  { id: "release-unpaid-seats" },
  { event: "booking/created" },
  async ({ event, step }) => {
    await step.sleep("wait-10-minutes", "10m");

    await step.run("check-and-release", async () => {
      const booking = await Booking.findById(event.data.bookingId);
      if (!booking.isPaid) {
        await Show.updateOne(
          { _id: booking.showId },
          { $pull: { occupiedSeats: { $in: booking.seats } } }
        );
        await booking.deleteOne();
      }
    });
  }
);
```

### 4. Email Notifications

**Trigger:** Stripe payment confirmation

**Content:**

- Booking confirmation number
- Movie title and poster
- Show date and time
- Seat numbers
- Total amount paid

**Implementation:** Nodemailer with Brevo SMTP

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Vikraman R**

- GitHub: [@VIKRAMANR7](https://github.com/VIKRAMANR7)

---

## 🙏 Acknowledgments

- [BookMyShow](https://bookmyshow.com) for inspiration
- [TMDB](https://www.themoviedb.org/) for movie data API
- [Clerk](https://clerk.dev/) for authentication
- [Stripe](https://stripe.com/) for payment processing
- [Inngest](https://www.inngest.com/) for workflow automation

---

## ⭐ Show Your Support

If you found this project helpful, please consider giving it a star on GitHub! It helps others discover the project and motivates continued development.

<p align="center">Made with ❤️ by Vikraman R</p>
