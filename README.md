# 🌾 AgriTrust - Decentralized Data Integrity Platform

**AgriTrust** is a comprehensive Web3-based agricultural data integrity system that leverages blockchain principles, cryptographic proofs, and distributed validation networks to ensure transparency, traceability, and trust in agricultural supply chains.

> **Building Trust in Agriculture with Decentralized Data**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

AgriTrust addresses critical challenges in agricultural supply chains by providing:

- **Data Integrity Verification**: Cryptographic proof that sensor data hasn't been tampered with
- **Distributed Trust**: Multiple independent witnesses validate daily data anchors
- **Merkle Tree Proofs**: Efficient verification of individual readings within aggregated data
- **Transparent Audit Trail**: Complete history of all readings, anchors, and witness signatures
- **Real-time Monitoring**: Live dashboard for viewing sensor data and system health

### Use Cases

1. **Farmers**: Track IoT sensor readings (temperature, humidity, soil moisture) with tamper-proof verification
2. **Suppliers/Buyers**: Verify authenticity and integrity of agricultural data
3. **Regulators**: Audit complete history with cryptographic proof of authenticity
4. **Consumers**: Trace product origins with verified environmental conditions

---

## ✨ Key Features

### 🔐 Security & Integrity
- SHA-256 cryptographic hashing for all readings
- Merkle tree aggregation for efficient batch verification
- ED25519 digital signatures from distributed witness network
- Quorum-based anchor verification (configurable threshold)
- Tamper detection and audit logging

### 📊 Data Management
- Real-time IoT sensor reading ingestion
- Daily data anchoring with Merkle root computation
- Selective data purge with retention policies
- Comprehensive audit trails with timestamps

### 👥 User Management
- Role-based access control (Farmer, Admin)
- JWT token authentication with refresh tokens
- Password security with bcrypt hashing
- User registration and profile management

### 📈 Analytics & Monitoring
- Real-time dashboard with live data feeds
- Historical analytics and performance metrics
- Trust score calculations
- Device health monitoring
- Monthly data distribution analysis

### 🌐 Witness Network
- Distributed validator network using ED25519 signatures
- Configurable witness URLs and quorum requirements
- Signature verification and validation
- Public key management

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AgriTrust Platform Architecture                   │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐
│   FRONTEND (React + Vite)       │
│  http://localhost:5173          │
├────────────────────────────────┤
│ • Landing Page                 │
│ • Login/Register               │
│ • Dashboard                    │
│ • Device Management            │
│ • Data Verification Portal     │
│ • Merkle Tree Visualization    │
│ • Witness Network Display      │
│ • Live Data Feed               │
│ • Analytics & Reporting        │
└────────────────────────────────┘
            ↓ HTTP/REST + JWT
┌────────────────────────────────┐
│   BACKEND (Express.js)          │
│  http://localhost:5000          │
├────────────────────────────────┤
│ • Auth Service                 │
│ • Device Management            │
│ • Reading Ingestion            │
│ • Merkle Tree Building         │
│ • Daily Anchor Creation        │
│ • Witness Coordination         │
│ • Verification Engine          │
│ • Analytics Service            │
│ • Admin Functions              │
└────────────────────────────────┘
   ↓ HTTP         ↓ Database
   │           ┌─────────────┐
   │           │  MongoDB    │
   │           │  Database   │
   │           └─────────────┘
   │
   ├─→ ┌──────────────────┐
   │   │ Witness #1       │
   │   │ :6001            │
   │   │ ED25519 Signing  │
   │   └──────────────────┘
   │
   ├─→ ┌──────────────────┐
   │   │ Witness #2       │
   │   │ :6002            │
   │   │ ED25519 Signing  │
   │   └──────────────────┘
   │
   └─→ ┌──────────────────┐
       │ Witness #N       │
       │ :600X            │
       │ ED25519 Signing  │
       └──────────────────┘
