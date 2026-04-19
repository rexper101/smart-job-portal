# 🚀 SmartHire — Smart Job Portal (MERN Stack)

A production-ready, full-stack job portal built with the MERN stack. Users can register as Job Seekers or Recruiters, post and apply for jobs, track applications, and manage hiring pipelines — all from a modern, responsive UI.

---

## 🧱 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS      |
| Backend     | Node.js + Express.js                |
| Database    | MongoDB (Mongoose ODM)              |
| Auth        | JWT (JSON Web Tokens) + bcryptjs    |
| API Style   | RESTful                             |
| Deployment  | Vercel (client) + Render (server)   |

---

## 📁 Project Structure

```
smart-job-portal/
├── server/                        # Node + Express backend
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, GetMe, UpdateProfile
│   │   ├── jobController.js       # CRUD for jobs
│   │   └── applicationController.js  # Apply, track, update status
│   ├── middleware/
│   │   ├── auth.js                # JWT protect middleware
│   │   └── roleCheck.js           # Role-based access control
│   ├── models/
│   │   ├── User.js                # User schema (bcrypt hashing)
│   │   ├── Job.js                 # Job schema
│   │   └── Application.js         # Application schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   └── applicationRoutes.js
│   ├── utils/
│   │   └── generateToken.js       # JWT token generator
│   ├── server.js                  # Entry point
│   ├── package.json
│   └── .env.example
│
└── client/                        # React frontend (Vite)
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── JobCard.jsx
    │   │   ├── StatusBadge.jsx
    │   │   └── Spinner.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state (useReducer)
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Jobs.jsx           # Browse with search + filters + pagination
    │   │   ├── JobDetail.jsx      # Full detail + apply modal
    │   │   ├── PostJob.jsx
    │   │   ├── EditJob.jsx
    │   │   ├── Dashboard.jsx      # Role-based (recruiter/user/admin)
    │   │   ├── Applications.jsx   # Application tracker
    │   │   ├── Profile.jsx
    │   │   └── NotFound.jsx
    │   ├── services/
    │   │   ├── axiosInstance.js   # Configured Axios with interceptors
    │   │   └── api.js             # Auth, Job, Application API calls
    │   ├── App.jsx                # Routes + ProtectedRoute + GuestRoute
    │   ├── main.jsx
    │   └── index.css              # Tailwind + custom component classes
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## 🔐 Authentication & Roles

| Role        | Capabilities                                                     |
|-------------|------------------------------------------------------------------|
| `user`      | Browse jobs, apply, view/track/withdraw applications             |
| `recruiter` | Post jobs, edit/delete own jobs, view applicants, update status  |
| `admin`     | All recruiter abilities + view all applications system-wide      |

---

## 🌐 REST API Reference

### Auth
| Method | Endpoint               | Access  | Description           |
|--------|------------------------|---------|-----------------------|
| POST   | `/api/auth/register`   | Public  | Create new account    |
| POST   | `/api/auth/login`      | Public  | Login, returns JWT    |
| GET    | `/api/auth/me`         | Private | Get current user      |
| PUT    | `/api/auth/profile`    | Private | Update profile        |

### Jobs
| Method | Endpoint                    | Access              | Description          |
|--------|-----------------------------|---------------------|----------------------|
| GET    | `/api/jobs`                 | Public              | Get all jobs (filter/paginate) |
| GET    | `/api/jobs/:id`             | Public              | Get single job       |
| GET    | `/api/jobs/recruiter/my-jobs` | Recruiter/Admin   | Get my posted jobs   |
| POST   | `/api/jobs`                 | Recruiter/Admin     | Create job           |
| PUT    | `/api/jobs/:id`             | Recruiter/Admin     | Update job           |
| DELETE | `/api/jobs/:id`             | Recruiter/Admin     | Delete job           |

### Applications
| Method | Endpoint                        | Access          | Description              |
|--------|---------------------------------|-----------------|--------------------------|
| POST   | `/api/applications`             | User            | Apply for a job          |
| GET    | `/api/applications/my`          | User            | Get my applications      |
| GET    | `/api/applications/job/:jobId`  | Recruiter/Admin | Get applicants for job   |
| GET    | `/api/applications`             | Admin           | Get all applications     |
| PUT    | `/api/applications/:id`         | Recruiter/Admin | Update application status|
| DELETE | `/api/applications/:id`         | User/Admin      | Withdraw application     |

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (free tier) OR local MongoDB
- Git

### Step 1 — Clone the repository
```bash
git clone https://github.com/yourusername/smart-job-portal.git
cd smart-job-portal
```

### Step 2 — Setup the Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
# ✅ Server running at http://localhost:5000
```

### Step 3 — Setup the Frontend
```bash
cd ../client
npm install
cp .env.example .env
# .env already has VITE_API_URL=/api (proxied by Vite to localhost:5000)
npm run dev
# ✅ Client running at http://localhost:5173
```

---

## 🔑 Environment Variables

### `server/.env`
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart-job-portal?retryWrites=true&w=majority

# JWT — generate with: node -e "require('crypto').randomBytes(64).toString('hex')"
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRE=7d

# Allowed frontend origin (CORS)
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```env
# Dev: uses Vite proxy → localhost:5000
VITE_API_URL=/api

# Production: your Render backend URL
# VITE_API_URL=https://smart-job-portal-api.onrender.com/api
```

---

## 🚀 Deployment Guide

### 1. MongoDB Atlas (Database)
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free M0 cluster
2. Create database user (username + password)
3. Whitelist IP `0.0.0.0/0` (allow from anywhere) under Network Access
4. Copy the connection string → paste into `MONGO_URI` in `.env`

### 2. Backend → Render.com
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add Environment Variables:
   ```
   MONGO_URI=<your Atlas URI>
   JWT_SECRET=<your secret>
   JWT_EXPIRE=7d
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   PORT=5000
   ```
6. Deploy → copy the Render URL (e.g. `https://smart-job-portal.onrender.com`)

### 3. Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   ```
   VITE_API_URL=https://smart-job-portal.onrender.com/api
   ```
4. Deploy → your app is live! 🎉

---

## 🧪 Test Credentials (for demo)

Register accounts manually or seed the database:

| Role      | Email                  | Password  |
|-----------|------------------------|-----------|
| Recruiter | recruiter@demo.com     | demo123   |
| Seeker    | seeker@demo.com        | demo123   |

> Note: Use the Register page to create these accounts. Admin role must be set directly in MongoDB.

---

## ✨ Features Summary

- ✅ JWT Authentication with role-based access (user / recruiter / admin)
- ✅ Full CRUD for Jobs (create, read, update, delete, toggle active)
- ✅ Job application system with cover letter + resume URL
- ✅ Application status pipeline: Applied → Reviewing → Selected / Rejected
- ✅ Advanced job search with text search, filters, and pagination
- ✅ Role-based dashboards (recruiter sees applicants, user tracks applications)
- ✅ Profile management with skills, bio, location
- ✅ Dark mode toggle (persisted to localStorage)
- ✅ Responsive design — mobile-first with Tailwind CSS
- ✅ Password hashing with bcryptjs (salt rounds: 12)
- ✅ CORS configured for production origins
- ✅ Global error handling (Express + Axios interceptors)
- ✅ Automatic 401 redirect to login on token expiry
- ✅ MongoDB text index for full-text job search
- ✅ Duplicate application prevention (unique compound index)

---

## 📄 License

MIT License — free to use for college projects and personal portfolios.

---

Built with ❤️ using the **MERN Stack** | MongoDB · Express · React · Node.js
