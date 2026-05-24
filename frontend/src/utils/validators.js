// Email validation
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// Phone number validation
export const isValidPhone = (phone) => {
  const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return regex.test(phone);
};

// URL validation
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

// File size validation (in MB)
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// File type validation
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// GPA validation
export const isValidGPA = (gpa, scale = 4.0) => {
  const numGPA = parseFloat(gpa);
  return !isNaN(numGPA) && numGPA >= 0 && numGPA <= scale;
};

// Date validation (not in past)
export const isNotPastDate = (date) => {
  return new Date(date) >= new Date();
};

// Required field validation
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Min/Max length validation
export const isValidLength = (value, min, max) => {
  const length = value.toString().length;
  return length >= min && length <= max;
};

// Numeric validation
export const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Range validation
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return num >= min && num <= max;
};

export default {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidURL,
  isValidFileSize,
  isValidFileType,
  isValidGPA,
  isNotPastDate,
  isRequired,
  isValidLength,
  isNumeric,
  isInRange,
};