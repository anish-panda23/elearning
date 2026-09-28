# Elearn Adda – Full-Stack E-Learning Platform

A modern e-learning platform designed for both instructors and students, built to deliver course creation, enrollment, progress tracking, AI-assisted learning, certificate generation, job placement support, and secure digital payments in a single end-to-end application.

This project demonstrates end-to-end full-stack development, user role separation, API design, cloud media handling, search optimization, and production-oriented application architecture suitable for a 2+ years experienced developer resume.

---

## Project Overview

Elearn Adda is a feature-rich learning management platform where:

- Instructors can create and manage online courses
- Students can browse and purchase courses
- Learners can watch course videos and track progress
- A built-in AI assistant helps answer course-related questions
- Certificates are auto-generated upon course completion
- Users can apply for jobs using verified credentials
- Payments are integrated using PayPal
- WhatsApp notifications support enrollment and completion messaging
- Elasticsearch is used for course search and filtering

The solution combines a React frontend, Express backend, MongoDB data layer, Redis job support, and Docker-based infrastructure for smooth local development and deployment readiness.

---

## Why This Project Is Resume-Strong

This project highlights strong full-stack engineering capabilities across:

- Frontend development with React, Vite, and Tailwind CSS
- Backend API development with Node.js and Express.js
- Database modeling and data management with MongoDB and Mongoose
- Search engineering with Elasticsearch
- Authentication and authorization with JWT and Google OAuth
- Security enhancements like 2FA support
- Cloud media storage with Cloudinary
- Payment integration with PayPal
- Background job processing patterns using Redis/BullMQ
- AI-powered course assistant experience
- Production-aware deployment setup with Docker Compose

---

## Core Features

### 1. Instructor Module
- Create, edit, and publish courses
- Manage course curriculum and lecture videos
- Upload media to Cloudinary
- Update course details and pricing
- Track enrolled students

### 2. Student Module
- Browse course catalog and view course details
- Search and filter courses by category, level, and language
- Purchase courses using PayPal checkout
- Track lecture-wise learning progress
- View purchased courses and resume learning
- Download generated certificates

### 3. AI Course Assistant
- Ask questions related to lectures and course concepts
- Use keyword-based retrieval and similarity matching to answer queries
- Generate quiz questions and course-specific responses
- Simulate an intelligent educational assistant experience

### 4. Certificate and Verification System
- Auto-generate completion certificates after course completion
- Store certificate metadata in MongoDB
- Provide certificate verification page using certificate IDs
- Download certificate as image for sharing

### 5. Placement and Hiring Support
- Course completion and assessment-based eligibility checks
- Recruiter / job application workflow
- Verified certificate tracking for job opportunities
- LinkedIn/Naukri-related job board integration pattern

### 6. Communication and Engagement
- WhatsApp notification support for enrollment and certificate events
- Instructor and student engagement flows
- Alerts and notifications throughout the learning journey

### 7. Search and Discovery
- Elasticsearch-powered course search and advanced filtering
- MongoDB fallback support if search service is unavailable
- Faster content discovery for students

### 8. Security and Authentication
- JWT-based authentication
- Google sign-in support
- Password hashing with bcrypt
- Two-factor authentication setup using Time-based OTP
- Role-based protected routes

---

## Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Framer Motion
- Radix UI components
- Axios
- React Player

### Backend
- Node.js
- Express.js
- Mongoose
- MongoDB

### Search and Data Infrastructure
- Elasticsearch
- Redis
- BullMQ

### Authentication and Security
- JWT
- bcryptjs
- Google OAuth
- Speakeasy (2FA)

### External Integrations
- PayPal SDK
- Cloudinary
- WhatsApp-based notifications

### DevOps / Environment
- Docker
- Docker Compose
- Nodemon
- ESLint

---

## Project Architecture

The system follows a modular full-stack architecture:

- Client app handles all user-facing interfaces and student/instructor flows
- Server exposes REST APIs for authentication, course management, payments, certificates, jobs, and AI features
- MongoDB stores core application data such as users, courses, orders, progress, stocks, and certificates
- Elasticsearch indexes course metadata for fast search and filtering
- Redis supports background processing and job queuing
- Cloudinary stores uploaded media assets like course thumbnails and lecture videos

---

## Folder Structure

