# ZKSAP: Zero-Knowledge Signature Authentication Protocol

ZKSAP is a decentralized, passwordless authentication framework built on **Ed25519 Elliptic Curve Cryptography** and **BIP-39 Mnemonic Derivation**. It eliminates the need for central password storage, making authentication immune to database breaches and phishing.


![Security](https://img.shields.io/badge/Cryptography-Ed25519-blueviolet?style=for-the-badge&logo=secret-network)
![Mnemonic](https://img.shields.io/badge/Recovery-BIP--39-orange?style=for-the-badge&logo=bitcoin)
![Protocol](https://img.shields.io/badge/Protocol-ZKSAP-00b894?style=for-the-badge)
![Encryption](https://img.shields.io/badge/Identity-Self--Custody-red?style=for-the-badge&logo=lock)
![ZKP](https://img.shields.io/badge/Auth-Zero--Knowledge-lightgrey?style=for-the-badge)


## 🛠 Cryptographic Foundations

| Library | Purpose |
| --- | --- |
| **`bip39`** | Handles Mnemonic generation and Seed derivation. |
| **`@noble/curves`** | High-performance, audited Ed25519 implementation. |
| **`better-sqlite3`** | Persistent storage for Public Keys and active Session Nonces. |

---

## 🚀 The Authentication Lifecycle

### Stage 1: Registration (Identity Genesis)

In this stage, a human-readable mnemonic is transformed into a fixed point on the Edwards Curve.

**1. Entropy to Mnemonic:**
A random 128-bit integer $E$ is generated and converted into a 12-word phrase $W$ using the BIP-39 wordlist.

**2. Mnemonic to Seed:**
The phrase $W$ is hashed using PBKDF2 with 2048 iterations to produce a 512-bit seed $S$.


$$S = \text{PBKDF2}(\text{HMAC-SHA512}, W, \text{"mnemonic"}, 2048)$$

**3. Key Derivation:**
The first 32 bytes of $S$ become the **Private Key ($k$)**. The **Public Key ($A$)** is then derived:


$$A = k \cdot G$$

* **$G$**: The Base Point (generator) of Curve25519.
* **$A$**: The Public Key (a point on the curve) sent to the server.

---

### Stage 2: The Challenge (The Nonce)

To prevent replay attacks, the server issues a "one-time" mathematical hurdle.

**1. Nonce Generation:**
The server generates a 32-byte cryptographically secure random value $M$.


$$M \in \{0, 1\}^{256}$$

**2. Storage:**
The server stores $(Username, M, ExpiresAt)$ in the SQLite database. If a login attempt does not happen before $ExpiresAt$, $M$ is purged.

---

### Stage 3: Verification (The Zero-Knowledge Proof)

The client proves they own $k$ without ever revealing $k$. This uses the **Edwards-curve Digital Signature Algorithm (EdDSA)**.

**1. Ephemeral Secret ($r$):**
The client generates a temporary secret $r$ (derived deterministically from $k$ and $M$).

**2. Commitment ($R$):**
The client calculates a commitment point $R$:


$$R = r \cdot G$$

**3. Hashing the Context ($h$):**
A hash is created to bind the signature to the specific challenge and the user's identity:


$$h = H(R \parallel A \parallel M)$$

**4. The Scalar Response ($s$):**
The client computes the final proof $s$:


$$s = (r + h \cdot k) \pmod L$$

* **$L$**: The order of the base point $G$.
* **$s, R$**: These two values together form the **Digital Signature**.

---

### Stage 4: Server Validation & Session Entry

The server confirms the math "balances" on both sides of the equation.

**1. Verification Equation:**
The server checks if:


$$s \cdot G = R + h \cdot A$$

**2. Logic Proof:**
Since $s = r + hk$, then $sG = (r + hk)G$.
By distributive law: $sG = rG + h(kG)$.
Substituting our knowns ($R=rG$ and $A=kG$): $sG = R + hA$.
If this holds true, the user **must** possess the private key $k$.

**3. Session Grant:**
The server generates a **Session Token ($T$)** and stores it in the DB.


$$T = \text{Random}(256 \text{ bits})$$

---

### Stage 5: Logout (Session Invalidation)

Security is maintained by ensuring tokens are not perpetual.

**1. Token Destruction:**
The client sends $T$ to the `/api/auth/logout` endpoint.
**2. Server Purge:**
The server executes:

```sql
DELETE FROM sessions WHERE token = ?

```

**3. Local Cleanup:**
The browser clears `localStorage` and `sessionStorage`. Even if the hardware key ($k$) remains in IndexedDB, access is denied until a new Challenge-Response (Stage 2 & 3) is performed.

---
In the context of the **ZKSAP** protocol, the **Recovery** phase is perhaps the most critical mathematical feature. It allows a user to "re-materialize" their identity on a brand-new device without the server needing to store any sensitive backup data.

### Stage 6: Recovery (Deterministic Identity Restoration)

If a user loses their device or clears their local storage, they can restore their account using their 12-word mnemonic. Because the math is **deterministic**, the same words will always produce the same Public Key.

**1. Input Verification:**
The user enters the phrase $W$. The client validates that $W$ consists of 12 words belonging to the BIP-39 wordlist.

**2. Derivation Re-run:**
The client repeats the derivation math from **Stage 1**:


$$S = \text{PBKDF2}(W)$$

$$k_{new} = S[0..31]$$

$$A_{new} = k_{new} \cdot G$$

**3. Server Lookup (The Handshake):**
The client sends $A_{new}$ to the server. The server performs an index search in SQLite:

```sql
SELECT username FROM users WHERE publicKey = ?

```

**4. Proof of Ownership:**
Once the username is found, the server does **not** simply grant access. It issues a new Challenge $M$ to ensure the person holding the words is the actual owner. The process then loops back to **Stage 3 (Verification)**.

---

### 🧠 Mathematical Logic of Recovery

The "magic" of this stage lies in the property of **Determinism**.

* **Variable Consistency:** In a traditional system, if you lose your password, the server must reset it (changing the state).
* **ZKSAP Logic:** In ZKSAP, the Public Key $A$ is a **mathematical constant** of the mnemonic $W$.
* If $f(W) = A$, then as long as $W$ is known, $A$ can be calculated anywhere in the universe at any time.
* This means the "Account" doesn't actually live on the server; the server just holds a "Lock" ($A$) that only the "Key" ($W$) can open.



---

### 🛠 Summary Table: Recovery Variables

| Variable | State during Recovery | Importance |
| --- | --- | --- |
| **$W$** | User Provided | The source of truth used to re-derive the keys. |
| **$A_{new}$** | Locally Computed | Used to identify which account to recover on the server. |
| **$k_{new}$** | Locally Computed | Used to sign the recovery challenge to prove the words are valid. |

---

### ⚠️ Security Warning

During this stage, the **Mnemonic ($W$)** is briefly held in the application's volatile memory (RAM). It is never sent to the server. The server only sees $A_{new}$ and the resulting signature $s$.

---

## 📓 Mathematical Variable Definitions

| Variable | Definition | Role |
| --- | --- | --- |
| **$W$** | Mnemonic Phrase | Human-readable backup of the seed. |
| **$k$** | Private Key | The secret scalar (never leaves the device). |
| **$G$** | Base Point | The fixed starting point on Curve25519. |
| **$A$** | Public Key | The user's identity stored in SQLite. |
| **$M$** | Nonce (Challenge) | Random message used to prevent signature reuse. |
| **$r$** | Ephemeral Secret | A "one-time" private key for a single signature. |
| **$R$** | Commitment | The public point corresponding to $r$. |
| **$h$** | Hash | The cryptographic link between identity and challenge. |
| **$s$** | Scalar Response | The proof that $k$ was used to sign the challenge. |
| **$L$** | Curve Order | The total number of points on the elliptic curve. |


---

## 🔒 Security Summary

By using **Ed25519**, ZKSAP provides:

1. **Zero-Knowledge:** The server validates the proof without learning the secret.
2. **Immutability:** Identity is mathematically tied to the 12 words.
3. **Forward Secrecy:** Stolen session tokens do not compromise the master key.

### OWNER : KUNAL SINGH

THANK YOU 🤝 

---
