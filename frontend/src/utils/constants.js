// Application status
export const APPLICATION_STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WAITLISTED: 'Waitlisted',
  DEFERRED: 'Deferred',
};

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// Study levels
export const STUDY_LEVELS = [
  'Undergraduate',
  'Postgraduate',
  'PhD',
  'Diploma',
];

// University types
export const UNIVERSITY_TYPES = [
  'Public',
  'Private',
  'Research',
  'Liberal Arts',
  'Technical',
];

// Language tests
export const LANGUAGE_TESTS = {
  IELTS: 'IELTS',
  TOEFL: 'TOEFL',
  PTE: 'PTE',
  DUOLINGO: 'Duolingo',
};

// Standardized tests
export const STANDARDIZED_TESTS = {
  GRE: 'GRE',
  GMAT: 'GMAT',
  SAT: 'SAT',
  ACT: 'ACT',
};

// Intake periods
export const INTAKE_PERIODS = ['Fall', 'Spring', 'Summer', 'Winter'];

// Scholarship types
export const SCHOLARSHIP_TYPES = [
  'University',
  'Government',
  'Private',
  'Merit-based',
  'Need-based',
  'Sports',
  'Research',
];

// Document types
export const DOCUMENT_TYPES = [
  'Transcript',
  'SOP',
  'LOR',
  'Resume',
  'Test Score',
  'Passport',
  'Financial Document',
  'Other',
];

// Countries (sample)
export const COUNTRIES = [
  'USA',
  'UK',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Singapore',
  'New Zealand',
  'Ireland',
];

// Notification types
export const NOTIFICATION_TYPES = {
  APPLICATION: 'application',
  DEADLINE: 'deadline',
  SCHOLARSHIP: 'scholarship',
  MESSAGE: 'message',
  REVIEW: 'review',
  SYSTEM: 'system',
  ANNOUNCEMENT: 'announcement',
  REMINDER: 'reminder',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  UNIVERSITIES: '/api/universities',
  SCHOLARSHIPS: '/api/scholarships',
  APPLICATIONS: '/api/applications',
  REVIEWS: '/api/reviews',
  VISA: '/api/visa',
  ADMIN: '/api/admin',
  NOTIFICATIONS: '/api/notifications',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'text/plain'],
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  TIME: 'HH:mm:ss',
  DATETIME: 'MMM dd, yyyy HH:mm',
};

// Social media
export const SOCIAL_MEDIA = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
};

export default {
  APPLICATION_STATUS,
  USER_ROLES,
  STUDY_LEVELS,
  UNIVERSITY_TYPES,
  LANGUAGE_TESTS,
  STANDARDIZED_TESTS,
  INTAKE_PERIODS,
  SCHOLARSHIP_TYPES,
  DOCUMENT_TYPES,
  COUNTRIES,
  NOTIFICATION_TYPES,
  API_ENDPOINTS,
  PAGINATION,
  FILE_UPLOAD,
  DATE_FORMATS,
  SOCIAL_MEDIA,
};