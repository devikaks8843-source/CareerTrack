import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/apiService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../services/authService.jsx';
import { FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt, FaBullhorn, FaBell, FaInfoCircle } from 'react-icons/fa';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect admin/companies to their respective dashboards
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user.role === 'company') {
        navigate('/company-dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const [profile, setProfile] = useState({});
  const [applications, setApplications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, appRes, annRes, notifRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/applications'),
        api.get('/admin/announcements'),
        api.get('/users/notifications')
      ]);

      setProfile(profileRes.data.user || {});
      setApplications(appRes.data.applications || []);
      setAnnouncements(annRes.data.announcements || []);
      setNotifications(notifRes.data.notifications || []);
    } catch (error) {
      console.error('Error fetching student dashboard details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchDashboardData();
    }
  }, [user]);

  // Profile completion percentage calculator
  const calculateCompletion = (prof) => {
    if (!prof || prof.role !== 'student') return 0;
    const fields = [
      prof.fullName, prof.phone, prof.gender, prof.dateOfBirth, prof.address,
      prof.collegeName, prof.university, prof.branch, prof.currentSemester, prof.graduationYear,
      prof.cgpa, prof.tenthPercentage, prof.twelfthPercentage,
      prof.programmingSkills?.length > 0, prof.technicalSkills?.length > 0,
      prof.projects?.length > 0, prof.internships?.length > 0,
      prof.certifications?.length > 0, prof.linkedinProfile, prof.resumeUrl
    ];
    let count = 0;
    fields.forEach(f => { if (f) count++; });
    return Math.round((count / fields.length) * 100);
  };

  const completionPct = calculateCompletion(profile);

  // Notification mark as read handler
  const handleMarkRead = async (notifId) => {
    try {
      const response = await api.put(`/users/notifications/${notifId}/read`);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error(error);
    }
  };

  // Extract upcoming interviews across all student applications
  const upcomingInterviews = useMemo(() => {
    const list = [];
    applications.forEach((app) => {
      app.rounds?.forEach((round) => {
        if (round.status === 'pending' || round.result === 'pending') {
          list.push({
            companyName: app.companyName,
            role: app.jobTitle,
            roundTitle: round.title,
            date: round.date,
            time: round.time,
            venue: round.venue,
            meetingLink: round.meetingLink
          });
        }
      });
    });
    // Sort by date ascending
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [applications]);

  // Recent placements timeline activities
  const recentActivities = useMemo(() => {
    const list = [];
    applications.forEach((app) => {
      app.timeline?.forEach((event) => {
        list.push({
          companyName: app.companyName,
          role: app.jobTitle,
          stage: event.stage,
          comment: event.comment,
          date: event.date
        });
      });
    });
    return list.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [applications]);

  const appStats = useMemo(() => {
    return {
      total: applications.length,
      selected: applications.filter(a => a.status === 'Selected').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
      pending: applications.filter(a => !['Selected', 'Rejected'].includes(a.status)).length
    };
  }, [applications]);

  const cards = [
    { label: 'Applications Sent', value: appStats.total, icon: <FaFileAlt />, color: 'primary' },
    { label: 'Offers Received', value: appStats.selected, icon: <FaCheckCircle />, color: 'success' },
    { label: 'Ongoing Evaluates', value: appStats.pending, icon: <FaClock />, color: 'warning' },
    { label: 'Rejections Logged', value: appStats.rejected, icon: <FaTimesCircle />, color: 'danger' }
  ];

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container-fluid py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading candidate dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid py-4">
        <div className="row gx-4">
          <div className="col-lg-3">
            <Sidebar />
          </div>
          <div className="col-lg-9">
            {/* Header section */}
            <div className="mb-4">
              <h2 className="mb-1 fw-bold text-dark">Welcome back, {profile.fullName || 'Student'}!</h2>
              <p className="text-muted mb-0">Overview of your campus recruitment progress and academic eligibility metrics.</p>
            </div>

            {/* Profile Completeness bar */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold text-dark">Student Profile Completeness Status</span>
                <span className="badge bg-primary fs-6">{completionPct}%</span>
              </div>
              <div className="progress rounded-pill shadow-inner" style={{ height: '12px' }}>
                <div
                  className={`progress-bar progress-bar-striped progress-bar-animated bg-${completionPct === 100 ? 'success' : 'primary'}`}
                  role="progressbar"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              {completionPct < 100 && (
                <p className="text-muted small mt-2 mb-0">
                  * Complete your missing profile fields in the <span className="text-primary cursor-pointer fw-semibold text-decoration-underline" onClick={() => navigate('/profile')}>Profile settings</span> page to maximize eligibility for new company drives.
                </p>
              )}
            </div>

            {/* Summary cards */}
            <div className="row g-3 mb-4">
              {cards.map((c, idx) => (
                <div key={idx} className="col-sm-6 col-md-3">
                  <div className={`card border-0 shadow-sm rounded-4 h-100 border-start border-5 border-${c.color} bg-white`}>
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-uppercase text-muted small mb-1">{c.label}</h6>
                        <h3 className="fw-bold mb-0 text-dark">{c.value}</h3>
                      </div>
                      <div className={`fs-2 text-${c.color} opacity-75`}>{c.icon}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboards widgets row */}
            <div className="row g-4">
              {/* Placement Notices & Announcements */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold mb-3 d-flex align-items-center text-dark">
                    <FaBullhorn className="text-primary me-2" /> Campus Placement Notices
                  </h5>
                  <hr className="my-2" />
                  {announcements.length === 0 ? (
                    <p className="text-muted small py-4 text-center">No official placement notices posted yet.</p>
                  ) : (
                    <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                      {announcements.map((ann) => (
                        <div key={ann._id} className="pb-3 border-bottom mb-3 last-border-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <strong className="text-dark small d-block">{ann.title}</strong>
                            <span className="text-muted font-monospace small" style={{ fontSize: '0.75rem' }}>{new Date(ann.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-muted small mb-0 mt-1 whitespace-pre-wrap">{ann.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Schedules */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold mb-3 d-flex align-items-center text-dark">
                    <FaCalendarAlt className="text-success me-2" /> Upcoming Interviews
                  </h5>
                  <hr className="my-2" />
                  {upcomingInterviews.length === 0 ? (
                    <p className="text-muted small py-4 text-center">No pending interview rounds scheduled.</p>
                  ) : (
                    <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                      {upcomingInterviews.map((interview, idx) => (
                        <div key={idx} className="p-3 bg-light rounded-3 border mb-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong className="text-dark d-block">{interview.roundTitle}</strong>
                              <span className="text-primary small fw-semibold">{interview.companyName} &middot; {interview.role}</span>
                            </div>
                            <span className="badge bg-warning text-dark small">Pending</span>
                          </div>
                          <div className="text-muted small mt-2">
                            <div>Date: {new Date(interview.date).toLocaleDateString()} at {interview.time}</div>
                            <div>Venue: {interview.venue || 'Online'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications Center */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold mb-3 d-flex align-items-center text-dark">
                    <FaBell className="text-warning me-2" /> Notification Center
                  </h5>
                  <hr className="my-2" />
                  {notifications.filter(n => !n.read).length === 0 ? (
                    <p className="text-muted small py-4 text-center">No new notifications.</p>
                  ) : (
                    <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                      {notifications.filter(n => !n.read).map((n) => (
                        <div key={n._id} className="p-3 bg-light rounded-3 border mb-2 d-flex justify-content-between align-items-start">
                          <div className="pe-2">
                            <strong className="text-dark small d-block">{n.title}</strong>
                            <p className="text-muted small mb-0 mt-0.5">{n.message}</p>
                          </div>
                          <button className="btn btn-link btn-sm text-decoration-none p-0 text-secondary font-monospace" onClick={() => handleMarkRead(n._id)}>
                            Dismiss
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent recruitment logs */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold mb-3 d-flex align-items-center text-dark">
                    <FaInfoCircle className="text-info me-2" /> Recent Recruiting Logs
                  </h5>
                  <hr className="my-2" />
                  {recentActivities.length === 0 ? (
                    <p className="text-muted small py-4 text-center">No recent application activities logged.</p>
                  ) : (
                    <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                      {recentActivities.map((act, idx) => (
                        <div key={idx} className="pb-2 border-bottom mb-2 last-border-0">
                          <div className="d-flex justify-content-between">
                            <strong className="text-dark small">{act.companyName} &middot; {act.role}</strong>
                            <span className="text-muted small font-monospace" style={{ fontSize: '0.7rem' }}>{new Date(act.date).toLocaleDateString()}</span>
                          </div>
                          <span className="badge bg-light text-secondary border small mt-1">{act.stage}</span>
                          <p className="text-muted small mb-0 mt-1">{act.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
