const University = require('../models/University');
const StudyProfile = require('../models/StudyProfile');

function convertGPA(gpa, fromScale = 5) {
  if (!gpa) return null;
  if (fromScale === 4) return parseFloat(gpa);
  return Math.round((gpa / fromScale) * 4 * 100) / 100;
}

function scoreUniversity(uni, profile) {
  let score = 0;
  const matchReasons = [];
  const warnings = [];

  const {
    studyLevel, preferredSubjects = [], budgetMax, budgetMin,
    ieltsOverall, hscGPA, bachelorCGPA, bachelorScale = '4.0', preferredCountries = []
  } = profile;

  const levelMap = { Bachelor: 'Undergraduate', Master: 'Postgraduate', PhD: 'PhD' };
  const targetLevel = levelMap[studyLevel] || 'Undergraduate';

  const relevantPrograms = (uni.programs || []).filter(p =>
    p.level === targetLevel && p.isActive !== false
  );

  // Country
  if (!preferredCountries.length || preferredCountries.includes(uni.country)) {
    score += 15;
    matchReasons.push(`Located in ${uni.country}`);
  }

  // Subject match
  if (preferredSubjects.length > 0) {
    const programTexts = [
      ...relevantPrograms.flatMap(p => [p.name, ...(p.specializations || [])]),
      ...(uni.programs || []).map(p => p.name),
    ].map(s => s?.toLowerCase()).filter(Boolean);

    const matched = preferredSubjects.filter(sub => {
      const s = sub.toLowerCase();
      return programTexts.some(pt => pt.includes(s) || s.split(' ').some(w => w.length > 3 && pt.includes(w)));
    });

    if (matched.length > 0) {
      score += Math.min(30, matched.length * 12);
      matchReasons.push(`Programs: ${matched.slice(0, 3).join(', ')}`);
    } else if (relevantPrograms.length > 0) {
      score -= 5;
    }
  } else {
    score += 10;
  }

  // Budget
  let effectiveTuition = studyLevel === 'Bachelor'
    ? uni.tuitionFees?.undergraduate?.international?.amount
    : uni.tuitionFees?.postgraduate?.international?.amount;

  if (!effectiveTuition && relevantPrograms.length > 0) {
    const amounts = relevantPrograms.map(p => p.tuitionFee?.amount).filter(Boolean);
    if (amounts.length) effectiveTuition = Math.min(...amounts);
  }

  if (budgetMax && effectiveTuition) {
    if (effectiveTuition <= budgetMax) {
      score += 20;
      matchReasons.push(`Within budget (~$${effectiveTuition.toLocaleString()}/yr)`);
    } else if (effectiveTuition <= budgetMax * 1.3) {
      score += 8;
      warnings.push(`Slightly over budget (~$${effectiveTuition.toLocaleString()}/yr)`);
    } else {
      score -= 10;
      warnings.push(`Above budget (~$${effectiveTuition.toLocaleString()}/yr)`);
    }
  }

  // IELTS
  const ieltsReqs = relevantPrograms
    .map(p => p.entryRequirements?.languageTest)
    .filter(lt => lt?.type === 'IELTS' && lt.minimumScore);

  if (ieltsReqs.length > 0 && ieltsOverall) {
    const minReq = Math.min(...ieltsReqs.map(r => r.minimumScore));
    if (ieltsOverall >= minReq) {
      score += 15;
      matchReasons.push(`IELTS ${ieltsOverall} meets requirement (min ${minReq})`);
    } else if (ieltsOverall >= minReq - 0.5) {
      score += 5;
      warnings.push(`IELTS ${ieltsOverall} close to requirement (min ${minReq})`);
    } else {
      score -= 10;
      warnings.push(`IELTS min: ${minReq} (yours: ${ieltsOverall})`);
    }
  } else if (ieltsOverall >= 6.5) {
    score += 10;
    matchReasons.push('Strong IELTS score');
  }

  // GPA
  let studentGPA = null;
  if (studyLevel === 'Bachelor') {
    studentGPA = convertGPA(hscGPA, 5);
  } else {
    studentGPA = bachelorScale === '5.0' ? convertGPA(bachelorCGPA, 5) : parseFloat(bachelorCGPA || 0);
  }

  const gpaReqs = relevantPrograms.map(p => p.entryRequirements?.minimumGPA).filter(Boolean);
  if (gpaReqs.length > 0 && studentGPA) {
    const minReq = Math.min(...gpaReqs);
    if (studentGPA >= minReq) {
      score += 15;
      matchReasons.push('Academic background meets requirements');
    } else if (studentGPA >= minReq - 0.3) {
      score += 5;
      warnings.push('GPA slightly below requirements');
    } else {
      score -= 5;
      warnings.push('GPA may not meet minimum requirements');
    }
  } else if (studentGPA >= 3.5) {
    score += 10;
    matchReasons.push('Strong academic background');
  }

  // QS Ranking
  const qsRank = uni.rankings?.qsRanking?.world;
  if (qsRank) {
    if (qsRank <= 100) { score += 10; matchReasons.push('Top 100 globally (QS)'); }
    else if (qsRank <= 300) { score += 7; matchReasons.push('Top 300 globally (QS)'); }
    else if (qsRank <= 500) score += 5;
    else if (qsRank <= 1000) score += 3;
  }

  // Acceptance rate
  if (uni.stats?.acceptanceRate > 70) score += 5;
  else if (uni.stats?.acceptanceRate > 40) score += 3;

  // English instruction
  if (uni.languageOfInstruction?.some(l => l.toLowerCase().includes('english'))) {
    score += 5;
    matchReasons.push('English medium');
  }

  // Normalize to 0–100%. Max possible score is ~115 (15+30+20+15+15+10+5+5)
  const MAX_SCORE = 115;
  const matchPercentage = Math.min(100, Math.round((Math.max(0, score) / MAX_SCORE) * 100));

  return { score: Math.max(0, score), matchPercentage, matchReasons, warnings, effectiveTuition };
}

