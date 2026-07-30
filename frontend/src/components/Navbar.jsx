import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService.jsx';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin-dashboard';
    if (user?.role === 'company') return '/company-dashboard';
    return '/dashboard';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-2">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold text-white d-flex align-items-center" to={getDashboardLink()}>
          <span className="fs-4 fw-bold tracking-tight">Career Track</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {user?.role === 'admin' ? (
              <li className="nav-item">
                <NavLink className="nav-link px-3 text-light" to="/admin-dashboard">Admin Dashboard</NavLink>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 text-light" to="/dashboard">Dashboard</NavLink>
                </li>
                {user?.role === 'company' && (
                  <li className="nav-item">
                    <NavLink className="nav-link px-3 text-light" to="/company-dashboard">Company Drive</NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <NavLink className="nav-link px-3 text-light" to="/applications">Applications</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 text-light" to="/jobs">Jobs</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 text-light" to="/profile">Profile</NavLink>
                </li>
              </>
            )}
            <li className="nav-item ms-lg-3">
              <span className="badge bg-light text-primary px-3 py-2 fw-semibold border">
                {user?.fullName || user?.companyName || 'Guest'} ({user?.role?.toUpperCase()})
              </span>
            </li>
            <li className="nav-item ms-lg-2">
              <button className="btn btn-outline-light btn-sm px-3 rounded-pill" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

