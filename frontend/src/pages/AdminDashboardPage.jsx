import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/apiService';
import {
  FaBuilding, FaUserGraduate, FaFileAlt, FaBullhorn, FaCheckCircle, FaTimesCircle,
  FaTrashAlt, FaChartBar, FaEye, FaSearch, FaFilter, FaExternalLinkAlt, FaGlobe,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaGraduationCap, FaCode, FaBriefcase,
  FaAward, FaDownload, FaUserTie, FaIndustry, FaUsers, FaCalendarAlt, FaPercent
} from 'react-icons/fa';

function AdminDashboardPage() {
  const [stats, setStats] = useState({});
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState({ branchStats: [], companyStats: [] });
  const [announcements, setAnnouncements] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentBranchFilter, setStudentBranchFilter] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('');

  // Modals Detail View State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Announcement form
  const [annForm, setAnnForm] = useState({ title: '', content: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, companiesRes, studentsRes, reportsRes, announcementsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/companies'),
        api.get('/admin/students'),
        api.get('/admin/reports'),
        api.get('/admin/announcements')
      ]);

      setStats(statsRes.data.stats || {});
      setCompanies(companiesRes.data.companies || []);
      setStudents(studentsRes.data.students || []);
      setReports(reportsRes.data || { branchStats: [], companyStats: [] });
      setAnnouncements(announcementsRes.data.announcements || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setMessage({ text: 'Error fetching administration dashboard data.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveCompany = async (id) => {
    try {
      await api.put(`/admin/companies/${id}/approve`);
      setMessage({ text: 'Company registration approved successfully!', type: 'success' });
      fetchData();
      if (selectedCompany && selectedCompany._id === id) {
        setSelectedCompany({ ...selectedCompany, status: 'active' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to approve company account.', type: 'danger' });
    }
  };

  const handleRejectCompany = async (id) => {
    if (!window.confirm('Are you sure you want to reject this company registration request?')) return;
    try {
      await api.put(`/admin/companies/${id}/reject`);
      setMessage({ text: 'Company registration request rejected.', type: 'warning' });
      fetchData();
      if (selectedCompany && selectedCompany._id === id) {
        setSelectedCompany({ ...selectedCompany, status: 'rejected' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to reject company account.', type: 'danger' });
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm('CRITICAL: Permanently delete this recruiter account and all their posted drives/job listings?')) return;
    try {
      await api.delete(`/admin/companies/${id}`);
      setMessage({ text: 'Company account and associated drive records removed successfully.', type: 'success' });
      if (selectedCompany && selectedCompany._id === id) {
        setSelectedCompany(null);
      }
      fetchData();
    } catch (error) {
      setMessage({ text: 'Failed to delete company account.', type: 'danger' });
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('CRITICAL: Permanently delete this student account? This will also purge their submitted job applications.')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      setMessage({ text: 'Student account and application data removed successfully.', type: 'success' });
      if (selectedStudent && selectedStudent._id === id) {
        setSelectedStudent(null);
      }
      fetchData();
    } catch (error) {
      setMessage({ text: 'Failed to delete student account.', type: 'danger' });
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return;
    try {
      await api.post('/admin/announcements', annForm);
      setMessage({ text: 'Placement announcement published and students notified!', type: 'success' });
      setAnnForm({ title: '', content: '' });
      fetchData();
    } catch (error) {
      setMessage({ text: 'Failed to publish announcement.', type: 'danger' });
    }
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchesSearch = (
      (s.fullName && s.fullName.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.phone && s.phone.includes(studentSearch)) ||
      (s.collegeName && s.collegeName.toLowerCase().includes(studentSearch.toLowerCase()))
    );
    const matchesBranch = studentBranchFilter ? s.branch === studentBranchFilter : true;
    return matchesSearch && matchesBranch;
  });

  // Filtered Companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = (
      (c.companyName && c.companyName.toLowerCase().includes(companySearch.toLowerCase())) ||
      (c.fullName && c.fullName.toLowerCase().includes(companySearch.toLowerCase())) ||
      (c.recruiterName && c.recruiterName.toLowerCase().includes(companySearch.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(companySearch.toLowerCase())) ||
      (c.industryType && c.industryType.toLowerCase().includes(companySearch.toLowerCase()))
    );
    const matchesStatus = companyStatusFilter ? c.status === companyStatusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Unique branches for filter dropdown
  const uniqueBranches = Array.from(new Set(students.map(s => s.branch).filter(Boolean)));

  const cardData = [
    { key: 'totalStudents', label: 'Registered Students', icon: <FaUserGraduate />, color: 'primary' },
    { key: 'verifiedCompanies', label: 'Verified Companies', icon: <FaBuilding />, color: 'success' },
    { key: 'pendingCompanies', label: 'Pending Approvals', icon: <FaUserTie />, color: 'warning' },
    { key: 'activeDrives', label: 'Active Placement Drives', icon: <FaChartBar />, color: 'info' },
    { key: 'totalApplications', label: 'Applications Submitted', icon: <FaFileAlt />, color: 'secondary' },
    { key: 'successfulPlacements', label: 'Placed Students', icon: <FaCheckCircle />, color: 'success' },
    { key: 'highestPackage', label: 'Highest Package Offered', icon: <FaChartBar />, color: 'danger' },
    { key: 'averagePackage', label: 'Average Package', icon: <FaChartBar />, color: 'primary' },
  ];

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid py-4">
        <div className="row gx-4">
          <div className="col-lg-3 mb-4">
            <Sidebar />
          </div>
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <h2 className="mb-1 fw-bold text-dark">Placement Administration Center</h2>
                <p className="text-muted mb-0">Master database management for all student accounts, recruiter profiles, verifications, and drives.</p>
              </div>
            </div>

            {message.text && (
              <div className={`alert alert-${message.type} border-0 shadow-sm rounded-4 mb-4 d-flex justify-content-between align-items-center`}>
                <span>{message.text}</span>
                <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
              </div>
            )}

            {loading ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                <div className="spinner-border text-primary mx-auto" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-3 mb-0">Loading complete administration dataset...</p>
              </div>
            ) : (
              <div>
                {/* Admin Sub Navigation */}
                <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white">
                  <div className="card-header bg-white border-0 p-0">
                    <ul className="nav nav-pills border-0 p-3 gap-2">
                      <li className="nav-item">
                        <button className={`nav-link border-0 px-4 py-2 rounded-3 fw-semibold ${activeTab === 'overview' ? 'active' : 'btn-light text-muted'}`} onClick={() => setActiveTab('overview')}>
                          <FaChartBar className="me-2" /> Overview
                        </button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link border-0 px-4 py-2 rounded-3 fw-semibold ${activeTab === 'recruiters' ? 'active' : 'btn-light text-muted'}`} onClick={() => setActiveTab('recruiters')}>
                          <FaBuilding className="me-2" /> Recruiters & Companies ({companies.length})
                          {companies.filter(c => c.status === 'pending').length > 0 && (
                            <span className="badge bg-danger ms-2">{companies.filter(c => c.status === 'pending').length} Pending</span>
                          )}
                        </button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link border-0 px-4 py-2 rounded-3 fw-semibold ${activeTab === 'students' ? 'active' : 'btn-light text-muted'}`} onClick={() => setActiveTab('students')}>
                          <FaUserGraduate className="me-2" /> Students Directory ({students.length})
                        </button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link border-0 px-4 py-2 rounded-3 fw-semibold ${activeTab === 'announcements' ? 'active' : 'btn-light text-muted'}`} onClick={() => setActiveTab('announcements')}>
                          <FaBullhorn className="me-2" /> Announcements ({announcements.length})
                        </button>
                      </li>
                      <li className="nav-item">
                        <button className={`nav-link border-0 px-4 py-2 rounded-3 fw-semibold ${activeTab === 'reports' ? 'active' : 'btn-light text-muted'}`} onClick={() => setActiveTab('reports')}>
                          <FaFileAlt className="me-2" /> Analytics & Reports
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="row g-3">
                    {cardData.map((c) => (
                      <div key={c.key} className="col-sm-6 col-xl-3">
                        <div className={`card border-0 shadow-sm rounded-4 h-100 border-start border-5 border-${c.color}`}>
                          <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="text-uppercase text-muted small mb-2">{c.label}</h6>
                              <h3 className="fw-bold mb-0 text-dark">{stats[c.key] || 0}</h3>
                            </div>
                            <div className={`fs-2 text-${c.color} opacity-75`}>{c.icon}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pending Approvals Quick Alert */}
                    {companies.filter(c => c.status === 'pending').length > 0 && (
                      <div className="col-12 mt-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-warning bg-opacity-10 border-start border-5 border-warning">
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                              <h5 className="fw-bold text-dark mb-1">
                                <FaUserTie className="me-2 text-warning" /> 
                                {companies.filter(c => c.status === 'pending').length} Pending Recruiter Approval Requests
                              </h5>
                              <p className="text-muted mb-0">Review pending corporate registrations before they can publish jobs to students.</p>
                            </div>
                            <button className="btn btn-warning rounded-pill px-4 fw-semibold" onClick={() => setActiveTab('recruiters')}>
                              Review Pending Companies
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="col-12 mt-4">
                      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h5 className="fw-bold mb-3 text-dark">Central Placement Portal Authority</h5>
                        <p className="text-muted mb-0">
                          This admin module gives you complete visibility across all registered students, company recruiters, job drives, 
                          applications, and placed candidates. You can inspect complete student profile dossiers (scores, backlogs, skills, resume), 
                          review recruiter company specs, verify corporate registrations, broadcast notifications, and generate campus reports.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: RECRUITERS & COMPANIES DIRECTORY */}
                {activeTab === 'recruiters' && (
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                      <div>
                        <h5 className="fw-bold mb-1 text-dark">Recruiters & Corporate Directory</h5>
                        <p className="text-muted small mb-0">Comprehensive list of all registered recruiter profiles and company accounts.</p>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <div className="input-group input-group-sm" style={{ width: '260px' }}>
                          <span className="input-group-text bg-light border-0"><FaSearch className="text-muted" /></span>
                          <input
                            type="text"
                            className="form-control bg-light border-0"
                            placeholder="Search company, HR, email..."
                            value={companySearch}
                            onChange={(e) => setCompanySearch(e.target.value)}
                          />
                        </div>
                        <select
                          className="form-select form-select-sm bg-light border-0"
                          style={{ width: '160px' }}
                          value={companyStatusFilter}
                          onChange={(e) => setCompanyStatusFilter(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          <option value="pending">Pending Only</option>
                          <option value="active">Approved / Active</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Company & Logo</th>
                            <th>Recruiter Details</th>
                            <th>Contact Phone & Email</th>
                            <th>Industry & Size</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCompanies.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4 text-muted">No recruiter accounts matching your criteria.</td>
                            </tr>
                          ) : (
                            filteredCompanies.map((c) => (
                              <tr key={c._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="rounded border me-2 bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ width: 45, height: 45, flexShrink: 0 }}>
                                      {c.companyLogo ? (
                                        <img src={c.companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <FaBuilding className="text-secondary fs-4" />
                                      )}
                                    </div>
                                    <div>
                                      <strong className="text-dark d-block">{c.companyName || 'Unnamed Company'}</strong>
                                      {c.website && (
                                        <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="text-primary small text-decoration-none">
                                          <FaGlobe className="me-1" /> {c.website.replace(/^https?:\/\//, '')}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="fw-semibold text-dark">{c.recruiterName || c.fullName || 'N/A'}</div>
                                  <span className="text-muted small">{c.recruiterDesignation || 'HR Recruiter'}</span>
                                </td>
                                <td>
                                  <div className="small text-dark"><FaEnvelope className="me-1 text-muted" />{c.email}</div>
                                  <div className="small text-muted"><FaPhone className="me-1 text-muted" />{c.contactNumber || c.phone || 'Not provided'}</div>
                                </td>
                                <td>
                                  <div className="small fw-semibold">{c.industryType || 'Corporate'}</div>
                                  <div className="small text-muted">{c.companySize ? `${c.companySize} employees` : 'Size N/A'}</div>
                                </td>
                                <td>
                                  <span className={`badge bg-${c.status === 'active' ? 'success' : c.status === 'pending' ? 'warning text-dark' : 'danger'}`}>
                                    {c.status === 'active' ? 'Approved' : c.status === 'pending' ? 'Pending Approval' : 'Rejected'}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <div className="btn-group btn-group-sm">
                                    <button className="btn btn-outline-primary" title="View Full Dossier" onClick={() => setSelectedCompany(c)}>
                                      <FaEye className="me-1" /> Dossier
                                    </button>
                                    {c.status === 'pending' && (
                                      <>
                                        <button className="btn btn-success" title="Approve Company" onClick={() => handleApproveCompany(c._id)}>
                                          <FaCheckCircle />
                                        </button>
                                        <button className="btn btn-outline-warning" title="Reject Request" onClick={() => handleRejectCompany(c._id)}>
                                          <FaTimesCircle />
                                        </button>
                                      </>
                                    )}
                                    <button className="btn btn-outline-danger" title="Delete Recruiter Account" onClick={() => handleDeleteCompany(c._id)}>
                                      <FaTrashAlt />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: STUDENTS DIRECTORY */}
                {activeTab === 'students' && (
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                      <div>
                        <h5 className="fw-bold mb-1 text-dark">Student Directory & Academic Dossiers</h5>
                        <p className="text-muted small mb-0">Master database of all registered students, marks, backlogs, skills, and resumes.</p>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <div className="input-group input-group-sm" style={{ width: '260px' }}>
                          <span className="input-group-text bg-light border-0"><FaSearch className="text-muted" /></span>
                          <input
                            type="text"
                            className="form-control bg-light border-0"
                            placeholder="Search name, email, college..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                          />
                        </div>
                        <select
                          className="form-select form-select-sm bg-light border-0"
                          style={{ width: '160px' }}
                          value={studentBranchFilter}
                          onChange={(e) => setStudentBranchFilter(e.target.value)}
                        >
                          <option value="">All Branches</option>
                          {uniqueBranches.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Student Profile</th>
                            <th>College & Branch</th>
                            <th>CGPA</th>
                            <th>10th / 12th %</th>
                            <th>Backlogs</th>
                            <th>Resume</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center py-4 text-muted">No student records found matching your filters.</td>
                            </tr>
                          ) : (
                            filteredStudents.map((s) => (
                              <tr key={s._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-inline-flex align-items-center justify-content-center me-2" style={{ width: 40, height: 40, flexShrink: 0 }}>
                                      {s.fullName?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                      <strong className="text-dark d-block">{s.fullName}</strong>
                                      <div className="text-muted small"><FaEnvelope className="me-1" />{s.email}</div>
                                      {s.phone && <div className="text-muted small"><FaPhone className="me-1" />{s.phone}</div>}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="fw-semibold text-dark">{s.branch || 'Branch N/A'}</div>
                                  <div className="text-muted small">{s.collegeName || 'College N/A'}</div>
                                  <div className="text-muted small">Graduation: {s.graduationYear || 'N/A'}</div>
                                </td>
                                <td>
                                  <span className="fw-bold text-primary fs-6">{s.cgpa !== undefined && s.cgpa !== null ? s.cgpa : 'N/A'}</span>
                                </td>
                                <td>
                                  <div className="small text-dark">10th: <strong>{s.tenthPercentage ? `${s.tenthPercentage}%` : 'N/A'}</strong></div>
                                  <div className="small text-dark">12th: <strong>{s.twelfthPercentage ? `${s.twelfthPercentage}%` : 'N/A'}</strong></div>
                                </td>
                                <td>
                                  <span className={`badge bg-${s.activeBacklogs > 0 ? 'danger' : 'success bg-opacity-10 text-success border border-success'}`}>
                                    {s.activeBacklogs || 0} Backlog(s)
                                  </span>
                                </td>
                                <td>
                                  {s.resumeUrl ? (
                                    <a href={s.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info rounded-pill">
                                      <FaDownload className="me-1" /> PDF
                                    </a>
                                  ) : (
                                    <span className="text-muted small">No Resume</span>
                                  )}
                                </td>
                                <td className="text-end">
                                  <div className="btn-group btn-group-sm">
                                    <button className="btn btn-outline-primary" title="View Full Student Profile Dossier" onClick={() => setSelectedStudent(s)}>
                                      <FaEye className="me-1" /> Dossier
                                    </button>
                                    <button className="btn btn-outline-danger" title="Delete Student Account" onClick={() => handleDeleteStudent(s._id)}>
                                      <FaTrashAlt />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: ANNOUNCEMENTS */}
                {activeTab === 'announcements' && (
                  <div className="row g-4">
                    <div className="col-md-5">
                      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h5 className="fw-bold mb-3 text-dark">Broadcast Placement Notice</h5>
                        <form onSubmit={handleAnnouncementSubmit}>
                          <div className="mb-3">
                            <label className="form-label text-muted small">Notice Header/Title</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Infosys Drive Registration Extension"
                              value={annForm.title}
                              onChange={e => setAnnForm({...annForm, title: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label text-muted small">Detailed Notice Content</label>
                            <textarea
                              className="form-control"
                              rows="5"
                              placeholder="Provide clear instructions, deadline, eligible branches..."
                              value={annForm.content}
                              onChange={e => setAnnForm({...annForm, content: e.target.value})}
                              required
                            />
                          </div>
                          <button type="submit" className="btn btn-primary w-100 rounded-3 shadow-sm py-2">
                            <FaBullhorn className="me-2" /> Publish Notice to Students
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="col-md-7">
                      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h5 className="fw-bold mb-3 text-dark">Notice Board History</h5>
                        {announcements.length === 0 ? (
                          <p className="text-muted text-center py-4 mb-0">No announcements published yet.</p>
                        ) : (
                          <div className="overflow-auto" style={{ maxHeight: '450px' }}>
                            {announcements.map((a) => (
                              <div key={a._id} className="border-bottom pb-3 mb-3">
                                <div className="d-flex justify-content-between align-items-start">
                                  <h6 className="fw-bold mb-1 text-primary">{a.title}</h6>
                                  <span className="text-muted small">{new Date(a.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-muted small mb-0 mt-1" style={{ whitespace: 'pre-wrap' }}>{a.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: ANALYTICS & REPORTS */}
                {activeTab === 'reports' && (
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                      <FaChartBar className="text-primary me-2" /> Campus Placement Intelligence & Analytics
                    </h5>

                    <div className="row g-4">
                      {/* Branch-wise Stats */}
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-4 border">
                          <h6 className="fw-bold mb-3 text-secondary text-uppercase font-monospace small">Branch / Department Selections</h6>
                          <div className="table-responsive">
                            <table className="table table-sm align-middle table-hover">
                              <thead>
                                <tr>
                                  <th>Branch</th>
                                  <th className="text-center">Selections</th>
                                  <th className="text-end">Avg Salary</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reports.branchStats.length === 0 ? (
                                  <tr>
                                    <td colSpan="3" className="text-center py-3 text-muted">No student selections recorded yet.</td>
                                  </tr>
                                ) : (
                                  reports.branchStats.map((b, idx) => (
                                    <tr key={idx}>
                                      <td><strong>{b.branch}</strong></td>
                                      <td className="text-center"><span className="badge bg-success rounded-pill px-2.5">{b.count}</span></td>
                                      <td className="text-end text-primary fw-semibold">{b.avgPackage}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Company Recruits */}
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-4 border">
                          <h6 className="fw-bold mb-3 text-secondary text-uppercase font-monospace small">Recruiting Corporate Leaderboard</h6>
                          <div className="table-responsive">
                            <table className="table table-sm align-middle table-hover">
                              <thead>
                                <tr>
                                  <th>Organization</th>
                                  <th className="text-center">Recruits</th>
                                  <th className="text-end">Max Package</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reports.companyStats.length === 0 ? (
                                  <tr>
                                    <td colSpan="3" className="text-center py-3 text-muted">No company selections recorded yet.</td>
                                  </tr>
                                ) : (
                                  reports.companyStats.map((c, idx) => (
                                    <tr key={idx}>
                                      <td><strong>{c.companyName}</strong></td>
                                      <td className="text-center"><span className="badge bg-primary rounded-pill px-2.5">{c.recruits}</span></td>
                                      <td className="text-end text-success fw-semibold">{c.maxPackage}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* STUDENT PROFILE DOSSIER MODAL */}
      {selectedStudent && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-4 border-0 px-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-white text-primary fw-bold fs-4 d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                    {selectedStudent.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0 text-white">{selectedStudent.fullName}</h5>
                    <p className="mb-0 text-white-50 small"><FaGraduationCap className="me-1" />{selectedStudent.branch || 'Student Profile'} • {selectedStudent.collegeName || 'Campus Candidate'}</p>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedStudent(null)}></button>
              </div>

              <div className="modal-body p-4">
                {/* Contact & Basics */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaEnvelope className="me-1" /> Contact Information</h6>
                      <div className="small"><strong>Email:</strong> {selectedStudent.email}</div>
                      <div className="small"><strong>Phone:</strong> {selectedStudent.phone || 'Not provided'}</div>
                      <div className="small"><strong>Gender:</strong> {selectedStudent.gender || 'Not specified'}</div>
                      <div className="small"><strong>Address:</strong> {selectedStudent.address || 'Not provided'}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaGraduationCap className="me-1" /> Academic Performance</h6>
                      <div className="small"><strong>CGPA Score:</strong> <span className="text-primary fw-bold">{selectedStudent.cgpa !== undefined ? selectedStudent.cgpa : 'N/A'}</span></div>
                      <div className="small"><strong>10th Percentage:</strong> {selectedStudent.tenthPercentage ? `${selectedStudent.tenthPercentage}%` : 'N/A'}</div>
                      <div className="small"><strong>12th Percentage:</strong> {selectedStudent.twelfthPercentage ? `${selectedStudent.twelfthPercentage}%` : 'N/A'}</div>
                      <div className="small"><strong>Active Backlogs:</strong> <span className={selectedStudent.activeBacklogs > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{selectedStudent.activeBacklogs || 0}</span></div>
                    </div>
                  </div>
                </div>

                {/* College Info */}
                <div className="p-3 bg-light rounded-3 border mb-4">
                  <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaBuilding className="me-1" /> Academic Enrollment</h6>
                  <div className="row">
                    <div className="col-sm-6 small"><strong>College:</strong> {selectedStudent.collegeName || 'N/A'}</div>
                    <div className="col-sm-6 small"><strong>University:</strong> {selectedStudent.university || 'N/A'}</div>
                    <div className="col-sm-6 small"><strong>Department / Branch:</strong> {selectedStudent.branch || 'N/A'}</div>
                    <div className="col-sm-6 small"><strong>Semester / Grad Year:</strong> Sem {selectedStudent.currentSemester || 'N/A'} (Class of {selectedStudent.graduationYear || 'N/A'})</div>
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="mb-4">
                  <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaCode className="me-1" /> Technical & Programming Skills</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedStudent.programmingSkills && selectedStudent.programmingSkills.length > 0 ? (
                      selectedStudent.programmingSkills.map((sk, idx) => (
                        <span key={idx} className="badge bg-primary rounded-pill px-3 py-2">{sk}</span>
                      ))
                    ) : (
                      <span className="text-muted small">No programming skills listed.</span>
                    )}
                    {selectedStudent.technicalSkills && selectedStudent.technicalSkills.map((sk, idx) => (
                      <span key={`tech-${idx}`} className="badge bg-info text-dark rounded-pill px-3 py-2">{sk}</span>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                {selectedStudent.projects && selectedStudent.projects.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaBriefcase className="me-1" /> Technical Projects</h6>
                    {selectedStudent.projects.map((p, idx) => (
                      <div key={idx} className="p-3 bg-light rounded-3 border mb-2">
                        <strong className="text-dark">{p.title}</strong>
                        <p className="small text-muted mb-1">{p.description}</p>
                        {p.technologies && p.technologies.length > 0 && (
                          <div className="small"><strong>Tech:</strong> {p.technologies.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Internships */}
                {selectedStudent.internships && selectedStudent.internships.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaAward className="me-1" /> Industry Internships</h6>
                    {selectedStudent.internships.map((intern, idx) => (
                      <div key={idx} className="p-3 bg-light rounded-3 border mb-2">
                        <strong className="text-dark">{intern.role}</strong> - <span className="text-primary">{intern.company}</span>
                        <div className="small text-muted mb-1">Duration: {intern.duration}</div>
                        <p className="small text-muted mb-0">{intern.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* External Links & Resume */}
                <div className="p-3 bg-light rounded-3 border">
                  <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaExternalLinkAlt className="me-1" /> Portfolios & Attachments</h6>
                  <div className="d-flex flex-wrap gap-3">
                    {selectedStudent.resumeUrl && (
                      <a href={selectedStudent.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-success rounded-pill px-3">
                        <FaDownload className="me-1" /> Download Resume PDF
                      </a>
                    )}
                    {selectedStudent.linkedinProfile && (
                      <a href={selectedStudent.linkedinProfile} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                        LinkedIn
                      </a>
                    )}
                    {selectedStudent.githubProfile && (
                      <a href={selectedStudent.githubProfile} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-dark rounded-pill px-3">
                        GitHub
                      </a>
                    )}
                    {selectedStudent.portfolioLink && (
                      <a href={selectedStudent.portfolioLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                        Portfolio Site
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light rounded-bottom-4 border-0">
                <button className="btn btn-outline-danger" onClick={() => handleDeleteStudent(selectedStudent._id)}>
                  <FaTrashAlt className="me-1" /> Delete Student Account
                </button>
                <button type="button" className="btn btn-secondary rounded-3" onClick={() => setSelectedStudent(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECRUITER & COMPANY DOSSIER MODAL */}
      {selectedCompany && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-dark text-white rounded-top-4 border-0 px-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded border bg-white p-1 d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                    {selectedCompany.companyLogo ? (
                      <img src={selectedCompany.companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <FaBuilding className="text-dark fs-3" />
                    )}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0 text-white">{selectedCompany.companyName || 'Corporate Recruiter'}</h5>
                    <p className="mb-0 text-white-50 small"><FaIndustry className="me-1" />{selectedCompany.industryType || 'Industry Organization'}</p>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedCompany(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaUserTie className="me-1" /> HR Contact Person</h6>
                      <div className="small"><strong>HR Name:</strong> {selectedCompany.recruiterName || selectedCompany.fullName || 'N/A'}</div>
                      <div className="small"><strong>Designation:</strong> {selectedCompany.recruiterDesignation || 'HR Representative'}</div>
                      <div className="small"><strong>Official Email:</strong> {selectedCompany.email}</div>
                      <div className="small"><strong>Phone / Contact:</strong> {selectedCompany.contactNumber || selectedCompany.phone || 'Not provided'}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaBuilding className="me-1" /> Corporate Specs</h6>
                      <div className="small"><strong>Headquarters:</strong> {selectedCompany.headquarters || 'Not specified'}</div>
                      <div className="small"><strong>Company Size:</strong> {selectedCompany.companySize ? `${selectedCompany.companySize} Employees` : 'N/A'}</div>
                      <div className="small"><strong>Established Year:</strong> {selectedCompany.yearOfEstablishment || 'N/A'}</div>
                      <div className="small"><strong>Account Status:</strong> 
                        <span className={`badge ms-2 bg-${selectedCompany.status === 'active' ? 'success' : selectedCompany.status === 'pending' ? 'warning text-dark' : 'danger'}`}>
                          {selectedCompany.status === 'active' ? 'Approved' : selectedCompany.status === 'pending' ? 'Pending Approval' : 'Rejected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCompany.companyDescription && (
                  <div className="p-3 bg-light rounded-3 border mb-4">
                    <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace">Company Overview / Bio</h6>
                    <p className="small text-muted mb-0" style={{ whitespace: 'pre-wrap' }}>{selectedCompany.companyDescription}</p>
                  </div>
                )}

                {selectedCompany.officeLocations && selectedCompany.officeLocations.length > 0 && (
                  <div className="p-3 bg-light rounded-3 border mb-4">
                    <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaMapMarkerAlt className="me-1" /> Office Locations</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedCompany.officeLocations.map((loc, idx) => (
                        <span key={idx} className="badge bg-secondary rounded-pill px-3 py-1.5">{loc}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCompany.website && (
                  <div className="p-3 bg-light rounded-3 border">
                    <h6 className="fw-bold text-secondary mb-2 small text-uppercase font-monospace"><FaGlobe className="me-1" /> Corporate Website</h6>
                    <a href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill">
                      <FaExternalLinkAlt className="me-1" /> Visit {selectedCompany.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light rounded-bottom-4 border-0 d-flex justify-content-between">
                <div>
                  {selectedCompany.status === 'pending' && (
                    <>
                      <button className="btn btn-success me-2 rounded-pill px-3" onClick={() => handleApproveCompany(selectedCompany._id)}>
                        <FaCheckCircle className="me-1" /> Approve Registration
                      </button>
                      <button className="btn btn-warning rounded-pill px-3" onClick={() => handleRejectCompany(selectedCompany._id)}>
                        <FaTimesCircle className="me-1" /> Reject Request
                      </button>
                    </>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-danger rounded-3" onClick={() => handleDeleteCompany(selectedCompany._id)}>
                    <FaTrashAlt className="me-1" /> Delete Recruiter Account
                  </button>
                  <button type="button" className="btn btn-secondary rounded-3" onClick={() => setSelectedCompany(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
