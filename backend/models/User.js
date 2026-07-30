const mongoose = require('mongoose');

// Small sub-schema to store simple documents like resume or profile photo.
const documentSchema = new mongoose.Schema({
  publicId: { type: String },
  url: { type: String },
  name: { type: String, trim: true },
  type: { type: String, trim: true },
}, { _id: false });

// Skill schema for student profiles.
const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
}, { _id: false });

// Internship schema for student profiles.
const internshipSchema = new mongoose.Schema({
  company: { type: String, trim: true },
  role: { type: String, trim: true },
  duration: { type: String, trim: true },
  description: { type: String, trim: true }
}, { _id: false });

// Main user schema. The same model is used for students, companies, and admins.
const userSchema = new mongoose.Schema({
  // Role decides available actions: 'student', 'company', or 'admin'.
  role: { type: String, enum: ['student', 'company', 'admin'], required: true, default: 'student' },

  // Account status: pending until approved by admin, active once approved.
  status: { type: String, enum: ['pending', 'active', 'rejected'], default: 'active' },

  // Basic identification fields.
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true },

  // Personal details (Student).
  gender: { type: String, enum: ['Male', 'Female', 'Other', null, ''], set: v => (!v || (typeof v === 'string' && v.trim() === '') ? null : v), trim: true },
  dateOfBirth: { type: Date },
  address: { type: String, trim: true },

  // Academic fields (Student).
  collegeName: { type: String, trim: true },
  university: { type: String, trim: true },
  branch: { type: String, trim: true },
  currentSemester: { type: Number },
  graduationYear: { type: Number },
  cgpa: { type: Number, min: 0, max: 10 },
  tenthPercentage: { type: Number, min: 0, max: 100 },
  twelfthPercentage: { type: Number, min: 0, max: 100 },
  activeBacklogs: { type: Number, min: 0, default: 0 },

  // Skills and experience (Student).
  programmingSkills: { type: [String], default: [] },
  technicalSkills: { type: [String], default: [] },
  projects: [{ title: String, description: String, technologies: [String] }],
  internships: [internshipSchema],
  certifications: { type: [String], default: [] },
  languagesKnown: { type: [String], default: [] },
  preferredLocations: { type: [String], default: [] },

  // Profile attachments and social links (Student).
  linkedinProfile: { type: String, trim: true },
  githubProfile: { type: String, trim: true },
  portfolioLink: { type: String, trim: true },
  resumeUrl: { type: String, trim: true },

  // Company-specific fields.
  companyName: { type: String, trim: true },
  companyLogo: { type: String, trim: true },
  industryType: { type: String, trim: true },
  companyDescription: { type: String, trim: true },
  website: { type: String, trim: true },
  headquarters: { type: String, trim: true },
  officeLocations: { type: [String], default: [] },
  recruiterName: { type: String, trim: true },
  recruiterDesignation: { type: String, trim: true },
  contactNumber: { type: String, trim: true },
  companySize: { type: Number },
  yearOfEstablishment: { type: Number },

  // Notifications for users.
  notifications: [
    {
      title: String,
      message: String,
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

