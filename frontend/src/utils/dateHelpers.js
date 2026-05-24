import { format, formatDistance, formatRelative, isAfter, isBefore, addDays, differenceInDays, parseISO } from 'date-fns';

// Format date to readable string
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Format date and time
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

// Get relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Relative time error:', error);
    return '';
  }
};

// Format relative date (e.g., "yesterday at 3:00 PM")
export const formatRelativeDate = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatRelative(dateObj, new Date());
  } catch (error) {
    console.error('Relative date error:', error);
    return '';
  }
};

// Calculate days until date
export const daysUntil = (date) => {
  if (!date) return 0;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInDays(dateObj, today);
  } catch (error) {
    console.error('Days until error:', error);
    return 0;
  }
};

// Check if date is in past
export const isPastDate = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isBefore(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

// Check if date is in future
export const isFutureDate = (date) => {
  if (!date) return false;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isAfter(dateObj, new Date());
  } catch (error) {
    return false;
  }
};

// Get deadline status
export const getDeadlineStatus = (deadline) => {
  const days = daysUntil(deadline);
  
  if (days < 0) {
    return { status: 'expired', color: 'error', label: 'Expired' };
  } else if (days <= 7) {
    return { status: 'urgent', color: 'error', label: `${days} days left` };
  } else if (days <= 30) {
    return { status: 'soon', color: 'warning', label: `${days} days left` };
  } else {
    return { status: 'upcoming', color: 'info', label: `${days} days left` };
  }
};

// Add days to date
export const addDaysToDate = (date, days) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return addDays(dateObj, days);
  } catch (error) {
    console.error('Add days error:', error);
    return null;
  }
};

// Get current academic year
export const getCurrentAcademicYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  // Academic year starts in September (month 8)
  if (month >= 8) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

// Get next intake dates
export const getNextIntakeDates = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const intakes = [
    { name: 'Fall', month: 8 },  // September
    { name: 'Spring', month: 0 }, // January
    { name: 'Summer', month: 4 }, // May
  ];

  const nextIntakes = [];

  for (const intake of intakes) {
    let intakeYear = year;
    if (intake.month < month) {
      intakeYear = year + 1;
    }
    
    const intakeDate = new Date(intakeYear, intake.month, 1);
    nextIntakes.push({
      name: intake.name,
      year: intakeYear,
      date: intakeDate,
      label: `${intake.name} ${intakeYear}`,
    });
  }

  return nextIntakes.sort((a, b) => a.date - b.date);
};

// Format date range
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = formatDate(startDate, 'MMM dd, yyyy');
  const end = formatDate(endDate, 'MMM dd, yyyy');
  
  return `${start} - ${end}`;
};

// Get age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  try {
    const dob = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Age calculation error:', error);
    return null;
  }
};

// Check if date is within range
export const isDateInRange = (date, startDate, endDate) => {
  try {
    const checkDate = typeof date === 'string' ? parseISO(date) : date;
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    return isAfter(checkDate, start) && isBefore(checkDate, end);
  } catch (error) {
    return false;
  }
};

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatRelativeDate,
  daysUntil,
  isPastDate,
  isFutureDate,
  getDeadlineStatus,
  addDaysToDate,
  getCurrentAcademicYear,
  getNextIntakeDates,
  formatDateRange,
  calculateAge,
  isDateInRange,
};