```

### Data Flow

1. **Reading Ingestion**: IoT devices send sensor data to backend
2. **Daily Aggregation**: All readings for a day are aggregated
3. **Merkle Tree**: Readings are combined into a Merkle tree structure
4. **Anchoring**: Merkle root is sent to witness network for signatures
5. **Verification**: Users can verify readings against Merkle proofs and witness signatures
6. **Audit Trail**: All operations are stored with timestamps and user info

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Document database
- **Mongoose** - ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Node-cron** - Scheduled tasks
- **CORS** - Cross-origin support

### Witness Network
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TweetNaCl.js** - ED25519 signing
- **dotenv** - Environment configuration

---

## 📁 Project Structure

```
AgriTrust/
├── README.md                    # This file
├── SYSTEM_ARCHITECTURE.md      # Detailed system design
├── package.json                 # Root package config
│
├── frontend-fixed/              # React Frontend Application
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # Entry point
│   │   ├── index.css            # Global styles
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # Authentication context
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Landing page
│   │   │   ├── LoginPage.tsx     # Login form
│   │   │   └── RegisterPage.tsx  # Registration form
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx      # Main dashboard layout
│   │   │   ├── AdminDashboard.tsx       # Admin panel
│   │   │   ├── Dashboard.tsx            # User dashboard
│   │   │   ├── DeviceManagement.tsx     # Device management UI
│   │   │   ├── VerificationPortal.tsx   # Verification interface
│   │   │   ├── MerkleTreeView.tsx       # Merkle tree visualization
│   │   │   ├── WitnessNetwork.tsx       # Witness display
│   │   │   ├── LiveDataFeed.tsx         # Real-time data
│   │   │   ├── Analytics.tsx            # Analytics charts
│   │   │   ├── ProtectedRoute.tsx       # Auth guard
│   │   │   └── ui/                      # UI component library (Radix)
│   │   ├── utils/
│   │   │   └── api.ts           # API client
│   │   └── styles/
│   │       └── globals.css
│   └── README.md
│
├── backend/                     # Express.js Backend API
│   ├── package.json
│   ├── server.js               # Main server entry point
│   ├── Dockerfile              # Docker configuration
│   ├── test-api.js             # API testing script
│   ├── seed-data.js            # Database seeding
│   ├── check-admin.js          # Admin verification script
│   ├── data/
│   │   └── ksdev002-21days.json # Sample IoT data
│   └── src/
│       ├── crypto-utils.js     # SHA256, canonical stringify
│       ├── merkle.js           # Merkle tree building
│       ├── utils.js            # Helper functions
│       ├── models/             # Database schemas
│       │   ├── User.js         # User model (farmers, admins)
│       │   ├── Device.js       # IoT device model
│       │   ├── Reading.js      # Sensor reading model
│       │   ├── Anchor.js       # Daily anchor with signatures
│       │   └── FarmerDayAudit.js # Audit trail
│       ├── middleware/
│       │   └── auth.js         # JWT authentication middleware
│       ├── routes/             # API endpoint handlers
│       │   ├── auth.js         # Auth endpoints (register, login)
│       │   ├── devices.js      # Device CRUD operations
│       │   ├── readings.js     # Reading ingestion & retrieval
│       │   ├── dashboard.js    # Dashboard stats & timeline
│       │   ├── verification.js # Reading verification
│       │   ├── merkle.js       # Merkle tree endpoints
│       │   ├── witnesses.js    # Witness management
│       │   ├── analytics.js    # Analytics data
│       │   └── admin.js        # Admin operations
│       └── services/
│           └── integrity.js    # Data integrity verification
│
└── witness/                     # Distributed Witness Node
    ├── package.json
    ├── Dockerfile
    ├── witness-server.js        # Main witness server
    └── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB** (local or Atlas URI)
- **Git**

### Step 1: Clone Repository

```bash
git clone https://github.com/Sohan0510/AgriTrust.git
cd AgriTrust
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/agritrust
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
WITNESS_URLS=http://localhost:6001,http://localhost:6002
ANCHOR_QUORUM=2
RAW_RETENTION_DAYS=90
VERIFY_WINDOW_DAYS=20
NODE_ENV=development
EOF

# Seed sample data (optional)
npm run dev  # or: node server.js
```

