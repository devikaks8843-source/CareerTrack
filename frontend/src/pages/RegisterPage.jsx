import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/apiService';
import { useAuth } from '../services/authService.jsx';
import { FaUserPlus, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

function RegisterPage() {
  const [role, setRole] = useState('student');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    role: 'student',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Personal details (Student)
    gender: '',
    dateOfBirth: '',
    address: '',
    
    // Academic details (Student)
    collegeName: '',
    university: '',
    branch: '',
    currentSemester: '',
    graduationYear: '',
    cgpa: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    activeBacklogs: '0',
    
    // Skills (Student)
    programmingSkills: '',
    technicalSkills: '',
    certifications: '',
    languagesKnown: '',
    preferredLocations: '',
    
    // Social / Files (Student)
    linkedinProfile: '',
    githubProfile: '',
    portfolioLink: '',
    resumeUrl: '',

    // Company specific details
    companyName: '',
    companyLogo: '',
    industryType: '',
    companyDescription: '',
    website: '',
    headquarters: '',
    officeLocations: '',
    recruiterName: '',
    recruiterDesignation: '',
    contactNumber: '',
    companySize: '',
    yearOfEstablishment: '',
  });

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const { saveUser } = useAuth();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setStep(1);
    setForm((prev) => ({ ...prev, role: selectedRole }));
    setError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const nextStep = () => {
    setError('');
    // Basic validation per step
    if (step === 1) {
      if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
        setError('Please fill out all credential and name fields.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    if (step === 2 && role === 'student') {
      if (!form.gender || !form.dateOfBirth || !form.address) {
        setError('Please fill out all personal details.');
        return;
      }
    }
    if (step === 3 && role === 'student') {
      if (!form.collegeName || !form.university || !form.branch || !form.currentSemester || !form.graduationYear || !form.cgpa || !form.tenthPercentage || !form.twelfthPercentage) {
        setError('Please fill out all academic parameters.');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    // Pre-submit check
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === 'company' && (!form.companyName || !form.companyName.trim())) {
      setError('Please provide the Company Registered Name.');
      return;
    }

    try {
      const response = await api.post('/users/register', form);
      if (response.data.token) {
        saveUser(response.data);
        navigate('/dashboard');
        return;
      }
      setInfo('Company account registration successful! Your profile remains in a pending state until approved by the administrator.');
      setForm({
        role: 'student',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        collegeName: '',
        university: '',
        branch: '',
        currentSemester: '',
        graduationYear: '',
        cgpa: '',
        tenthPercentage: '',
        twelfthPercentage: '',
        activeBacklogs: '0',
        programmingSkills: '',
        technicalSkills: '',
        certifications: '',
        languagesKnown: '',
        preferredLocations: '',
        linkedinProfile: '',
        githubProfile: '',
        portfolioLink: '',
        resumeUrl: '',
        companyName: '',
        companyLogo: '',
        industryType: '',
        companyDescription: '',
        website: '',
        headquarters: '',
        officeLocations: '',
        recruiterName: '',
        recruiterDesignation: '',
        contactNumber: '',
        companySize: '',
        yearOfEstablishment: '',
      });
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light py-5 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg border-0 rounded-4 w-100 mx-3" style={{ maxWidth: '800px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h1 className="fw-bold text-primary">Career Track</h1>
            <p className="text-muted">Digitalize & Automate Campus Recruits</p>
          </div>

          <div className="d-flex justify-content-center gap-3 mb-4">
            <button
              type="button"
              className={`btn px-4 ${role === 'student' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleRoleChange('student')}
            >
              Student Profile
            </button>
            <button
              type="button"
              className={`btn px-4 ${role === 'company' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleRoleChange('company')}
            >
              Corporate Recruiter
            </button>
          </div>

          {/* Stepper indicator */}
          {role === 'student' && (
            <div className="d-flex justify-content-between mb-4 font-monospace text-muted small">
              <span className={step === 1 ? 'text-primary fw-bold' : ''}>1. Credentials</span>
              <span className={step === 2 ? 'text-primary fw-bold' : ''}>2. Personal</span>
              <span className={step === 3 ? 'text-primary fw-bold' : ''}>3. Academics</span>
              <span className={step === 4 ? 'text-primary fw-bold' : ''}>4. Skills & Assets</span>
            </div>
          )}
          {role === 'company' && (
            <div className="d-flex justify-content-between mb-4 font-monospace text-muted small">
              <span className={step === 1 ? 'text-primary fw-bold' : ''}>1. Admin Credentials</span>
              <span className={step === 2 ? 'text-primary fw-bold' : ''}>2. Corporate Details</span>
            </div>
          )}

          {error && <div className="alert alert-danger border-0">{error}</div>}
          {info && <div className="alert alert-success border-0">{info}</div>}

          <form onSubmit={handleSubmit}>
            {/* Student Flow */}
            {role === 'student' && (
              <div>
                {step === 1 && (
                  <div className="row g-3">
                    <h5 className="fw-bold mb-1 text-dark">Portal Credentials</h5>
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input name="fullName" type="text" className="form-control" value={form.fullName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address *</label>
                      <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password *</label>
                      <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Confirm Password *</label>
                      <input name="confirmPassword" type="password" className="form-control" value={form.confirmPassword} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="row g-3">
                    <h5 className="fw-bold mb-1 text-dark">Personal Information</h5>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number *</label>
                      <input name="phone" type="tel" className="form-control" value={form.phone} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Gender *</label>
                      <select name="gender" className="form-select" value={form.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date of Birth *</label>
                      <input name="dateOfBirth" type="date" className="form-control" value={form.dateOfBirth} onChange={handleChange} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Permanent Address *</label>
                      <textarea name="address" className="form-control" rows="2" value={form.address} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="row g-3">
                    <h5 className="fw-bold mb-1 text-dark">Academic Record</h5>
                    <div className="col-md-6">
                      <label className="form-label">College Name *</label>
                      <input name="collegeName" type="text" className="form-control" value={form.collegeName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">University Name *</label>
                      <input name="university" type="text" className="form-control" value={form.university} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Branch / Department *</label>
                      <input name="branch" type="text" className="form-control" placeholder="e.g. Computer Science" value={form.branch} onChange={handleChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Current Semester *</label>
                      <input name="currentSemester" type="number" className="form-control" value={form.currentSemester} onChange={handleChange} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Graduation Year *</label>
                      <input name="graduationYear" type="number" className="form-control" value={form.graduationYear} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Current CGPA Score *</label>
                      <input name="cgpa" type="number" step="0.01" max="10" className="form-control" value={form.cgpa} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">10th Grade Percentage (%) *</label>
                      <input name="tenthPercentage" type="number" step="0.01" max="100" className="form-control" value={form.tenthPercentage} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">12th Grade Percentage (%) *</label>
                      <input name="twelfthPercentage" type="number" step="0.01" max="100" className="form-control" value={form.twelfthPercentage} onChange={handleChange} required />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Active Backlogs count *</label>
                      <input name="activeBacklogs" type="number" className="form-control" value={form.activeBacklogs} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="row g-3">
                    <h5 className="fw-bold mb-1 text-dark">Skills, Links & Resume Docs</h5>
                    <div className="col-md-6">
                      <label className="form-label">Programming Languages (Comma separated) *</label>
                      <input name="programmingSkills" type="text" className="form-control" placeholder="e.g. Java, Python" value={form.programmingSkills} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Technical Skills (Comma separated) *</label>
                      <input name="technicalSkills" type="text" className="form-control" placeholder="e.g. React.js, Node.js" value={form.technicalSkills} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Certifications (Comma separated)</label>
                      <input name="certifications" type="text" className="form-control" placeholder="AWS Cloud Practitioner" value={form.certifications} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Languages Known (Comma separated)</label>
                      <input name="languagesKnown" type="text" className="form-control" placeholder="English, Hindi" value={form.languagesKnown} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Preferred Job Locations (Comma separated)</label>
                      <input name="preferredLocations" type="text" className="form-control" placeholder="Bangalore, Hybrid" value={form.preferredLocations} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">LinkedIn Profile link *</label>
                      <input name="linkedinProfile" type="url" className="form-control" placeholder="https://linkedin.com/in/username" value={form.linkedinProfile} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">GitHub Profile link *</label>
                      <input name="githubProfile" type="url" className="form-control" placeholder="https://github.com/username" value={form.githubProfile} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Portfolio Website link</label>
                      <input name="portfolioLink" type="url" className="form-control" placeholder="https://portfolio.com" value={form.portfolioLink} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Resume Upload URL Link *</label>
                      <input name="resumeUrl" type="url" className="form-control" placeholder="https://drive.google.com/..." value={form.resumeUrl} onChange={handleChange} required />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recruiter Flow */}
            {role === 'company' && (
              <div>
                {step === 1 && (
                  <div className="row g-3">
                    <h5 className="fw-bold mb-1 text-dark">Portal Recruiter Credentials</h5>
                    <div className="col-md-6">
                      <label className="form-label">Recruiter Full Name *</label>
                      <input name="fullName" type="text" className="form-control" value={form.fullName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Recruiter Designation *</label>
                      <input name="recruiterDesignation" type="text" className="form-control" placeholder="e.g. Talent Acquisition" value={form.recruiterDesignation} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Official Work Email *</label>
                      <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Recruiter Phone *</label>
                      <input name="phone" type="tel" className="form-control" value={form.phone} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password *</label>
                      <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Confirm Password *</label>
                      <input name="confirmPassword" type="password" className="form-control" value={form.confirmPassword} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="row g-3">
                    <h5 className="fw-bold mb-1 text-dark">Corporate Details</h5>
                    <div className="col-md-6">
                      <label className="form-label">Company Registered Name *</label>
                      <input name="companyName" type="text" className="form-control" value={form.companyName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Company Corporate Logo URL *</label>
                      <input name="companyLogo" type="url" className="form-control" placeholder="https://logo-url..." value={form.companyLogo} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Industry Sector *</label>
                      <input name="industryType" type="text" className="form-control" placeholder="e.g. IT, Tech, Finance" value={form.industryType} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Official Corporate Website *</label>
                      <input name="website" type="url" className="form-control" placeholder="https://company.com" value={form.website} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Headquarters Location *</label>
                      <input name="headquarters" type="text" className="form-control" placeholder="e.g. San Jose, CA" value={form.headquarters} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Office Branches Locations (Comma separated)</label>
                      <input name="officeLocations" type="text" className="form-control" placeholder="e.g. New York, Bangalore" value={form.officeLocations} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Recruitment Contact Phone (Office)</label>
                      <input name="contactNumber" type="tel" className="form-control" value={form.contactNumber} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Company Size (Employees)</label>
                      <input name="companySize" type="number" className="form-control" value={form.companySize} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Year Established</label>
                      <input name="yearOfEstablishment" type="number" className="form-control" value={form.yearOfEstablishment} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Official Address *</label>
                      <textarea name="address" className="form-control" rows="2" value={form.address} onChange={handleChange} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Corporate Description</label>
                      <textarea name="companyDescription" className="form-control" rows="3" value={form.companyDescription} onChange={handleChange} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form control buttons */}
            <div className="d-flex justify-content-between mt-5 border-top pt-4">
              {step > 1 ? (
                <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={prevStep}>
                  <FaArrowLeft /> Back
                </button>
              ) : (
                <div />
              )}

              {((role === 'student' && step < 4) || (role === 'company' && step < 2)) ? (
                <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={nextStep}>
                  Next <FaArrowRight />
                </button>
              ) : (
                <button type="submit" className="btn btn-success d-flex align-items-center gap-2">
                  <FaUserPlus /> Submit Registration
                </button>
              )}
            </div>
          </form>

          <p className="text-center mt-4 mb-0 small">
            Already registered? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
