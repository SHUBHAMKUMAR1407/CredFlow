# 💳 CredFlow - AI-Powered Financial Management Ecosystem

[![Live Demo - Client](https://img.shields.io/badge/Live%20Demo-Client-blueviolet?style=for-the-badge)](https://cred-flow-hazel.vercel.app)
[![Live Demo - Admin](https://img.shields.io/badge/Live%20Demo-Admin-blue?style=for-the-badge)](https://cred-flow-31r3.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend-API-green?style=for-the-badge)](https://credflow-4vjr.onrender.com)

**CredFlow** is a modern, state-of-the-art fintech application designed for comprehensive personal finance management. It leverages AI-driven credit scoring to provide users with intelligent financial insights while offering a powerful administrative control panel for system oversight.

---

## 🔗 Deployment Links

| Portal | Live Link |
| :--- | :--- |
| **🚀 Main Application (User)** | [cred-flow-hazel.vercel.app](https://cred-flow-hazel.vercel.app) |
| **🛠️ Admin Control Panel** | [cred-flow-31r3.vercel.app](https://cred-flow-31r3.vercel.app) |
| **⚙️ Backend API Server** | [credflow-4vjr.onrender.com](https://credflow-4vjr.onrender.com) |

---

## 🌟 Key Features

### 👤 User Experience (Client Portal)
- **Intelligent Dashboard:** Real-time visualization of total balance, income, expenses, and savings.
- **AI Credit Scoring:** Dynamic credit score generation based on spending habits, income stability, and payment history.
- **Transaction Management:** Seamlessly add, edit, and categorize transactions with professional analytics.
- **Smart Goals:** Track savings goals and get AI-based financial suggestions to optimize savings.
- **Security:** Secure authentication with OTP verification and JWT-based session management.

### 🛡️ Administrative Control (Admin Portal)
- **Visual Analytics:** Interactive Doughnut charts showing user distribution and transaction volume breakdown.
- **User Management:** Full CRUD operations on users, including role management and professional deletion workflows.
- **Activity Monitoring:** Real-time logs of system activities and user interactions.
- **System Settings:** Centralized control for system-wide preferences and appearance.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Vite, Chart.js, Lucide Icons, React Router 7 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas) |
| **Auth & Security** | JWT, Bcrypt.js, OTP System |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📂 Project Structure

```text
CredFlow/
├── client/          # User-facing React application
├── admin/           # Administrative control panel (React)
└── server/          # Node.js Express API & Database models
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SHUBHAMKUMAR1407/CredFlow.git
   cd CredFlow
   ```

2. **Setup Backend:**
   ```bash
   cd server
   npm install
   # Create .env file with MONGO_URI and JWT_SECRET
   npm start
   ```

3. **Setup Frontend (Client):**
   ```bash
   cd ../client
   npm install
   # Set VITE_API_URL in .env
   npm run dev
   ```

4. **Setup Admin Panel:**
   ```bash
   cd ../admin
   npm install
   # Set VITE_API_URL in .env
   npm run dev
   ```

---

## 🎨 Design Philosophy
CredFlow is built with a **Premium Dark/Glassmorphism** aesthetic, ensuring a clutter-free and intuitive user experience. Every interaction is animated for a "live" feel, making financial management not just useful, but engaging.

---

## 📜 License
Distributed under the ISC License. See `LICENSE` for more information.

---
*Developed with ❤️ by Shubham Kumar*