### Step 3: Frontend Setup

```bash
cd ../frontend-fixed

# Install dependencies
npm install

# Create .env file (if needed)
# The frontend will use http://localhost:5000 by default
```

### Step 4: Witness Node Setup

```bash
cd ../witness

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=6001
ED25519_SEED_HEX=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
EOF

# Run witness node
npm start
```

For multiple witnesses, create additional `.env` files with different ports and seed keys.

---

## ▶️ Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
# Backend running on http://localhost:5000
```

### Terminal 2: Start Witness Node(s)

```bash
cd witness
npm start
# Witness running on http://localhost:6001
```

Optional: Start second witness
```bash
PORT=6002 ED25519_SEED_HEX=1111111111111111111111111111111111111111111111111111111111111111 npm start
```

### Terminal 3: Start Frontend

```bash
cd frontend-fixed
npm run dev
# Frontend running on http://localhost:5173
```

Visit: **http://localhost:5173**

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "farmer@example.com",
  "password": "secure_password",
  "role": "farmer"
}

Response: { token, refreshToken, user }
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "secure_password"
}

Response: { token, refreshToken, user }
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response: { user }
```

### Device Management

#### Create Device
```
POST /api/devices
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Field Sensor A",
  "location": "Field 1",
  "type": "DHT22"
}

Response: { device }
```

#### Get User Devices
```
GET /api/devices
Authorization: Bearer {token}

Response: { devices: [...] }
```

### Reading Management

#### Submit Reading
```
POST /api/readings
Authorization: Bearer {token}
Content-Type: application/json

{
  "deviceId": "device_id",
  "payload": {
    "temperature": 25.5,
    "humidity": 60,
    "soil_moisture": 45
  }
}

Response: { reading, leafHash }
```

#### Get Live Readings
```
GET /api/readings/live
Authorization: Bearer {token}

Response: { readings: [...] }
```

#### Get Reading Stats
```
GET /api/readings/stats
Authorization: Bearer {token}

Response: { stats }
```

### Verification

#### Verify Reading
```
POST /api/verification/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "readingId": "reading_id"
}

Response: {
  "consistent": true,
  "verified": true,
  "merkleRoot": "hash...",
  "merkleProof": [...],
  "witnesses": [...],
  "quorumMet": true
}
```

### Dashboard

#### Get Dashboard Stats
```
GET /api/dashboard/stats
Authorization: Bearer {token}

Response: { stats, trustScore, recentAnchors }
```

#### Get Dashboard Timeline
```
GET /api/dashboard/timeline
Authorization: Bearer {token}

Response: { timeline }
```

### Witness Network

#### Get Active Witnesses
```
GET /api/witnesses
Authorization: Bearer {token}

Response: { witnesses: [...] }
```

#### Get Witness Details
```
GET /api/witnesses/:id
Authorization: Bearer {token}

Response: { witness }
```

### Analytics

#### Get Analytics Data
```
GET /api/analytics
Authorization: Bearer {token}
Query Params: ?period=month

Response: { analytics, charts }
```

### Health Check

#### Health Status (No Auth Required)
```
GET /api/health

Response: { ok: true, status: "healthy", timestamp }
```

---

