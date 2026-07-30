import { useEffect, useState } from 'react';
import api from '../services/apiService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FaBuilding, FaBriefcase, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaVideo, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaChevronDown, FaChevronUp, FaBook } from 'react-icons/fa';

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);
  const [message, setMessage] = useState('');

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications', { params: { search, status: statusFilter } });
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error(error);
      setMessage('Failed to fetch applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter]);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.delete(`/applications/${id}`);
      setMessage('Application withdrawn successfully.');
      fetchApplications();
      if (selectedApp?._id === id) setSelectedApp(null);
    } catch (error) {
      setMessage('Failed to withdraw application.');
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
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
              <div>
                <h2 className="mb-1 fw-bold text-dark">My Placement Applications</h2>
                <p className="text-muted mb-0">Track application stages, interview rounds, recruiter feedback, and study plans.</p>
              </div>
            </div>

            {message && <div className="alert alert-info border-0 shadow-sm rounded-4 mb-4">{message}</div>}

            <div className="row g-4">
              {/* Applications List */}
              <div className="col-md-5">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                  <h5 className="fw-bold mb-3 text-dark">Applications History</h5>
                  <div className="mb-3">
                    <input type="text" className="form-control mb-2" placeholder="Search by role or company..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="All">All Stages</option>
                      <option value="Application Submitted">Application Submitted</option>
                      <option value="Resume Under Review">Resume Under Review</option>
                      <option value="Resume Shortlisted">Resume Shortlisted</option>
                      <option value="Online Assessment">Online Assessment</option>
                      <option value="Technical Interview">Technical Interview</option>
                      <option value="HR Interview">HR Interview</option>
                      <option value="Final Interview">Final Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    </div>
                  ) : applications.length === 0 ? (
                    <p className="text-muted text-center py-4">No applications registered.</p>
                  ) : (
                    <div className="overflow-auto" style={{ maxHeight: '500px' }}>
                      {applications.map((app) => (
                        <div
                          key={app._id}
                          className={`card border shadow-none rounded-3 p-3 mb-2 cursor-pointer transition-all hover-light ${selectedApp?._id === app._id ? 'border-primary bg-primary-subtle' : 'bg-light'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedApp(app)}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong className="text-dark d-block">{app.jobTitle}</strong>
                              <span className="text-primary small fw-semibold">{app.companyName}</span>
                            </div>
                            <span className={`badge bg-${app.status === 'Selected' ? 'success' : app.status === 'Rejected' ? 'danger' : 'info'} text-white`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="text-muted small mt-2 d-flex justify-content-between align-items-center">
                            <span>Applied: {formatDate(app.applicationDate)}</span>
                            <button className="btn btn-link btn-sm text-decoration-none p-0 text-primary fw-semibold" onClick={() => setSelectedApp(app)}>
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Application details dashboard */}
              <div className="col-md-7">
                {selectedApp ? (
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 flex-wrap gap-2">
                      <div>
                        <h4 className="fw-bold text-dark mb-1">{selectedApp.jobTitle}</h4>
                        <h6 className="text-primary fw-bold mb-0">{selectedApp.companyName}</h6>
                        <div className="text-muted small mt-1">Package: {selectedApp.package} &middot; {selectedApp.employmentType}</div>
                      </div>
                      <div>
                        <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => handleWithdraw(selectedApp._id)}>
                          Withdraw
                        </button>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3 text-secondary text-uppercase small font-monospace">Application Journey</h6>
                      <div className="position-relative ps-4 border-start border-2 border-light ms-2">
                        {selectedApp.timeline?.map((t, idx) => (
                          <div key={idx} className="mb-3 position-relative">
                            <span
                              className={`position-absolute start-0 translate-middle-x rounded-circle border border-white bg-${selectedApp.status === 'Rejected' && idx === selectedApp.timeline.length - 1 ? 'danger' : selectedApp.status === 'Selected' && idx === selectedApp.timeline.length - 1 ? 'success' : 'primary'} d-inline-flex align-items-center justify-content-center`}
                              style={{ width: '12px', height: '12px', left: '-26px', top: '6px' }}
                            />
                            <strong className="text-dark small d-block">{t.stage}</strong>
                            <span className="text-muted small d-block mt-0.5">{t.comment}</span>
                            <span className="text-muted font-monospace small" style={{ fontSize: '0.75rem' }}>{formatDate(t.date)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rejection analysis block */}
                    {selectedApp.status === 'Rejected' && (
                      <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h6 className="fw-bold d-flex align-items-center mb-2">
                          <FaTimesCircle className="me-2" /> Application Rejection Feedback
                        </h6>
                        <p className="small mb-3">
                          <strong>Recruiter Feedback:</strong> {selectedApp.rejectionReason || selectedApp.feedback || 'No comments provided.'}
                        </p>
                        
                        {/* Auto suggestions */}
                        <div className="bg-white rounded-3 p-3 text-dark border">
                          <strong className="small text-secondary font-monospace text-uppercase d-block mb-2">
                            <FaBook className="me-1" /> Personalized Improvement Roadmap
                          </strong>
                          <p className="small text-muted mb-2">Based on recruitment indicators, we recommend prioritizing study modules in:</p>
                          <div className="d-flex flex-wrap gap-1.5">
                            {selectedApp.improvementSuggestions?.map((sug, idx) => (
                              <span key={idx} className="badge bg-danger-subtle text-danger px-2.5 py-1.5 border border-danger-subtle rounded-pill small">
                                {sug}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scheduled interview rounds details */}
                    <div>
                      <h6 className="fw-bold mb-3 text-secondary text-uppercase small font-monospace">Scheduled Rounds & Resources</h6>
                      {selectedApp.rounds?.length === 0 ? (
                        <div className="p-3 bg-light rounded-3 text-center text-muted small">
                          No interview schedules published yet for this drive.
                        </div>
                      ) : (
                        <div className="row g-3">
                          {selectedApp.rounds.map((round, idx) => (
                            <div key={idx} className="col-12">
                              <div className="p-3 rounded-4 bg-light border">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h6 className="fw-bold text-dark mb-0">{round.title}</h6>
                                  <span className={`badge bg-${round.result === 'passed' ? 'success' : round.result === 'failed' ? 'danger' : 'warning text-dark'}`}>
                                    {round.result === 'pending' ? 'Scheduled' : round.result === 'passed' ? 'Passed' : 'Not Cleared'}
                                  </span>
                                </div>

                                <div className="row g-2 mb-3 text-muted small">
                                  <div className="col-sm-6 d-flex align-items-center gap-1.5">
                                    <FaCalendarAlt /> <span>{formatDate(round.date)}</span>
                                  </div>
                                  <div className="col-sm-6 d-flex align-items-center gap-1.5">
                                    <FaClock /> <span>{round.time}</span>
                                  </div>
                                  <div className="col-sm-12 d-flex align-items-center gap-1.5">
                                    <FaMapMarkerAlt /> <span>{round.venue || 'Online'}</span>
                                  </div>
                                  {round.meetingLink && (
                                    <div className="col-12">
                                      <a href={round.meetingLink} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3 mt-1 d-inline-flex align-items-center gap-1.5">
                                        <FaVideo /> Join Online Meeting
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {/* Logistics specifications */}
                                <div className="bg-white p-3 rounded-3 border small">
                                  {round.dressCode && (
                                    <div className="mb-2"><strong>Dress Code:</strong> {round.dressCode}</div>
                                  )}
                                  {round.requiredDocuments?.length > 0 && (
                                    <div className="mb-2"><strong>Required Documents:</strong> {round.requiredDocuments.join(', ')}</div>
                                  )}
                                  {round.reportingInstructions && (
                                    <div className="mb-2"><strong>Instructions:</strong> {round.reportingInstructions}</div>
                                  )}
                                  {round.interviewSyllabus && (
                                    <div className="mb-2"><strong>Syllabus:</strong> {round.interviewSyllabus}</div>
                                  )}
                                  {round.preparationMaterials && (
                                    <div className="mb-2">
                                      <strong>Learning Resource Link: </strong>
                                      <a href={round.preparationMaterials} target="_blank" rel="noreferrer" className="text-decoration-underline text-primary">{round.preparationMaterials}</a>
                                    </div>
                                  )}
                                  {round.previousQuestions?.length > 0 && (
                                    <div className="mb-2"><strong>Previous Interview Questions:</strong> {round.previousQuestions.join('; ')}</div>
                                  )}
                                  {round.additionalGuidelines && (
                                    <div className="mb-0"><strong>Guidelines:</strong> {round.additionalGuidelines}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex flex-column justify-content-center align-items-center">
                    <FaInfoCircle className="text-muted mb-3 fs-1" />
                    <h5 className="text-dark fw-bold">Select an Application</h5>
                    <p className="text-muted small">Select an application from the history panel to view detailed timelines, scheduled interview logistics, and recruiter recommendations.</p>
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

export default ApplicationsPage;
