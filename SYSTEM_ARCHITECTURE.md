# 🏗️ AgriTrust System Architecture

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AgriTrust Platform                                  │
│                    Decentralized Data Integrity System                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐
│    FRONTEND (React + Vite)       │
│   http://localhost:5173          │
├──────────────────────────────────┤
│                                  │
│  ┌──────────────────────────┐   │
│  │  Dashboard              │   │
│  │  - Stats & Timeline     │   │
│  │  - Recent Anchors       │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Verification Portal    │   │
│  │  - Verify Readings      │   │
│  │  - Merkle Proofs        │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Merkle Tree View       │   │
│  │  - Tree Visualization   │   │
│  │  - Node Details         │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Witness Network        │   │
│  │  - Active Witnesses     │   │
│  │  - Live Signatures      │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Live Data Feed         │   │
│  │  - Sensor Readings      │   │
│  │  - Real-time Updates    │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Analytics              │   │
│  │  - Monthly Data         │   │
│  │  - Performance Metrics  │   │
│  └──────────────────────────┘   │
│                                  │
└──────────────────────────────────┘
            │
            │ HTTP/REST + JWT Auth
            │
            ▼
┌──────────────────────────────────┐
│     BACKEND (Express.js)         │
│   http://localhost:5000          │
├──────────────────────────────────┤
│                                  │
│  ┌──────────────────────────┐   │
│  │  Auth Routes             │   │
│  │  /auth/register          │   │
│  │  /auth/login             │   │
│  │  /auth/me                │   │
│  │  /auth/refresh           │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Dashboard Routes        │   │
│  │  /dashboard/stats        │   │
│  │  /dashboard/timeline     │   │
│  │  /dashboard/anchors      │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Verification Routes     │   │
│  │  /verification/verify    │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Merkle Routes           │   │
│  │  /merkle/tree            │   │
│  │  /merkle/node/:id        │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Witness Routes          │   │
│  │  /witnesses              │   │
│  │  /witnesses/:id          │   │
│  │  /witnesses/signatures   │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Readings Routes         │   │
│  │  /readings/live          │   │
│  │  /readings/stats         │   │
│  │  /readings/distribution  │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │  Analytics Routes        │   │
│  │  /analytics/monthly      │   │
│  │  /analytics/storage      │   │
│  │  /analytics/regional     │   │
│  │  /analytics/performance  │   │
│  │  /analytics/verification │   │
│  └──────────────────────────┘   │
│                                  │
└──────────────────────────────────┘
            │
            │ Query & Mutation
            │
            ▼
┌──────────────────────────────────┐
│       MONGODB ATLAS              │
│     (Cloud Database)             │
├──────────────────────────────────┤
│                                  │
│  Collections:                    │
│  - users (authenticated access)  │
│  - readings (sensor data)        │
│  - anchors (merkle roots)        │
│  - devices (IoT devices)         │
│  - farmerDayAudits (verification)│
│                                  │
└──────────────────────────────────┘
            ▲        ▲
            │        │
            │        └─────────────┐
            │                      │
   Signature│                      │Query
  Request   │              Merkle Tree
            │              Building
            │                      │
            ▼                      ▼
┌──────────────────────┐  ┌────────────────────┐
│  WITNESS SERVER 1    │  │ WITNESS SERVER 2   │
│ Port 6001            │  │ Port 6002          │
├──────────────────────┤  ├────────────────────┤
│                      │  │                    │
│ ED25519 Signer       │  │ ED25519 Signer     │
│                      │  │                    │
│ Receives:            │  │ Receives:          │
│ - dayKey             │  │ - dayKey           │
│ - merkleRoot         │  │ - merkleRoot       │
│                      │  │                    │
│ Returns:             │  │ Returns:           │
│ - signature (base64) │  │ - signature (base64)
│ - publicKey (hex)    │  │ - publicKey (hex)  │
│                      │  │                    │
└──────────────────────┘  └────────────────────┘
```

## Data Flow: Reading Verification

```
1. USER SUBMITS READING ID
   └─→ Frontend: VerificationPortal
       └─→ POST /api/verification/verify { readingId }

2. BACKEND PROCESSES REQUEST
   ├─→ Find Reading in DB
   ├─→ Get dayKey from Reading
   ├─→ Find Anchor for that dayKey
   └─→ Fetch all Readings for dayKey

3. MERKLE TREE RECONSTRUCTION
   ├─→ Build Merkle tree from reading hashes
   ├─→ Generate Merkle proof for specific reading
   └─→ Compare with stored merkleRoot

4. VERIFY SIGNATURES
   ├─→ Retrieve witness signatures from Anchor
   ├─→ Count valid signatures (quorum check)
   └─→ Determine verification status

5. RESPONSE TO FRONTEND
   ├─→ Verification result (true/false)
   ├─→ Merkle proof path
   ├─→ Witness signatures
   └─→ Quorum status

6. FRONTEND DISPLAYS
   ├─→ Green checkmark if verified
   ├─→ Merkle proof chain visualization
   ├─→ Witness signatures list
   └─→ Overall integrity status
