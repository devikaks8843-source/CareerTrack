import { useEffect, useState } from 'react';
import { useAuth } from '../services/authService.jsx';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/apiService';
import { FaUser, FaGraduationCap, FaCode, FaLink, FaSave, FaPlus, FaTrash } from 'react-icons/fa';

function ProfilePage() {
  const { user, saveUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Projects & Internships temporary states
  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '' });
  const [newInternship, setNewInternship] = useState({ company: '', role: '', duration: '', description: '' });

  // Comma-separated editing inputs for array-based profile fields
  const [skillsText, setSkillsText] = useState({
    programmingSkills: '',
    technicalSkills: '',
    certifications: '',
    languagesKnown: '',
    preferredLocations: '',
    officeLocations: '',
  });

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const userProfile = response.data.user || {};
      setProfile(userProfile);
      setSkillsText({
        programmingSkills: userProfile.programmingSkills?.join(', ') || '',
        technicalSkills: userProfile.technicalSkills?.join(', ') || '',
        certifications: userProfile.certifications?.join(', ') || '',
        languagesKnown: userProfile.languagesKnown?.join(', ') || '',
        preferredLocations: userProfile.preferredLocations?.join(', ') || '',
        officeLocations: userProfile.officeLocations?.join(', ') || '',
      });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to fetch profile details.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Profile completion percentage calculator
  const calculateCompletion = (prof) => {
    if (!prof || prof.role !== 'student') return 100; // Recruiter profile or empty

    const fields = [
      { val: prof.fullName, weight: 5 },
      { val: prof.phone, weight: 5 },
      { val: prof.gender, weight: 5 },
      { val: prof.dateOfBirth, weight: 5 },
      { val: prof.address, weight: 5 },
      { val: prof.collegeName, weight: 5 },
      { val: prof.university, weight: 5 },
      { val: prof.branch, weight: 5 },
      { val: prof.currentSemester, weight: 5 },
      { val: prof.graduationYear, weight: 5 },
      { val: prof.cgpa, weight: 5 },
      { val: prof.tenthPercentage, weight: 5 },
      { val: prof.twelfthPercentage, weight: 5 },
      { val: prof.programmingSkills?.length > 0, weight: 5 },
      { val: prof.technicalSkills?.length > 0, weight: 5 },
      { val: prof.projects?.length > 0, weight: 5 },
      { val: prof.internships?.length > 0, weight: 5 },
      { val: prof.certifications?.length > 0, weight: 5 },
      { val: prof.linkedinProfile, weight: 5 },
      { val: prof.resumeUrl, weight: 5 },
    ];

    let total = 0;
    fields.forEach((f) => {
      if (f.val) total += f.weight;
    });
    return total;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    const { name, value } = e.target;
    setSkillsText((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add/remove projects
  const addProject = () => {
    if (!newProject.title) return;
    const projectItem = {
      title: newProject.title,
      description: newProject.description,
      technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean)
    };
    setProfile(prev => ({
      ...prev,
      projects: [...(prev.projects || []), projectItem]
    }));
    setNewProject({ title: '', description: '', technologies: '' });
  };

  const removeProject = (index) => {
    setProfile(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, idx) => idx !== index)
    }));
  };

  // Add/remove internships
  const addInternship = () => {
    if (!newInternship.company || !newInternship.role) return;
    setProfile(prev => ({
      ...prev,
      internships: [...(prev.internships || []), newInternship]
    }));
    setNewInternship({ company: '', role: '', duration: '', description: '' });
  };

  const removeInternship = (index) => {
    setProfile(prev => ({
      ...prev,
      internships: (prev.internships || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const profileToSubmit = {
        ...profile,
        programmingSkills: skillsText.programmingSkills.split(',').map(s => s.trim()).filter(Boolean),
        technicalSkills: skillsText.technicalSkills.split(',').map(s => s.trim()).filter(Boolean),
        certifications: skillsText.certifications.split(',').map(s => s.trim()).filter(Boolean),
        languagesKnown: skillsText.languagesKnown.split(',').map(s => s.trim()).filter(Boolean),
        preferredLocations: skillsText.preferredLocations.split(',').map(s => s.trim()).filter(Boolean),
        officeLocations: skillsText.officeLocations.split(',').map(s => s.trim()).filter(Boolean),
      };
      const response = await api.put('/users/profile', profileToSubmit);
      const updatedProfile = response.data.user;
      setProfile(updatedProfile);
      
      setSkillsText({
        programmingSkills: updatedProfile.programmingSkills?.join(', ') || '',
        technicalSkills: updatedProfile.technicalSkills?.join(', ') || '',
        certifications: updatedProfile.certifications?.join(', ') || '',
        languagesKnown: updatedProfile.languagesKnown?.join(', ') || '',
        preferredLocations: updatedProfile.preferredLocations?.join(', ') || '',
        officeLocations: updatedProfile.officeLocations?.join(', ') || '',
      });

      // Sync login session user storage
      const storedUser = localStorage.getItem('careertrackUser');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.fullName = updatedProfile.fullName;
        u.companyName = updatedProfile.companyName;
        localStorage.setItem('careertrackUser', JSON.stringify(u));
        saveUser(u);
      }
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      setMessage({ text: error.response?.data?.message || 'Failed to update profile.', type: 'danger' });
    }
  };

  const completionPct = calculateCompletion(profile);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid py-4">
        <div className="row gx-4">
          <div className="col-lg-3">
            <Sidebar />
          </div>
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div>
                <h2 className="mb-1 fw-bold text-dark">Profile Settings</h2>
                <p className="text-muted mb-0">Update your account profile and verify eligibility stats.</p>
              </div>
            </div>

            {message.text && (
              <div className={`alert alert-${message.type} border-0 shadow-sm rounded-4 mb-4`}>
                {message.text}
              </div>
            )}

            {loading ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-3 mb-0">Fetching your profile details...</p>
              </div>
            ) : (
              <div>
                {/* Completion Progress Widget for Students */}
                {profile.role === 'student' && (
                  <div className="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold text-dark">Profile Completion Progress</span>
                      <span className="badge bg-primary fs-6">{completionPct}%</span>
                    </div>
                    <div className="progress rounded-pill shadow-inner" style={{ height: '14px' }}>
                      <div
                        className={`progress-bar progress-bar-striped progress-bar-animated bg-${completionPct === 100 ? 'success' : 'primary'}`}
                        role="progressbar"
                        style={{ width: `${completionPct}%` }}
                        aria-valuenow={completionPct}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                    <p className="text-muted small mt-2 mb-0">
                      * Complete all fields to ensure 100% eligibility matching. Missing fields may auto-disqualify you from drives.
                    </p>
                  </div>
                )}

                <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                  <div className="card-header bg-light border-0 p-0">
                    <ul className="nav nav-tabs border-0 px-3 pt-3 gap-1">
                      {profile.role === 'student' ? (
                        <>
                          <li className="nav-item">
                            <button
                              className={`nav-link border-0 px-4 py-2.5 rounded-top-3 fw-semibold ${activeTab === 'personal' ? 'active bg-white text-primary shadow-sm' : 'text-muted'}`}
                              onClick={() => setActiveTab('personal')}
                            >
                              <FaUser className="me-2" /> Personal
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              className={`nav-link border-0 px-4 py-2.5 rounded-top-3 fw-semibold ${activeTab === 'academic' ? 'active bg-white text-primary shadow-sm' : 'text-muted'}`}
                              onClick={() => setActiveTab('academic')}
                            >
                              <FaGraduationCap className="me-2" /> Academic
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              className={`nav-link border-0 px-4 py-2.5 rounded-top-3 fw-semibold ${activeTab === 'skills' ? 'active bg-white text-primary shadow-sm' : 'text-muted'}`}
                              onClick={() => setActiveTab('skills')}
                            >
                              <FaCode className="me-2" /> Skills & Exp
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              className={`nav-link border-0 px-4 py-2.5 rounded-top-3 fw-semibold ${activeTab === 'links' ? 'active bg-white text-primary shadow-sm' : 'text-muted'}`}
                              onClick={() => setActiveTab('links')}
                            >
                              <FaLink className="me-2" /> Links & Resume
                            </button>
                          </li>
                        </>
                      ) : (
                        <li className="nav-item">
                          <button className="nav-link border-0 px-4 py-2.5 rounded-top-3 fw-semibold active bg-white text-primary" onClick={() => setActiveTab('company')}>
                            Company Details
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                      {activeTab === 'personal' && (
                        <div>
                          <h5 className="fw-bold mb-3">Personal Information</h5>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Full Name *</label>
                              <input type="text" name="fullName" className="form-control" value={profile.fullName || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Official Email Address (Primary)</label>
                              <input type="email" className="form-control bg-light" value={profile.email || ''} disabled />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Phone Number *</label>
                              <input type="tel" name="phone" className="form-control" value={profile.phone || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Gender *</label>
                              <select name="gender" className="form-select" value={profile.gender || ''} onChange={handleInputChange} required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Date of Birth *</label>
                              <input type="date" name="dateOfBirth" className="form-control" value={profile.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-12">
                              <label className="form-label text-muted small">Permanent Address *</label>
                              <textarea name="address" className="form-control" rows="2" value={profile.address || ''} onChange={handleInputChange} required />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'academic' && (
                        <div>
                          <h5 className="fw-bold mb-3">Academic Parameters</h5>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small">College Name *</label>
                              <input type="text" name="collegeName" className="form-control" value={profile.collegeName || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">University *</label>
                              <input type="text" name="university" className="form-control" value={profile.university || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Branch / Department *</label>
                              <input type="text" name="branch" className="form-control" placeholder="e.g. Computer Science and Engineering" value={profile.branch || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Current Semester *</label>
                              <input type="number" name="currentSemester" className="form-control" value={profile.currentSemester || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label text-muted small">Graduation Year *</label>
                              <input type="number" name="graduationYear" className="form-control" value={profile.graduationYear || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label text-muted small">Current CGPA (Scale 0-10) *</label>
                              <input type="number" step="0.01" max="10" name="cgpa" className="form-control" value={profile.cgpa || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label text-muted small">Active Backlogs count *</label>
                              <input type="number" name="activeBacklogs" className="form-control" value={profile.activeBacklogs || 0} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">10th Standard Percentage (%) *</label>
                              <input type="number" step="0.01" name="tenthPercentage" className="form-control" value={profile.tenthPercentage || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">12th Standard Percentage (%) *</label>
                              <input type="number" step="0.01" name="twelfthPercentage" className="form-control" value={profile.twelfthPercentage || ''} onChange={handleInputChange} required />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'skills' && (
                        <div>
                          <h5 className="fw-bold mb-3">Skills, Projects & Internships</h5>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Programming Languages (Comma Separated) *</label>
                              <input type="text" name="programmingSkills" className="form-control" placeholder="Java, Python, Javascript" value={skillsText.programmingSkills} onChange={handleSkillsChange} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Technical Skills / Frameworks (Comma Separated) *</label>
                              <input type="text" name="technicalSkills" className="form-control" placeholder="React.js, Node.js, Mongoose, AWS" value={skillsText.technicalSkills} onChange={handleSkillsChange} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Certifications list (Comma Separated)</label>
                              <input type="text" name="certifications" className="form-control" placeholder="AWS Cloud Practitioner, GCP Architect" value={skillsText.certifications} onChange={handleSkillsChange} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Languages Known (Comma Separated)</label>
                              <input type="text" name="languagesKnown" className="form-control" placeholder="English, Hindi, Spanish" value={skillsText.languagesKnown} onChange={handleSkillsChange} />
                            </div>
                            <div className="col-12">
                              <label className="form-label text-muted small">Preferred Locations (Comma Separated)</label>
                              <input type="text" name="preferredLocations" className="form-control" placeholder="Bangalore, Mumbai, Remote" value={skillsText.preferredLocations} onChange={handleSkillsChange} />
                            </div>
                          </div>

                          <hr className="my-4" />

                          {/* Projects Section */}
                          <div className="mb-4">
                            <h6 className="fw-bold text-secondary mb-3">Completed Projects</h6>
                            <div className="row g-2 mb-3 bg-light p-3 rounded-3 border">
                              <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                              </div>
                              <div className="col-md-5">
                                <input type="text" className="form-control form-control-sm" placeholder="Technologies (Comma separated)" value={newProject.technologies} onChange={e => setNewProject({...newProject, technologies: e.target.value})} />
                              </div>
                              <div className="col-md-3">
                                <button type="button" className="btn btn-sm btn-primary w-100" onClick={addProject}>
                                  <FaPlus className="me-1" /> Add Project
                                </button>
                              </div>
                              <div className="col-12 mt-2">
                                <input type="text" className="form-control form-control-sm" placeholder="Short description..." value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                              </div>
                            </div>

                            <ul className="list-group">
                              {profile.projects?.map((proj, idx) => (
                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-start border-0 shadow-sm rounded-3 mb-2 bg-light">
                                  <div>
                                    <strong className="text-dark">{proj.title}</strong>
                                    <p className="text-muted small mb-1">{proj.description}</p>
                                    <span className="badge bg-secondary">{proj.technologies?.join(', ')}</span>
                                  </div>
                                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeProject(idx)}>
                                    <FaTrash />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <hr className="my-4" />

                          {/* Internships Section */}
                          <div className="mb-2">
                            <h6 className="fw-bold text-secondary mb-3">Internship Experiences</h6>
                            <div className="row g-2 mb-3 bg-light p-3 rounded-3 border">
                              <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm" placeholder="Company Name" value={newInternship.company} onChange={e => setNewInternship({...newInternship, company: e.target.value})} />
                              </div>
                              <div className="col-md-3">
                                <input type="text" className="form-control form-control-sm" placeholder="Role (e.g. Frontend Dev)" value={newInternship.role} onChange={e => setNewInternship({...newInternship, role: e.target.value})} />
                              </div>
                              <div className="col-md-3">
                                <input type="text" className="form-control form-control-sm" placeholder="Duration (e.g. 3 Months)" value={newInternship.duration} onChange={e => setNewInternship({...newInternship, duration: e.target.value})} />
                              </div>
                              <div className="col-md-2">
                                <button type="button" className="btn btn-sm btn-primary w-100" onClick={addInternship}>
                                  <FaPlus className="me-1" /> Add
                                </button>
                              </div>
                              <div className="col-12 mt-2">
                                <input type="text" className="form-control form-control-sm" placeholder="Short description..." value={newInternship.description} onChange={e => setNewInternship({...newInternship, description: e.target.value})} />
                              </div>
                            </div>

                            <ul className="list-group">
                              {profile.internships?.map((intern, idx) => (
                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-start border-0 shadow-sm rounded-3 mb-2 bg-light">
                                  <div>
                                    <strong className="text-dark">{intern.company} ({intern.role})</strong> &middot; <span className="text-muted small">{intern.duration}</span>
                                    <p className="text-muted small mb-0 mt-1">{intern.description}</p>
                                  </div>
                                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeInternship(idx)}>
                                    <FaTrash />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {activeTab === 'links' && (
                        <div>
                          <h5 className="fw-bold mb-3">Profile Assets & Links</h5>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small">LinkedIn Profile URL *</label>
                              <input type="url" name="linkedinProfile" className="form-control" placeholder="https://linkedin.com/in/username" value={profile.linkedinProfile || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">GitHub Profile URL *</label>
                              <input type="url" name="githubProfile" className="form-control" placeholder="https://github.com/username" value={profile.githubProfile || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Portfolio Website Link</label>
                              <input type="url" name="portfolioLink" className="form-control" placeholder="https://myportfolio.com" value={profile.portfolioLink || ''} onChange={handleInputChange} />
                            </div>
                            <div className="col-12">
                              <label className="form-label text-muted small">Resume URL (Google Drive / Cloudinary Link) *</label>
                              <input type="url" name="resumeUrl" className="form-control" placeholder="https://drive.google.com/file/d/..." value={profile.resumeUrl || ''} onChange={handleInputChange} required />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'company' && (
                        <div>
                          <h5 className="fw-bold mb-3">Recruiter Profile & Company Details</h5>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Recruiter Full Name *</label>
                              <input type="text" name="fullName" className="form-control" value={profile.fullName || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Recruiter Designation *</label>
                              <input type="text" name="recruiterDesignation" className="form-control" placeholder="e.g. Senior Talent Acquisition" value={profile.recruiterDesignation || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Official Recruiter Email</label>
                              <input type="email" className="form-control bg-light" value={profile.email || ''} disabled />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Official Recruiter Phone *</label>
                              <input type="tel" name="phone" className="form-control" value={profile.phone || ''} onChange={handleInputChange} required />
                            </div>

                            <hr className="my-3" />

                            <div className="col-md-6">
                              <label className="form-label text-muted small">Company Registered Name *</label>
                              <input type="text" name="companyName" className="form-control" value={profile.companyName || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Company Logo URL *</label>
                              <input type="url" name="companyLogo" className="form-control" placeholder="https://logo-url..." value={profile.companyLogo || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Industry Type *</label>
                              <input type="text" name="industryType" className="form-control" placeholder="e.g. IT, FinTech" value={profile.industryType || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Official Company Website URL *</label>
                              <input type="url" name="website" className="form-control" placeholder="https://company.com" value={profile.website || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Headquarters Location *</label>
                              <input type="text" name="headquarters" className="form-control" value={profile.headquarters || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Office Locations (Comma Separated)</label>
                              <input type="text" name="officeLocations" className="form-control" placeholder="New York, London, Remote" value={skillsText.officeLocations} onChange={handleSkillsChange} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Company Size (Employee Count)</label>
                              <input type="number" name="companySize" className="form-control" value={profile.companySize || ''} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label text-muted small">Year of Establishment</label>
                              <input type="number" name="yearOfEstablishment" className="form-control" value={profile.yearOfEstablishment || ''} onChange={handleInputChange} />
                            </div>
                            <div className="col-12">
                              <label className="form-label text-muted small">Corporate Headquarters Address</label>
                              <textarea name="address" className="form-control" rows="2" value={profile.address || ''} onChange={handleInputChange} />
                            </div>
                            <div className="col-12">
                              <label className="form-label text-muted small">Company Description</label>
                              <textarea name="companyDescription" className="form-control" rows="3" value={profile.companyDescription || ''} onChange={handleInputChange} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-top d-flex gap-2">
                        <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 shadow-sm d-inline-flex align-items-center">
                          <FaSave className="me-2" /> Save Profile Details
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
