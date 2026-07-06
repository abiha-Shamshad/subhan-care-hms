/**
 * @typedef {'admin'|'doctor'|'receptionist'|'pharmacist'|'billing'} Role
 */

/**
 * @typedef {'F'|'R'|'L'|null} AccessLevel
 */

/**
 * @typedef {Object} Patient
 * @property {string} id
 * @property {string} name
 * @property {string} dob
 * @property {number} age
 * @property {'Male'|'Female'|'Other'} gender
 * @property {string} phone
 * @property {string} cnic
 * @property {string} address
 * @property {string} emergencyContact
 * @property {string} lastVisit
 * @property {string} registrationDate
 * @property {MedicalHistoryEntry[]} medicalHistory
 * @property {Appointment[]} appointments
 * @property {Prescription[]} prescriptions
 */

/**
 * @typedef {Object} MedicalHistoryEntry
 * @property {string|number} id
 * @property {string} date
 * @property {string} doctor
 * @property {string} note
 * @property {string} [timestamp]
 * @property {string} [diagnosis]
 */

/**
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {string} patientName
 * @property {string} patientId
 * @property {string} doctor
 * @property {string} date
 * @property {string} time
 * @property {string} type
 * @property {'pending'|'confirmed'|'completed'|'cancelled'} status
 * @property {string} [notes]
 */

/**
 * @typedef {Object} Medication
 * @property {string} name
 * @property {string} dosage
 * @property {string} frequency
 * @property {string} duration
 * @property {string} [instructions]
 */

/**
 * @typedef {Object} Prescription
 * @property {string} id
 * @property {string} patient
 * @property {string} doctor
 * @property {string} date
 * @property {string} diagnosis
 * @property {Medication[]} medications
 * @property {string} [notes]
 * @property {'pending'|'dispensed'} status
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} patient
 * @property {string} date
 * @property {string} dueDate
 * @property {Array<{name:string, qty:number, rate:number}>} services
 * @property {number} discount
 * @property {number} paid
 * @property {'paid'|'partial'|'unpaid'|'overdue'} status
 */

/**
 * @typedef {Object} InventoryItem
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} unit
 * @property {number} quantity
 * @property {number} reorderLevel
 * @property {number} rate
 * @property {string} [supplier]
 * @property {string} [expiry]
 * @property {'in-stock'|'low-stock'|'out-of-stock'} status
 */
