const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');

// Eligibility Engine: Compares student academic/technical profile with job requirements.
const buildEligibility = (student, job) => {
  const reasons = [];
  const requiredSkills = job.requiredSkills || [];
  const requiredLanguages = job.requiredProgrammingLanguages || [];

  // 1. Branch / Department check
  const branches = job.eligibleDepartments || [];
  if (branches.length > 0) {
    const studentBranch = (student.branch || '').toLowerCase().trim();
    const isBranchEligible = branches.some(b => b.toLowerCase().trim() === studentBranch);
    if (!isBranchEligible) {
      reasons.push(`Only ${branches.join(', ')} students are eligible (your branch is '${student.branch || 'not specified'}')`);
    }
  }

  // 2. CGPA check
  if (job.minimumCgpa !== undefined && job.minimumCgpa !== null) {
    const studentCgpa = student.cgpa || 0;
    if (studentCgpa < job.minimumCgpa) {
      reasons.push(`Minimum CGPA required is ${job.minimumCgpa} but your CGPA is ${studentCgpa}`);
    }
  }

  // 3. Backlogs check
  if (job.maximumBacklogs !== undefined && job.maximumBacklogs !== null) {
    const studentBacklogs = student.activeBacklogs || 0;
    if (studentBacklogs > job.maximumBacklogs) {
      reasons.push(`Maximum allowed backlogs is ${job.maximumBacklogs} but your profile contains ${studentBacklogs} active backlogs`);
    }
  }

  // 4. 10th Percentage check
  if (job.minimumTenthPercentage !== undefined && job.minimumTenthPercentage !== null) {
    const studentTenth = student.tenthPercentage || 0;
    if (studentTenth < job.minimumTenthPercentage) {
      reasons.push(`Minimum 10th percentage required is ${job.minimumTenthPercentage}% but your score is ${studentTenth}%`);
    }
  }

  // 5. 12th Percentage check
  if (job.minimumTwelfthPercentage !== undefined && job.minimumTwelfthPercentage !== null) {
    const studentTwelfth = student.twelfthPercentage || 0;
    if (studentTwelfth < job.minimumTwelfthPercentage) {
      reasons.push(`Minimum 12th percentage required is ${job.minimumTwelfthPercentage}% but your score is ${studentTwelfth}%`);
    }
  }

  // 6. Graduation Year check
  const gradYears = job.eligibleGraduationYear || [];
  if (gradYears.length > 0) {
    const studentGradYear = student.graduationYear;
    const isGradYearEligible = gradYears.includes(Number(studentGradYear));
    if (!isGradYearEligible) {
      reasons.push(`Only graduation years ${gradYears.join(', ')} are eligible (your graduation year is ${studentGradYear || 'not specified'})`);
    }
  }

  // 7. Technical & Programming Skills check
  const missingSkills = [];
  const studentTechSkills = (student.technicalSkills || []).map(s => s.toLowerCase().trim());
  const studentProgSkills = (student.programmingSkills || []).map(s => s.toLowerCase().trim());
  const studentCombinedSkills = [...studentTechSkills, ...studentProgSkills];

  requiredSkills.forEach(skill => {
    const hasSkill = studentCombinedSkills.includes(skill.toLowerCase().trim());
    if (!hasSkill) {
      missingSkills.push(skill);
      reasons.push(`Required skill '${skill}' is not available in your profile`);
    }
  });

  requiredLanguages.forEach(lang => {
    const hasLang = studentCombinedSkills.includes(lang.toLowerCase().trim());
    if (!hasLang) {
      missingSkills.push(lang);
      reasons.push(`Required programming language '${lang}' is not available in your profile`);
    }
  });

  return {
    isEligible: reasons.length === 0,
    reasons,
    requiredSkills: [...requiredSkills, ...requiredLanguages],
    missingSkills
  };
};

