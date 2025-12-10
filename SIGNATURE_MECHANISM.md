# 🔐 AgriTrust Signature Mechanism

## Overview

The signature mechanism in AgriTrust is the **core security feature** that proves data integrity and prevents tampering. It uses **ED25519 digital signatures** from a distributed witness network to cryptographically sign daily aggregated data (Merkle roots).

---

## 🎯 Role of Signatures

Signatures serve three critical purposes:

1. **Data Integrity Proof**: Prove that sensor data hasn't been modified
2. **Distributed Trust**: Multiple independent witnesses validate the same data
3. **Non-Repudiation**: Witnesses can't deny signing data later (tamper detection)

---

## 📊 How Signatures Work - Step by Step

### 1️⃣ **Daily Reading Aggregation**

```
Day 1 (2025-12-09):
├─ Reading 1: Temperature=25.5°C → leafHash: abc123...
├─ Reading 2: Humidity=60% → leafHash: def456...
├─ Reading 3: Soil Moisture=45% → leafHash: ghi789...
└─ Reading 4: Wind Speed=5m/s → leafHash: jkl012...
```

Each reading is hashed independently using **SHA-256**:
```javascript
// From backend/src/crypto-utils.js
leafHash = SHA256(canonicalStringify(payload))
```

### 2️⃣ **Merkle Tree Building**

All daily leaf hashes are combined into a **Merkle Tree**:

```
                    merkleRoot (final hash)
                           |
                  ┌────────┴────────┐
                  |                 |
            hash12                hash34
              |                     |
        ┌─────┴─────┐         ┌─────┴─────┐
      abc123      def456    ghi789      jkl012
      (Read1)     (Read2)   (Read3)     (Read4)
```

The Merkle root represents **all readings for that day in one hash**.

**From backend/src/merkle.js:**
```javascript
export function buildMerkleRoot(leafHashes) {
  if (!leafHashes || leafHashes.length === 0) return null;
  let layer = leafHashes.slice();
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 === layer.length) {
        next.push(sha256Hex(layer[i] + layer[i]));
      } else {
        const left = layer[i];
        const right = layer[i + 1];
        const [a, b] = left < right ? [left, right] : [right, left];
        next.push(sha256Hex(a + b));
      }
    }
    layer = next;
  }
  return layer[0]; // Final Merkle root
}
```

### 3️⃣ **Signature Request to Witnesses**

Each day, the backend sends the **Merkle root** to all configured witnesses for signing:

```
Backend → Witness #1 (http://localhost:6001)
├─ POST / 
├─ Body: { dayKey: "2025-12-09", merkleRoot: "abc123..." }
└─ Response: { signature: "xyz789...", publicKey: "key1..." }

Backend → Witness #2 (http://localhost:6002)
├─ POST /
├─ Body: { dayKey: "2025-12-09", merkleRoot: "abc123..." }
└─ Response: { signature: "def456...", publicKey: "key2..." }
```

**From backend/server.js (cron job):**
```javascript
// Every 5 minutes, check if yesterday's data should be anchored
cron.schedule('*/5 * * * *', async () => {
  try {
    const dayKey = toDayKey(yesterday);
    const leaves = await Reading.find({ dayKey }).select('leafHash').lean();
    const root = buildMerkleRoot(leaves.map(l => l.leafHash));

    const sigs = [];
    for (const url of WITNESS_URLS) {
      try {
        const resp = await httpPostJson(url, { dayKey, merkleRoot: root });
        if (resp?.signature && resp?.publicKey) {
          sigs.push({ witnessUrl: url, publicKey: resp.publicKey, signature: resp.signature });
        }
      } catch (e) {
        console.warn('witness error', url, e.message);
      }
    }
    const quorumMet = sigs.length >= ANCHOR_QUORUM;
    await Anchor.create({ dayKey, merkleRoot: root, signatures: sigs, quorumMet });
  } catch (e) {
    console.error('anchor_cron_failed', e);
  }
});
```

### 4️⃣ **Witness Signing**

Each witness independently signs the message using **ED25519 cryptography**:

**From witness/witness-server.js:**
```javascript
const msg = decodeUTF8(`${dayKey}:${merkleRoot}`);
const sig = nacl.sign.detached(msg, keyPair.secretKey);
const signatureB64 = encodeBase64(sig);
```

The witness uses:
- **Private Key** (from `ED25519_SEED_HEX` in `.env`) to sign
- **Public Key** (derived from private key) to verify
- **Message Format**: `"2025-12-09:abc123..."`

### 5️⃣ **Anchor Storage**

Backend stores all witness signatures in the database:

