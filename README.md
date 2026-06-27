# HealthFirst360 — Health Check-up Flow Management

AI-powered queue management for hospital health check-up departments, aligned with the flow specified in your requirements and inspired by [HealthFirst360](http://healthfirst360.com/) (live token tracking, multi-department queues, smart routing).

## System Flow

```
Registration
      │
      ▼
Queue Engine
      │
      ├── ECG Queue
      ├── X-Ray Queue
      ├── USG Queue
      ├── Mammography Queue
      ├── 2D Echo Queue
      ├── TMT Queue
      └── Dental Queue
      │
      ▼
Automatic Routing
      │
      ▼
Completion Dashboard
```

## Features

### Patient Side
- Online registration with health package selection
- QR code check-in
- Digital token number
- Live queue status & estimated waiting time
- SMS/WhatsApp/In-App notifications (placeholder)
- Department-wise appointment schedule

### Receptionist Dashboard
- Patient registration log-in stats
- QR check-in desk
- Token search & quick actions

### Doctor Schedule (placeholder)
- Department-wise doctor availability
- Time slot status (available / booked / in progress)

### MOIS Report (placeholder)
- Medical report status tracking
- Pending / partial / completed results

### Coordinator Dashboard
- Real-time patient tracking with color-coded pathways
- Department workload monitoring
- Automatic patient assignment via AI
- Delay alerts
- Daily patient completion report

### Department Dashboard
- Current patient & next 3 in queue
- Average examination time
- Status management: Waiting, In Progress, Completed, Delayed

### AI Queue Optimization
- Predict waiting time using AI (heuristic placeholder)
- Redirect patients to next available department
- Balance workload across departments
- Alert staff when queues exceed targets
- Live occupancy per department

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Socket.io |
| Backend | Node.js, Express, TypeScript, Socket.io |
| Real-time | WebSocket broadcasts every 5 seconds |

## Getting Started

### Prerequisites
- Node.js 18+

### One command — combined app (recommended)

Install dependencies once:

```powershell
cd "c:\Users\LENOVO\Desktop\Health Check up Flow management"
npm run install:all
```

Start frontend + backend together on **one port**:

```powershell
npm run dev
```

**Open the app:** [http://localhost:3001](http://localhost:3001)

Or double-click **`start-app.bat`** in the project folder, or open **`open-app.html`** for a launch link.

### Quick links

| Link | Purpose |
|------|---------|
| [http://localhost:3001](http://localhost:3001) | Full app (UI + API) |
| [http://localhost:3001/api/queue](http://localhost:3001/api/queue) | Queue API |
| [http://localhost:3001/health](http://localhost:3001/health) | Health check |

### Separate dev (optional)

```powershell
# Backend only
cd backend && npm run dev

# Frontend only (with proxy to API)
cd frontend && npm run dev
```

## Health Packages

| Package | Departments Included |
|---------|---------------------|
| Basic | Lab, ECG, Doctor |
| Standard | Lab, ECG, X-Ray, Doctor |
| Comprehensive | Lab, ECG, X-Ray, USG, 2D Echo, Doctor |
| Executive | All departments |
| Cardiac | Lab, ECG, 2D Echo, TMT, Doctor |
| Women's Health | Lab, USG, Mammography, Doctor |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new patient |
| POST | `/api/check-in` | QR/token check-in |
| GET | `/api/queue` | All department queue stats |
| GET | `/api/ai/predictions` | AI wait time predictions |
| GET | `/api/ai/suggestions` | Routing suggestions |
| GET | `/api/dashboard/stats` | Registration statistics |
| GET | `/api/dashboard/completion` | Daily completion report |

## Production Integration Placeholders

- **AI Model**: Replace `aiOptimizer.ts` heuristic with trained ML model
- **Notifications**: Connect Twilio/WhatsApp Business API in `notifications.ts`
- **HIS/MOIS**: Integrate hospital information system for doctor schedules
- **Database**: Replace in-memory store with PostgreSQL/MongoDB

## License

MIT