// Map recruiter rejection feedback to educational suggestions
const getImprovementSuggestions = (rejectionReason, feedback) => {
  const suggestions = [];
  const text = `${rejectionReason || ''} ${feedback || ''}`.toLowerCase();
  
  if (text.includes('technical') || text.includes('coding') || text.includes('programming') || text.includes('knowledge') || text.includes('dbms') || text.includes('dsa') || text.includes('sql')) {
    suggestions.push('Data Structures and Algorithms');
    suggestions.push('Database Management Systems');
    suggestions.push('Operating Systems');
  }
  if (text.includes('coding') || text.includes('performance') || text.includes('weak technical')) {
    suggestions.push('Mock Interviews');
    suggestions.push('Additional certifications');
  }
  if (text.includes('communication') || text.includes('poor communication') || text.includes('confidence') || text.includes('hr')) {
    suggestions.push('Communication Skills');
    suggestions.push('Mock Interviews');
  }
  if (text.includes('aptitude') || text.includes('score') || text.includes('math') || text.includes('reasoning')) {
    suggestions.push('Aptitude Practice');
  }
  
  // Default fallback if recruiter feedback is generic
  if (suggestions.length === 0) {
    suggestions.push('Data Structures and Algorithms');
    suggestions.push('Mock Interviews');
    suggestions.push('Communication Skills');
  }

  return [...new Set(suggestions)];
};

// GET /api/applications
const getApplications = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (req.user.role === 'student') query.student = req.user._id;
    if (req.user.role === 'company') query.company = req.user._id;

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'All') query.status = status;

    const applications = await Application.find(query)
      .populate('student', 'fullName email branch cgpa activeBacklogs programmingSkills technicalSkills resumeUrl linkedinProfile githubProfile collegeName')
      .populate('company', 'companyName email companyLogo website recruiterName')
      .sort({ applicationDate: -1 });

    const stats = {
      total: applications.length,
      selected: applications.filter(a => a.status === 'Selected').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
      applied: applications.filter(a => a.status === 'Application Submitted').length,
      underReview: applications.filter(a => a.status === 'Resume Under Review').length,
      shortlisted: applications.filter(a => a.status === 'Resume Shortlisted').length,
      oa: applications.filter(a => a.status === 'Online Assessment' || a.status === 'Online Assessment Result').length,
      interview: applications.filter(a => ['Technical Interview', 'HR Interview', 'Final Interview'].includes(a.status)).length,
    };

    res.json({ applications, stats });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// GET /api/applications/:id
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'fullName email branch cgpa activeBacklogs programmingSkills technicalSkills resumeUrl linkedinProfile githubProfile collegeName')
      .populate('company', 'companyName email companyLogo website recruiterName');
      
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Auth checks
    if (req.user.role === 'student' && !application.student._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'company' && !application.company._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching application' });
  }
};

// POST /api/applications/apply
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required to apply' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Placement drive not found' });
    }

    // Check if duplicate application exists
    const duplicate = await Application.findOne({ student: req.user._id, job: job._id });
    if (duplicate) {
      return res.status(400).json({ message: 'You have already applied to this recruitment drive' });
    }

    // Eligibility check
    const student = await User.findById(req.user._id);
    const eligibility = buildEligibility(student, job);

    if (!eligibility.isEligible) {
      return res.status(400).json({
        message: 'You do not meet the eligibility requirements for this job.',
        reasons: eligibility.reasons,
      });
    }

    const application = await Application.create({
      student: req.user._id,
      company: job.company,
      job: job._id,
      jobTitle: job.title,
      companyName: job.companyName,
      role: job.title,
      package: job.package,
      employmentType: job.employmentType,
      requiredSkills: job.requiredSkills || [],
      minimumCgpa: job.minimumCgpa,
      maximumBacklogs: job.maximumBacklogs,
      eligibleBranches: job.eligibleDepartments || [],
      eligibleGraduationYears: job.eligibleGraduationYear || [],
      status: 'Application Submitted',
      eligibility,
      timeline: [{ stage: 'Application Submitted', comment: 'Application submitted successfully through portal.' }],
    });

    // Notify company recruiter
    const recruiter = await User.findById(job.company);
    if (recruiter) {
      recruiter.notifications.push({
        title: 'New Applicant',
        message: `New application submitted by ${student.fullName} for '${job.title}' drive.`,
      });
      await recruiter.save();
    }

    // Notify student
    student.notifications.push({
      title: 'Applied Successfully',
      message: `Your application for '${job.title}' at ${job.companyName} has been submitted. Check dashboard for workflow status.`,
    });
    await student.save();

    // Notify administrators
    const admins = await User.find({ role: 'admin' });
    const adminPromises = admins.map(async (admin) => {
      admin.notifications.push({
        title: 'New Placement Application',
        message: `${student.fullName} applied to ${job.companyName} for the role of ${job.title}.`,
      });
      return admin.save();
    });
    await Promise.all(adminPromises);

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
};

