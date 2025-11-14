# AgriTrust - Data Integrity Layer Frontend

A modern, tamper-proof agricultural IoT dashboard built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Landing Page** - Beautiful hero section with stats and features
- **Authentication** - Login and registration pages with role-based access (Farmer/Admin)
- **Integrity Dashboard** - 30-day verification timeline and stats
- **Verification Portal** - Cryptographic verification of IoT readings
- **Merkle Tree Visualization** - Interactive tree structure view
- **Witness Network** - Real-time witness status and signatures
- **Live Data Feed** - Streaming IoT sensor readings
- **Analytics** - Comprehensive charts and metrics

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

### API Base URL

The API base URL is configured in `/utils/api.ts`. Update line 5 to point to your backend:

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

Change this to your production URL when deploying:

```typescript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

### API Integration

All API endpoints are configured in `/utils/api.ts`. Update the `API_BASE_URL` to match your backend URL.

## 🔌 Backend Integration Guide

### Authentication API

Your backend should implement these endpoints:

#### POST `/api/auth/register`
```typescript
Request Body:
{
  email: string;
  password: string;
  name: string;
  role: 'farmer' | 'admin';
  farmerId?: string;      // For farmers only
  phone?: string;          // For farmers only
  address?: string;        // For farmers only
  farmSize?: string;       // For farmers only
}

Response:
{
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'farmer' | 'admin';
    farmerId?: string;
  }
}
```

#### POST `/api/auth/login`
```typescript
Request Body:
{
  email: string;
  password: string;
}

Response:
{
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'farmer' | 'admin';
    farmerId?: string;
  }
}
```

#### GET `/api/auth/me`
Headers: `Authorization: Bearer <token>`

Response:
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: 'farmer' | 'admin';
    farmerId?: string;
  }
}
```

### Dashboard API

#### GET `/api/dashboard/stats?days=30`
```typescript
Response:
{
  totalReadings: number;
  verifiedDays: number;
  activeWitnesses: number;
  dataIntegrity: number; // percentage 0-100
}
```

#### GET `/api/dashboard/integrity-timeline?days=30`
```typescript
Response: Array<{
  date: string; // "2025-01-15"
  readings: number;
  verified: boolean;
  witnessCount?: number;
}>
```

#### GET `/api/dashboard/recent-anchors?limit=5`
```typescript
Response: Array<{
  id: string;
  date: string;
  readings: number;
  witnessCount: number;
  verified: boolean;
}>
```

### Verification API

#### POST `/api/verification/verify`
```typescript
Request Body:
{
  readingId: string;
}

Response:
{
  consistent: boolean;
  quorumMet: boolean;
  validSigs: number;
  needed: number;
  readingData: {
    id: string;
    timestamp: string;
    farmerId: string;
    sensor: string;
    value: string;
    unit: string;
    hash: string;
    [key: string]: any;
  };
  merkleProof: Array<{
    position: 'left' | 'right';
    hash: string;
  }>;
  merkleRoot: string;
  witnesses: Array<{
    id: string;
    name: string;
    signature: string;
    timestamp: number;
  }>;
  verificationTime?: number; // milliseconds
}
```

### Merkle Tree API

#### GET `/api/merkle/tree?date=2025-01-15`
```typescript
Response:
{
  root: {
    id: string;
    hash: string;
  };
  leafCount: number;
  totalNodes: number;
  levels: number;
  nodes: {
    [level: string]: Array<{
      id: string;
      hash: string;
      type?: string;
      data?: any;
    }>;
  };
}
```

### Witness Network API

#### GET `/api/witnesses`
```typescript
Response: Array<{
  id: string;
  name: string;
  location: string;
  provider: string;
  status: 'active' | 'syncing' | 'offline';
  uptime: number; // percentage
  latency: number; // milliseconds
  signaturesCount: number;
  lastSigned?: number; // timestamp
}>
```

#### GET `/api/witnesses/signatures?limit=10`
```typescript
Response: Array<{
  id: string;
  witnessId: string;
  witnessName: string;
  merkleRoot: string;
  hash: string;
  timestamp: number;
}>
```

### Live Data Feed API

#### GET `/api/readings/live?limit=15`
```typescript
Response: Array<{
  id: string;
  farmerId: string;
  sensorType: string; // 'temperature', 'humidity', 'moisture', 'wind'
  sensorName: string;
  value: string;
  unit: string;
  timestamp: string;
  hash: string;
}>
```

#### GET `/api/readings/stats`
```typescript
Response:
{
  totalToday: number;
  ingestedPerSecond: number;
  hashedPerSecond: number;
  batchProgress: number; // percentage 0-100
}
```

#### GET `/api/readings/sensor-distribution`
```typescript
Response: Array<{
  type: string;
  name: string;
  percentage: number;
}>
```

### Analytics API

#### GET `/api/analytics/monthly`
```typescript
Response: Array<{
  month: string; // 'Jan', 'Feb', etc.
  readings: number;
  farmers: number;
  merkleRoots?: number;
}>
```

#### GET `/api/analytics/storage`
```typescript
Response: Array<{
  name: string;
  value: number; // GB
  color: string; // hex color
}>
```

#### GET `/api/analytics/regional`
```typescript
Response: Array<{
  region: string;
  farmers: number;
  readings: number;
  uptime: number; // percentage
}>
```

#### GET `/api/analytics/performance`
```typescript
Response: Array<{
  hour: string; // '0:00', '1:00', etc.
  latency: number; // milliseconds
  throughput: number; // ops/sec
}>
```

#### GET `/api/analytics/verification-stats`
```typescript
Response: Array<{
  day: string; // 'Mon', 'Tue', etc.
  verified: number;
  tampered: number;
}>
```

## 🔐 Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token is stored in localStorage
4. All subsequent API requests include `Authorization: Bearer <token>` header
5. Protected routes check for valid token before rendering

## 🎨 Customization

### Colors

The app uses a dark theme with emerald accents. To change colors, update the Tailwind classes in components.

### Logo

Replace the Shield icon in the header components with your own logo import.

## 🚀 Development

```bash
npm start
```

## 🏗️ Build

```bash
npm run build
```

## 📁 Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── Dashboard.tsx
│   │   ├── VerificationPortal.tsx
│   │   ├── MerkleTreeView.tsx
│   │   ├── WitnessNetwork.tsx
│   │   ├── LiveDataFeed.tsx
│   │   ├── Analytics.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── utils/
│   │   └── api.ts          # API client
│   ├── App.tsx
│   └── index.tsx
├── .env                     # Environment variables
└── README.md
```

## 🔄 Data Flow

1. **Landing Page** → User browses features
2. **Register/Login** → User creates account or signs in
3. **Dashboard** → Protected route, loads user data
4. **API Calls** → Components fetch data from backend
5. **Real-time Updates** → Polling intervals for live data

## 🛠️ Error Handling

The frontend includes error handling for:
- Network failures
- Invalid credentials
- Missing data
- API timeouts

Error messages are displayed using toast notifications and inline alerts.

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security

- JWT tokens stored in localStorage
- Protected routes require authentication
- Automatic token refresh on page load
- Secure API communication

## 📊 Performance

- Lazy loading for routes
- Optimized re-renders with React hooks
- Debounced API calls
- Chart data virtualization

## 🐛 Debugging

Enable debug mode by adding to `.env`:
```env
REACT_APP_DEBUG=true
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For backend integration support, refer to your DIL backend documentation.

---

**Note**: All mock data has been removed. You need to implement the backend APIs as specified above for the frontend to work correctly.