**Anchor Document in MongoDB:**
```javascript
{
  _id: ObjectId,
  dayKey: "2025-12-09",
  merkleRoot: "abc123...",
  signatures: [
    {
      witnessUrl: "http://localhost:6001",
      publicKey: "TLWr9q15+/WrvMr8wmnYXNJlHtS4hbWGnyQa7fCluik=",
      signature: "JNH81gNK1zHFUVahrXiE/vKgyV0OtQlHMssyF6Q+rBuY..."
    },
    {
      witnessUrl: "http://localhost:6002",
      publicKey: "AnotherPublicKey==",
      signature: "AnotherSignature..."
    }
  ],
  quorumMet: true,  // If signatures.length >= ANCHOR_QUORUM
  tampered: false,
  createdAt: "2025-12-10T15:30:18.289Z",
  updatedAt: "2025-12-10T15:30:18.289Z"
}
```

### 6️⃣ **Verification**

Users can verify a reading by checking:

**From backend/src/routes/verification.js:**
```javascript
POST /api/verification/verify
Body: { readingId: "reading_id" }

Response:
{
  consistent: true,                    // Leaf exists in Merkle tree
  verified: true,                      // Merkle root matches + quorum met
  merkleRoot: "abc123...",
  merkleProof: [                       // Proof path to root
    { position: "right", hash: "def456..." },
    { position: "left", hash: "ghi789..." }
  ],
  witnesses: [                         // Witness signatures
    {
      id: "witness_0",
      name: "Witness 1",
      signature: "JNH81gNK1zHF...",
      timestamp: "2025-12-10T15:30:18.289Z"
    }
  ],
  quorumMet: true,                     // Enough signatures collected
  dayKey: "2025-12-09"
}
```

---

## ⏰ How It Works Occasionally (Cron Schedule)

The signature process runs **automatically on a cron schedule**:

### Backend Cron Jobs:

#### 1. **Anchor Cron (Every 5 minutes)**
```javascript
// backend/server.js
cron.schedule('*/5 * * * *', async () => {
  // 1. Check if anchor already exists for yesterday
  // 2. Get all readings for yesterday
  // 3. Build Merkle root
  // 4. Request signatures from all configured witnesses
  // 5. Store anchor + signatures if quorum is met
  // 6. Log: "[anchor] anchored 2025-12-09 root=abc123... sigs=2"
});
```

**When it runs:**
- `00:05, 00:10, 00:15, 00:20, ..., 23:55` (every 5 minutes)
- Only processes **yesterday's** data (not today)
- Skips if anchor already exists
- Skips if no readings for that day

#### 2. **Retention Cleanup Cron (Daily at 2:30 AM UTC)**
```javascript
cron.schedule('0 2 * * *', async () => {
  // Remove raw readings older than RAW_RETENTION_DAYS (default: 90 days)
  // Keeps anchored signatures indefinitely
});
```

#### 3. **Selective Purge Cron (Daily at 3:30 AM UTC)**
```javascript
cron.schedule('30 3 * * *', async () => {
  // Verify data integrity for last VERIFY_WINDOW_DAYS (default: 20 days)
  // Delete clean readings, keep tampered ones for audit
});
```

---

## 🔍 Witness Network Status Flow

### How Witnesses Appear in Frontend:

1. **Backend /api/witnesses endpoint (updated):**
   - Reads all configured `WITNESS_URLS` from `.env`
   - Pings each witness URL with a test signing request
   - Checks response time (latency)
   - Aggregates signature counts from Anchor documents

2. **Response format:**
```json
{
  "witnesses": [
    {
      "id": "witness_1",
      "name": "Witness 1",
      "url": "http://localhost:6001",
      "publicKey": "TLWr9q15+/WrvMr8wmnYXNJlHtS4hbWGnyQa7fCluik=",
      "status": "active",           // online = true, offline = false
      "latency": 5,                 // milliseconds
      "signatureCount": 42,         // total signatures collected
      "lastSignature": "2025-12-10T15:30:18.289Z"
    },
    {
      "id": "witness_2",
      "name": "Witness 2",
      "url": "http://localhost:6002",
      "status": "inactive",         // offline
      "latency": 0,
      "signatureCount": 0,
      "lastSignature": null
    }
  ],
  "totalActive": 1,
  "totalConfigured": 2,
  "health": "degraded"              // "healthy" if all active
}
```

3. **Frontend updates:**
   - Shows active witnesses with green indicator
   - Shows inactive witnesses with gray indicator
   - Displays latency only for active witnesses
   - Updates live signature feed in real-time

---

## 📈 Signature Lifecycle Example

**Timeline for 2025-12-09:**

