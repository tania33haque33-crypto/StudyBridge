// Email validation
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!regex.test(email)) return 'Invalid email format';
  return '';
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character';
  return '';
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.length > 50) return `${fieldName} must not exceed 50 characters`;
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${fieldName} contains invalid characters`;
  return '';
};

// Phone number validation
export const validatePhone = (phone) => {
  if (!phone) return '';  // Optional field
  const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  if (!regex.test(phone)) return 'Invalid phone number format';
  return '';
};

// Date validation
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) return `${fieldName} is required`;
  const selectedDate = new Date(date);
  const today = new Date();
  if (isNaN(selectedDate.getTime())) return 'Invalid date';
  if (selectedDate > today) return 'Date cannot be in the future';
  return '';
};

// Future date validation (for deadlines)
export const validateFutureDate = (date, fieldName = 'Date') => {
  if (!date) return `${fieldName} is required`;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(selectedDate.getTime())) return 'Invalid date';
  if (selectedDate < today) return 'Date must be in the future';
  return '';
};

// URL validation
export const validateURL = (url) => {
  if (!url) return '';  // Optional field
  try {
    new URL(url);
    return '';
  } catch (e) {
    return 'Invalid URL format';
  }
};

// GPA validation
export const validateGPA = (gpa, scale = 4.0) => {
  if (!gpa) return 'GPA is required';
  const gpaNum = parseFloat(gpa);
  if (isNaN(gpaNum)) return 'GPA must be a number';
  if (gpaNum < 0 || gpaNum > scale) return `GPA must be between 0 and ${scale}`;
  return '';
};

// Test score validation
export const validateTestScore = (score, testType) => {
  const ranges = {
    IELTS: { min: 0, max: 9 },
    TOEFL: { min: 0, max: 120 },
    GRE: { min: 260, max: 340 },
    GMAT: { min: 200, max: 800 },
    SAT: { min: 400, max: 1600 },
  };

  if (!score) return `${testType} score is required`;
  const scoreNum = parseFloat(score);
  if (isNaN(scoreNum)) return 'Score must be a number';

  const range = ranges[testType];
  if (range && (scoreNum < range.min || scoreNum > range.max)) {
    return `${testType} score must be between ${range.min} and ${range.max}`;
  }

  return '';
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  } = options;

  if (!file) return 'File is required';
  if (file.size > maxSize) {
    return `File size must not exceed ${(maxSize / 1024 / 1024).toFixed(2)}MB`;
  }
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }
  return '';
};

// Required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} is required`;
  }
  return '';
};

// Number range validation
export const validateNumberRange = (value, min, max, fieldName = 'Value') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  const num = parseFloat(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < min) return `${fieldName} must be at least ${min}`;
  if (num > max) return `${fieldName} must not exceed ${max}`;
  return '';
};

// Text length validation
export const validateLength = (value, min, max, fieldName = 'Field') => {
  if (!value) return `${fieldName} is required`;
  const length = value.toString().length;
  if (length < min) return `${fieldName} must be at least ${min} characters`;
  if (length > max) return `${fieldName} must not exceed ${max} characters`;
  return '';
};

// Array validation
export const validateArray = (arr, minLength = 1, fieldName = 'Field') => {
  if (!arr || !Array.isArray(arr) || arr.length < minLength) {
    return `Please select at least ${minLength} ${fieldName.toLowerCase()}`;
  }
  return '';
};

// Composite form validation
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field];

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validatePhone,
  validateDate,
  validateFutureDate,
  validateURL,
  validateGPA,
  validateTestScore,
  validateFile,
  validateRequired,
  validateNumberRange,
  validateLength,
  validateArray,
  validateForm,
};