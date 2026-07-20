import { useState, useEffect } from 'react';
import { Search, UserPlus, FileText, AlertTriangle, ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../hooks/useToast';
import useApiResource from '../hooks/useApiResource';
import { useNavigation } from '../context/NavigationContext';
import { patientService } from '../services/api';
import './Patients.css';

const PAGE_SIZE = 6;

// Normalizes a real Patient document (backend field is `patientId`, no
// embedded history/appointments/prescriptions) to the shape this page's
// profile tabs expect, without touching every `.id` reference below.
const normalizePatient = (p) => ({
  ...p,
  id: p.patientId,
  medicalHistory: p.medicalHistory ?? [],
  appointments: p.appointments ?? [],
  prescriptions: p.prescriptions ?? [],
});

const Patients = () => {
  const { data: patientsData, loading, error, refetch } = useApiResource(() => patientService.getAll());
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (patientsData) setPatients(patientsData.map(normalizePatient));
  }, [patientsData]);

  const [activeView, setActiveView] = useState('list'); // 'list', 'register', 'profile'
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [activeTab, setActiveTab] = useState('demographics'); // 'demographics', 'history', 'appointments', 'prescriptions'
  
  // Simulation Role State
  const [userRole, setUserRole] = useState('admin'); // 'admin', 'receptionist', 'doctor'
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState(null); // { type: 'delete', data: patient }
  const { toast, showToast } = useToast();

  // Form States
  const [regForm, setRegForm] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    phone: '',
    cnic: '',
    address: '',
    emergencyContact: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [historyNote, setHistoryNote] = useState('');

  const openRegisterForm = () => {
    setActiveView('register');
    setRegForm({ name: '', dob: '', gender: 'Male', phone: '', cnic: '', address: '', emergencyContact: '' });
    setValidationErrors({});
    setDuplicateWarning(false);
  };

  // Arriving here via the Dashboard's "Register Patient" quick action.
  const { payload, clearPayload } = useNavigation();
  useEffect(() => {
    if (payload?.openRegister) {
      openRegisterForm();
      clearPayload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  const activePatient = patients.find(p => p.id === selectedPatientId);

  // Filter Patients
  const filteredPatients = patients.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = !query || 
      p.name.toLowerCase().includes(query) || 
      p.id.toLowerCase().includes(query) || 
      p.phone.includes(query);

    const matchDateRange = (!startDate || new Date(p.registrationDate) >= new Date(startDate)) &&
                           (!endDate || new Date(p.registrationDate) <= new Date(endDate));

    return matchQuery && matchDateRange;
  });

  // Pagination (clamps to valid range as the filtered set changes)
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedPatients = filteredPatients.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  // Delete a patient record (admin only) — confirmed via ConfirmModal
  const handleDeletePatient = (patient) => {
    setPatients((prev) => prev.filter((p) => p.id !== patient.id));
    setModal(null);
    if (selectedPatientId === patient.id) {
      setSelectedPatientId(null);
      setActiveView('list');
    }
    showToast(`Patient ${patient.name} deleted.`);
  };

  // Calculate age helper
  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Search input change with duplicate check helper
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setCurrentPage(1);

    // Simulate duplicate check warning if search matches exactly
    const exists = patients.some(p => p.name.toLowerCase() === val.toLowerCase().trim());
    if (exists && val.trim().length > 3) {
      setDuplicateWarning(true);
    } else {
      setDuplicateWarning(false);
    }
  };

  // Demographics validation
  const validateForm = () => {
    const errors = {};
    if (!regForm.name.trim()) errors.name = 'Full name is required';
    if (!regForm.dob) errors.dob = 'Date of birth is required';
    
    // Phone validation
    const phonePattern = /^03\d{2}-\d{7}$|^03\d{9}$/;
    if (!regForm.phone) {
      errors.phone = 'Phone number is required';
    } else if (!phonePattern.test(regForm.phone)) {
      errors.phone = 'Format must be: 0300-1234567 or 03001234567';
    }

    // CNIC validation (XXXXX-XXXXXXX-X format)
    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    if (!regForm.cnic) {
      errors.cnic = 'CNIC is required';
    } else if (!cnicPattern.test(regForm.cnic)) {
      errors.cnic = 'Format must be: 42101-1234567-1';
    }

    if (!regForm.address.trim()) errors.address = 'Address is required';
    if (!regForm.emergencyContact.trim()) errors.emergencyContact = 'Emergency contact is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Registration Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate Check duplicate registration before finalizing
    const isDuplicate = patients.some(
      p => p.phone === regForm.phone || p.cnic === regForm.cnic
    );

    if (isDuplicate) {
      setDuplicateWarning(true);
      alert('Duplicate Patient Found: A patient with this CNIC or Phone number already exists!');
      return;
    }

    try {
      const created = await patientService.create({
        ...regForm,
        age: calculateAge(regForm.dob),
        lastVisit: 'New Registration',
        registrationDate: new Date().toISOString().split('T')[0],
      });
      const newPatient = normalizePatient(created);

      setPatients([newPatient, ...patients]);
      setSelectedPatientId(newPatient.id);
      setActiveView('profile');
      setActiveTab('demographics');
      // reset form
      setRegForm({
        name: '',
        dob: '',
        gender: 'Male',
        phone: '',
        cnic: '',
        address: '',
        emergencyContact: ''
      });
      setDuplicateWarning(false);
      showToast(`Patient ${newPatient.name} registered.`);
    } catch (err) {
      showToast(err.message || 'Failed to register patient.');
    }
  };

  // Add clinical medical note (Append-Only)
  const handleAddClinicalNote = (e) => {
    e.preventDefault();
    if (!historyNote.trim()) return;

    const newNote = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      doctor: userRole === 'doctor' ? 'Dr. Fatima Noor' : 'Admin Subhan',
      note: historyNote
    };

    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          medicalHistory: [newNote, ...p.medicalHistory]
        };
      }
      return p;
    });

    setPatients(updatedPatients);
    setHistoryNote('');
  };

  // Role helper variables
  const isReceptionist = userRole === 'receptionist';
  const isDoctor = userRole === 'doctor';
  const isAdmin = userRole === 'admin';

  const canEditDemographics = isAdmin || isReceptionist;
  const canAppendClinicalHistory = isAdmin || isDoctor;

  if (loading) {
    return (
      <div className="patients-page" aria-busy="true" aria-label="Loading…">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton-row">
            <LoadingSkeleton variant="text" width="120px" />
            <LoadingSkeleton variant="text" width="200px" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-centered">
        <EmptyState icon={Search} message={error} actionLabel="Retry" onAction={refetch} />
      </div>
    );
  }

  return (
    <div className="patients-page">
      {/* Simulation Controls */}
      <div className="patients-toolbar" role="toolbar" aria-label="Module simulation parameters">
        <div className="toolbar-title-area">
          <h2>Patient Registry</h2>
          <p>Search, register, and review clinical chart records</p>
        </div>
        <div className="toolbar-controls">
          <label htmlFor="role-select" className="label-sm-bold">Mock User Role:</label>
          <select
            id="role-select"
            value={userRole}
            onChange={(e) => {
              setUserRole(e.target.value);
              // reset views to prevent invalid state configurations
              setActiveView('list');
            }}
            className="role-dropdown"
          >
            <option value="admin">Role: Admin (Full Access)</option>
            <option value="receptionist">Role: Receptionist (Demographics Only)</option>
            <option value="doctor">Role: Doctor (Clinical/Medical Only)</option>
          </select>
        </div>
      </div>

      {/* Screen 1: Patient List View */}
      {activeView === 'list' && (
        <>
          <div className="search-actions-bar">
            <div className="search-input-group">
              <Search className="search-icon" size={18} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by name, MRN, or phone..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search patient registry"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="reg-start">Reg Date:</label>
              <input
                id="reg-start"
                type="date"
                className="filter-date-input"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                aria-label="Filter registration start date"
              />
              <span aria-hidden="true">to</span>
              <input
                type="date"
                className="filter-date-input"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                aria-label="Filter registration end date"
              />
            </div>

            {canEditDemographics && (
              <button className="action-btn action-btn-primary" onClick={openRegisterForm}>
                <UserPlus size={18} />
                <span>Register New Patient</span>
              </button>
            )}
          </div>

          {/* Close duplicate match banner alert */}
          {duplicateWarning && searchQuery && (
            <div className="duplicate-warning-banner" role="alert">
              <AlertTriangle className="warning-icon" size={20} />
              <div className="warning-content">
                <h4>Potential Duplicate Record Found</h4>
                <p>A patient named <strong>"{searchQuery}"</strong> already exists in the system. Please verify registration logs before adding a duplicate profile.</p>
                <div className="warning-actions">
                  <button
                    className="warning-btn"
                    onClick={() => {
                      const match = patients.find(p => p.name.toLowerCase() === searchQuery.toLowerCase().trim());
                      if (match) {
                        setSelectedPatientId(match.id);
                        setActiveView('profile');
                        setActiveTab('demographics');
                      }
                    }}
                  >
                    View Existing Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List Table */}
          <div className="table-container">
            {filteredPatients.length === 0 ? (
              <EmptyState icon={Search} message="No patients found matching your search filters." />
            ) : (
              <table className="patients-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age/DOB</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Last Visit</th>
                    <th aria-label="Actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPatients.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setActiveView('profile');
                        setActiveTab('demographics');
                      }}
                      tabIndex="0"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSelectedPatientId(p.id);
                          setActiveView('profile');
                          setActiveTab('demographics');
                        }
                      }}
                      aria-label={`View clinical file for ${p.name}`}
                    >
                      <td><span className="mrn-code">{p.id}</span></td>
                      <td className="cell-bold">{p.name}</td>
                      <td>{p.age} yrs ({p.dob})</td>
                      <td>{p.gender}</td>
                      <td>{p.phone}</td>
                      <td>{p.lastVisit}</td>
                      <td className="patients-row-actions">
                        <button
                          className="icon-btn"
                          title="View medical history"
                          aria-label={`View medical history for ${p.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatientId(p.id);
                            setActiveView('profile');
                            setActiveTab('history');
                          }}
                        >
                          <FileText size={15} aria-hidden="true" />
                        </button>
                        {isAdmin && (
                          <button
                            className="icon-btn icon-btn--danger"
                            title="Delete patient"
                            aria-label={`Delete patient ${p.name}`}
                            onClick={(e) => { e.stopPropagation(); setModal({ type: 'delete', data: p }); }}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredPatients.length > 0 && totalPages > 1 && (
            <nav className="pagination" aria-label="Patient list pagination">
              <button
                className="pagination-btn"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-btn ${page === safePage ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === safePage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}

      {/* Screen 2: Patient Registration Form */}
      {activeView === 'register' && (
        <div className="table-container form-container--padded">
          <div className="form-back-header">
            <button
              onClick={() => setActiveView('list')}
              className="btn-back"
              aria-label="Back to patient list"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <h3 className="form-section-title">Patient Demographics Registration</h3>
          </div>

          <form onSubmit={handleRegisterSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="reg-name">Full Name *</label>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Muhammad Ali"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className={validationErrors.name ? 'error-field' : ''}
                />
                {validationErrors.name && <span className="error-message">{validationErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-dob">Date of Birth *</label>
                <input
                  id="reg-dob"
                  type="date"
                  value={regForm.dob}
                  onChange={(e) => setRegForm({ ...regForm, dob: e.target.value })}
                  className={validationErrors.dob ? 'error-field' : ''}
                />
                {validationErrors.dob && <span className="error-message">{validationErrors.dob}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-gender">Gender *</label>
                <select
                  id="reg-gender"
                  value={regForm.gender}
                  onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reg-phone">Phone Number *</label>
                <input
                  id="reg-phone"
                  type="text"
                  placeholder="e.g. 0300-1234567"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className={validationErrors.phone ? 'error-field' : ''}
                />
                {validationErrors.phone && <span className="error-message">{validationErrors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-cnic">National ID / CNIC *</label>
                <input
                  id="reg-cnic"
                  type="text"
                  placeholder="e.g. 42101-1234567-1"
                  value={regForm.cnic}
                  onChange={(e) => setRegForm({ ...regForm, cnic: e.target.value })}
                  className={validationErrors.cnic ? 'error-field' : ''}
                />
                {validationErrors.cnic && <span className="error-message">{validationErrors.cnic}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reg-emergency">Emergency Contact (Name, Relation & Phone) *</label>
                <input
                  id="reg-emergency"
                  type="text"
                  placeholder="e.g. Sara Khan (Wife) - 0300-9876543"
                  value={regForm.emergencyContact}
                  onChange={(e) => setRegForm({ ...regForm, emergencyContact: e.target.value })}
                  className={validationErrors.emergencyContact ? 'error-field' : ''}
                />
                {validationErrors.emergencyContact && <span className="error-message">{validationErrors.emergencyContact}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="reg-address">Residential Address *</label>
                <textarea
                  id="reg-address"
                  placeholder="Street address, block, area..."
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  className={validationErrors.address ? 'error-field' : ''}
                />
                {validationErrors.address && <span className="error-message">{validationErrors.address}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-btn action-btn-secondary"
                onClick={() => setActiveView('list')}
              >
                Cancel
              </button>
              <button type="submit" className="action-btn action-btn-primary">
                Register Demographics
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Screen 3: Patient Profile Detail View */}
      {activeView === 'profile' && activePatient && (
        <div className="profile-grid">
          {/* Sidebar Detail Card */}
          <div className="profile-sidebar">
            <button
              onClick={() => setActiveView('list')}
              className="btn-back-profile"
              aria-label="Return to list of patients"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Back to Registry</span>
            </button>

            <div className="profile-avatar-section">
              <div className="profile-avatar" aria-hidden="true">
                {activePatient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3>{activePatient.name}</h3>
              <span className="profile-mrn">{activePatient.id}</span>
            </div>

            <div className="profile-summary-list">
              <div className="summary-item">
                <span className="summary-label">Age / Gender</span>
                <span className="summary-value">{activePatient.age} yrs / {activePatient.gender}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Phone Number</span>
                <span className="summary-value">{activePatient.phone}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">CNIC / ID</span>
                <span className="summary-value">{activePatient.cnic}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Registration Date</span>
                <span className="summary-value">{activePatient.registrationDate}</span>
              </div>
            </div>
          </div>

          {/* Main Tabbed Information Content */}
          <div className="profile-content">
            <div className="tabs-header" role="tablist">
              <button
                className={`tab-btn ${activeTab === 'demographics' ? 'active' : ''}`}
                onClick={() => setActiveTab('demographics')}
                role="tab"
                aria-selected={activeTab === 'demographics'}
              >
                Demographics
              </button>
              <button
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
                role="tab"
                aria-selected={activeTab === 'history'}
              >
                Medical History
              </button>
              <button
                className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
                role="tab"
                aria-selected={activeTab === 'appointments'}
              >
                Appointments
              </button>
              <button
                className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('prescriptions')}
                role="tab"
                aria-selected={activeTab === 'prescriptions'}
              >
                Prescriptions
              </button>
            </div>

            {/* TAB PANELS */}
            <div className="tab-panel">
              {/* Tab A: Demographics (Editable only by Receptionist/Admin) */}
              {activeTab === 'demographics' && (
                <div>
                  <h3 className="section-heading">Patient Contact and Identification</h3>
                  
                  {!canEditDemographics ? (
                    // Hides demographic edit fields for Doctor
                    <div className="form-grid">
                      <div className="summary-item">
                        <span className="summary-label">Full Name</span>
                        <span className="summary-value">{activePatient.name}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Date of Birth</span>
                        <span className="summary-value">{activePatient.dob}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Gender</span>
                        <span className="summary-value">{activePatient.gender}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Phone</span>
                        <span className="summary-value">{activePatient.phone}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">National ID / CNIC</span>
                        <span className="summary-value">{activePatient.cnic}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Emergency Contact Details</span>
                        <span className="summary-value">{activePatient.emergencyContact}</span>
                      </div>
                      <div className="summary-item full-width">
                        <span className="summary-label">Residential Address</span>
                        <span className="summary-value">{activePatient.address}</span>
                      </div>
                    </div>
                  ) : (
                    // Demographics editor for Admin & Receptionist
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      alert('Demographics successfully updated in secure database.');
                    }}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="edit-name">Full Name</label>
                          <input
                            id="edit-name"
                            type="text"
                            value={activePatient.name}
                            onChange={(e) => {
                              const updated = patients.map(p => p.id === activePatient.id ? { ...p, name: e.target.value } : p);
                              setPatients(updated);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit-dob">Date of Birth</label>
                          <input
                            id="edit-dob"
                            type="date"
                            value={activePatient.dob}
                            onChange={(e) => {
                              const updated = patients.map(p => p.id === activePatient.id ? { ...p, dob: e.target.value, age: calculateAge(e.target.value) } : p);
                              setPatients(updated);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit-gender">Gender</label>
                          <select
                            id="edit-gender"
                            value={activePatient.gender}
                            onChange={(e) => {
                              const updated = patients.map(p => p.id === activePatient.id ? { ...p, gender: e.target.value } : p);
                              setPatients(updated);
                            }}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit-phone">Phone Number</label>
                          <input
                            id="edit-phone"
                            type="text"
                            value={activePatient.phone}
                            onChange={(e) => {
                              const updated = patients.map(p => p.id === activePatient.id ? { ...p, phone: e.target.value } : p);
                              setPatients(updated);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit-cnic">CNIC</label>
                          <input
                            id="edit-cnic"
                            type="text"
                            value={activePatient.cnic}
                            onChange={(e) => {
                              const updated = patients.map(p => p.id === activePatient.id ? { ...p, cnic: e.target.value } : p);
                              setPatients(updated);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="edit-emergency">Emergency Contact</label>
                          <input
                            id="edit-emergency"
                            type="text"
                            value={activePatient.emergencyContact}
                            onChange={(e) => {
                              const updated = patients.map(p => p.id === activePatient.id ? { ...p, emergencyContact: e.target.value } : p);
                              setPatients(updated);
                            }}
                          />
                        </div>
                        <div className="form-group full-width">
                          <label htmlFor="edit-address">Residential Address</label>
                          <textarea
                            id="edit-address"
                            value={activePatient.address}
                            onChange={(e) => {
                              const updated = patients.map(p => p.id === activePatient.id ? { ...p, address: e.target.value } : p);
                              setPatients(updated);
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="action-btn action-btn-primary">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Tab B: Medical History (READ-ONLY display, Append-Only notes log) */}
              {activeTab === 'history' && (
                <div className="medical-history-tab">
                  {canAppendClinicalHistory ? (
                    // Demographics/medical notes editor for Doctors & Admins
                    <form onSubmit={handleAddClinicalNote} className="append-clinical-note-section">
                      <label htmlFor="clinical-entry" className="label-sm-bold">Append Clinical Entry</label>
                      <textarea
                        id="clinical-entry"
                        placeholder="Type diagnosis notes, recommendations, or symptoms. Submitting appends this entry immutably to the patient's record..."
                        value={historyNote}
                        onChange={(e) => setHistoryNote(e.target.value)}
                        className="clinical-note-textarea"
                      />
                      <button
                        type="submit"
                        className="action-btn action-btn-primary btn-append"
                      >
                        <Plus size={16} />
                        <span>Append Entry</span>
                      </button>
                    </form>
                  ) : (
                    // Receptionists cannot see clinical entry controls
                    <div className="access-restricted-notice">
                      🔒 Clinical note additions are restricted to medical personnel (Doctors/Admins).
                    </div>
                  )}

                  {/* Read-Only Timeline */}
                  <div className="clinical-timeline">
                    {activePatient.medicalHistory.length === 0 ? (
                      <EmptyState icon={FileText} message="No clinical history entries logged for this patient." />
                    ) : (
                      <ul aria-label="Chronological medical records log">
                        {activePatient.medicalHistory.map((history) => (
                          <li key={history.id} className="timeline-item">
                            <div className="timeline-marker">
                              <span className="timeline-dot" aria-hidden="true" />
                              <span className="timeline-line" aria-hidden="true" />
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-meta">
                                <span className="timeline-doctor">{history.doctor}</span>
                                <span>{history.date}</span>
                              </div>
                              <p className="timeline-note">{history.note}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Tab C: Linked Appointments */}
              {activeTab === 'appointments' && (
                <div className="appointment-list-tab">
                  {activePatient.appointments.length === 0 ? (
                    <EmptyState icon={FileText} message="No appointments scheduled." />
                  ) : (
                    activePatient.appointments.map((apt) => (
                      <div key={apt.id} className="appointment-card">
                        <div className="apt-date-time">
                          <span className="apt-date">{apt.date}</span>
                          <span className="apt-time-label">{apt.time} - {apt.doctor}</span>
                        </div>
                        <StatusBadge status={apt.status} />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab D: Linked Prescriptions */}
              {activeTab === 'prescriptions' && (
                <div className="prescriptions-list-tab">
                  {activePatient.prescriptions.length === 0 ? (
                    <EmptyState icon={FileText} message="No active prescriptions found." />
                  ) : (
                    activePatient.prescriptions.map((presc) => (
                      <div key={presc.id} className="prescription-card">
                        <div className="prescription-header-row">
                          <span>Authorized by: {presc.doctor}</span>
                          <span>Issued: {presc.date}</span>
                        </div>
                        <ul className="medications-list">
                          {presc.medications.map((med, idx) => (
                            <li key={idx} className="medication-item">• {med}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Delete Patient Record"
          message={`Are you sure you want to permanently delete ${modal.data.name} (${modal.data.id})? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => handleDeletePatient(modal.data)}
          onClose={() => setModal(null)}
        />
      )}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default Patients;
