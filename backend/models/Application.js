const mongoose = require('mongoose');

// Simple document schema for attachments.
const documentSchema = new mongoose.Schema({
  publicId: String,
  url: String,
  name: String,
  type: String,
}, { _id: false });

// Interview round schema: stores comprehensive details for each scheduled interview round.
const roundSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true }, // e.g. "Technical Interview" or "HR Interview"
  status: { type: String, enum: ['pending', 'completed', 'selected', 'rejected', 'waiting'], default: 'pending' },
  date: Date,
  time: String,
  venue: String,
  meetingLink: String,
  result: { type: String, enum: ['pending', 'passed', 'failed', 'waiting'], default: 'pending' },
  
  // Specific scheduling fields from requirements
  dressCode: { type: String, trim: true },
  requiredDocuments: { type: [String], default: [] },
  reportingInstructions: { type: String, trim: true },
  interviewSyllabus: { type: String, trim: true },
  preparationMaterials: { type: String, trim: true },
  previousQuestions: { type: [String], default: [] },
  learningResources: { type: [String], default: [] },
  additionalGuidelines: { type: String, trim: true },
  
  feedback: { type: String, trim: true },
  improvementSuggestions: { type: [String], default: [] }
}, { _id: false });

// Simple eligibility structure used to record why a student is eligible or not.
const eligibilitySchema = new mongoose.Schema({
  isEligible: { type: Boolean, default: false },
  reasons: [String],
  requiredSkills: [String],
  missingSkills: [String],
}, { _id: false });

// Main application schema linking a student to a job/company.
const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // optional direct link to job post
  jobTitle: { type: String, required: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  package: { type: String, trim: true },
  employmentType: { type: String, enum: ['Internship', 'Full Time'], default: 'Full Time' },

  // Eligibility details copied from the Job when applying.
  requiredSkills: [String],
  minimumCgpa: Number,
  maximumBacklogs: Number,
  eligibleBranches: [String],
  eligibleGraduationYears: [Number],

  // Application status and history.
  status: { 
    type: String, 
    enum: [
      'Application Submitted', 
      'Resume Under Review', 
      'Resume Shortlisted', 
      'Online Assessment', 
      'Online Assessment Result', 
      'Technical Interview', 
      'HR Interview', 
      'Final Interview', 
      'Selected', 
      'Rejected'
    ], 
    default: 'Application Submitted' 
  },
  eligibility: eligibilitySchema,
  applicationDate: { type: Date, default: Date.now },
  timeline: [{ stage: String, date: { type: Date, default: Date.now }, comment: String }],
  rounds: [roundSchema],
  rejectionReason: { type: String, trim: true },
  feedback: { type: String, trim: true },
  improvementSuggestions: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);

