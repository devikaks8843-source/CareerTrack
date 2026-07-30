# Career Track

Career Track is a feature-rich, full-stack placement management system designed using the MERN (MongoDB, Express, React, Node.js) stack. It streamlines the recruitment and placement drives of educational institutions by providing dedicated workflows, dashboards, and role-based permissions for **Students**, **Companies**, and **Placement Officers (Administrators)**.

---

## 🌟 Key Features by User Role

### 1. Student Portal (Candidate Console)
* **Comprehensive Profile Management:** Log personal information, educational backgrounds (CGPA, semester, branch, 10th & 12th percentages), technical and programming skills, project histories, internship experiences, certifications, LinkedIn links, and resume paths.
* **Profile Completion Tracker:** Real-time dynamic scoring percentage displaying user profile completeness to encourage thorough resumes.
* **Placement Announcements:** A central feed showcasing institution-wide notifications and announcements published by administrative staff.
* **Notification System:** Receive real-time alerts on registration drive approvals, status updates, or interview invitations with mark-as-read capability.
* **Interview Prep & Tracking:** High-level dashboard showcasing upcoming interview events (date, time, venue/meeting link, dress code, documents, syllabus, and resources).
* **Job Application Tracking:** Comprehensive review log showing all ongoing job applications, timeline events, and recruiter feedback.

### 2. Company Portal (Recruiter Console)
* **Job Drive Management:** Publish and update recruitment drives (details including eligibility criteria, salary package, job role, description, and target branch restrictions).
* **Advanced Candidate Searching & Filters:** Filter student applications dynamically by name, CGPA cutoffs, college name, branch, graduation year, and required programming/technical skills.
* **Recruitment Workflows:** Move candidates across hiring stages: *Applied*, *Shortlisted*, *Interviewing*, *Offered*, or *Rejected*.
* **Detailed Interview Scheduling:** Set up structured interview rounds with customized instructions (dress code, syllabus, reporting times, reference links, and interview questions).

### 3. Administrator Console (Placement Officer Hub)
* **High-Level Statistics:** Track student registrations, verified/unverified company drives, placement rate, highest salary packages, average packages, and total applications.
* **Company Drive Approvals:** Review new company sign-ups to approve or reject their access to student resumes and job posting workflows.
* **Student Directory Audits:** Complete view of the student body with administrative capabilities to remove student records (automatically cleans up related application logs).
* **Broadcast Hub:** Compose and publish notifications directly to student dashboards.
* **Analytics Reports:** Extract metrics on branch-wise placement successes and company-wise package reports.

---

## 🛠️ Tech Stack

* **Frontend:**
  * React (Vite-powered environment)
  * React Router DOM (v6 for protected and role-restricted routing)
  * Bootstrap 5 (Responsive UI styling)
  * React Icons (Iconography library)
  * Axios (HTTP request client with request interceptors)
* **Backend:**
  * Node.js & Express.js
  * MongoDB Atlas with Mongoose schemas
  * JWT (JSON Web Tokens) for stateless authentication header middleware
  * Bcrypt.js for secure password hashing
  * Cors & Dotenv configuration management

---

## 📂 Project Structure

```text
CareerTrack/
├── frontend/                   # Frontend Vite-React App
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Shared UI components (Navbar, Sidebar)
│   │   ├── pages/              # Role-specific dashboard page views
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── ApplicationsPage.jsx
│   │   │   ├── CompanyDashboardPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── JobsPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/           # Axios API configuration & AuthContext provider
│   │   │   ├── apiService.js
│   │   │   └── authService.jsx
│   │   ├── styles/             # Modular CSS styles
│   │   │   └── styles.css
│   │   ├── App.jsx             # Main Router and protected routes configuration
│   │   └── main.jsx            # DOM Renderer entry point
│   ├── package.json
│   └── vite.config.js
└── backend/                    # Node.js Express REST API Backend
    ├── config/                 # Mongoose Database client initialization
    ├── controllers/            # Feature controllers containing core logic
    │   ├── adminController.js
    │   ├── applicationController.js
    │   ├── jobController.js
    │   └── userController.js
    ├── middleware/             # Route protectors & authorization check routes
    │   └── authMiddleware.js
    ├── models/                 # Database Schemas
    │   ├── Announcement.js
    │   ├── Application.js
    │   ├── Job.js
    │   └── User.js
    ├── routes/                 # Express route configurations mapping to endpoints
    │   ├── adminRoutes.js
    │   ├── applicationRoutes.js
    │   ├── jobRoutes.js
    │   └── userRoutes.js
    ├── server.js               # Entry script containing middleware & server hooks
    └── package.json
```

