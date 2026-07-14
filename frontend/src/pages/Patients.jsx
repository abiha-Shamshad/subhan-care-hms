import { useState } from 'react';
import { Search, UserPlus, FileText, AlertTriangle, ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../hooks/useToast';
import './Patients.css';

const PAGE_SIZE = 6;

// Initial Mock Patients Database
const INITIAL_PATIENTS = [
  {
    id: 'PT-1001',
    name: 'Ahmed Khan',
    dob: '1985-05-12',
    age: 41,
    gender: 'Male',
    phone: '0300-1234567',
    cnic: '42101-1234567-1',
    address: 'Flat 402, Block C, Gulshan-e-Iqbal, Karachi',
    emergencyContact: 'Sara Khan (Wife) - 0300-9876543',
    lastVisit: '2026-06-28',
    registrationDate: '2026-01-15',
    medicalHistory: [
      { id: 1, date: '2026-06-28', doctor: 'Dr. Fatima Noor', note: 'Patient presented with mild chest tightness. ECG performed: normal sinus rhythm. Advised lifestyle changes and follow-up in 2 weeks.' },
      { id: 2, date: '2026-03-10', doctor: 'Dr. Usman Ali', note: 'Reviewed chronic back pain. Prescribed physiotherapy sessions and muscle relaxants. Avoid heavy lifting.' }
    ],
    appointments: [
      { id: 101, date: '2026-07-02', time: '09:00 AM', doctor: 'Dr. Fatima Noor', status: 'confirmed' },
      { id: 102, date: '2026-07-15', time: '11:00 AM', doctor: 'Dr. Usman Ali', status: 'pending' }
    ],
    prescriptions: [
      { id: 201, date: '2026-06-28', doctor: 'Dr. Fatima Noor', medications: ['Aspirin 75mg - Once daily', 'Atorvastatin 10mg - At night'] }
    ]
  },
  {
    id: 'PT-1002',
    name: 'Sara Malik',
    dob: '1992-08-23',
    age: 33,
    gender: 'Female',
    phone: '0321-7654321',
    cnic: '42201-9876543-2',
    address: 'House 42, Street 5, DHA Phase 6, Karachi',
    emergencyContact: 'Tariq Malik (Husband) - 0321-1122334',
    lastVisit: '2026-07-01',
    registrationDate: '2026-02-20',
    medicalHistory: [
      { id: 1, date: '2026-07-01', doctor: 'Dr. Usman Ali', note: 'Post-op review of ankle fracture. Healing is on track. Cast removed. Referred to physical therapy for range of motion exercises.' }
    ],
    appointments: [
      { id: 103, date: '2026-07-02', time: '09:30 AM', doctor: 'Dr. Usman Ali', status: 'confirmed' }
    ],
    prescriptions: [
      { id: 202, date: '2026-07-01', doctor: 'Dr. Usman Ali', medications: ['Ibuprofen 400mg - Twice daily as needed'] }
    ]
  },
  {
    id: 'PT-1003',
    name: 'Hassan Raza',
    dob: '1978-11-04',
    age: 47,
    gender: 'Male',
    phone: '0333-5556667',
    cnic: '42301-5555555-5',
    address: 'Apartment B-12, Askari 4, Karachi',
    emergencyContact: 'Zubair Raza (Brother) - 0333-9998887',
    lastVisit: '2026-06-15',
    registrationDate: '2026-03-01',
    medicalHistory: [],
    appointments: [
      { id: 104, date: '2026-07-02', time: '10:00 AM', doctor: 'Dr. Ayesha Tariq', status: 'pending' }
    ],
    prescriptions: []
  },
  { id: 'PT-1004', name: 'Zainab Bibi', dob: '1990-02-18', age: 36, gender: 'Female', phone: '0301-2223344', cnic: '42101-2223344-6', address: 'House 8, Gulberg III, Lahore', emergencyContact: 'Imran Ali (Brother) - 0301-5556677', lastVisit: '2026-06-20', registrationDate: '2026-03-12', medicalHistory: [], appointments: [], prescriptions: [] },
  { id: 'PT-1005', name: 'Bilal Hussain', dob: '1983-09-30', age: 42, gender: 'Male', phone: '0302-3334455', cnic: '42101-3334455-7', address: 'Flat 12, Model Town, Lahore', emergencyContact: 'Ayesha Hussain (Wife) - 0302-8889900', lastVisit: '2026-06-25', registrationDate: '2026-03-18', medicalHistory: [], appointments: [], prescriptions: [] },
  { id: 'PT-1006', name: 'Maryam Sheikh', dob: '1998-12-05', age: 27, gender: 'Female', phone: '0303-4445566', cnic: '42101-4445566-8', address: 'House 55, Bahria Town, Rawalpindi', emergencyContact: 'Kamran Sheikh (Father) - 0303-1112233', lastVisit: '2026-07-01', registrationDate: '2026-04-02', medicalHistory: [], appointments: [], prescriptions: [] },
  { id: 'PT-1007', name: 'Ali Raza', dob: '1975-06-14', age: 51, gender: 'Male', phone: '0304-5556677', cnic: '42101-5556677-9', address: 'Apartment 3B, Clifton, Karachi', emergencyContact: 'Nadia Raza (Wife) - 0304-2223344', lastVisit: '2026-06-18', registrationDate: '2026-04-10', medicalHistory: [], appointments: [], prescriptions: [] },
  { id: 'PT-1008', name: 'Nadia Perveen', dob: '1988-03-22', age: 38, gender: 'Female', phone: '0305-6667788', cnic: '42101-6667788-1', address: 'House 21, Johar Town, Lahore', emergencyContact: 'Faisal Perveen (Husband) - 0305-3334455', lastVisit: '2026-06-30', registrationDate: '2026-04-19', medicalHistory: [], appointments: [], prescriptions: [] },
  { id: 'PT-1009', name: 'Usman Ghani', dob: '1995-07-09', age: 30, gender: 'Male', phone: '0306-7778899', cnic: '42101-7778899-2', address: 'Street 9, F-8, Islamabad', emergencyContact: 'Sana Ghani (Sister) - 0306-4445566', lastVisit: '2026-06-22', registrationDate: '2026-05-03', medicalHistory: [], appointments: [], prescriptions: [] },
  { id: 'PT-1010', name: 'Fatima Zahra', dob: '2001-11-28', age: 24, gender: 'Female', phone: '0307-8889900', cnic: '42101-8889900-3', address: 'House 14, Wapda Town, Lahore', emergencyContact: 'Hassan Zahra (Father) - 0307-5556677', lastVisit: '2026-07-02', registrationDate: '2026-05-15', medicalHistory: [], appointments: [], prescriptions: [] },
  { id: 'PT-1011', name: 'Kamran Shah', dob: '1970-04-03', age: 56, gender: 'Male', phone: '0308-9990011', cnic: '42101-9990011-4', address: 'Bungalow 7, Cantt, Peshawar', emergencyContact: 'Rahat Shah (Son) - 0308-6667788', lastVisit: '2026-06-12', registrationDate: '2026-05-22', medicalHistory: [], appointments: [], prescriptions: [] },
  { id: 'PT-1012', name: 'Hina Saeed', dob: '1993-08-17', age: 32, gender: 'Female', phone: '0309-0001122', cnic: '42101-0001122-5', address: 'Flat 9C, Gulshan, Karachi', emergencyContact: 'Saeed Ahmed (Father) - 0309-7778899', lastVisit: '2026-06-29', registrationDate: '2026-06-01', medicalHistory: [], appointments: [], prescriptions: [] }
];

const Patients = () => {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
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
  const handleRegisterSubmit = (e) => {
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

    const newId = `PT-${1000 + patients.length + 1}`;
    const newPatient = {
      id: newId,
      ...regForm,
      age: calculateAge(regForm.dob),
      lastVisit: 'New Registration',
      registrationDate: new Date().toISOString().split('T')[0],
      medicalHistory: [],
      appointments: [],
      prescriptions: []
    };

    setPatients([newPatient, ...patients]);
    setSelectedPatientId(newId);
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
              <button
                className="action-btn action-btn-primary"
                onClick={() => {
                  setActiveView('register');
                  setRegForm({
                    name: '',
                    dob: '',
                    gender: 'Male',
                    phone: '',
                    cnic: '',
                    address: '',
                    emergencyContact: ''
                  });
                  setValidationErrors({});
                  setDuplicateWarning(false);
                }}
              >
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
