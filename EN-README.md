# BlackBox 🖤🔐

> _"An encrypted vault. Multi-algorithms. For the post-quantum era."_  
> Advanced encryption web app, for hackers, professionals and code dreamers.

---

## ⚙️ Overview

**BlackBox** is a multi-algorithm encryption web application designed for security and discretion.  
You can encrypt your data with proven standards, but also with an exclusive **custom** algorithm, or soon with post-quantum (Kyber in development).

---

## 🧰 Installation

To run the application locally:

```
npm install
npm run dev
```

Once started, go to:  
👉 [http://localhost:5173](http://localhost:5173)

To generate the optimized production version:

```
npm run build
```

---

## 🚀 Key Features

- 🎛️ Choice between AES-256-GCM, ChaCha20-Poly1305, custom algorithm, and Kyber (in progress)  
- 🔑 Keys derived with PBKDF2, random salts, and strong stretching  
- 🕵️‍♂️ Double encryption layer in custom algorithm, with advanced obfuscation  
- 🔒 Data integrity guaranteed by HMAC-SHA256  
- 🛡️ **Real-time password strength analyzer** with 9 security levels
- 🌑 Stealth mode (UI) ready, stealth encryption coming soon  
- 💻 100% Web Crypto API, client-side only  

---

## 🔍 Key Strength Analyzer

BlackBox integrates an advanced real-time password strength evaluation system, designed to guide users toward truly secure keys.

### 🎯 9 Security Levels

The system evaluates each password on a scale of **0 to 30+ points** and assigns it to one of 9 levels:

| Level | Score | Color | Description |
|--------|-------|---------|-------------|
| **VERY WEAK** | 0 | 🔴 Dark red | Unacceptable, immediate compromise |
| **WEAK** | 1-3 | 🔴 Bright red | Vulnerable to basic attacks |
| **POOR** | 4-6 | 🟠 Red orange | Insufficient, easily breakable |
| **FAIR** | 7-10 | 🟠 Orange | Weak resistance |
| **MODERATE** | 11-14 | 🟡 Yellow | Decent but improvable |
| **GOOD** | 15-18 | 🟢 Yellow green | Good resistance |
| **STRONG** | 19-22 | 🟢 Bright green | Very secure |
| **VERY STRONG** | 23-26 | 🟢 Sea green | Excellent security |
| **EXCEPTIONAL** | 27+ | 🔵 Cyan | Maximum security |

### ⬆️ Bonus Criteria (increase score)

- **Progressive length**: +1 to +5 points depending on length (6 to 32+ characters)
- **Character diversity**: +2 points each (lowercase, uppercase, digits, symbols)
- **Advanced special characters**: +2 points for `!@#$%^&*()` etc.
- **Accented characters**: +1 point for À-ÿ
- **Mixed case**: +2 points if uppercase/lowercase are mixed
- **Digit distribution**: +1 point if digits aren't only at the end
- **No repetitions**: +1 to +2 points depending on level
- **Maximum diversity**: +2 to +3 points for 4+ different character types

### ⬇️ Security Penalties (reduce score)

The analyzer detects and severely penalizes dangerous patterns:

- **-6 points**: **Common passwords** (`password`, `admin`, `123456`, `qwerty`, etc.)
- **-4 points**: **Sequences** (`abc`, `123`, `789`, `987`, etc.)
- **-4 points**: **Keyboard patterns** (`qwerty`, `asdf`, `zxcv`, etc.)
- **-3 points**: **Dates** (`1990`, `2024`, `12/05/2024`, timestamps)
- **-3 points**: **Phone numbers** (recognized formats)
- **-3 points**: **Repetitive patterns** (`abcabc`, `121212`)
- **-3 points**: **Monotype** (only letters or digits)
- **-2 points**: **Uniform case** (all uppercase or lowercase)
- **-2 points**: **Personal patterns** (names + simple digits)

### 🎯 Strategies for EXCEPTIONAL Password

To reach maximum level, combine:
- **20+ character length**
- **4+ character types** (a-z, A-Z, 0-9, symbols, accents)
- **No recognizable patterns** (no words, dates, sequences)
- **Random distribution** of characters
- **Passphrases** with creative substitutions

**Progression example**:
- `password123` → VERY WEAK (0 points, -6 for common pattern)
- `MyP@ssw0rd2024` → GOOD (16 points, penalized for date but good diversity)
- `c0rr3ct-h0rs3-b4tt3ry-st4pl3!` → GOOD (17 points, long but repetitive patterns)
- `Tr0ub4dor&3` → STRONG (20 points, classic xkcd but solid)
- `Ñ7§mK£9#vP∆2wQ¢8xF@4nL!` → EXCEPTIONAL (28+ points)

### 🔄 Real-time Visual Feedback

The interface displays a colored progress bar with 7 segments that fill proportionally to the score, allowing users to instantly see the impact of each character added.

---

## 💀 Custom Algorithm — "Double Lock & Obfuscate"

BlackBox.js's custom algorithm is a multi-layered hybrid construction, designed to strengthen security beyond simple symmetric encryption. Here's how it works in detail:

### Encryption Steps

1. **Multiple key derivation**  
   The user password is used with two different random salts (`salt1` and `salt2`) to generate **two distinct keys** via PBKDF2 (100,000 iterations, SHA-256).  
   This creates a solid and isolated foundation for each layer, reducing compromise risks in case of key leakage.

2. **First layer — ChaCha20**  
   The plaintext is first encrypted with ChaCha20 using the first key (`key1`).  
   ChaCha20 is fast, secure and perfect for web environments.

3. **Integrity hash calculation**  
   An HMAC-SHA256 hash is generated on the first layer's ciphertext with an integrity key derived from password + suffix `"INTEGRITY"`.  
   This hash ensures data won't be silently altered.

4. **Dynamic obfuscation**  
   The first layer's result is then passed through a pseudo-random obfuscation function.  
   - It inserts special characters (`§`, `¢`, `€`, etc.) at variable positions according to a random seed (`obfuscationSeed`), thus scrambling the data structure.  
   - This step complicates pattern recognition and makes cryptographic analysis more difficult.

5. **Second layer — AES-256-GCM**  
   The obfuscated data is then encrypted a second time with AES-256-GCM and the second derived key (`key2`).  
   This layer adds additional security through standardized encryption, guaranteeing confidentiality and integrity thanks to GCM.

6. **Final assembly**  
   The final result combines in a string the two salts (`salt1`, `salt2`), the obfuscation seed, the integrity hash, and the AES ciphertext, separated by `|`.  
   This structure allows precise decryption and verification.

---

### Decryption Steps

1. Extract salts, obfuscation seed, integrity hash and encrypted data.  
2. Re-derive both keys with salts and password.  
3. AES-256-GCM decryption (second layer) on obfuscated data.  
4. Remove obfuscation characters to recover original ChaCha20 ciphertext.  
5. Verify integrity hash (HMAC-SHA256) — if verification fails, process stops (altered data or invalid password).  
6. ChaCha20 decryption (first layer) to recover plaintext.

---

## 🔐 Why This Approach?

- **Double key, double layer:** Separating keys and layers limits risks in case of attack on only one part.  
- **Obfuscation:** Adding specific "noise" makes statistical attacks and pattern analysis more complex.  
- **Reinforced integrity:** Internal HMAC verification prevents any manipulation without detection.  
- **Preventive validation:** The strength analyzer guides users toward truly secure passwords before encryption.
- **Web compatible:** Based on Web Crypto API, 100% client-side, thus maximum confidentiality.

---

## ⚠️ Current Limitations

- Stealth mode is currently in development.  
- Kyber algorithm is currently simulated, real implementation coming soon.

---

## 📚 Technical Resources

- [Web Crypto API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)  
- [RFC 8439 — ChaCha20-Poly1305](https://datatracker.ietf.org/doc/html/rfc8439)
- [NIST Post Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [AES-GCM Standard](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- Research on obfuscation and multi-layer cryptography

---

## 🤖 Contributions & Feedback

Open source, constantly evolving. Any help to finalize Kyber or improve stealth mode will be welcome.  
Contact me to share your ideas or questions.

---

# Keep our secrets out of reach. Always. 🖤🔐