```
2025-12-09 23:59:59
├─ Last readings ingested for the day
│
2025-12-10 00:05:00  ← CRON 1st check
├─ No anchor exists yet
├─ Build Merkle root from all day's readings
├─ POST http://localhost:6001 → sign
├─ POST http://localhost:6002 → sign
├─ Both respond with signatures
├─ Create Anchor with 2 signatures (quorumMet: true)
│
2025-12-10 00:10:00  ← CRON 2nd check
├─ Anchor exists, skip
│
2025-12-10 02:30:00  ← RETENTION CLEANUP
├─ Remove raw readings older than 90 days
├─ Keep anchors forever
│
2025-12-10 03:30:00  ← SELECTIVE PURGE
├─ Check data integrity for last 20 days
├─ Delete clean readings
├─ Keep tampered ones for audit
│
Anytime user verifies a reading:
├─ GET /api/verification/verify { readingId }
├─ Check if reading in Merkle tree
├─ Check if Merkle root in Anchor
├─ Check if signatures valid
├─ Return verification result
```

---

## 🛡️ Security Guarantees

### What Signatures Prove:

1. **Data Integrity**
   - If ANY reading changes, Merkle root changes
   - Witness signatures won't match modified root
   - Tampering is immediately detected

2. **Distributed Trust**
   - Single witness can't fake signatures
   - `ANCHOR_QUORUM` (min 2-3) required to establish trust
   - Collusion requires compromising multiple witnesses

3. **Timestamp Proof**
   - Anchor creation time is in database
   - Signature creation time is in metadata
   - Audit trail shows when data was signed

### Attack Scenarios & How Signatures Stop Them:

| Attack | How It's Stopped |
|--------|------------------|
| Hacker modifies reading 1 day after collection | Merkle root changes, witness signatures don't match |
| Hacker creates fake reading | Can't fake witness signature without private key |
| Hacker forges witness signature | ED25519 signature verification fails cryptographically |
| Hacker compromises 1 witness | Other witnesses' signatures still valid, quorum fails |
| Hacker backdates reading | Block timestamp proves when reading was added |

---

## 🔧 Configuration

### Backend `.env`:
```env
# Witness URLs (comma-separated)
WITNESS_URLS=http://localhost:6001,http://localhost:6002,http://localhost:6003

# How many witness signatures needed before marking anchor as "trusted"
ANCHOR_QUORUM=2

# Raw readings older than this (days) are deleted in cleanup
RAW_RETENTION_DAYS=90

# How many days back to check for integrity during purge
VERIFY_WINDOW_DAYS=20
```

### Witness `.env`:
```env
# Port this witness listens on
PORT=6001

# ED25519 seed (32 bytes as hex) - NEVER SHARE!
ED25519_SEED_HEX=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

---

## 📊 Database Schema for Signatures

### Anchor Model
```javascript
{
  dayKey: String,              // "2025-12-09"
  merkleRoot: String,          // "abc123..."
  signatures: [
    {
      witnessUrl: String,      // "http://localhost:6001"
      publicKey: String,       // Base64 encoded public key
      signature: String        // Base64 encoded ED25519 signature
    }
  ],
  quorumMet: Boolean,          // true if signatures.length >= ANCHOR_QUORUM
  tampered: Boolean,           // true if Merkle root mismatch detected
  tamperInfo: Object,          // { reason, computedRoot, anchorRoot }
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Manual Signature Testing

### Force an Anchor (for testing):
```bash
curl -X POST http://localhost:5000/api/debug/anchor-now \
  -H "Content-Type: application/json"
```

### View All Signatures:
```bash
curl -X GET http://localhost:5000/api/witnesses/signatures/recent \
  -H "Authorization: Bearer {token}"
```

### Verify a Reading:
```bash
curl -X POST http://localhost:5000/api/verification/verify \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"readingId": "reading_id"}'
```

---

## 📋 Summary Table

| Aspect | Details |
|--------|---------|
| **Signature Type** | ED25519 (asymmetric cryptography) |
| **What's Signed** | Merkle root of daily readings |
| **Who Signs** | Independent witness nodes |
| **How Often** | Every 5 minutes (cron) for yesterday's data |
| **Quorum** | Configurable (default: 2 witnesses) |
| **Storage** | MongoDB Anchor documents |
| **Verification** | User can verify any reading against signatures |
| **Tamper Detection** | If data changes, signature verification fails |
| **Distributed** | Multiple witnesses = multiple signatures |

---

## 🎓 Key Takeaways

1. **Signatures = Proof of Data Integrity** - Cryptographic proof that data hasn't changed
2. **ED25519 = Strong Cryptography** - Military-grade signing algorithm
3. **Witness Network = Distributed Trust** - No single point of failure
4. **Cron Jobs = Automatic** - No manual intervention needed
5. **Quorum = Consensus** - Multiple witnesses must agree
6. **Merkle Tree = Efficient** - Can verify one reading without all readings

---

*For more details, see `backend/src/routes/witnesses.js`, `backend/server.js` (cron section), and `witness/witness-server.js`*