// POST /api/study-profiles/match  (public - no auth needed)
exports.matchUniversities = async (req, res, next) => {
  try {
    const profile = req.body;

    if (!profile.studyLevel) {
      return res.status(400).json({ success: false, message: 'studyLevel is required' });
    }

    const query = { isActive: true };
    if (profile.preferredCountries?.length) {
      query.country = { $in: profile.preferredCountries };
    }

    const universities = await University.find(query)
      .select('name slug country city coverImage logo rankings stats programs tuitionFees languageOfInstruction universityType overview.description admissions scholarships')
      .lean();

    const scored = universities
      .map(uni => {
        const result = scoreUniversity(uni, profile);
        return { university: uni, ...result };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    res.status(200).json({
      success: true,
      total: scored.length,
      data: scored,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/study-profiles  (protected - save profile)
exports.saveProfile = async (req, res, next) => {
  try {
    const profile = await StudyProfile.findOneAndUpdate(
      { user: req.user.id },
      { ...req.body, user: req.user.id },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// GET /api/study-profiles/my  (protected)
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await StudyProfile.findOne({ user: req.user.id });
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// GET /api/study-profiles/community  (public)
exports.getCommunityProfiles = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, studyLevel, country, subject, sort = 'newest', q } = req.query;
    const query = { isPublic: true };
    if (studyLevel) query.studyLevel = studyLevel;
    if (country) query.preferredCountries = country;
    if (subject) query.preferredSubjects = subject;
    if (q && q.trim()) {
      query.$or = [
        { futureGoals: { $regex: q.trim(), $options: 'i' } },
        { displayName: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [profiles, total] = await Promise.all([
      StudyProfile.find(query)
        .sort(sortOrder)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'firstName lastName profilePicture'),
      StudyProfile.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: profiles,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/study-profiles/community/stats  (public)
exports.getCommunityStats = async (req, res, next) => {
  try {
    const [total, byLevel, withIELTS, topCountries] = await Promise.all([
      StudyProfile.countDocuments({ isPublic: true }),
      StudyProfile.aggregate([
        { $match: { isPublic: true } },
        { $group: { _id: '$studyLevel', count: { $sum: 1 } } },
      ]),
      StudyProfile.countDocuments({ isPublic: true, hasIELTS: true }),
      StudyProfile.aggregate([
        { $match: { isPublic: true, preferredCountries: { $exists: true, $ne: [] } } },
        { $unwind: '$preferredCountries' },
        { $group: { _id: '$preferredCountries', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byLevel: byLevel.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
        withIELTS,
        topCountries: topCountries.map(({ _id, count }) => ({ country: _id, count })),
      },
    });
  } catch (error) {
    next(error);
  }
};