```

## Daily Anchoring Process

```
CRON JOB RUNS EVERY 5 MINUTES
    │
    ▼
CHECK FOR YESTERDAY'S DATA
    │
    ├─→ Is Anchor already created? YES → SKIP
    │
    └─→ NO → Continue
        │
        ▼
    FETCH ALL READINGS FOR YESTERDAY
        │
        ├─→ Empty? YES → SKIP
        │
        └─→ Have readings? Continue
            │
            ▼
        BUILD MERKLE ROOT
            │
            └─→ Hash all readings into tree
                │
                ▼
            REQUEST SIGNATURES FROM WITNESSES
                │
                ├─→ POST to Witness 1
                │   └─→ Returns: signature + publicKey
                │
                └─→ POST to Witness 2
                    └─→ Returns: signature + publicKey
                    │
                    ▼
                COLLECT SIGNATURES
                    │
                    ├─→ Count: 2 signatures
                    ├─→ Needed: 2 (ANCHOR_QUORUM)
                    ├─→ Quorum Met? YES ✓
                    │
                    ▼
                CREATE ANCHOR RECORD
                    │
                    ├─→ dayKey: yesterday's date
                    ├─→ merkleRoot: computed hash
                    ├─→ signatures: [sig1, sig2]
                    ├─→ quorumMet: true
                    ├─→ tampered: false
                    │
                    ▼
                SAVE TO MONGODB
                    │
                    └─→ Anchor stored & verified!
```

## Authentication & Authorization Flow

```
USER REGISTRATION/LOGIN
    │
    ├─→ POST /auth/register
    │   ├─→ Check if email exists
    │   ├─→ Hash password with bcrypt
    │   ├─→ Create User in MongoDB
    │   └─→ Return: { token, refreshToken, user }
    │
    └─→ POST /auth/login
        ├─→ Find user by email
        ├─→ Compare password hash
        ├─→ Generate tokens
        └─→ Return: { token, refreshToken, user }

TOKEN STORED IN FRONTEND
    │
    ├─→ localStorage.setItem('token', token)
    │
    └─→ localStorage.setItem('refreshToken', refreshToken)

SUBSEQUENT REQUESTS
    │
    ├─→ Get token from localStorage
    │
    ├─→ Add to request header:
    │   Authorization: Bearer <token>
    │
    └─→ Backend receives request
        │
        ├─→ Extract token from header
        │
        ├─→ Verify JWT signature
        │   ├─→ Valid? ✓ Continue
        │   └─→ Invalid? ✗ Return 401
        │
        ├─→ Fetch user from DB
        │
        └─→ Attach user to request (req.user)

ON TOKEN EXPIRY
    │
    ├─→ Frontend gets 401 error
    │
    ├─→ Use refreshToken to get new token
    │   POST /auth/refresh { refreshToken }
    │
    ├─→ Backend validates refreshToken
    │
    └─→ Return new accessToken
        │
        └─→ Frontend stores and retries original request
```

## System Health Check

```
┌──────────────────────────────────────────────────────┐
│           JUDGES' HEALTH CHECK COMMANDS              │
└──────────────────────────────────────────────────────┘

1. FRONTEND CHECK
   URL: http://localhost:5173
   Expected: Dashboard loads with greeting

2. BACKEND CHECK
   URL: http://localhost:5000/api/health
   Expected: { ok: true, status: "healthy", timestamp: "..." }

3. WITNESS 1 CHECK
   URL: http://localhost:6001/health
   Expected: { ok: true }

4. WITNESS 2 CHECK
   URL: http://localhost:6002/health
   Expected: { ok: true }

5. DATABASE CHECK
   MongoDB Atlas connection verified on startup

6. TEST FLOW
   ├─→ Register new account
   ├─→ Login with credentials
   ├─→ View Dashboard (should show stats)
   ├─→ Import sample data (optional)
   ├─→ Trigger anchoring: POST /api/debug/anchor-each
   └─→ Verify a reading: Use VerificationPortal

ALL CHECKS PASSING = SYSTEM READY ✓
```

## Key Architecture Decisions

### 1. **RESTful API Design**
- Clean separation of concerns
- Clear endpoint naming
- Standard HTTP methods & status codes

### 2. **JWT Authentication**
- Stateless authentication
- Easy to scale horizontally
- Secure token-based access

### 3. **MongoDB Collections**
- Flexible document structure
- Supports complex queries
- Easy to aggregate data

### 4. **Decentralized Witnesses**
- Independent signature collection
- No single point of failure
- Quorum-based consensus

### 5. **Frontend Component Architecture**
- Modular, reusable components
- Clear separation of concerns
- Easy to test and maintain

---

**Total Components**: 6 Dashboard Tabs + Auth Pages + API Routes
**Total Backend Routes**: 25+ endpoints
**Total Database Collections**: 5
**Total Witness Servers**: 2 (Quorum = 2)
**Authentication**: JWT with refresh tokens
**Database**: MongoDB Atlas
**Frontend Framework**: React 18 + TypeScript + Tailwind
**Backend Framework**: Express.js + Node.js
