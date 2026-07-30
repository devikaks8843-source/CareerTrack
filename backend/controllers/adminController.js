const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Announcement = require('../models/Announcement');

// Helper to parse package string into LPA number
const parsePackage = (pkgStr) => {
  if (!pkgStr) return 0;
  const match = pkgStr.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (num > 10000) {
    return num / 100000;
  }
  return num;
};

// GET /api/admin/dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const verifiedCompanies = await User.countDocuments({ role: 'company', status: 'active' });
    const pendingCompanies = await User.countDocuments({ role: 'company', status: 'pending' });
    const activeDrives = await Job.countDocuments({ status: 'Open' });
    const totalApplications = await Application.countDocuments();
    
    // Placements statistics
    const selectedApplications = await Application.find({ status: 'Selected' });
    const successfulPlacements = selectedApplications.length;

    let highestPackageVal = 0;
    let highestPackageStr = '0 LPA';
    let totalPackageVal = 0;

    selectedApplications.forEach((app) => {
      const val = parsePackage(app.package);
      totalPackageVal += val;
      if (val > highestPackageVal) {
        highestPackageVal = val;
        highestPackageStr = app.package || `${val} LPA`;
      }
    });

    const averageSalaryVal = successfulPlacements > 0 ? (totalPackageVal / successfulPlacements) : 0;
    const averageSalaryPackage = `${averageSalaryVal.toFixed(2)} LPA`;

    const placementPercentage = totalStudents > 0 ? ((successfulPlacements / totalStudents) * 100).toFixed(1) : 0;

    res.json({
      stats: {
        totalStudents,
        verifiedCompanies,
        pendingCompanies,
        activeDrives,
        totalApplications,
        successfulPlacements,
        highestPackage: highestPackageStr,
        averagePackage: averageSalaryPackage,
        placementPercentage: `${placementPercentage}%`,
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Server error fetching dashboard statistics' });
  }
};

// GET /api/admin/companies
const getCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: 'company' }).select('-password').sort({ createdAt: -1 });
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching companies' });
  }
};

// PUT /api/admin/companies/:id/approve
const approveCompany = async (req, res) => {
  try {
    const company = await User.findOne({ _id: req.params.id, role: 'company' });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    company.status = 'active';
    
    // Add notification to the approved company
    company.notifications.push({
      title: 'Account Approved',
      message: 'Your recruiter account has been verified and approved by the Administrator. You can now post job opportunities and manage drives.',
    });
    
    await company.save();
    res.json({ message: 'Company approved successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Server error approving company' });
  }
};

// PUT /api/admin/companies/:id/reject
const rejectCompany = async (req, res) => {
  try {
    const company = await User.findOne({ _id: req.params.id, role: 'company' });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    company.status = 'rejected';
    
    // Add notification to the rejected company
    company.notifications.push({
      title: 'Registration Rejected',
      message: 'Your recruiter registration request was rejected by the Administrator. Please contact placement cell for details.',
    });
    
    await company.save();
    res.json({ message: 'Company rejected successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Server error rejecting company' });
  }
};

// GET /api/admin/students
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching students' });
  }
};

// DELETE /api/admin/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student account not found' });
    }
    // Delete student's applications as well to maintain DB integrity
    await Application.deleteMany({ student: student._id });
    await student.deleteOne();
    res.json({ message: 'Student account and associated applications removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing student account' });
  }
};

// POST /api/admin/announcements
const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Announcement title and content are required' });
    }
    
    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user._id,
    });

    // Notify all student users about the new announcement
    const students = await User.find({ role: 'student' });
    const notificationPromises = students.map(async (student) => {
      student.notifications.push({
        title: `Placement Notice: ${title}`,
        message: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
      });
      return student.save();
    });
    await Promise.all(notificationPromises);

    res.status(201).json({ message: 'Announcement published successfully', announcement });
  } catch (error) {
    console.error('Announcement creation error:', error);
    res.status(500).json({ message: 'Server error publishing announcement' });
  }
};

// GET /api/admin/announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching announcements' });
  }
};

// GET /api/admin/reports
const getPlacementReports = async (req, res) => {
  try {
    // 1. Selection count by Branch/Department
    const branchStats = await Application.aggregate([
      { $match: { status: 'Selected' } },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.branch',
          selectedCount: { $sum: 1 },
          packages: { $push: '$package' }
        }
      }
    ]);

    const formattedBranchStats = branchStats.map(b => {
      let maxPkgVal = 0;
      let totalPkgVal = 0;
      b.packages.forEach(p => {
        const v = parsePackage(p);
        totalPkgVal += v;
        if (v > maxPkgVal) maxPkgVal = v;
      });
      return {
        branch: b._id || 'General',
        count: b.selectedCount,
        maxPackage: maxPkgVal > 0 ? `${maxPkgVal} LPA` : 'N/A',
        avgPackage: b.selectedCount > 0 ? `${(totalPkgVal / b.selectedCount).toFixed(2)} LPA` : 'N/A'
      };
    });

    // 2. Company Recruitments
    const companyStats = await Application.aggregate([
      { $match: { status: 'Selected' } },
      {
        $group: {
          _id: '$companyName',
          recruitedCount: { $sum: 1 },
          packages: { $push: '$package' }
        }
      },
      { $sort: { recruitedCount: -1 } }
    ]);

    const formattedCompanyStats = companyStats.map(c => {
      let maxPkgVal = 0;
      c.packages.forEach(p => {
        const v = parsePackage(p);
        if (v > maxPkgVal) maxPkgVal = v;
      });
      return {
        companyName: c._id,
        recruits: c.recruitedCount,
        maxPackage: maxPkgVal > 0 ? `${maxPkgVal} LPA` : 'N/A'
      };
    });

    res.json({
      branchStats: formattedBranchStats,
      companyStats: formattedCompanyStats,
    });
  } catch (error) {
    console.error('Reports generation error:', error);
    res.status(500).json({ message: 'Server error generating placement reports' });
  }
};

// DELETE /api/admin/companies/:id
const deleteCompany = async (req, res) => {
  try {
    const company = await User.findOne({ _id: req.params.id, role: 'company' });
    if (!company) {
      return res.status(404).json({ message: 'Company account not found' });
    }
    const jobs = await Job.find({ company: company._id });
    const jobIds = jobs.map(j => j._id);
    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ company: company._id });
    await company.deleteOne();
    res.json({ message: 'Company account and associated job drives removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing company account' });
  }
};

module.exports = {
  getAdminDashboard,
  getCompanies,
  approveCompany,
  rejectCompany,
  deleteCompany,
  getStudents,
  deleteStudent,
  createAnnouncement,
  getAnnouncements,
  getPlacementReports,
};
