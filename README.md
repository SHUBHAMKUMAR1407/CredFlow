<div align="center">

# 💳 CredFlow

**The Future of Intelligent Personal Finance & Wealth Management**

[![Deployment Status](https://img.shields.io/badge/Status-Live_in_Production-success?style=for-the-badge&logo=vercel)](https://cred-flow-hazel.vercel.app)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_REST_API-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

[**Live Platform**](https://cred-flow-hazel.vercel.app) · [**Admin Dashboard**](https://cred-flow-31r3.vercel.app) · [**Report a Bug**](https://github.com/SHUBHAMKUMAR1407/CredFlow/issues)

</div>

---

## 🌟 Executive Summary

**CredFlow** is a next-generation, premium fintech application engineered to bridge the gap between raw financial data and actionable wealth intelligence. Built with a focus on high-performance architecture, bank-grade security, and an ultra-modern glassmorphism UI, CredFlow offers a seamless ecosystem for users to track expenses, visualize cash flow, and build their financial reputation through our proprietary **AI-Driven Credit Scoring Engine**.

---

## 🔗 Live Infrastructure

Experience the platform in real-time across our specialized environments:

| System | Purpose | Access Link |
| :--- | :--- | :--- |
| **🌐 Client Portal** | Main consumer application for financial management | [Launch CredFlow](https://cred-flow-hazel.vercel.app) |
| **🛡️ Admin Center** | Enterprise oversight, user management, and metrics | [Launch Admin](https://cred-flow-31r3.vercel.app) |
| **⚙️ Core API** | High-throughput Node.js backend infrastructure | [API Endpoint](https://credflow-4vjr.onrender.com) |

---

## ✨ Premium Features & Capabilities

### 🧠 Proprietary AI Credit Scoring
Move beyond static numbers. CredFlow evaluates financial health dynamically:
- **Zero-History Intelligence:** New users start with a neutral `N/A` rating to prevent misleading poor scores.
- **Multi-Factor Analysis:** Evaluates *Payment Consistency (35%)*, *Income Stability (25%)*, *Savings Ratio (20%)*, *Spending Discipline (15%)*, and *Account Age (5%)*.
- **Smart Suggestions:** Automated, actionable advice to help users reach the elite 850-score bracket.

### 🔐 Bank-Grade Authentication & Security
- **Secure Onboarding:** Mandatory OTP-based email verification powered by the **Brevo HTTP API**, ensuring zero spam and verified user identities.
- **Stateless Architecture:** JWT (JSON Web Tokens) combined with Bcrypt password hashing ensures session integrity.

### 📊 Elite Financial Analytics
- **Granular Cash Flow:** Track money in vs. money out with precision.
- **Interactive Visualizations:** High-fidelity dynamic charts powered by `Chart.js` for instant wealth comprehension.
- **Automated Budget Guardrails:** Visual cues to prevent overspending in dedicated categories.

---

## 🏗️ Technical Architecture

CredFlow operates on a robust decoupled **MERN stack**, optimized for horizontal scaling and rapid UI rendering.

### 🎨 Frontend Engineering (Client & Admin)
- **Framework:** React 18 leveraging Vite for millisecond HMR (Hot Module Replacement).
- **Design System:** Custom CSS featuring an advanced Dark Mode Glassmorphism aesthetic for a premium banking feel.
- **State Management:** Optimized React Context API ensuring rapid cross-component data flow without prop drilling.
- **Icons & Typography:** Seamless integration of `lucide-react` for crisp, vector-based visual communication.

### ⚙️ Backend Engineering
- **Server:** Node.js / Express.js tailored for asynchronous, high-volume transaction processing.
- **Database:** MongoDB Atlas, utilizing Mongoose ODM with advanced indexing for fast query resolution.
- **Mailing Service:** Native Node `https` module integrated with Brevo for 99.9% reliable transactional email delivery (bypassing restrictive SMTP ports).

---

## 💻 Developer Onboarding & Local Setup

Deploying CredFlow locally requires Node.js (v18+) and a MongoDB instance.

### 1. Clone the Repository
```bash
git clone https://github.com/SHUBHAMKUMAR1407/CredFlow.git
cd CredFlow
```

### 2. Environment Configuration
Create `.env` files in the respective directories:

**`/server/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_ultra_secure_jwt_secret
BREVO_API_KEY=your_brevo_v3_api_key
```

**`/client/.env` & `/admin/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Initialize the Ecosystem
Launch the three core pillars of CredFlow in separate terminal instances:

```bash
# Terminal 1: Initialize Backend API
cd server
npm install
npm run dev

# Terminal 2: Initialize Consumer Frontend
cd client
npm install
npm run dev

# Terminal 3: Initialize Admin Dashboard
cd admin
npm install
npm run dev
```

---

## 🤝 Open Source & Contribution

CredFlow is built on the ethos of accessible financial intelligence. We welcome pull requests, feature suggestions, and architectural improvements. 

Distributed under the **ISC License**. See `LICENSE` for more information.

---

<div align="center">
  <p>Architected and maintained with precision by <b><a href="https://github.com/SHUBHAMKUMAR1407">Shubham Kumar</a></b>.</p>
</div>