## 💾 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: 'farmer' | 'admin',
  timestamps: { createdAt, updatedAt }
}
```

### Device Model
```javascript
{
  userId: ObjectId,
  name: String,
  location: String,
  type: String,
  isActive: Boolean,
  lastReading: Date,
  timestamps: { createdAt, updatedAt }
}
```

### Reading Model
```javascript
{
  payload: Object,           // Sensor data
  leafHash: String,          // SHA256 hash of payload
  ts: Date,                  // Reading timestamp
  dayKey: String,            // YYYY-MM-DD
  farmerId: ObjectId,        // User reference
  deviceId: String,
  timestamps: { createdAt, updatedAt }
}
```

### Anchor Model
```javascript
{
  dayKey: String (unique),   // YYYY-MM-DD
  merkleRoot: String,        // Root hash of all readings
  signatures: [
    {
      witnessUrl: String,
      publicKey: String,
      signature: String      // ED25519 signature
    }
  ],
  quorumMet: Boolean,        // Quorum threshold reached
  tampered: Boolean,         // Tampering detected
  tamperInfo: Object,        // Tampering details
  timestamps: { createdAt, updatedAt }
}
```

### FarmerDayAudit Model
```javascript
{
  farmerId: ObjectId,
  dayKey: String,
  action: String,            // 'PURGE_REQUEST', 'PURGE_EXECUTED', etc.
  readingCount: Number,
  merkleRoot: String,
  signatures: [String],
  timestamps: { createdAt, updatedAt }
}
```

---

## 🐳 Deployment

### Docker

#### Build Backend Image
```bash
cd backend
docker build -t agritrust-backend:latest .
```

#### Build Witness Image
```bash
cd witness
docker build -t agritrust-witness:latest .
```

#### Run with Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: agritrust

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://mongodb:27017/agritrust
      JWT_SECRET: dev_secret_key
      WITNESS_URLS: http://witness1:6001,http://witness2:6002
    depends_on:
      - mongodb

  witness1:
    build: ./witness
    ports:
      - "6001:6001"
    environment:
      ED25519_SEED_HEX: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

  witness2:
    build: ./witness
    ports:
      - "6002:6002"
    environment:
      ED25519_SEED_HEX: 1111111111111111111111111111111111111111111111111111111111111111

  frontend:
    build: ./frontend-fixed
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:5000
```

Run:
```bash
docker-compose up -d
```

---

## 📝 Environment Configuration

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/agritrust

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# Witness Network
WITNESS_URLS=http://localhost:6001,http://localhost:6002
ANCHOR_QUORUM=2

# Data Retention
RAW_RETENTION_DAYS=90
VERIFY_WINDOW_DAYS=20
```

### Witness (.env)

```env
# Server
PORT=6001

# ED25519 Signing
ED25519_SEED_HEX=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

---

## 🧪 Testing

### Test API Endpoints
```bash
cd backend
node test-api.js
```

### Seed Sample Data
```bash
cd backend
node seed-data.js
```

### Check Admin Status
```bash
cd backend
node check-admin.js
```

---

## 🔐 Security Considerations

1. **JWT Tokens**: Access tokens expire in 1 hour, refresh tokens in 7 days
2. **Password Hashing**: bcryptjs with 10-salt rounds
3. **CORS**: Configured for localhost development
4. **Input Validation**: All inputs validated before processing
5. **Database Indexing**: Key fields indexed for performance
6. **Witness Quorum**: Requires multiple independent signatures

### Production Recommendations

- Use environment variables for all secrets
- Enable HTTPS/TLS
- Configure firewall rules
- Use managed MongoDB (Atlas, Azure)
- Implement rate limiting
- Add request logging and monitoring
- Use secrets management service
- Regular security audits

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

### Code Style

- Use ES modules (import/export)
- Follow async/await patterns
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions focused and small

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support & Documentation

- **Architecture Details**: See `SYSTEM_ARCHITECTURE.md`
- **Issue Tracker**: GitHub Issues
- **Documentation**: Check individual README files in directories
- **Email**: contact@agritrust.dev

---

## 🚀 Future Enhancements

- [ ] Mobile app for farmers
- [ ] Blockchain integration (Ethereum, Polygon)
- [ ] Advanced analytics and ML-based anomaly detection
- [ ] Supply chain tracking
- [ ] Consumer verification QR codes
- [ ] API rate limiting and usage metering
- [ ] Multi-language support
- [ ] Advanced reporting and exports

---

## 👥 Contributors

- **Creator**: Sohan0510
- **Contributors**: [Add your name here]

---

**AgriTrust** - Building Trust in Agricultural Supply Chains with Decentralized Technology

*Last Updated: December 2025*
