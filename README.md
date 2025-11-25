# 🎬 BookMyShow Clone - Movie Ticket Booking Platform

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://book-my-show-green-seven.vercel.app/)
[![API Status](https://img.shields.io/badge/API-active-success)](https://bookmyshow-server-fawn.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)

A full-stack movie ticket booking application inspired by BookMyShow, featuring real-time seat selection, automated booking workflows, secure payments, and an admin dashboard for show management.

## 🌐 Live Deployment

- **Frontend:** [https://book-my-show-green-seven.vercel.app/](https://book-my-show-green-seven.vercel.app/)
- **Backend API:** [https://bookmyshow-server-fawn.vercel.app/](https://bookmyshow-server-fawn.vercel.app/)

## 📸 Screenshots

### User Interface

![Homepage](client/public/screenshots/homepage.png)
_Homepage with trending movies and trailers_

![Movie Details](client/public/screenshots/movie-details.png)
_Detailed movie information with cast, genres, and ratings_

![Movies List](client/public/screenshots/movies-list.png)
_Browse all currently showing movies_

![Seat Selection](client/public/screenshots/seat-selection.png)
_Interactive seat selection with real-time availability_

![My Bookings](client/public/screenshots/my-bookings.png)
_User booking history with payment status_

![Stripe Checkout](client/public/screenshots/stripe-checkout.png)
_Secure payment processing with Stripe_

### Admin Dashboard

![Admin Dashboard](client/public/screenshots/admin-dashboard.png)
_Admin dashboard with revenue analytics and statistics_

![Add Shows](client/public/screenshots/admin-add-shows.png)
_Add new shows with date-time selection_

![All Bookings](client/public/screenshots/admin-all-bookings.png)
_Manage all platform bookings_

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>Vite + TypeScript]
        B[TailwindCSS]
        C[Clerk Auth]
    end

    subgraph "API Gateway"
        D[Express.js Server<br/>TypeScript]
        E[Clerk Middleware]
        F[CORS Handler]
    end

    subgraph "Business Logic"
        G[User Controller]
        H[Booking Controller]
        I[Show Controller]
        J[Admin Controller]
    end

    subgraph "External Services"
        K[Stripe Payment<br/>Gateway]
        L[TMDB API<br/>Movie Data]
        M[Brevo SMTP<br/>Email Service]
        N[Upstash Redis<br/>Seat Locking]
    end

    subgraph "Background Jobs"
        O[Inngest<br/>Workflow Engine]
        P[Payment Verification<br/>10 min delay]
        Q[Email Notification<br/>On booking success]
    end

    subgraph "Data Layer"
        R[(MongoDB<br/>Primary Database)]
    end

    A --> D
    C --> E
    E --> D
    F --> D

    D --> G
    D --> H
    D --> I
    D --> J

    H --> K
    I --> L
    G --> R
    H --> R
    I --> R
    J --> R

    H --> N
    K --> O
    O --> P
    O --> Q
    Q --> M
    P --> R
```

---

## 🔄 Data Flow Diagram

```mermaid
flowchart TD
    Start([User Opens App]) --> Auth{Authenticated?}

    Auth -->|No| Login[Clerk Sign In]
    Auth -->|Yes| Home[Browse Movies]
    Login --> Home

    Home --> MovieDetails[View Movie Details<br/>& Show Times]
    MovieDetails --> SelectDate[Select Date & Time]
    SelectDate --> SeatSelection[Interactive Seat Layout]

    SeatSelection --> CheckAvail{Check Seat<br/>Availability}
    CheckAvail -->|Available| LockSeats[Lock Seats in Redis<br/>+ Create Booking]
    CheckAvail -->|Occupied| SeatSelection

    LockSeats --> CreateStripe[Create Stripe<br/>Checkout Session]
    CreateStripe --> TriggerWorkflow[Trigger Inngest<br/>Payment Check]
    TriggerWorkflow --> Redirect[Redirect to Stripe]

    Redirect --> Payment{User Pays?}

    Payment -->|Success| Webhook[Stripe Webhook<br/>checkout.session.completed]
    Webhook --> UpdateDB[Mark Booking as Paid<br/>Clear Payment Link]
    UpdateDB --> SendEmail[Inngest: Send<br/>Confirmation Email]
    SendEmail --> ShowBooking[Display in My Bookings]

    Payment -->|Timeout| Wait10Min[Inngest Waits<br/>10 Minutes]
    Wait10Min --> CheckPaid{Booking Paid?}
    CheckPaid -->|No| ReleaseSeats[Release Seats<br/>Delete Booking]
    CheckPaid -->|Yes| ShowBooking

    ReleaseSeats --> End([End])
    ShowBooking --> End

    style Auth fill:#e1f5ff
    style Payment fill:#fff3cd
    style Webhook fill:#d4edda
    style ReleaseSeats fill:#f8d7da
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USER ||--o{ BOOKING : creates
    SHOW ||--o{ BOOKING : "has bookings"
    MOVIE ||--o{ SHOW : "scheduled in"

    USER {
        string _id PK "Clerk User ID"
        string name
        string email
        string image
        timestamp createdAt
        timestamp updatedAt
    }

    MOVIE {
        string _id PK "TMDB Movie ID"
        string title
        string overview
        string poster_path
        string backdrop_path
        string release_date
        string original_language
        string tagline
        object[] genres "id, name"
        object[] casts "id, name, profile_path, character"
        number vote_average
        number runtime
        timestamp createdAt
        timestamp updatedAt
    }

    SHOW {
        string _id PK
        string movie FK "References Movie._id"
        datetime showDateTime
        number showPrice
        object occupiedSeats "seat_id: user_id mapping"
        timestamp createdAt
        timestamp updatedAt
    }

    BOOKING {
        string _id PK
        string user FK "References User._id"
        string show FK "References Show._id"
        number amount
        string[] bookedSeats
        boolean isPaid "Default: false"
        string paymentLink
        timestamp createdAt
        timestamp updatedAt
    }
```

### Schema Relationships

- **User → Booking:** One-to-Many (A user can have multiple bookings)
- **Show → Booking:** One-to-Many (A show can have multiple bookings)
- **Movie → Show:** One-to-Many (A movie can have multiple scheduled shows)

---

## 🧩 Component Architecture

```mermaid
graph TB
    subgraph "Frontend Components"
        direction TB

        subgraph "Pages"
            P1[Home]
            P2[Movies]
            P3[MovieDetails]
            P4[SeatLayout]
            P5[MyBookings]
            P6[Favorite]
            P7[Admin/Dashboard]
            P8[Admin/AddShows]
            P9[Admin/ListShows]
            P10[Admin/ListBookings]
        end

        subgraph "Shared Components"
            C1[Navbar]
            C2[Footer]
            C3[MovieCard]
            C4[DateSelect]
            C5[Loading]
            C6[HeroSection]
            C7[FeaturedSection]
            C8[TrailersSection]
            C9[BlurCircle]
        end

        subgraph "Admin Components"
            AC1[AdminNavbar]
            AC2[AdminSidebar]
            AC3[Title]
        end

        subgraph "Context & State"
            CTX[AppContext<br/>Global State]
            AUTH[Clerk Auth<br/>Provider]
        end
    end

    AUTH --> CTX
    CTX --> P1
    CTX --> P2
    CTX --> P3
    CTX --> P4
    CTX --> P5
    CTX --> P6
    CTX --> P7
    CTX --> P8

    P1 --> C6
    P1 --> C7
    P1 --> C8

    P2 --> C3
    P3 --> C3
    P3 --> C4
    P6 --> C3

    C1 --> AUTH

    P7 --> AC1
    P7 --> AC2
    P8 --> AC1
    P8 --> AC2
```

---

## 🔀 API Request Flow

```mermaid
sequenceDiagram
    participant Client as React App
    participant Clerk as Clerk Auth
    participant Express as Express Server
    participant Auth as Auth Middleware
    participant Controller as Controller
    participant DB as MongoDB
    participant External as External APIs<br/>(Stripe/TMDB/Redis)
    participant Inngest as Inngest Worker
    participant Email as Email Service

    Note over Client,Email: Example: Create Booking Flow

    Client->>Clerk: Get JWT Token
    Clerk-->>Client: Return Token

    Client->>Express: POST /api/booking/create<br/>Headers: Authorization Bearer {token}

    Express->>Auth: Verify Token & Extract userId
    Auth-->>Express: userId extracted

    Express->>Controller: createBooking(req, res)

    Controller->>DB: Check seat availability<br/>Show.findById(showId)
    DB-->>Controller: Show data

    Controller->>External: Lock seats in Redis<br/>Set temp reservation
    External-->>Controller: Seats locked

    Controller->>DB: Create Booking document<br/>Booking.create({...})
    DB-->>Controller: Booking created

    Controller->>DB: Update Show occupiedSeats<br/>Show.save()
    DB-->>Controller: Seats marked occupied

    Controller->>External: Create Stripe session<br/>stripe.checkout.sessions.create()
    External-->>Controller: Session URL

    Controller->>DB: Update booking.paymentLink<br/>Booking.save()
    DB-->>Controller: Updated

    Controller->>Inngest: Trigger app/checkpayment<br/>event with bookingId
    Inngest-->>Controller: Event queued

    Controller-->>Client: { success: true, url: stripeUrl }

    Client->>External: Redirect to Stripe

    Note over Inngest,Email: Background Process (10 min delay)

    Inngest->>Inngest: Wait 10 minutes

    Inngest->>DB: Check Booking.isPaid

    alt Booking NOT Paid
        Inngest->>DB: Release seats<br/>Delete Booking
        DB-->>Inngest: Cleaned up
    else Booking Paid
        Note over Inngest: No action needed
    end

    Note over External,Email: Stripe Webhook Flow (on payment)

    External->>Express: POST /api/stripe<br/>Webhook: checkout.session.completed

    Express->>DB: Update Booking<br/>{ isPaid: true, paymentLink: '' }
    DB-->>Express: Updated

    Express->>Inngest: Trigger app/show.booked
    Inngest-->>Express: Queued

    Inngest->>DB: Fetch booking with<br/>populated show & user
    DB-->>Inngest: Booking data

    Inngest->>Email: Send confirmation email<br/>via Brevo SMTP
    Email-->>Inngest: Email sent

    Express-->>External: 200 OK
```

---

## ✨ Key Features

### 🎟️ User Features

- **Movie Discovery:** Browse trending movies from TMDB with ratings and details
- **Interactive Trailers:** Watch movie trailers directly on the platform
- **Real-time Seat Selection:** Visual seat layout with instant availability updates
- **Secure Payments:** Stripe integration with automatic checkout sessions
- **Booking Management:** View all bookings with payment status and ticket details
- **Favorites:** Save favorite movies for quick access
- **Responsive Design:** Seamless experience across desktop, tablet, and mobile

### 👨‍💼 Admin Features

- **Dashboard Analytics:** Revenue, bookings, active shows, and user statistics
- **Show Management:** Add shows with flexible date-time scheduling from TMDB's now-playing list
- **Booking Overview:** View all platform bookings with user and payment information
- **Show Listings:** Monitor all scheduled shows with reserved seats and earnings

### 🔧 Technical Features

- **Automated Seat Release:** Unpaid bookings auto-expire after 10 minutes using Inngest workflows
- **Email Notifications:** Brevo SMTP integration for booking confirmations
- **Caching Layer:** In-memory cache for trending movies and trailers (4-hour TTL)
- **Redis Seat Locking:** Temporary seat reservations to prevent race conditions
- **Webhook Processing:** Stripe webhooks for real-time payment verification
- **Role-based Access:** Clerk metadata for admin authorization

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React 19.1 with TypeScript
- **Build Tool:** Vite 7.0
- **Styling:** TailwindCSS 4.1 (utility-first CSS)
- **Authentication:** Clerk React SDK
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Video Player:** React Player
- **State Management:** Context API + Custom Hooks
- **Notifications:** React Hot Toast

### Backend

- **Runtime:** Node.js 20+ with TypeScript
- **Framework:** Express.js 4.21
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** Clerk Express SDK
- **Payments:** Stripe API
- **Movie Data:** TMDB API
- **Email Service:** Nodemailer + Brevo SMTP
- **Background Jobs:** Inngest (workflow orchestration)
- **Caching:** Upstash Redis + In-memory cache
- **Deployment:** Vercel (serverless functions)

### DevOps & Tools

- **Package Manager:** pnpm
- **Code Quality:** ESLint + Prettier
- **Type Safety:** TypeScript 5.9 (strict mode)
- **Deployment:** Vercel
- **Version Control:** Git

---

## 📁 Project Structure

```
bookmyshow-clone/
├── client/                          # Frontend React application
│   ├── public/
│   │   └── screenshots/            # UI screenshots
│   ├── src/
│   │   ├── assets/                 # Images, logos, icons
│   │   ├── components/             # Reusable components
│   │   │   ├── admin/             # Admin-specific components
│   │   │   ├── BlurCircle.tsx
│   │   │   ├── DateSelect.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── MovieCard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── FeaturedSection.tsx
│   │   │   └── TrailersSection.tsx
│   │   ├── context/               # Global state management
│   │   │   └── AppContext.tsx
│   │   ├── lib/                   # Utility functions
│   │   │   ├── api.ts
│   │   │   ├── dateFormat.ts
│   │   │   ├── isoTimeFormat.ts
│   │   │   ├── kConverter.ts
│   │   │   └── timeFormat.ts
│   │   ├── pages/                 # Route pages
│   │   │   ├── admin/            # Admin dashboard pages
│   │   │   ├── Favorite.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── MovieDetails.tsx
│   │   │   ├── Movies.tsx
│   │   │   ├── MyBookings.tsx
│   │   │   └── SeatLayout.tsx
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vercel.json
│
└── server/                          # Backend Express application
    ├── src/
    │   ├── configs/                # Configuration files
    │   │   ├── db.ts              # MongoDB connection
    │   │   ├── nodeMailer.ts      # SMTP setup
    │   │   ├── redis.ts           # Upstash Redis client
    │   │   └── validateEnv.ts     # Environment validation
    │   ├── controllers/            # Business logic
    │   │   ├── adminController.ts
    │   │   ├── bookingController.ts
    │   │   ├── showController.ts
    │   │   ├── stripeWebhooks.ts
    │   │   └── userController.ts
    │   ├── inngest/               # Background job functions
    │   │   ├── client.ts
    │   │   ├── functions/
    │   │   │   ├── booking.email.ts
    │   │   │   └── booking.expire.ts
    │   │   └── index.ts
    │   ├── middleware/            # Express middleware
    │   │   ├── asyncHandler.ts
    │   │   ├── auth.ts           # Admin authorization
    │   │   └── errorHandler.ts
    │   ├── models/               # Mongoose schemas
    │   │   ├── Booking.ts
    │   │   ├── Movie.ts
    │   │   ├── Show.ts
    │   │   └── User.ts
    │   ├── routes/               # API routes
    │   │   ├── adminRoutes.ts
    │   │   ├── bookingRoutes.ts
    │   │   ├── showRoutes.ts
    │   │   └── userRoutes.ts
    │   ├── types/                # TypeScript types
    │   ├── utils/                # Helper functions
    │   │   ├── auth.ts
    │   │   └── cache.ts
    │   └── server.ts             # Entry point
    ├── package.json
    ├── tsconfig.json
    ├── eslint.config.js
    └── vercel.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and pnpm installed
- MongoDB Atlas account or local MongoDB instance
- Clerk account for authentication
- Stripe account for payments
- TMDB API access token
- Brevo account for email service
- Upstash Redis account
- Inngest account for background jobs

### Environment Variables

#### Client (`client/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
VITE_BASE_URL=http://localhost:5000
VITE_CURRENCY=₹
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

#### Server (`server/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# TMDB API
TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...

# Email Service (Brevo)
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SENDER_EMAIL=your@email.com

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/bookmyshow-clone.git
cd bookmyshow-clone
```

2. **Install dependencies**

```bash
# Install server dependencies
cd server
pnpm install

# Install client dependencies
cd ../client
pnpm install
```

3. **Configure environment variables**

```bash
# Create .env files from examples
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit both files with your credentials
```

4. **Start development servers**

```bash
# Terminal 1: Start backend (from server/)
pnpm dev

# Terminal 2: Start frontend (from client/)
pnpm dev
```

5. **Access the application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📡 API Endpoints

### Public Routes

| Method | Endpoint                     | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| GET    | `/api/show/trending`         | Get trending movies from TMDB |
| GET    | `/api/show/home-trailers`    | Get trailer data for homepage |
| GET    | `/api/show/all`              | Get all available shows       |
| GET    | `/api/show/:movieId`         | Get show details for a movie  |
| GET    | `/api/booking/seats/:showId` | Get occupied seats for a show |

### Protected User Routes

| Method | Endpoint                    | Description                         |
| ------ | --------------------------- | ----------------------------------- |
| GET    | `/api/user/bookings`        | Get current user's bookings         |
| POST   | `/api/user/update-favorite` | Add/remove favorite movie           |
| GET    | `/api/user/favorites`       | Get user's favorite movies          |
| POST   | `/api/booking/create`       | Create new booking + Stripe session |

### Admin Routes (Protected)

| Method | Endpoint                  | Description                 |
| ------ | ------------------------- | --------------------------- |
| GET    | `/api/admin/is-admin`     | Verify admin status         |
| GET    | `/api/admin/dashboard`    | Get dashboard statistics    |
| GET    | `/api/admin/all-shows`    | Get all scheduled shows     |
| GET    | `/api/admin/all-bookings` | Get all platform bookings   |
| GET    | `/api/show/now-playing`   | Get TMDB now-playing movies |
| POST   | `/api/show/add`           | Add new show(s)             |

### Webhooks

| Method | Endpoint       | Description                       |
| ------ | -------------- | --------------------------------- |
| POST   | `/api/stripe`  | Stripe payment webhook (raw body) |
| POST   | `/api/inngest` | Inngest function endpoint         |

---

## 🔐 Authentication & Authorization

### User Authentication

- **Provider:** Clerk (OAuth + Email/Password)
- **Flow:**
  1. User signs in via Clerk UI
  2. Clerk issues JWT token
  3. Frontend includes token in Authorization header
  4. Backend validates token using `@clerk/express` middleware

### Admin Authorization

```typescript
// Middleware checks Clerk user metadata
const user = await clerkClient.users.getUser(userId);
const role = user.privateMetadata?.role;

if (role !== "admin") {
  return res.status(403).json({ message: "Admins only" });
}
```

To create an admin:

1. Sign up normally through the app
2. In Clerk Dashboard, find the user
3. Add to `privateMetadata`: `{ "role": "admin" }`

---

## 💳 Payment Processing Flow

1. **User selects seats** → `POST /api/booking/create`
2. **Backend creates:**
   - Booking document (isPaid: false)
   - Locks seats in `Show.occupiedSeats`
   - Stripe checkout session (30-min expiry)
3. **User redirected to Stripe** → Enters payment details
4. **On successful payment:**
   - Stripe sends `checkout.session.completed` webhook
   - Backend marks booking as paid
   - Triggers `app/show.booked` event → Sends email
5. **On timeout (10 min without payment):**
   - Inngest `app/checkpayment` worker runs
   - Releases seats, deletes unpaid booking

---

## 📧 Email Notifications

**Triggered by:** `app/show.booked` Inngest event (after successful payment)

**Email includes:**

- User name
- Movie title
- Show date & time (Asia/Kolkata timezone)
- Booking confirmation message

**Provider:** Brevo SMTP via Nodemailer

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User signup/login via Clerk
- [ ] Browse movies and view details
- [ ] Select show date and time
- [ ] Interactive seat selection (max 5 seats)
- [ ] Stripe checkout flow (use test card: `4242 4242 4242 4242`)
- [ ] Booking confirmation email received
- [ ] View bookings in "My Bookings"
- [ ] Admin login and dashboard access
- [ ] Add shows from TMDB now-playing
- [ ] View all bookings and shows in admin panel
- [ ] Verify seat auto-release after 10 minutes (unpaid)

### Test Stripe Integration

Use Stripe test mode cards:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Any future expiry date, any CVC

---

## 🌍 Deployment

### Vercel Deployment (Current Setup)

**Frontend:**

```json
// client/vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Backend:**

```json
// server/vercel.json
{
  "version": 2,
  "builds": [{ "src": "src/server.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/server.ts" }]
}
```

**Steps:**

1. Connect GitHub repo to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy both `client` and `server` as separate projects
4. Update `VITE_BASE_URL` to point to backend URL
5. Update `CLIENT_URL` in backend to frontend URL

### MongoDB Atlas Setup

1. Create cluster on MongoDB Atlas
2. Add IP whitelist: `0.0.0.0/0` (allow all for serverless)
3. Create database user with read/write permissions
4. Copy connection string to `MONGODB_URI`

### Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-backend-url.vercel.app/api/stripe`
3. Select event: `checkout.session.completed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Inngest Setup

1. Create account at inngest.com
2. Connect Inngest to your backend URL
3. Copy signing key to `INNGEST_SIGNING_KEY`
4. Deploy functions: `POST https://your-backend-url.vercel.app/api/inngest`

---

## 👨‍💻 Author

**Vikraman R**

- GitHub: [@VIKRAMANR7](https://github.com/VIKRAMANR7)

---

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie data and images
- [Clerk](https://clerk.dev/) for authentication infrastructure
- [Stripe](https://stripe.com/) for payment processing
- [Inngest](https://www.inngest.com/) for background job orchestration
- [BookMyShow](https://in.bookmyshow.com/) for design inspiration

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ and ☕

</div>