```bash
 elearning/
├── client/                  # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Node.js backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── helpers/
│   ├── tests/
│   ├── server.js
│   └── package.json
│
├── docker-compose.yml      # Docker services for MongoDB, Redis, Elasticsearch
├── README.md
└── package.json (if present in root setup)
```

---

## Key Functional Modules

### Authentication & User Management
- User registration and login
- Role-based accounts: instructor, student, admin-like usage patterns
- Google login support
- 2FA setup and verification

### Course Management
- Add course with title, subtitle, category, level, pricing, and curriculum
- Media upload support
- Publish status and lecture structure management

### Purchase & Payment Flow
- Create order
- Pay via PayPal sandbox or fallback flow
- Finalize and confirm order
- Update student course ownership

### Learning Experience
- Student dashboard
- Course detail pages
- Lecture progression tracking
- Certificate unlocking upon completion

### AI Intelligence Layer
- Semantic-style search using pseudo embeddings and similarity matching
- Quiz generation and conceptual Q&A
- Course-specific knowledge retrieval experience

### Job & Placement Flow
- List job postings
- Verify eligibility using certificate or assessment status
- Apply to jobs with learner identity and certificate proof

---

## Environment Variables

Create environment variables in the backend as needed:

```bash
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/elearning
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET_ID=your_paypal_secret_id
REDIS_HOST=localhost
REDIS_PORT=6379
ELASTICSEARCH_NODE=http://localhost:9200
```

For the client, configure the API base URL and frontend environment as needed if separate env files are used.

---

## Setup & Run Instructions

### 1. Clone the project

```bash
git clone <repository-url>
cd elearning
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Start infrastructure with Docker

From the root directory:

```bash
docker-compose up -d
```

This starts:
- MongoDB
- Redis
- Elasticsearch

### 5. Start the backend server

```bash
cd server
npm run dev
```

### 6. Start the frontend app

```bash
cd client
npm run dev
```

### 7. Open the app

```bash
http://localhost:5173
```

---

## Docker Setup

The project includes Docker Compose configuration to manage core services:

- MongoDB for application data
- Redis for background processing / queue support
- Elasticsearch for course indexing and search

This makes the project easy to run locally and demonstrates deployment-friendly architecture.

---

## Resume-Friendly Project Summary

### Professional Summary Version

Developed a full-stack e-learning platform called Elearn Adda that supports instructor course management, student learning journeys, online enrollment, certificate issuance, AI-powered learning assistance, and job-placement workflows. Built the application using React, Tailwind CSS, Node.js, Express, MongoDB, Elasticsearch, and Docker. Integrated PayPal payments, Google authentication, JWT-based authorization, 2FA support, Cloudinary media uploads, and WhatsApp notifications to create a production-inspired learning ecosystem.

### Skills Demonstrated
- Full-Stack Web Development
- React.js + Vite + Tailwind CSS
- Node.js + Express.js
- MongoDB + Mongoose
- Elasticsearch + Search Optimization
- Authentication and Security
- REST API Development
- Payment Integration
- Cloud Storage Integration
- AI-Assisted User Experience
- Docker and Local Deployment

---

## Challenges Solved

- Designed role-based access for instructors and students
- Built secure online purchase flow for digital learning products
- Implemented progress tracking across course lectures
- Added certificate automation based on successful completion
- Enhanced search with Elasticsearch while maintaining MongoDB fallback logic
- Managed infrastructure dependencies in a local and containerized environment

---

## Learning Outcomes

This project strengthened expertise in:

- Full-stack product development from concept to deployment
- Architecture planning for multi-role web products
- Data modeling and application workflow design
- Integration of third-party services and APIs
- Building user-centric learning platforms with strong UX
- Delivering a complete product experience rather than isolated frontend/backend modules

---

## Optional Enhancement Ideas

If you want to take this project further for portfolio or job interviews, consider adding:

- Admin dashboard with insights and analytics
- Real AI/LLM integration using OpenAI or Azure OpenAI
- Email notification service
- Stripe payment support as a second payment gateway
- Unit and integration testing coverage
- CI/CD pipeline setup
- Cloud deployment on AWS, Azure, or Vercel + Render

---

## Final Note

This project is ideal for demonstrating hands-on experience in building a complex, real-world product with multiple user roles, business workflows, and integrated technologies. It communicates strong product-thinking, backend logic, and frontend implementation—making it highly valuable for a resume and interview discussion.
