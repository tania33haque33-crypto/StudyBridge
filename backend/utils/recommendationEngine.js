const University = require('../models/University');
const Scholarship = require('../models/Scholarship');

// Calculate match score based on user preferences
const calculateMatchScore = (university, userProfile) => {
  let score = 0;

  // Country preference
  if (userProfile.preferredCountries?.includes(university.country)) {
    score += 30;
  }

  // Budget match
  if (userProfile.budget?.max) {
    const tuition = university.tuitionFees?.undergraduate?.international?.amount || 0;
    if (tuition <= userProfile.budget.max) {
      score += 25;
    } else if (tuition <= userProfile.budget.max * 1.2) {
      score += 15;
    }
  }

  // Course availability
  if (userProfile.preferredCourses?.length > 0) {
    const hasPreferredCourse = university.programs?.some(program =>
      userProfile.preferredCourses.some(course =>
        program.name.toLowerCase().includes(course.toLowerCase())
      )
    );
    if (hasPreferredCourse) {
      score += 25;
    }
  }

  // Study level match
  if (userProfile.studyLevel) {
    const hasLevel = university.programs?.some(p => p.level === userProfile.studyLevel);
    if (hasLevel) {
      score += 10;
    }
  }

  // Rating bonus
  if (university.averageRating >= 4.5) {
    score += 10;
  } else if (university.averageRating >= 4.0) {
    score += 5;
  }

  return score;
};

// Get university recommendations
exports.getUniversityRecommendations = async (userProfile, limit = 10) => {
  try {
    const query = { isActive: true };

    // Filter by preferred countries if specified
    if (userProfile.preferredCountries?.length > 0) {
      query.country = { $in: userProfile.preferredCountries };
    }

    const universities = await University.find(query)
      .select('name country city logo rankings averageRating programs tuitionFees')
      .limit(50); // Get more to score and filter

    // Calculate match scores
    const scoredUniversities = universities.map(uni => ({
      university: uni,
      matchScore: calculateMatchScore(uni.toObject(), userProfile)
    }));

    // Sort by match score and return top recommendations
    const recommendations = scoredUniversities
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .map(item => ({
        ...item.university.toObject(),
        matchScore: item.matchScore
      }));

    return recommendations;
  } catch (error) {
    console.error('Recommendation error:', error);
    throw error;
  }
};

// Get scholarship recommendations
exports.getScholarshipRecommendations = async (userProfile, limit = 10) => {
  try {
    const query = {
      isActive: true,
      deadline: { $gte: new Date() }
    };

    // Filter by study level
    if (userProfile.studyLevel) {
      query.studyLevel = userProfile.studyLevel;
    }

    // Filter by nationality if specified
    if (userProfile.nationality) {
      query.$or = [
        { 'eligibilityCriteria.nationality': userProfile.nationality },
        { 'eligibilityCriteria.nationality': { $size: 0 } }
      ];
    }

    const scholarships = await Scholarship.find(query)
      .sort('-amount.value')
      .limit(limit);

    return scholarships;
  } catch (error) {
    console.error('Scholarship recommendation error:', error);
    throw error;
  }
};

// Calculate eligibility score for a scholarship
exports.calculateEligibilityScore = (scholarship, userProfile) => {
  let score = 100;

  // Check nationality
  if (scholarship.eligibilityCriteria?.nationality?.length > 0) {
    if (!scholarship.eligibilityCriteria.nationality.includes(userProfile.nationality)) {
      score -= 50;
    }
  }

  // Check GPA
  if (scholarship.eligibilityCriteria?.minimumGPA) {
    if (!userProfile.gpa || userProfile.gpa < scholarship.eligibilityCriteria.minimumGPA) {
      score -= 30;
    }
  }

  // Check study level
  if (scholarship.studyLevel?.length > 0) {
    if (!scholarship.studyLevel.includes(userProfile.studyLevel)) {
      score -= 20;
    }
  }

  return Math.max(0, score);
};