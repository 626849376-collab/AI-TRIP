# AI Mini Travel Planner

An AI-powered travel planning service designed for college students. Users input their budget, time, destination preferences, departure location, and interests, and the system automatically generates a complete travel plan, including routes, accommodation suggestions, attraction arrangements, budget analysis, and itinerary schedules.

## Project Overview

AI Mini Travel Planner is an AI-based intelligent travel planning tool designed specifically for college students. With simple inputs, users can receive personalized travel plans, helping them save planning time and enhance their travel experience.

### Product Positioning

- **Target Users**: College students, graduate students, exchange students
- **Use Cases**: Holidays, weekends, winter/summer breaks
- **Platform Support**: Web (PC/Mobile)

## Features

### MVP Features

- ✅ User Registration & Login
- ✅ AI-Powered Travel Itinerary Generation
- ✅ Budget Analysis & Planning
- ✅ Save, Edit, Delete Travel Plans
- ✅ Export Travel Plans as PDF
- ✅ Responsive Design (Mobile Support)

### Core Feature Modules

| Module | Description |
|--------|-------------|
| Registration/Login | Email registration, password login, forgot password |
| Dashboard | User homepage displaying travel plan list |
| Create Plan | Input destination, dates, budget, interests, etc. |
| AI Generation | Automatically generates complete itinerary based on user preferences |
| Trip Details | View daily itinerary, attractions, dining recommendations |
| Budget Analysis | Expense breakdown and budget allocation |
| User Center | Personal information management, trip history |

## Tech Stack

### Frontend

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: ShadCN UI (Radix UI)
- **State Management**: Zustand
- **Maps**: Leaflet
- **PDF Export**: @react-pdf/renderer

### Backend

- **API**: Next.js Route Handler
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Storage**: Supabase Storage

### Deployment

- **Code Hosting**: GitHub
- **Deployment Platform**: Vercel

## Quick Start

### Prerequisites

- Node.js >= 18
- npm or yarn
- Supabase account

### Installation Steps

1. Clone the repository

```bash
git clone https://github.com/626849376-collab/AI-TRIP.git
cd AI-TRIP
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the following configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Initialize the database

Execute `supabase_schema.sql` in the Supabase SQL editor to create the database tables.

5. Start the development server

```bash
npm run dev
```

6. Open your browser and visit

```
http://localhost:3000
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run code linting
```

## Project Structure

```
src/
├── app/           # Next.js page routes
│   ├── auth/      # Authentication pages
│   ├── dashboard/ # User dashboard
│   ├── trip/      # Trip plan pages
│   ├── profile/   # User center
│   └── admin/     # Admin panel
├── components/    # Reusable components
├── hooks/         # Custom hooks
├── lib/           # Utility libraries
├── services/      # API services
├── store/         # State management
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Page Structure

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/auth/forgot-password` | Forgot password |
| `/dashboard` | User dashboard |
| `/trip/create` | Create travel plan |
| `/trip/[id]` | Trip details |
| `/profile` | User center |
| `/admin` | Admin panel |
| `/admin/users` | User management |
| `/admin/statistics` | Statistics |

## Database Design

### Main Tables

- **user_profiles** - User information
- **trip_plans** - Travel plans
- **trip_details** - Trip details

For detailed database structure, please refer to `supabase_schema.sql`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/trip/generate` | AI generate itinerary |
| GET | `/api/trip/[id]` | Get trip details |
| PUT | `/api/trip/[id]` | Update trip |
| DELETE | `/api/trip/[id]` | Delete trip |

## Non-Functional Requirements

### Performance Metrics

- Page load time < 2 seconds
- AI generation time < 10 seconds

### Security Requirements

- HTTPS encrypted transmission
- JWT authentication
- Row Level Security (RLS) access control

### Browser Compatibility

- Chrome
- Edge
- Safari
- Mobile Browser

## License

This project is for learning and communication purposes only.