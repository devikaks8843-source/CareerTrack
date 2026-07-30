const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

// Middleware: allow requests from the frontend and parse JSON.
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : '';
    if (!process.env.CLIENT_URL || process.env.CLIENT_URL === '*' || origin === clientUrl || origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'CareerTrack API is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), env: process.env.NODE_ENV || 'development' });
});

const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Seed default administrator if none exists
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Seeding default administrator...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword', salt);
      await User.create({
        fullName: 'System Administrator',
        email: 'admin@careertrack.com',
        phone: '1234567890',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log('Default admin account created: admin@careertrack.com / adminpassword');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
};

/**
 * Connect to the database, seed sample data if the DB is empty,
 * and then start the HTTP server.
 */
const startServer = async () => {
  await connectDB();
  await seedAdmin();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Career Track server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});

