import { Link } from 'react-router-dom';
import { FaGraduationCap, FaBuilding, FaUserShield } from 'react-icons/fa';

function LandingPage() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light" style={{ overflowX: 'hidden' }}>
      {/* Navigation Header */}
      <header className="navbar navbar-expand-lg navbar-dark bg-primary py-3 shadow-sm">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white fs-3">
            Career Track
          </span>
          <div className="ms-auto d-flex gap-2">
            <Link to="/login" className="btn btn-outline-light px-4 rounded-pill">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-info text-white px-4 rounded-pill">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Role Selection Panel */}
      <main className="flex-grow-1 d-flex align-items-center py-5" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)' }}>
        <div className="container px-4">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center text-white mb-5 mb-lg-0 d-flex flex-column justify-content-center">
              <h1 className="display-4 fw-bold mb-3">Campus Placements Portal</h1>
              <p className="lead text-light">
                Digitalizing and automating campus placement drives for Students, Corporate Recruiters, and Administrators.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="card border-0 shadow-lg p-4 bg-white text-dark rounded-4">
                <h4 className="fw-bold text-primary mb-3 text-center">Select Portal Access</h4>
                <div className="d-flex flex-column gap-3 mt-3">
                  <Link to="/login" className="btn btn-outline-primary d-flex align-items-center justify-content-between p-3 rounded-3 text-start hover-shadow">
                    <div>
                      <strong className="d-block text-dark"><FaGraduationCap className="me-2 text-primary" /> Student Portal</strong>
                      <span className="text-muted small">View eligibility, apply for jobs & track interviews</span>
                    </div>
                    <span className="badge bg-primary-subtle text-primary rounded-circle p-2">&rarr;</span>
                  </Link>
                  <Link to="/login" className="btn btn-outline-success d-flex align-items-center justify-content-between p-3 rounded-3 text-start hover-shadow">
                    <div>
                      <strong className="d-block text-dark"><FaBuilding className="me-2 text-success" /> Recruiter Center</strong>
                      <span className="text-muted small">Publish job drives & manage applicants</span>
                    </div>
                    <span className="badge bg-success-subtle text-success rounded-circle p-2">&rarr;</span>
                  </Link>
                  <Link to="/login" className="btn btn-outline-warning d-flex align-items-center justify-content-between p-3 rounded-3 text-start hover-shadow">
                    <div>
                      <strong className="d-block text-dark"><FaUserShield className="me-2 text-warning" /> Administrator Console</strong>
                      <span className="text-muted small">Approve companies & monitor reports</span>
                    </div>
                    <span className="badge bg-warning-subtle text-warning rounded-circle p-2">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 text-center">
        <span className="small text-muted">&copy; {new Date().getFullYear()} Career Track.</span>
      </footer>
    </div>
  );
}

export default LandingPage;
