const Job = require('../models/Job');
const User = require('../models/User');
const { buildEligibility } = require('./applicationController');

// Create a new job post. Only verified company users can create jobs.
const createJob = async (req, res) => {
  try {
    const companyUser = await User.findById(req.user._id);
    if (!companyUser || companyUser.role !== 'company') {
      return res.status(403).json({ message: 'Only companies can publish placement drives' });
    }
    if (companyUser.status !== 'active') {
      return res.status(403).json({ message: 'Your account must be approved by the administrator before creating placement drives.' });
    }

    const {
      title,
      jobRole,
      package: jobPackage,
      employmentType,
      location,
      workMode,
      description,
      requiredSkills,
      requiredProgrammingLanguages,
      minimumCgpa,
      maximumBacklogs,
      minimumTenthPercentage,
      minimumTwelfthPercentage,
      eligibleDepartments,
      eligibleGraduationYear,
      requiredCertifications,
      experienceRequired,
      applicationDeadline,
      interviewDate,
      interviewTime,
      interviewVenue,
      onlineMeetingLink,
      interviewRounds,
      requiredDocuments,
      interviewSyllabus,
      preparationMaterials,
      additionalInstructions,
    } = req.body;

    const job = await Job.create({
      company: companyUser._id,
      companyName: companyUser.companyName || companyUser.fullName,
      title: title || jobRole,
      jobRole: jobRole || title,
      package: jobPackage,
      employmentType,
      location,
      workMode: workMode || 'On-site',
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      requiredProgrammingLanguages: Array.isArray(requiredProgrammingLanguages) ? requiredProgrammingLanguages : (requiredProgrammingLanguages ? requiredProgrammingLanguages.split(',').map(s => s.trim()) : []),
      minimumCgpa: Number(minimumCgpa) || undefined,
      maximumBacklogs: Number(maximumBacklogs) || 0,
      minimumTenthPercentage: Number(minimumTenthPercentage) || undefined,
      minimumTwelfthPercentage: Number(minimumTwelfthPercentage) || undefined,
      eligibleDepartments: Array.isArray(eligibleDepartments) ? eligibleDepartments : (eligibleDepartments ? eligibleDepartments.split(',').map(s => s.trim()) : []),
      eligibleGraduationYear: Array.isArray(eligibleGraduationYear) ? eligibleGraduationYear : (eligibleGraduationYear ? eligibleGraduationYear.split(',').map(s => Number(s.trim())) : []),
      requiredCertifications: Array.isArray(requiredCertifications) ? requiredCertifications : (requiredCertifications ? requiredCertifications.split(',').map(s => s.trim()) : []),
      experienceRequired,
      applicationDeadline,
      interviewDate,
      interviewTime,
      interviewVenue,
      onlineMeetingLink,
      interviewRounds: Array.isArray(interviewRounds) ? interviewRounds : (interviewRounds ? interviewRounds.split(',').map(s => s.trim()) : []),
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : (requiredDocuments ? requiredDocuments.split(',').map(s => s.trim()) : []),
      interviewSyllabus,
      preparationMaterials,
      additionalInstructions,
      status: 'Open',
    });

    // Notify all students of the new placement drive
    const students = await User.find({ role: 'student' });
    const notificationPromises = students.map(async (student) => {
      student.notifications.push({
        title: `New Placement Drive: ${job.companyName}`,
        message: `${job.companyName} is hiring for ${job.title}. CTC: ${job.package || 'N/A'}. Application deadline is ${new Date(job.applicationDeadline).toLocaleDateString()}. Check eligibility and apply!`,
      });
      return student.save();
    });
    await Promise.all(notificationPromises);

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error creating placement drive' });
  }
};

// Update a job. Only the owning company can update.
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Placement drive not found' });
    if (!job.company.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowed = [
      'title', 'jobRole', 'package', 'employmentType', 'location', 'workMode', 'description',
      'requiredSkills', 'requiredProgrammingLanguages', 'minimumCgpa', 'maximumBacklogs',
      'minimumTenthPercentage', 'minimumTwelfthPercentage', 'eligibleDepartments', 'eligibleGraduationYear',
      'requiredCertifications', 'experienceRequired', 'applicationDeadline', 'interviewDate',
      'interviewTime', 'interviewVenue', 'onlineMeetingLink', 'interviewRounds', 'requiredDocuments',
      'interviewSyllabus', 'preparationMaterials', 'additionalInstructions', 'status'
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (['requiredSkills', 'requiredProgrammingLanguages', 'eligibleDepartments', 'eligibleGraduationYear', 'requiredCertifications', 'interviewRounds', 'requiredDocuments'].includes(field)) {
          job[field] = Array.isArray(req.body[field]) ? req.body[field] : req.body[field].split(',').map(s => s.trim()).filter(Boolean);
        } else {
          job[field] = req.body[field];
        }
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error updating job drive' });
  }
};

// Delete a job.
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Placement drive not found' });
    if (!job.company.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await job.deleteOne();
    res.json({ message: 'Placement drive deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error deleting job drive' });
  }
};

// Get jobs with advanced filtering: search and mine. If student, attach live eligibility details.
const getJobs = async (req, res) => {
  try {
    const { search, location, minCgpa, branch, year, mine } = req.query;
    const query = {};

    // For companies, they might want to view all their jobs (mine=true). Otherwise default is Open drives.
    if (mine === 'true' && req.user && req.user.role === 'company') {
      query.company = req.user._id;
    } else if (req.user && req.user.role === 'company') {
      query.company = req.user._id;
    } else {
      query.status = 'Open';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { jobRole: { $regex: search, $options: 'i' } },
        { requiredSkills: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minCgpa) query.minimumCgpa = { $lte: Number(minCgpa) };
    if (branch) query.eligibleDepartments = { $regex: branch, $options: 'i' };
    if (year) query.eligibleGraduationYear = Number(year);

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    // If request is from a student, attach their specific eligibility object for each drive
    if (req.user && req.user.role === 'student') {
      const student = await User.findById(req.user._id);
      const jobsWithEligibility = jobs.map((job) => {
        const eligibility = buildEligibility(student, job);
        return {
          ...job.toObject(),
          eligibility,
        };
      });
      return res.json({ jobs: jobsWithEligibility });
    }

    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error fetching placement drives' });
  }
};

// Get a single job by ID.
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Placement drive not found' });
    
    if (req.user && req.user.role === 'student') {
      const student = await User.findById(req.user._id);
      const eligibility = buildEligibility(student, job);
      return res.json({
        job: {
          ...job.toObject(),
          eligibility,
        }
      });
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching job details' });
  }
};

module.exports = { createJob, updateJob, deleteJob, getJobs, getJobById };
