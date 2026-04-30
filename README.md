# 🌍 Trip Planner - Full Stack Application

A modern, full-stack web application for planning and managing trips, discovering destinations, and booking travel activities. Built with React, Express.js, MongoDB, and Node.js.

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [How to Run](#how-to-run)
- [API Endpoints](#api-endpoints)
- [Usage Guide](#usage-guide)
- [Project Architecture](#project-architecture)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Introduction

**Trip Planner** is a comprehensive travel planning application that allows users to:
- Create and manage their upcoming trips
- Explore and discover travel destinations
- Book travel activities and accommodations
- Track trip history and manage bookings
- View personalized user profiles

The application features role-based access with admin capabilities for managing destinations and platform content. It implements modern web development practices including JWT authentication, RESTful API design, and responsive UI with Tailwind CSS.

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.5** - UI library for building interactive components
- **Vite 8.0.10** - Modern frontend build tool for fast development
- **React Router DOM 7.14.2** - Client-side routing for SPA navigation
- **Tailwind CSS 3.4.19** - Utility-first CSS framework for styling
- **Axios 1.15.2** - HTTP client for API requests
- **Lucide React 1.11.0** - Icon library
- **Sonner 2.0.7** - Toast notification library
- **ESLint** - Code quality and style linting

### Backend
- **Node.js** - JavaScript runtime environment
- **Express 5.1.0** - Web framework for building REST APIs
- **MongoDB** - NoSQL database for data persistence
- **Mongoose 8.19.1** - ODM library for MongoDB data modeling
- **JWT (jsonwebtoken 9.0.2)** - Secure authentication and authorization
- **bcryptjs 3.0.2** - Password hashing and security
- **CORS 2.8.5** - Cross-origin resource sharing
- **Dotenv 17.2.3** - Environment variable management
- **Nodemon 3.1.10** - Development tool for auto-restarting server

---

## ✨ Features

### User Features
- **User Authentication**
  - User registration with email and password
  - Secure login with JWT token generation
  - Password hashing with bcryptjs
  - Session persistence with token-based auth

- **Trip Management**
  - Create, read, update, and delete trips
  - Set trip destination, start date, and end date
  - View trip details and itineraries
  - Track upcoming trips with banner notifications
  - Access to trip history and past trips

- **Destination Exploration**
  - Browse all available travel destinations
  - View detailed destination information
  - Access destination images and descriptions
  - Filter and search destinations

- **Activity & Booking Management**
  - Browse activities available at destinations
  - Book activities for trips
  - View booking confirmations
  - Cancel bookings

- **User Profile**
  - View and update user information
  - Access personal profile settings
  - Track booking history

### Admin Features
- **Admin Dashboard**
  - Overview of platform statistics
  - Management interface for destinations
  - Monitoring of bookings and activities
  - User management capabilities

- **Destination Management**
  - Add new travel destinations
  - Update destination information
  - Delete destinations
  - Manage destination images and descriptions

- **Activity Management**
  - Create activities for destinations
  - Update activity details
  - Remove outdated activities

- **Admin Profile**
  - Access admin-specific settings
  - View platform statistics

---

## 📁 Project Structure

```
TripPlanner/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── ActivityModal.jsx
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── BookingModal.jsx
│   │   │   ├── DestinationModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── TripCard.jsx
│   │   │   ├── TripModal.jsx
│   │   │   └── SkeletonCard.jsx
│   │   ├── pages/                   # Page components (routes)
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TripDetails.jsx
│   │   │   ├── DestinationPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── [other pages]
│   │   ├── context/                 # React Context for state management
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── usePageTitle.js
│   │   │   └── useScrollToTop.js
│   │   ├── services/                # API service calls
│   │   │   └── api.js
│   │   ├── utils/                   # Utility functions and components
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   └── getDestinationImage.js
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   └── tailwind.config.js           # Tailwind CSS configuration
│
├── server/                          # Express backend application
│   ├── controllers/                 # Business logic for routes
│   │   ├── authController.js
│   │   ├── tripController.js
│   │   ├── destinationController.js
│   │   ├── activityController.js
│   │   └── bookingController.js
│   ├── models/                      # MongoDB Mongoose schemas
│   │   ├── User.js
│   │   ├── Trip.js
│   │   ├── Destination.js
│   │   ├── Activity.js
│   │   └── Booking.js
│   ├── routes/                      # API route definitions
│   │   ├── authRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── destinationRoutes.js
│   │   ├── activityRoutes.js
│   │   └── bookingRoutes.js
│   ├── middleware/                  # Express middleware
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── errorMiddleware.js
│   ├── config/                      # Configuration files
│   │   ├── db.js                    # MongoDB connection
│   │   └── jwtConfig.js
│   ├── utils/                       # Utility functions
│   │   └── generateToken.js
│   ├── server.js                    # Entry point
│   └── package.json                 # Backend dependencies
│
├── concept_explanation_guide.md     # Web development concepts guide
└── README.md                        # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** - Package manager
- **MongoDB** account - [Sign up on MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - Version control system
- **Code Editor** - VS Code recommended - [Download](https://code.visualstudio.com/)

### Verify Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

---

## 💾 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TripPlanner
```

### 2. Backend Setup

#### Navigate to server directory
```bash
cd server
```

#### Install dependencies
```bash
npm install
```

#### Create `.env` file in the server directory
Create a new file named `.env` in the `server` folder with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

**Get your MongoDB Connection String:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in or create an account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string and replace `username`, `password`, and `database_name`

### 3. Frontend Setup

#### Navigate to client directory
```bash
cd ../client
```

#### Install dependencies
```bash
npm install
```

#### Create `.env` file in the client directory (optional)
If needed, create a `.env` file for frontend configuration:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 How to Run

### Running Backend Server

#### Terminal 1 - Start Backend Development Server
```bash
cd server
npm run dev
```

**Output:**
```
Server running on port 5000
Connected to MongoDB
```

The backend will be available at `http://localhost:5000`

#### Production Mode (without auto-reload)
```bash
npm start
```

---

### Running Frontend Application

#### Terminal 2 - Start Frontend Development Server
```bash
cd client
npm run dev
```

**Output:**
```
  VITE v8.0.10  ready in 512 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

The frontend will be available at `http://localhost:5173`

### Building for Production

#### Build Frontend
```bash
cd client
npm run build
```

This creates an optimized build in the `dist` folder.

#### Preview Production Build
```bash
npm run preview
```

---

## 🔐 Environment Configuration

### Backend Environment Variables (.env in /server)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key_123!` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Frontend Environment Variables (.env in /client)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Trip Routes (`/api/trips`)
- `GET /api/trips` - Get all trips for authenticated user
- `POST /api/trips` - Create a new trip
- `GET /api/trips/:id` - Get specific trip details
- `PUT /api/trips/:id` - Update trip information
- `DELETE /api/trips/:id` - Delete a trip

### Destination Routes (`/api/destinations`)
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/:id` - Get specific destination
- `POST /api/destinations` - Create destination (admin)
- `PUT /api/destinations/:id` - Update destination (admin)
- `DELETE /api/destinations/:id` - Delete destination (admin)

### Activity Routes (`/api/activities`)
- `GET /api/activities` - Get all activities
- `GET /api/activities/destination/:destinationId` - Get activities by destination
- `POST /api/activities` - Create new activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Booking Routes (`/api/bookings`)
- `GET /api/bookings` - Get all bookings for user
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get specific booking
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

---

## 📖 Usage Guide

### First-Time User Setup

#### 1. Access the Application
- Open browser and navigate to `http://localhost:5173`

#### 2. Register an Account
- Click "Register" on the home page
- Fill in email and password
- Submit form to create account

#### 3. Login
- Click "Login" on the home page
- Enter your credentials
- You'll be redirected to Dashboard

#### 4. Create Your First Trip
- Click "New Trip" button on Dashboard
- Fill in trip details:
  - Trip Name
  - Destination
  - Start Date
  - End Date
- Click "Create Trip"

#### 5. Explore Destinations
- Navigate to "Destinations" page
- Browse available destinations
- Click on a destination to view details

#### 6. Book Activities
- View activities available at destinations
- Click "Book Now" to reserve an activity
- View your bookings in your profile

### Admin Access

#### Access Admin Dashboard
1. Log in with admin credentials
2. Navigate to `/admin/dashboard`
3. Manage destinations, activities, and bookings

#### Add New Destination
1. Go to Admin Dashboard
2. Click "Add Destination"
3. Fill in destination details
4. Upload destination image
5. Save changes

---

## 🏗️ Project Architecture

### Frontend Architecture (React)

```
User Interface (React Components)
    ↓
React Router (Navigation)
    ↓
Context API (Global Auth State)
    ↓
Custom Hooks (usePageTitle, useScrollToTop)
    ↓
Services (axios API calls)
    ↓
Backend API
```

### Backend Architecture (Express)

```
HTTP Request
    ↓
Middleware (CORS, JSON parsing)
    ↓
Routes (API routing)
    ↓
Controllers (Business logic)
    ↓
Models (MongoDB Mongoose schemas)
    ↓
Database (MongoDB)
```

### Authentication Flow

```
1. User enters credentials
   ↓
2. Register/Login controller validates
   ↓
3. If valid, JWT token is generated
   ↓
4. Token stored in browser localStorage
   ↓
5. Protected routes check token
   ↓
6. authMiddleware verifies token
   ↓
7. Access granted/denied
```

---

## 🔄 Development Workflow

### Adding a New Feature

1. **Plan the feature** - Identify backend and frontend requirements
2. **Backend**
   - Create MongoDB model in `server/models/`
   - Add controller in `server/controllers/`
   - Add routes in `server/routes/`
3. **Frontend**
   - Create React components in `client/src/components/`
   - Add pages if needed in `client/src/pages/`
   - Create API calls in `client/src/services/api.js`
   - Add routes in `client/src/App.jsx`
4. **Test** - Test the feature locally
5. **Deploy** - Push to repository and deploy

### Code Standards

- **Naming Convention**
  - Components: PascalCase (e.g., `TripCard.jsx`)
  - Functions: camelCase (e.g., `fetchTrips()`)
  - Variables: camelCase (e.g., `const tripName`)
  - Constants: UPPER_SNAKE_CASE (e.g., `const API_URL`)

- **File Organization**
  - Keep components small and focused
  - One component per file
  - Use meaningful file names

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:27017`
- **Solution:** Ensure MongoDB connection string is correct in `.env`
- Verify MongoDB account and network access

**Error:** `Port 5000 already in use`
- **Solution:** Kill process using port 5000
  ```bash
  # On Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Frontend Won't Load

**Error:** `CORS error in browser console`
- **Solution:** Ensure backend is running and CORS is configured
- Check that `http://localhost:5000` is accessible

**Error:** `API calls returning 401 Unauthorized`
- **Solution:** Clear browser localStorage and login again
- Check JWT token in browser DevTools

### Database Connection Issues

**Error:** `MongooseError: Cannot connect to MongoDB`
- **Solution:** 
  - Verify MongoDB Atlas cluster is active
  - Check connection string format
  - Whitelist IP address in MongoDB Atlas

---

## 📦 Deployment

### Backend Deployment (Example: Render, Railway, or Heroku)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables on platform
4. Deploy

### Frontend Deployment (Example: Vercel or Netlify)

1. Build the project: `npm run build`
2. Connect Git repository to hosting platform
3. Set build command: `npm run build`
4. Deploy

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeatureName`
3. Commit your changes: `git commit -m 'Add YourFeatureName'`
4. Push to branch: `git push origin feature/YourFeatureName`
5. Open a Pull Request

### Guidelines
- Write clean, readable code
- Add comments for complex logic
- Test features before submitting PR
- Follow the existing code style

---

## 📝 License

This project is licensed under the ISC License - see LICENSE file for details.

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [JWT Introduction](https://jwt.io/introduction)
- [Vite Documentation](https://vitejs.dev)

---

## ❓ Frequently Asked Questions (FAQ)

**Q: How do I reset my password?**
A: Currently, use the Admin Dashboard to reset user passwords. Password reset email feature can be added.

**Q: Can I run both frontend and backend on the same port?**
A: No, they must run on different ports. Frontend on 5173, Backend on 5000.

**Q: How do I become an admin?**
A: Admin status is set in the MongoDB database. Contact the database administrator to add admin privileges to your account.

**Q: Is there a mobile app?**
A: Currently, this is a web application that is responsive on all devices.

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the concept explanation guide
3. Open an issue on GitHub repository

---

## 👨‍💻 Author

Harshini Meghana Kotha
Created as a full-stack MERN project for learning and practice.

---

**Happy Traveling! 🌍✈️**