---

## 🔑 Default Credentials

When the backend server launches, it automatically seeds a system administrator account if no admin accounts exist.

* **Email:** `admin@careertrack.com`
* **Password:** `adminpassword`

---

## ⚙️ Configuration Setup

### Server Environment Configuration
Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/careertrack?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_token
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Installation & Local Development

### 1. Clone the repository and navigate to the project directory:
```bash
cd C:\Users\Lenovo\Desktop\CareerTrack
```

### 2. Configure and run the Backend Server:
```bash
# Navigate to the backend directory
cd backend

# Install server dependencies
npm install

# Start the server in hot-reload development mode
npm run dev
```
The server will bind and listen on the configured port (default is `5000`): `http://localhost:5000`.

### 3. Configure and run the Frontend Application:
```bash
# Open a new terminal in the project root and navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the local Vite server
npm run dev
```
The frontend will start running and can be accessed at: `http://localhost:5173`.

---

## 🔌 API Reference Guide

### 🛡️ Authentication & User Profile Endpoints
| HTTP Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/users/register` | Public | Registers a new Student or Company account. |
| `POST` | `/api/users/login` | Public | Authenticates credentials and returns a JWT token. |
| `GET` | `/api/users/profile` | Authenticated | Retrieves profile details corresponding to logged-in user. |
| `PUT` | `/api/users/profile` | Authenticated | Updates personal, academic, or corporate metadata details. |
| `GET` | `/api/users/notifications` | Authenticated | Fetches customized notifications for the authenticated user. |
| `PUT` | `/api/users/notifications/:id/read` | Authenticated | Marks a specific notification event as read. |

### 💼 Jobs & Placement Drives Endpoints
| HTTP Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | Authenticated | Retrieves a list of active job posting records. |
| `GET` | `/api/jobs/:id` | Authenticated | Retrieves complete details for a single job posting. |
| `POST` | `/api/jobs` | Company Only | Creates a new placement recruitment drive posting. |
| `PUT` | `/api/jobs/:id` | Company Only | Updates criteria or information on an active job posting. |
| `DELETE` | `/api/jobs/:id` | Company Only | Deletes a recruitment drive job posting. |

### 📝 Job Applications Endpoints
| HTTP Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/applications` | Authenticated | Fetches user-relevant application trackers. |
| `GET` | `/api/applications/:id` | Authenticated | Returns detailed status/history logs of a specific application. |
| `POST` | `/api/applications/apply` | Student Only | Submits candidate profile details as an application to a job. |
| `PUT` | `/api/applications/:id` | Student, Company, Admin | Updates application status or logs candidate timeline events. |
| `POST` | `/api/applications/:id/round` | Company, Admin | Schedules a new interview round and notifies candidate. |
| `DELETE` | `/api/applications/:id` | Student, Company, Admin | Removes or withdraws a student application record. |

### 👑 Placement Officer (Admin Console) Endpoints
| HTTP Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin Only | Retrieves overall analytics stats for dashboard metrics. |
| `GET` | `/api/admin/companies` | Admin Only | Retrieves list of all signed-up recruiters. |
| `PUT` | `/api/admin/companies/:id/approve` | Admin Only | Approves pending recruiter account requests. |
| `PUT` | `/api/admin/companies/:id/reject` | Admin Only | Rejects pending recruiter account requests. |
| `GET` | `/api/admin/students` | Admin Only | Retrieves directory list of all students. |
| `DELETE` | `/api/admin/students/:id` | Admin Only | Deletes student profile and cascading application logs. |
| `GET` | `/api/admin/announcements` | Authenticated | Retrieves announcement feed entries. |
| `POST` | `/api/admin/announcements` | Admin Only | Publishes a system-wide notification. |
| `GET` | `/api/admin/reports` | Admin Only | Compiles metrics on branch/company placement successes. |
