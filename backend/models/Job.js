const mongoose = require('mongoose');

// Simple document schema for attachments.
const documentSchema = new mongoose.Schema({
  publicId: String,
  url: String,
  name: String,
  type: String,
}, { _id: false });

// Job schema stores essential information required to display and
// check eligibility for a job drive.
const jobSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  jobRole: { type: String, trim: true }, // same as title
  package: { type: String, trim: true }, // salary package
  employmentType: { type: String, enum: ['Internship', 'Full Time'], default: 'Full Time' },
  location: { type: String, trim: true }, // work location
  workMode: { type: String, enum: ['On-site', 'Hybrid', 'Remote'], default: 'On-site' },
  description: { type: String, trim: true },

  // Eligibility fields
  requiredSkills: { type: [String], default: [] },
  requiredProgrammingLanguages: { type: [String], default: [] },
  minimumCgpa: { type: Number },
  maximumBacklogs: { type: Number, default: 0 },
  minimumTenthPercentage: { type: Number },
  minimumTwelfthPercentage: { type: Number },
  eligibleDepartments: { type: [String], default: [] }, // eligible branches/departments
  eligibleGraduationYear: { type: [Number], default: [] }, // graduation year
  requiredCertifications: { type: [String], default: [] },
  experienceRequired: { type: String, trim: true },

  // Interview and drive information.
  applicationDeadline: Date,
  interviewDate: Date,
  interviewTime: String,
  interviewVenue: String,
  onlineMeetingLink: String,
  interviewRounds: { type: [String], default: [] },
  requiredDocuments: { type: [String], default: [] },
  interviewSyllabus: { type: String, trim: true },
  preparationMaterials: { type: String, trim: true },
  additionalInstructions: { type: String, trim: true },

  // Simple status and attachments.
  status: { type: String, enum: ['Open', 'Closed', 'Archived'], default: 'Open' },
  attachments: [documentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);