// PUT /api/applications/:id
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Authorization
    if (req.user.role === 'student' && !application.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'company' && !application.company.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, comment, rejectionReason, feedback } = req.body;

    if (status) {
      application.status = status;
      application.timeline.push({
        stage: status,
        comment: comment || `Status updated to ${status}.`,
      });

      // Handle Rejection suggestions
      if (status === 'Rejected') {
        application.rejectionReason = rejectionReason || 'Rejection feedback not specified';
        application.feedback = feedback || rejectionReason || '';
        application.improvementSuggestions = getImprovementSuggestions(rejectionReason, feedback);
      }

      // Notify student
      const studentUser = await User.findById(application.student);
      if (studentUser) {
        studentUser.notifications.push({
          title: `Application Stage: ${status}`,
          message: status === 'Selected'
            ? `Congratulations! You have been Selected for '${application.jobTitle}' at ${application.companyName}!`
            : status === 'Rejected'
            ? `Your application for '${application.jobTitle}' at ${application.companyName} has been marked as Rejected. View feedback and custom learning recommendations on your dashboard.`
            : `Your application stage for '${application.jobTitle}' at ${application.companyName} is now: '${status}'.`,
        });
        await studentUser.save();
      }
    }

    // Apply allowed direct updates
    if (rejectionReason !== undefined) application.rejectionReason = rejectionReason;
    if (feedback !== undefined) application.feedback = feedback;

    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error updating application' });
  }
};

// POST /api/applications/:id/round (Company schedules a new round)
const addInterviewRound = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (!application.company.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      title,
      status,
      date,
      time,
      venue,
      meetingLink,
      dressCode,
      requiredDocuments,
      reportingInstructions,
      interviewSyllabus,
      preparationMaterials,
      previousQuestions,
      learningResources,
      additionalGuidelines,
    } = req.body;

    const roundData = {
      title: title || `Round ${application.rounds.length + 1}`,
      status: status || 'pending',
      date,
      time,
      venue,
      meetingLink,
      dressCode,
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : (requiredDocuments ? requiredDocuments.split(',').map(s => s.trim()) : []),
      reportingInstructions,
      interviewSyllabus,
      preparationMaterials,
      previousQuestions: Array.isArray(previousQuestions) ? previousQuestions : (previousQuestions ? previousQuestions.split(',').map(s => s.trim()) : []),
      learningResources: Array.isArray(learningResources) ? learningResources : (learningResources ? learningResources.split(',').map(s => s.trim()) : []),
      additionalGuidelines,
    };

    application.rounds.push(roundData);

    // Auto-progress application status to match interview stage if scheduler selected standard stages
    const standardStages = [
      'Online Assessment',
      'Technical Interview',
      'HR Interview',
      'Final Interview'
    ];
    if (standardStages.includes(title)) {
      application.status = title;
      application.timeline.push({
        stage: title,
        comment: `Scheduled: ${title} round on ${new Date(date).toLocaleDateString()} at ${time}.`,
      });
    } else {
      application.timeline.push({
        stage: application.status,
        comment: `Scheduled new round: '${title}' on ${new Date(date).toLocaleDateString()} at ${time}.`,
      });
    }

    await application.save();

    // Notify student
    const studentUser = await User.findById(application.student);
    if (studentUser) {
      studentUser.notifications.push({
        title: 'New Interview Scheduled',
        message: `An interview round '${title}' has been scheduled for '${application.jobTitle}' at ${application.companyName}. Check your dashboard for reporting parameters.`,
      });
      await studentUser.save();
    }

    res.json(application);
  } catch (error) {
    console.error('Scheduling interview round error:', error);
    res.status(500).json({ message: 'Server error scheduling interview round' });
  }
};

// DELETE /api/applications/:id
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (req.user.role === 'student' && !application.student.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'company' && !application.company.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await application.deleteOne();
    res.json({ message: 'Application removed successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ message: 'Server error deleting application' });
  }
};

module.exports = {
  buildEligibility,
  getApplications,
  getApplicationById,
  applyToJob,
  updateApplication,
  addInterviewRound,
  deleteApplication,
};

