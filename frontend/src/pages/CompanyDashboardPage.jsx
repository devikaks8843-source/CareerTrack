import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/apiService';
import { useAuth } from '../services/authService.jsx';
import { FaUser, FaGraduationCap, FaCode, FaLink, FaCalendarPlus, FaExchangeAlt, FaTimesCircle, FaSearch, FaChevronRight } from 'react-icons/fa';

const companyCards = [
  { key: 'openJobs', label: 'Open Drives', color: 'primary' },
  { key: 'applicants', label: 'Applications Received', color: 'info' },
  { key: 'selected', label: 'Selected Offers', color: 'success' },
  { key: 'rejected', label: 'Rejections', color: 'danger' },
];

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function CompanyDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Selection/Applicant Details states
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Advanced Search Filters state
  const [filters, setFilters] = useState({
    search: '',
    cgpa: '',
    branch: '',
    skills: '',
    graduationYear: '',
    college: ''
  });

  // Shortlist form state
  const [stageForm, setStageForm] = useState({
    status: '',
    comment: '',
    rejectionReason: 'weak technical knowledge',
    feedback: ''
  });

  // Interview Schedule form state
  const [roundForm, setRoundForm] = useState({
    title: 'Technical Interview',
    status: 'pending',
    date: '',
    time: '',
    venue: 'Corporate Office',
    meetingLink: '',
    dressCode: 'Business Formal',
    requiredDocuments: 'Resume copy, Academics transcript, Gov ID',
    reportingInstructions: 'Report 15 minutes before the scheduled time.',
    interviewSyllabus: 'Data structures, coding logic, database design, framework architecture',
    preparationMaterials: 'https://leetcode.com',
    previousQuestions: 'Explain MVC model; Design cache system; Reverse a string',
    additionalGuidelines: 'Ensure stable internet connection if joining online.'
  });

  const fetchCompanyData = async () => {
    try {
      const [applicationRes, jobRes] = await Promise.all([
        api.get('/applications'),
        api.get('/jobs'),
      ]);
      setApplications(applicationRes.data.applications || []);
      setJobs(jobRes.data.jobs || []);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to retrieve company dashboard details.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filter applicant logic
  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      const student = app.student || {};
      const searchStr = `${student.fullName || ''} ${app.jobTitle || ''} ${student.collegeName || ''}`.toLowerCase();
      
      const matchSearch = searchStr.includes(filters.search.toLowerCase());
      const matchCgpa = filters.cgpa ? (student.cgpa >= Number(filters.cgpa)) : true;
      const matchBranch = filters.branch ? ((student.branch || '').toLowerCase().includes(filters.branch.toLowerCase())) : true;
      const matchYear = filters.graduationYear ? (student.graduationYear === Number(filters.graduationYear)) : true;
      const matchCollege = filters.college ? ((student.collegeName || '').toLowerCase().includes(filters.college.toLowerCase())) : true;
      
      // Skills check
      let matchSkills = true;
      if (filters.skills) {
        const querySkills = filters.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        const studentSkills = [...(student.programmingSkills || []), ...(student.technicalSkills || [])].map(s => s.toLowerCase());
        matchSkills = querySkills.every(q => studentSkills.some(s => s.includes(q)));
      }

      return matchSearch && matchCgpa && matchBranch && matchYear && matchCollege && matchSkills;
    });
  }, [applications, filters]);

  // Update candidate status workflow
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      const payload = {
        status: stageForm.status,
        comment: stageForm.comment,
      };

      if (stageForm.status === 'Rejected') {
        payload.rejectionReason = stageForm.rejectionReason;
        payload.feedback = stageForm.feedback || stageForm.rejectionReason;
      }

      const res = await api.put(`/applications/${selectedApp._id}`, payload);
      setMessage({ text: `Candidate status updated to '${stageForm.status}' successfully!`, type: 'success' });
      setSelectedApp(res.data);
      fetchCompanyData();
      window.scrollTo(0, 0);
    } catch (error) {
      setMessage({ text: 'Failed to update candidate workflow status.', type: 'danger' });
    }
  };

  // Schedule interview round
  const handleScheduleRound = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      const res = await api.post(`/applications/${selectedApp._id}/round`, roundForm);
      setMessage({ text: `New Interview round '${roundForm.title}' scheduled and candidate notified!`, type: 'success' });
      setSelectedApp(res.data);
      setRoundForm(prev => ({
        ...prev,
        date: '',
        time: '',
        meetingLink: ''
      }));
      fetchCompanyData();
      window.scrollTo(0, 0);
    } catch (error) {
      setMessage({ text: 'Failed to schedule interview round.', type: 'danger' });
    }
  };

  // Stats calculation
  const stats = useMemo(() => ({
    openJobs: jobs.length,
    applicants: applications.length,
    selected: applications.filter((item) => item.status === 'Selected').length,
    rejected: applications.filter((item) => item.status === 'Rejected').length,
  }), [jobs, applications]);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid py-4">
        <div className="row gx-4">
          <div className="col-lg-3">
            <Sidebar />
          </div>
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h2 className="mb-1 fw-bold text-dark">Recruiter Control Center</h2>
                <p className="text-muted mb-0">Evaluate candidates, verify eligibility logs, schedule interviews, and announce placement offers.</p>
              </div>
            </div>

            {message.text && (
              <div className={`alert alert-${message.type} border-0 shadow-sm rounded-4 mb-4`}>
                {message.text}
              </div>
            )}

            {/* Quick Metrics */}
            <div className="row g-3">
              {companyCards.map((card) => (
                <div key={card.key} className="col-sm-6 col-xl-3">
                  <div className={`card border-0 shadow-sm rounded-4 h-100 border-start border-5 border-${card.color} bg-white`}>
                    <div className="card-body">
                      <h6 className="text-uppercase text-muted small mb-3">{card.label}</h6>
                      <h3 className="fw-bold mb-0 text-dark">{loading ? '...' : stats[card.key]}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Recruiting Dashboard Panel */}
            <div className="row mt-4 g-4">
              {/* Applicants Directory Panel */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h5 className="fw-bold mb-3">Applicants Directory</h5>
                  
                  {/* Advanced Filters */}
                  <div className="row g-2 mb-3 bg-light p-3 rounded-3 border">
                    <div className="col-md-6">
                      <input type="text" name="search" className="form-control form-control-sm" placeholder="Search name/role/college..." value={filters.search} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-6">
                      <input type="text" name="branch" className="form-control form-control-sm" placeholder="Filter Branch (e.g. CS)" value={filters.branch} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-4">
                      <input type="number" name="cgpa" className="form-control form-control-sm" placeholder="Min CGPA" value={filters.cgpa} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-4">
                      <input type="number" name="graduationYear" className="form-control form-control-sm" placeholder="Grad Year" value={filters.graduationYear} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-4">
                      <input type="text" name="skills" className="form-control form-control-sm" placeholder="Skills (React, Java)" value={filters.skills} onChange={handleFilterChange} />
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    </div>
                  ) : filteredApplicants.length === 0 ? (
                    <p className="text-muted text-center py-4">No job applications match your filters.</p>
                  ) : (
                    <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                      {filteredApplicants.map((app) => {
                        const student = app.student || {};
                        return (
                          <div
                            key={app._id}
                            className={`card border shadow-none rounded-3 p-3 mb-2 cursor-pointer transition-all hover-light ${selectedApp?._id === app._id ? 'border-primary bg-primary-subtle' : 'bg-light'}`}
                            onClick={() => {
                              setSelectedApp(app);
                              setStageForm({ status: app.status, comment: '', rejectionReason: 'weak technical knowledge', feedback: '' });
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong className="text-dark d-block">{student.fullName || 'Candidate'}</strong>
                                <span className="text-primary small fw-semibold">{app.jobTitle}</span>
                                <div className="text-muted small mt-1">
                                  {student.branch} &middot; CGPA: {student.cgpa} &middot; Backlogs: {student.activeBacklogs}
                                </div>
                              </div>
                              <span className={`badge bg-${app.status === 'Selected' ? 'success' : app.status === 'Rejected' ? 'danger' : 'info'} text-white`}>
                                {app.status}
                              </span>
                            </div>
                            <div className="text-end mt-2 small text-muted font-monospace">
                              Applied: {formatDate(app.applicationDate)} <FaChevronRight className="ms-1" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Applicant Evaluation Desk */}
              <div className="col-lg-6">
                {selectedApp ? (
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <h5 className="fw-bold mb-3 border-bottom pb-2">Candidate Evaluation Desk</h5>
                    
                    {/* Candidate Details Card */}
                    <div className="mb-4 bg-light p-3 rounded-4 border">
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold me-3" style={{ width: 50, height: 50, fontSize: '1.2rem' }}>
                          {selectedApp.student?.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark mb-0">{selectedApp.student?.fullName}</h6>
                          <span className="text-muted small">{selectedApp.student?.email}</span>
                        </div>
                      </div>

                      <div className="row gy-2 small mb-3">
                        <div className="col-6"><strong>College:</strong> {selectedApp.student?.collegeName}</div>
                        <div className="col-6"><strong>Branch:</strong> {selectedApp.student?.branch}</div>
                        <div className="col-6"><strong>CGPA Score:</strong> {selectedApp.student?.cgpa}</div>
                        <div className="col-6"><strong>Active Backlogs:</strong> {selectedApp.student?.activeBacklogs}</div>
                      </div>

                      <div className="small mb-3">
                        <strong>Programming Languages:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {selectedApp.student?.programmingSkills?.map((s, idx) => (
                            <span key={idx} className="badge bg-secondary">{s}</span>
                          )) || 'None'}
                        </div>
                      </div>

                      <div className="small mb-3">
                        <strong>Technical Skills:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {selectedApp.student?.technicalSkills?.map((s, idx) => (
                            <span key={idx} className="badge bg-dark">{s}</span>
                          )) || 'None'}
                        </div>
                      </div>

                      <div className="border-top pt-2 d-flex gap-2">
                        {selectedApp.student?.resumeUrl && (
                          <a href={selectedApp.student.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-3 px-3">
                            View Resume Docs
                          </a>
                        )}
                        {selectedApp.student?.linkedinProfile && (
                          <a href={selectedApp.student.linkedinProfile} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary rounded-3 px-3">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Predefined workflow stage transitions */}
                    <div className="mb-4 border p-3 rounded-4">
                      <h6 className="fw-bold text-dark d-flex align-items-center mb-3">
                        <FaExchangeAlt className="text-primary me-2" /> Transition Recruitment Stage
                      </h6>
                      <form onSubmit={handleUpdateStatus}>
                        <div className="mb-3">
                          <label className="form-label text-muted small">Update Status Stage</label>
                          <select className="form-select" value={stageForm.status} onChange={e => setStageForm({...stageForm, status: e.target.value})} required>
                            <option value="Application Submitted">Application Submitted</option>
                            <option value="Resume Under Review">Resume Under Review</option>
                            <option value="Resume Shortlisted">Resume Shortlisted</option>
                            <option value="Online Assessment">Online Assessment</option>
                            <option value="Online Assessment Result">Online Assessment Result</option>
                            <option value="Technical Interview">Technical Interview</option>
                            <option value="HR Interview">HR Interview</option>
                            <option value="Final Interview">Final Interview</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        {/* Rejection Feedbacks */}
                        {stageForm.status === 'Rejected' && (
                          <div className="mb-3 p-3 bg-danger-subtle rounded-3 border border-danger-subtle">
                            <div className="mb-2">
                              <label className="form-label text-muted small text-danger font-bold">Feedback Reason for Rejection *</label>
                              <select className="form-select border-danger-subtle" value={stageForm.rejectionReason} onChange={e => setStageForm({...stageForm, rejectionReason: e.target.value})} required>
                                <option value="weak technical knowledge">weak technical knowledge</option>
                                <option value="poor communication skills">poor communication skills</option>
                                <option value="insufficient coding performance">insufficient coding performance</option>
                                <option value="low aptitude score">low aptitude score</option>
                                <option value="lack of required technical skills">lack of required technical skills</option>
                              </select>
                            </div>
                            <div>
                              <label className="form-label text-muted small text-danger">Recruiter Notes (optional)</label>
                              <textarea className="form-control" rows="2" placeholder="Detail feedback recommendations..." value={stageForm.feedback} onChange={e => setStageForm({...stageForm, feedback: e.target.value})} />
                            </div>
                          </div>
                        )}

                        <div className="mb-3">
                          <label className="form-label text-muted small">Stage Action Comment</label>
                          <input type="text" className="form-control" placeholder="e.g. Shortlisted resume for interview round" value={stageForm.comment} onChange={e => setStageForm({...stageForm, comment: e.target.value})} />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 rounded-3 shadow-sm">
                          Update Workflow Stage
                        </button>
                      </form>
                    </div>

                    {/* Interview scheduling tool */}
                    <div className="border p-3 rounded-4">
                      <h6 className="fw-bold text-dark d-flex align-items-center mb-3">
                        <FaCalendarPlus className="text-success me-2" /> Schedule Interview Round
                      </h6>
                      <form onSubmit={handleScheduleRound}>
                        <div className="row g-2">
                          <div className="col-md-6">
                            <label className="form-label text-muted small">Round Title</label>
                            <select className="form-select form-select-sm" value={roundForm.title} onChange={e => setRoundForm({...roundForm, title: e.target.value})} required>
                              <option value="Online Assessment">Online Assessment</option>
                              <option value="Technical Interview">Technical Interview</option>
                              <option value="HR Interview">HR Interview</option>
                              <option value="Final Interview">Final Interview</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted small">Dress Code</label>
                            <input type="text" className="form-control form-control-sm" value={roundForm.dressCode} onChange={e => setRoundForm({...roundForm, dressCode: e.target.value})} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted small">Schedule Date *</label>
                            <input type="date" className="form-control form-control-sm" value={roundForm.date} onChange={e => setRoundForm({...roundForm, date: e.target.value})} required />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted small">Schedule Time *</label>
                            <input type="time" className="form-control form-control-sm" value={roundForm.time} onChange={e => setRoundForm({...roundForm, time: e.target.value})} required />
                          </div>
                          <div className="col-12">
                            <label className="form-label text-muted small">Interview Venue *</label>
                            <input type="text" className="form-control form-control-sm" value={roundForm.venue} onChange={e => setRoundForm({...roundForm, venue: e.target.value})} required />
                          </div>
                          <div className="col-12">
                            <label className="form-label text-muted small">Online Meeting Link</label>
                            <input type="url" className="form-control form-control-sm" placeholder="https://zoom.us/..." value={roundForm.meetingLink} onChange={e => setRoundForm({...roundForm, meetingLink: e.target.value})} />
                          </div>
                          <div className="col-12">
                            <label className="form-label text-muted small">Interview Syllabus Topics</label>
                            <input type="text" className="form-control form-control-sm" value={roundForm.interviewSyllabus} onChange={e => setRoundForm({...roundForm, interviewSyllabus: e.target.value})} />
                          </div>
                          <div className="col-12">
                            <label className="form-label text-muted small">Recommended Reference / Prep Link</label>
                            <input type="url" className="form-control form-control-sm" value={roundForm.preparationMaterials} onChange={e => setRoundForm({...roundForm, preparationMaterials: e.target.value})} />
                          </div>
                          <div className="col-12">
                            <label className="form-label text-muted small">Required Documents to Carry</label>
                            <input type="text" className="form-control form-control-sm" placeholder="Resume, Transcripts" value={roundForm.requiredDocuments} onChange={e => setRoundForm({...roundForm, requiredDocuments: e.target.value})} />
                          </div>
                          <div className="col-12">
                            <label className="form-label text-muted small">Guidelines / Instructions</label>
                            <textarea className="form-control form-control-sm" rows="2" value={roundForm.additionalGuidelines} onChange={e => setRoundForm({...roundForm, additionalGuidelines: e.target.value})} />
                          </div>
                        </div>
                        <button type="submit" className="btn btn-success w-100 rounded-3 shadow-sm mt-3">
                          Schedule & Notify Candidate
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex flex-column justify-content-center align-items-center">
                    <FaUser className="text-muted mb-3 fs-1" />
                    <h5 className="text-dark fw-bold">Evaluate Candidate</h5>
                    <p className="text-muted small">Select an applicant from the left directory to examine their profile parameters, verify documents, evaluate interview histories, or schedule next recruitment rounds.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboardPage;
