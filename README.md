# 🔐 Police Criminal Records Management System (CRMS)

A secure, full-stack web application for law enforcement to manage, encrypt, and share criminal records — protected by multi-factor authentication and military-grade cryptography.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Spring Boot](https://img.shields.io/badge/Spring-Boot-green) ![AES-256](https://img.shields.io/badge/AES-256-red) ![JWT](https://img.shields.io/badge/JWT-Auth-orange)

---

## 🚀 Features

- **3-Factor Authentication** — Password + OTP + Live Face Recognition
- **AES-256 File Encryption** — Military-grade encryption for all records
- **RSA Key Exchange** — Only the intended recipient can decrypt shared files
- **Face Biometric Login** — Real-time face detection using face-api.js
- **Secure File Sharing** — Share encrypted files between verified officers
- **Audit Trail** — Complete log of all encrypt, decrypt, and share operations
- **JWT Authentication** — Stateless, secure session management

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React + Vite | UI Framework |
| React Router v6 | Client-side routing |
| face-api.js | Face detection & recognition |
| Axios | HTTP client with JWT interceptor |
| React Toastify | Notifications |
| Tailwind CSS | Styling |

### Backend
| Technology | Purpose |
|------------|---------|
| Spring Boot | REST API |
| Spring Security + JWT | Authentication |
| AES-256 | File encryption |
| RSA | Key exchange |
| Spring Mail | OTP delivery |
| JPA + MySQL | Database |

---

## 📁 Project Structure
```
police-crms/
├── src/
│   ├── components/
│   │   ├── AuthLayout.jsx       # Centered auth card layout
│   │   ├── FaceCapture.jsx      # Webcam face capture & verify
│   │   └── ProtectedRoute.jsx   # Route guard
│   ├── context/
│   │   └── AuthContext.jsx      # Global auth state
│   ├── pages/
│   │   ├── LandingPage.jsx      # Public landing page
│   │   ├── SignupPage.jsx       # 2-step registration + face enroll
│   │   ├── LoginPage.jsx        # 3-step MFA login
│   │   ├── DashboardLayout.jsx  # Sidebar layout
│   │   ├── DashboardHome.jsx    # Stats + activity
│   │   ├── EncryptPage.jsx      # File encryption
│   │   ├── DecryptPage.jsx      # File decryption + face verify
│   │   ├── SharePage.jsx        # Secure file sharing
│   │   └── HistoryPage.jsx      # Audit history + pagination
│   └── utils/
│       └── api.js               # Axios instance + JWT interceptor
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Java 17+
- MySQL 8+

### Frontend Setup
```bash
git clone https://github.com/YOUR_USERNAME/police-crms-frontend.git
cd police-crms-frontend
npm install
npm run dev
```

### Backend Setup
```bash
git clone https://github.com/YOUR_USERNAME/police-crms-backend.git
cd police-crms-backend
# Configure application.properties with your DB and mail credentials
./mvnw spring-boot:run
```

### Environment Variables (Backend)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/crms_db
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.mail.username=your_email
spring.mail.password=your_app_password
jwt.secret=your_jwt_secret
```

---

## 🔒 Security Architecture
```
User Login Flow:
─────────────────────────────────────────────
Step 1: Password  →  JWT token issued
Step 2: OTP       →  Email verification
Step 3: Face ID   →  Biometric verification
         ↓
    Access Granted → Dashboard
─────────────────────────────────────────────

File Encryption Flow:
─────────────────────────────────────────────
Upload File → AES-256 Encrypt → Store on Server
                    ↓
            RSA encrypt AES key
            with user's public key
─────────────────────────────────────────────
```

---

## 📸 Screenshots

> Add screenshots of Landing Page, Dashboard, Encrypt Page here

---

## 👨‍💻 Author

**Boobalan** — Computer Science Student  
Mini Project | 2024-2025

---

## 📄 License

This project is for academic purposes only.
```
