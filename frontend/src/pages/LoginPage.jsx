import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/apiService';
import { useAuth } from '../services/authService.jsx';
import { FaSignInAlt } from 'react-icons/fa';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { saveUser } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/users/login', { email, password });
      saveUser(response.data);
      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (response.data.role === 'company') {
        navigate('/company-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.statusText || err.message || 'Login failed';
      setError(message);
    }
  };

  return (
    <div className="container-fluid vh-100 bg-light">
      <div className="row h-100 align-items-center">
        <div className="col-lg-6 d-none d-lg-flex bg-primary text-white justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <div className="text-center px-5">
            <h1 className="display-5 fw-bold">Career Track</h1>
            <p className="lead mt-3">Secure login for students, companies, and admins with instant access to placement intelligence.</p>
          </div>
        </div>
        <div className="col-lg-6 d-flex align-items-center justify-content-center py-5">
          <div className="card shadow-sm rounded-4 w-100 mx-3" style={{ maxWidth: '420px' }}>
            <div className="card-body p-5">
              <h2 className="card-title mb-4 text-center">Login</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-3">
                  <FaSignInAlt className="me-2" /> Login
                </button>
              </form>
              <p className="text-center mb-0">
                Don't have an account? <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
