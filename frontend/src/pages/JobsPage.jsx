import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/apiService';
import { useAuth } from '../services/authService.jsx';
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaClock, FaCheckCircle, FaExclamationTriangle, FaPlusCircle, FaSearch } from 'react-icons/fa';

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('list');

  // Search & Filter state
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    location: '',
    workMode: '',
    employmentType: ''
  });

  // Create Job Form state
  const [form, setForm] = useState({
    title: '',
    jobRole: '',
    package: '',
    employmentType: 'Full Time',
    location: '',
    workMode: 'On-site',
    description: '',
    requiredSkills: '',
    requiredProgrammingLanguages: '',
    minimumCgpa: '',
    maximumBacklogs: '0',
    minimumTenthPercentage: '',
    minimumTwelfthPercentage: '',
    eligibleDepartments: '',
    eligibleGraduationYear: '',
    requiredCertifications: '',
    experienceRequired: '',
    applicationDeadline: '',
    interviewDate: '',
    interviewTime: '',
    interviewVenue: '',
    onlineMeetingLink: '',
    interviewRounds: 'Online Test, Technical Interview, HR Interview',
    requiredDocuments: 'Resume, Marksheets, Aadhaar Card',
    interviewSyllabus: '',
    preparationMaterials: '',
    additionalInstructions: ''
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchFilters.search,
        location: searchFilters.location,
      };
      
      // If company, get jobs created by them
      if (user?.role === 'company') {
        params.mine = true;
      }
      
      const response = await api.get('/jobs', { params });
      let filteredJobs = response.data.jobs || [];

      // Client side sub-filters
      if (searchFilters.workMode) {
        filteredJobs = filteredJobs.filter(j => j.workMode === searchFilters.workMode);
      }
      if (searchFilters.employmentType) {
        filteredJobs = filteredJobs.filter(j => j.employmentType === searchFilters.employmentType);
      }

      setJobs(filteredJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setMessage({ text: 'Failed to fetch job drives.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchFilters, user]);

  const handleFilterChange = (e) => {
    setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleApply = async (jobId) => {
    setMessage({ text: '', type: '' });
    try {
      await api.post('/applications/apply', { jobId });
      setMessage({ text: 'Application submitted successfully! Recruiter has been notified.', type: 'success' });
      fetchJobs(); // reload jobs to update eligibility/status if needed
      window.scrollTo(0, 0);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Failed to apply to this job.', type: 'danger' });
      window.scrollTo(0, 0);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      await api.post('/jobs', form);
      setMessage({ text: 'Placement drive published successfully! Students have been notified.', type: 'success' });
      setForm({
        title: '',
        jobRole: '',
        package: '',
        employmentType: 'Full Time',
        location: '',
        workMode: 'On-site',
        description: '',
        requiredSkills: '',
        requiredProgrammingLanguages: '',
        minimumCgpa: '',
        maximumBacklogs: '0',
        minimumTenthPercentage: '',
        minimumTwelfthPercentage: '',
        eligibleDepartments: '',
        eligibleGraduationYear: '',
        requiredCertifications: '',
        experienceRequired: '',
        applicationDeadline: '',
        interviewDate: '',
        interviewTime: '',
        interviewVenue: '',
        onlineMeetingLink: '',
        interviewRounds: 'Online Test, Technical Interview, HR Interview',
        requiredDocuments: 'Resume, Marksheets, Aadhaar Card',
        interviewSyllabus: '',
        preparationMaterials: '',
        additionalInstructions: ''
      });
      setActiveTab('list');
      fetchJobs();
    } catch (error) {
      console.error(error);
      setMessage({ text: error.response?.data?.message || 'Failed to publish placement drive.', type: 'danger' });
    }
  };

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
                <h2 className="mb-1 fw-bold text-dark">{user?.role === 'company' ? 'My Placement Drives' : 'Placement Drives'}</h2>
                <p className="text-muted mb-0">{user?.role === 'company' ? 'Publish, view, and update your corporate recruitment openings.' : 'Explore eligibility matches and apply to active campus placement drives.'}</p>
              </div>
              {user?.role === 'company' && (
                <div className="d-flex gap-2">
                  <button className={`btn rounded-3 fw-semibold ${activeTab === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('list')}>
                    Drives List
                  </button>
                  <button className={`btn rounded-3 fw-semibold ${activeTab === 'create' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('create')}>
                    <FaPlusCircle className="me-1" /> Create Drive
                  </button>
                </div>
              )}
            </div>

            {message.text && (
              <div className={`alert alert-${message.type} border-0 shadow-sm rounded-4 mb-4`}>
                {message.text}
              </div>
            )}

            {activeTab === 'create' && user?.role === 'company' ? (
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold mb-4 text-primary">Publish New Recruitment Drive</h5>
                <form onSubmit={handleCreateJob}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Job Title *</label>
                      <input name="title" value={form.title} onChange={handleFormChange} className="form-control" placeholder="e.g. Graduate Engineer Trainee" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Specific Job Role *</label>
                      <input name="jobRole" value={form.jobRole} onChange={handleFormChange} className="form-control" placeholder="e.g. Software Engineer" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small">Annual Compensation Package (CTC) *</label>
                      <input name="package" value={form.package} onChange={handleFormChange} className="form-control" placeholder="e.g. 12 LPA" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small">Employment Nature *</label>
                      <select name="employmentType" value={form.employmentType} onChange={handleFormChange} className="form-select" required>
                        <option value="Full Time">Full Time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small">Work Mode *</label>
                      <select name="workMode" value={form.workMode} onChange={handleFormChange} className="form-select" required>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Work Location *</label>
                      <input name="location" value={form.location} onChange={handleFormChange} className="form-control" placeholder="e.g. Bangalore, India" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Experience Requirement Description</label>
                      <input name="experienceRequired" value={form.experienceRequired} onChange={handleFormChange} className="form-control" placeholder="e.g. Freshers or 0-1 year intern experience" />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small">Detailed Job Description *</label>
                      <textarea name="description" value={form.description} onChange={handleFormChange} className="form-control" rows="4" placeholder="Mention job roles, responsibilities, growth, and team scope..." required />
                    </div>

                    <h6 className="fw-bold mt-4 mb-2 text-secondary">Academic & Skill Eligibility Criteria</h6>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Required Technical Skills (Comma separated) *</label>
                      <input name="requiredSkills" value={form.requiredSkills} onChange={handleFormChange} className="form-control" placeholder="React.js, Node.js, REST APIs" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Required Programming Languages (Comma separated)</label>
                      <input name="requiredProgrammingLanguages" value={form.requiredProgrammingLanguages} onChange={handleFormChange} className="form-control" placeholder="Javascript, Python, C++" />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Minimum CGPA (0-10) *</label>
                      <input name="minimumCgpa" value={form.minimumCgpa} onChange={handleFormChange} className="form-control" type="number" step="0.01" max="10" placeholder="e.g. 7.5" required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Maximum Allowed Backlogs *</label>
                      <input name="maximumBacklogs" value={form.maximumBacklogs} onChange={handleFormChange} className="form-control" type="number" min="0" required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Min 10th Percentage (%) *</label>
                      <input name="minimumTenthPercentage" value={form.minimumTenthPercentage} onChange={handleFormChange} className="form-control" type="number" step="0.01" max="100" placeholder="e.g. 60" required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label text-muted small">Min 12th Percentage (%) *</label>
                      <input name="minimumTwelfthPercentage" value={form.minimumTwelfthPercentage} onChange={handleFormChange} className="form-control" type="number" step="0.01" max="100" placeholder="e.g. 60" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Eligible Branches / Departments (Comma separated) *</label>
                      <input name="eligibleDepartments" value={form.eligibleDepartments} onChange={handleFormChange} className="form-control" placeholder="Computer Science and Engineering, Information Technology" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Eligible Graduation Years (Comma separated) *</label>
                      <input name="eligibleGraduationYear" value={form.eligibleGraduationYear} onChange={handleFormChange} className="form-control" placeholder="2025, 2026" required />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label text-muted small">Required Certifications (Optional - comma separated)</label>
                      <input name="requiredCertifications" value={form.requiredCertifications} onChange={handleFormChange} className="form-control" placeholder="AWS Associate, GCP Engineer" />
                    </div>

                    <h6 className="fw-bold mt-4 mb-2 text-secondary">Interview Schedule & Resources</h6>
                    <div className="col-md-4">
                      <label className="form-label text-muted small">Application Deadline *</label>
                      <input name="applicationDeadline" type="date" value={form.applicationDeadline} onChange={handleFormChange} className="form-control" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small">Interview Date *</label>
                      <input name="interviewDate" type="date" value={form.interviewDate} onChange={handleFormChange} className="form-control" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small">Interview Time *</label>
                      <input name="interviewTime" type="time" value={form.interviewTime} onChange={handleFormChange} className="form-control" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Interview Venue *</label>
                      <input name="interviewVenue" value={form.interviewVenue} onChange={handleFormChange} className="form-control" placeholder="e.g. Seminar Hall or Online" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Online Meeting Link (If Hybrid/Remote)</label>
                      <input name="onlineMeetingLink" value={form.onlineMeetingLink} onChange={handleFormChange} className="form-control" placeholder="https://zoom.us/j/..." />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Interview Rounds (Comma separated) *</label>
                      <input name="interviewRounds" value={form.interviewRounds} onChange={handleFormChange} className="form-control" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Required Documents to Carry (Comma separated)</label>
                      <input name="requiredDocuments" value={form.requiredDocuments} onChange={handleFormChange} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Interview Syllabus Topics</label>
                      <input name="interviewSyllabus" value={form.interviewSyllabus} onChange={handleFormChange} className="form-control" placeholder="e.g. Core Java, OOPs, DBMS queries, basic algorithms" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Preparation Materials Reference links</label>
                      <input name="preparationMaterials" value={form.preparationMaterials} onChange={handleFormChange} className="form-control" placeholder="e.g. GeeksforGeeks dsa cheat sheet link" />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small">Additional recruiter instructions</label>
                      <textarea name="additionalInstructions" value={form.additionalInstructions} onChange={handleFormChange} className="form-control" rows="2" placeholder="Mention dress code, reporting timings..." />
                    </div>

                    <div className="col-12 mt-4 border-top pt-3">
                      <button type="submit" className="btn btn-primary px-4 py-2 rounded-3 shadow">Publish Recruitment Drive</button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                {/* Search Panel */}
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-muted"><FaSearch /></span>
                        <input type="text" name="search" className="form-control border-start-0 ps-0" placeholder="Search by role or company" value={searchFilters.search} onChange={handleFilterChange} />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <input type="text" name="location" className="form-control" placeholder="Location" value={searchFilters.location} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-2.5 col-sm-6">
                      <select name="workMode" className="form-select" value={searchFilters.workMode} onChange={handleFilterChange}>
                        <option value="">All Work Modes</option>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                    <div className="col-md-2.5 col-sm-6">
                      <select name="employmentType" className="form-select" value={searchFilters.employmentType} onChange={handleFilterChange}>
                        <option value="">All Types</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Job Drives list */}
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                    <p className="text-muted mb-0">No active placement drives found. Try clearing filters.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {jobs.map((job) => {
                      const isStudent = user?.role === 'student';
                      const elig = job.eligibility || { isEligible: true, reasons: [] };

                      return (
                        <div key={job._id} className="col-12">
                          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white hover-shadow transition-all">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                              <div>
                                <h4 className="fw-bold mb-1 text-dark">{job.title}</h4>
                                <h6 className="text-primary fw-semibold mb-2">{job.companyName}</h6>
                              </div>
                              <span className={`badge bg-${job.status === 'Open' ? 'success' : 'secondary'} px-3 py-1.5 fs-7`}>
                                {job.status}
                              </span>
                            </div>

                            <p className="text-muted small mb-3 whitespace-pre-wrap">{job.description}</p>

                            <div className="row g-3 py-2 border-top border-bottom mb-3 text-muted small">
                              <div className="col-md-3 col-sm-6 d-flex align-items-center gap-2">
                                <FaBriefcase /> <span>{job.employmentType} &middot; {job.workMode}</span>
                              </div>
                              <div className="col-md-3 col-sm-6 d-flex align-items-center gap-2">
                                <FaMapMarkerAlt /> <span>{job.location}</span>
                              </div>
                              <div className="col-md-3 col-sm-6 d-flex align-items-center gap-2">
                                <FaDollarSign /> <span>{job.package || 'Not Specified'}</span>
                              </div>
                              <div className="col-md-3 col-sm-6 d-flex align-items-center gap-2">
                                <FaClock /> <span>Deadline: {formatDate(job.applicationDeadline)}</span>
                              </div>
                            </div>

                            <div className="row align-items-center g-3">
                              {/* Eligibility Engine Box */}
                              <div className="col-md-8">
                                <div className="small">
                                  <strong className="text-dark d-block mb-1">Academic Criteria:</strong>
                                  <span className="text-muted">
                                    Eligible Branches: {job.eligibleDepartments?.join(', ') || 'All'} | Min CGPA: {job.minimumCgpa} | Max Backlogs: {job.maximumBacklogs}
                                  </span>
                                </div>
                                <div className="small mt-2">
                                  <strong className="text-dark d-block mb-1">Required Skills:</strong>
                                  <span className="badge bg-light text-secondary border me-1">{job.requiredSkills?.join(', ')}</span>
                                  {job.requiredProgrammingLanguages?.length > 0 && (
                                    <span className="badge bg-light text-secondary border">{job.requiredProgrammingLanguages?.join(', ')}</span>
                                  )}
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="col-md-4 text-md-end">
                                {isStudent ? (
                                  elig.isEligible ? (
                                    <div>
                                      <div className="text-success small mb-2 d-flex align-items-center justify-content-md-end gap-1">
                                        <FaCheckCircle /> <span>Eligible to Apply</span>
                                      </div>
                                      <button className="btn btn-success px-4 py-2 rounded-3 shadow-sm w-100" onClick={() => handleApply(job._id)}>
                                        Apply Now
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="text-danger small mb-2 d-flex align-items-center justify-content-md-end gap-1">
                                        <FaExclamationTriangle /> <span>Ineligible Profile</span>
                                      </div>
                                      
                                      {/* Detailed explanation reasons */}
                                      <div className="alert alert-danger p-2 small text-start border-0 mb-2">
                                        <ul className="mb-0 ps-3">
                                          {elig.reasons.map((r, idx) => (
                                            <li key={idx}>{r}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <button className="btn btn-secondary px-4 py-2 rounded-3 w-100" disabled>
                                        Apply Disabled
                                      </button>
                                    </div>
                                  )
                                ) : (
                                  <span className="text-muted small">Logged in as {user?.role}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobsPage;
