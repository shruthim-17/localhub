# KaryaMitra Product Roadmap

## Running The Dynamic Backend
The Express server serves the frontend and API from `E:\website`.

```powershell
Set-Location E:\website
$env:MONGODB_URI = 'mongodb://127.0.0.1:27017'
$env:MONGODB_DB = 'karyamitra'
npm start
```

`MONGODB_URI` is optional for local UI development. Without it, the API uses temporary in-memory data. With it, users, jobs, services, and posts use MongoDB and survive server restarts. Never commit credentials or a production connection string.

Authentication uses email OTP through Resend. Set `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL` in `.env`; OTP hashes and expiry records are stored in MongoDB.

## Phase 1 — Static UI (Completed)
- Splash Screen
- Login
- Home
- Services
- Provider Profile
- Request Service
- Work
- Community (basic idea)
- Profile

## Phase 2 — User Flow
The next priority is to make the product feel complete by mapping every interaction end-to-end.

### Service Flow
1. Login
2. Home
3. Need a Service
4. Search / Browse Categories
5. Provider List
6. Provider Profile
7. Request Service
8. Quote Received
9. Accept Quote
10. Professional On the Way
11. Service Completed
12. Payment
13. Rating & Review

### Job Seeker Flow
1. Home
2. Need Work
3. Search Jobs
4. Job Details
5. Apply
6. Employer Accepts
7. Navigation to Job
8. Work Completed
9. Payment Received
10. Review

### Employer Flow
1. Home
2. Post Job
3. Applications
4. Select Worker
5. Worker Arrives
6. Complete Job
7. Payment
8. Review

### Community Flow
1. Home
2. Create Post
3. Nearby People Notified
4. People Respond
5. Request Completed

## Phase 3 — Information Architecture
### Sitemap
```
Home
│
├── Services
│     ├── Categories
│     ├── Search
│     ├── Provider List
│     ├── Provider Profile
│     ├── Request Service
│     ├── Quotes
│     └── Booking Confirmation
│
├── Work
│     ├── Jobs
│     ├── Job Details
│     ├── Apply
│     ├── Employer Dashboard
│     ├── Post Job
│     ├── Applications
│     └── Work Confirmation
│
├── Community
│     ├── Feed
│     ├── Blood Donation
│     ├── Emergency Help
│     ├── Lost & Found
│     ├── Roommate
│     ├── Buy & Sell
│     └── Create Post
│
└── Profile
      ├── Wallet
      ├── Settings
      ├── Reviews
      ├── Verification
      ├── History
      └── Saved Items
```

## Phase 4 — Backend Design
### Main Entities
- Users
- Service Providers
- Services
- Jobs
- Job Applications
- Community Posts
- Bookings
- Quotes
- Payments
- Reviews
- Notifications
- Messages

### Suggested Relationships
- User has many Bookings
- User has many Job Applications
- Service Provider has many Services
- Service Provider has many Bookings
- Job has many Applications
- Booking has one Quote
- Booking has many Messages
- Community Post has many Responses

## Phase 5 — Prototype
Before writing backend code, wire the screen transitions in a prototype tool.
- Create a clickable flow from Home → Search → Provider → Book → Success
- Add the same for Work and Community
- Make the Post action feel fast and clear

## Phase 6 — Development Recommendations
### Frontend
- Flutter or React Native for cross-platform mobile
- Keep the current static screens as UI reference
- Build the flows step-by-step starting from Home

### Backend
- Choose Node.js + Express, Django, or Spring Boot
- Database: MongoDB
- Authentication: OTP login
- Notifications: email through Resend, with in-app notifications planned
- Payments: Razorpay (India)

## Phase 7 — Future Differentiation
### AI-assisted entry point
Start with a single question:
- "What do you need today?"

Route user input automatically to the right experience:
- plumber → Services
- looking for work → Jobs
- need O+ blood → Community
- roommate → Community

### Future AI features
- natural language request routing
- service recommendation
- job matching
- translated messaging
- quote estimation

## Recommended Next Steps
1. Identify missing screens for each flow
2. Create a sitemap and connect the flows visually
3. Decide backend entities and key APIs
4. Prototype the flow before coding
5. Build the first end-to-end path: Service search → booking → quote → completion
