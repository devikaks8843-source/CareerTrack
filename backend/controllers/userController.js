const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Map database fields to client user response
const getUserData = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  phone: user.phone,
  gender: user.gender,
  dateOfBirth: user.dateOfBirth,
  address: user.address,
  
  // Academic
  collegeName: user.collegeName,
  university: user.university,
  branch: user.branch,
  currentSemester: user.currentSemester,
  graduationYear: user.graduationYear,
  cgpa: user.cgpa,
  tenthPercentage: user.tenthPercentage,
  twelfthPercentage: user.twelfthPercentage,
  activeBacklogs: user.activeBacklogs,
  
  // Skills & Professional
  programmingSkills: user.programmingSkills || [],
  technicalSkills: user.technicalSkills || [],
  projects: user.projects || [],
  internships: user.internships || [],
  certifications: user.certifications || [],
  languagesKnown: user.languagesKnown || [],
  preferredLocations: user.preferredLocations || [],
  
  // Social & Uploads
  linkedinProfile: user.linkedinProfile,
  githubProfile: user.githubProfile,
  portfolioLink: user.portfolioLink,
  resumeUrl: user.resumeUrl,

  // Company Specific
  companyName: user.companyName,
  companyLogo: user.companyLogo,
  industryType: user.industryType,
  companyDescription: user.companyDescription,
  website: user.website,
  headquarters: user.headquarters,
  officeLocations: user.officeLocations || [],
  recruiterName: user.recruiterName,
  recruiterDesignation: user.recruiterDesignation,
  contactNumber: user.contactNumber,
  companySize: user.companySize,
  yearOfEstablishment: user.yearOfEstablishment,
});

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const {
      role,
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      
      // Personal
      gender,
      dateOfBirth,
      address,
      
      // Academic
      collegeName,
      university,
      branch,
      currentSemester,
      graduationYear,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      activeBacklogs,
      
      // Skill strings or lists
      programmingSkills,
      technicalSkills,
      projects,
      internships,
      certifications,
      languagesKnown,
      preferredLocations,
      
      // Social/Files
      linkedinProfile,
      githubProfile,
      portfolioLink,
      resumeUrl,

      // Company specific
      companyName,
      companyLogo,
      industryType,
      companyDescription,
      website,
      headquarters,
      officeLocations,
      recruiterName,
      recruiterDesignation,
      contactNumber,
      companySize,
      yearOfEstablishment,
    } = req.body;

    const cleanEmail = email.trim().toLowerCase();

    if (!role || !cleanEmail || !password || !confirmPassword || !fullName) {
      return res.status(400).json({ message: 'Required identity fields are missing' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (role === 'company' && (!companyName || !companyName.trim())) {
      return res.status(400).json({ message: 'Company Name is required' });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initial default mapping
    const userData = {
      role,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone,
      password: hashedPassword,
    };

    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin registration is not allowed' });
    }

    if (role === 'company') {
      userData.companyName = companyName;
      userData.companyLogo = companyLogo;
      userData.industryType = industryType;
      userData.companyDescription = companyDescription;
      userData.website = website;
      userData.headquarters = headquarters;
      userData.officeLocations = Array.isArray(officeLocations) ? officeLocations : (officeLocations ? officeLocations.split(',').map(s => s.trim()) : []);
      userData.recruiterName = recruiterName;
      userData.recruiterDesignation = recruiterDesignation;
      userData.contactNumber = contactNumber;
      userData.companySize = Number(companySize) || undefined;
      userData.yearOfEstablishment = Number(yearOfEstablishment) || undefined;
      userData.address = address;
      userData.status = 'pending'; // Company accounts are pending admin approval
    } else if (role === 'student') {
      userData.gender = gender && gender.trim() ? gender : undefined;
      userData.dateOfBirth = dateOfBirth || undefined;
      userData.address = address;
      userData.collegeName = collegeName;
      userData.university = university;
      userData.branch = branch;
      userData.currentSemester = Number(currentSemester) || undefined;
      userData.graduationYear = Number(graduationYear) || undefined;
      userData.cgpa = Number(cgpa) || undefined;
      userData.tenthPercentage = Number(tenthPercentage) || undefined;
      userData.twelfthPercentage = Number(twelfthPercentage) || undefined;
      userData.activeBacklogs = Number(activeBacklogs) || 0;
      
      // Skills arrays
      userData.programmingSkills = Array.isArray(programmingSkills) ? programmingSkills : (programmingSkills ? programmingSkills.split(',').map(s => s.trim()) : []);
      userData.technicalSkills = Array.isArray(technicalSkills) ? technicalSkills : (technicalSkills ? technicalSkills.split(',').map(s => s.trim()) : []);
      userData.projects = Array.isArray(projects) ? projects : [];
      userData.internships = Array.isArray(internships) ? internships : [];
      userData.certifications = Array.isArray(certifications) ? certifications : (certifications ? certifications.split(',').map(s => s.trim()) : []);
      userData.languagesKnown = Array.isArray(languagesKnown) ? languagesKnown : (languagesKnown ? languagesKnown.split(',').map(s => s.trim()) : []);
      userData.preferredLocations = Array.isArray(preferredLocations) ? preferredLocations : (preferredLocations ? preferredLocations.split(',').map(s => s.trim()) : []);
      
      userData.linkedinProfile = linkedinProfile;
      userData.githubProfile = githubProfile;
      userData.portfolioLink = portfolioLink;
      userData.resumeUrl = resumeUrl;
      userData.status = 'active'; // Students can login immediately
    }

    const user = await User.create(userData);
    if (!user) {
      return res.status(400).json({ message: 'Failed to create account' });
    }

    // Add initial welcome notification
    user.notifications.push({
      title: 'Welcome to Career Track!',
      message: role === 'student' 
        ? 'Successfully registered. Complete your student profile to maximize your eligibility score.'
        : 'Company drive registered successfully. Your profile is currently under review by our Admin team.',
    });
    await user.save();

    const responsePayload = getUserData(user);
    if (user.status === 'active') {
      responsePayload.token = generateToken(user._id, user.role);
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    if (error.name === 'ValidationError') {
      const firstMsg = Object.values(error.errors)[0]?.message || 'Invalid form input data';
      return res.status(400).json({ message: firstMsg });
    }
    res.status(500).json({ message: error.message || 'Server error during user registration' });
  }
};

// POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check approval block
    if (user.role !== 'admin' && user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending administrator approval.' });
    }
    if (user.role !== 'admin' && user.status === 'rejected') {
      return res.status(403).json({ message: 'Your registration request has been rejected.' });
    }

    res.json({
      ...getUserData(user),
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during user authentication' });
  }
};

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json({ user: getUserData(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile details' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const fields = [
      'fullName', 'phone', 'gender', 'dateOfBirth', 'address',
      'collegeName', 'university', 'branch', 'currentSemester', 'graduationYear',
      'cgpa', 'tenthPercentage', 'twelfthPercentage', 'activeBacklogs',
      'programmingSkills', 'technicalSkills', 'projects', 'internships',
      'certifications', 'languagesKnown', 'preferredLocations',
      'linkedinProfile', 'githubProfile', 'portfolioLink', 'resumeUrl',
      
      // Company specific
      'companyName', 'companyLogo', 'industryType', 'companyDescription',
      'website', 'headquarters', 'officeLocations', 'recruiterName',
      'recruiterDesignation', 'contactNumber', 'companySize', 'yearOfEstablishment'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const val = req.body[field];
        if ((field === 'gender' || field === 'dateOfBirth') && (val === '' || val === null)) {
          user[field] = null;
        } else {
          user[field] = val;
        }
      }
    });

    await user.save();
    res.json({ message: 'Profile updated successfully', user: getUserData(user) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating user profile' });
  }
};

// GET /api/users/notifications
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ notifications: user.notifications || [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// PUT /api/users/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.read = true;
    await user.save();
    res.json({ message: 'Notification marked as read', notifications: user.notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error reading notification' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
};
