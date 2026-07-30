import { NavLink } from 'react-router-dom';
import { useAuth } from '../services/authService.jsx';

function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
      <div className="card-body p-3">
        <div className="mb-3 px-2">
          <h6 className="mb-1 text-uppercase text-muted font-monospace small">Navigation Menu</h6>
        </div>
        <div className="list-group list-group-flush rounded-3">
          {user?.role === 'admin' ? (
            <>
              <NavLink className="list-group-item list-group-item-action py-2.5 px-3 border-0 rounded-2 mb-1" to="/admin-dashboard">
                Overview & Approvals
              </NavLink>
            </>
          ) : (
            <>
              <NavLink className="list-group-item list-group-item-action py-2.5 px-3 border-0 rounded-2 mb-1" to="/dashboard">
                Dashboard Overview
              </NavLink>
              <NavLink className="list-group-item list-group-item-action py-2.5 px-3 border-0 rounded-2 mb-1" to="/applications">
                My Applications
              </NavLink>
              <NavLink className="list-group-item list-group-item-action py-2.5 px-3 border-0 rounded-2 mb-1" to="/jobs">
                Available Jobs
              </NavLink>
              {user?.role === 'company' && (
                <NavLink className="list-group-item list-group-item-action py-2.5 px-3 border-0 rounded-2 mb-1" to="/company-dashboard">
                  Company Dashboard
                </NavLink>
              )}
              <NavLink className="list-group-item list-group-item-action py-2.5 px-3 border-0 rounded-2 mb-1" to="/profile">
                Profile Settings
              </NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

