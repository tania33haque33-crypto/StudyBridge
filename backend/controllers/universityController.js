const University = require('../models/University');
const dbOps = require('../utils/databaseOperations');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const path = require('path');

// @desc    Get all universities
// @route   GET /api/universities
// @access  Public
exports.getAllUniversities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    if (req.query.country) {
      query.country = req.query.country;
    }

    if (req.query.city) {
      query.city = req.query.city;
    }

    const universities = await dbOps.findUniversities(query, {
      select: '-programs -campusLife -admissions',
      skip,
      limit,
      sort: '-averageRating -viewCount'
    });

    const total = await dbOps.countUniversities(query);

    res.status(200).json({
      success: true,
      count: universities.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: universities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search universities with filters
// @route   GET /api/universities/search
// @access  Public
exports.searchUniversities = async (req, res, next) => {
  try {
    const {
      q,
      country,
      city,
      courseLevel,
      minTuition,
      maxTuition,
      qsRankingMin,
      qsRankingMax,
      acceptanceRateMin,
      acceptanceRateMax,
      universityType,
      languageOfInstruction,
      intakePeriod,
      page = 1,
      limit = 20,
      sortBy = '-averageRating'
    } = req.query;

    const query = { isActive: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Country filter
    if (country) {
      query.country = Array.isArray(country) ? { $in: country } : country;
    }

    // City filter
    if (city) {
      query.city = Array.isArray(city) ? { $in: city } : city;
    }

    // University type
    if (universityType) {
      query.universityType = Array.isArray(universityType) ? { $in: universityType } : universityType;
    }

    // Language of instruction
    if (languageOfInstruction) {
      query.languageOfInstruction = Array.isArray(languageOfInstruction) 
        ? { $in: languageOfInstruction } 
        : languageOfInstruction;
    }

    // Intake period
    if (intakePeriod) {
      query.intakePeriods = Array.isArray(intakePeriod) ? { $in: intakePeriod } : intakePeriod;
    }

    // Tuition range
    if (minTuition || maxTuition) {
      query['tuitionFees.undergraduate.international.amount'] = {};
      if (minTuition) query['tuitionFees.undergraduate.international.amount'].$gte = parseFloat(minTuition);
      if (maxTuition) query['tuitionFees.undergraduate.international.amount'].$lte = parseFloat(maxTuition);
    }

    // QS Ranking
    if (qsRankingMin || qsRankingMax) {
      query['rankings.qsRanking.world'] = {};
      if (qsRankingMin) query['rankings.qsRanking.world'].$gte = parseInt(qsRankingMin);
      if (qsRankingMax) query['rankings.qsRanking.world'].$lte = parseInt(qsRankingMax);
    }

    // Acceptance rate
    if (acceptanceRateMin || acceptanceRateMax) {
      query['stats.acceptanceRate'] = {};
      if (acceptanceRateMin) query['stats.acceptanceRate'].$gte = parseFloat(acceptanceRateMin);
      if (acceptanceRateMax) query['stats.acceptanceRate'].$lte = parseFloat(acceptanceRateMax);
    }

    // Course level filter
    if (courseLevel) {
      query['programs.level'] = Array.isArray(courseLevel) ? { $in: courseLevel } : courseLevel;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const universities = await dbOps.findUniversities(query, {
      select: '-programs -campusLife.facilities',
      skip,
      limit: parseInt(limit),
      sort: sortBy
    });

    const total = await dbOps.countUniversities(query);

    res.status(200).json({
      success: true,
      count: universities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: universities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get university by ID
// @route   GET /api/universities/:id
// @access  Public
exports.getUniversityById = async (req, res, next) => {
  try {
    const university = await dbOps.findUniversityById(req.params.id, {
      populate: [{
        path: 'reviews',
        match: { isPublished: true, moderationStatus: 'Approved' },
        options: { limit: 10, sort: '-createdAt' },
        select: 'userId ratings title review wouldRecommend createdAt',
        populate: {
          path: 'userId',
          select: 'firstName lastName profilePicture'
        }
      }]
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get university by slug
// @route   GET /api/universities/slug/:slug
// @access  Public
exports.getUniversityBySlug = async (req, res, next) => {
  try {
    const university = await dbOps.findUniversity({ slug: req.params.slug }, {
      populate: [{
        path: 'reviews',
        match: { isPublished: true, moderationStatus: 'Approved' },
        options: { limit: 10, sort: '-createdAt' }
      }]
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter options
// @route   GET /api/universities/filter-options
// @access  Public
exports.getFilterOptions = async (req, res, next) => {
  try {
    const countries = await dbOps.distinctUniversities('country', { isActive: true });
    const cities = await dbOps.distinctUniversities('city', { isActive: true });
    const universityTypes = await dbOps.distinctUniversities('universityType', { isActive: true });
    const languages = await dbOps.distinctUniversities('languageOfInstruction', { isActive: true });
    const intakes = await dbOps.distinctUniversities('intakePeriods', { isActive: true });

    const courseLevels = ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma'];

    res.status(200).json({
      success: true,
      data: {
        countries: countries.sort(),
        cities: cities.sort(),
        universityTypes: universityTypes.sort(),
        languages: languages.sort(),
        intakes: intakes.sort(),
        courseLevels
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare universities
// @route   POST /api/universities/compare
// @access  Public
exports.compareUniversities = async (req, res, next) => {
  try {
    const { universityIds } = req.body;

    if (!universityIds || universityIds.length < 2 || universityIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide 2-5 university IDs to compare'
      });
    }

    const universities = await dbOps.findUniversities({
      _id: { $in: universityIds },
      isActive: true
    }, {
      select: 'name country city rankings stats tuitionFees programs averageRating'
    });

    if (universities.length < 2) {
      return res.status(404).json({
        success: false,
        message: 'Not enough universities found for comparison'
      });
    }

    res.status(200).json({
      success: true,
      data: universities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar universities
// @route   GET /api/universities/:id/similar
// @access  Public
exports.getSimilarUniversities = async (req, res, next) => {
  try {
    const university = await dbOps.findUniversityById(req.params.id);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    const similar = await dbOps.findUniversities({
      _id: { $ne: university._id },
      isActive: true,
      $or: [
        { country: university.country },
        { universityType: university.universityType }
      ]
    }, {
      select: 'name country city logo rankings averageRating tuitionFees',
      limit: 6,
      sort: '-averageRating'
    });

    res.status(200).json({
      success: true,
      data: similar
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular universities
// @route   GET /api/universities/popular
// @access  Public
exports.getPopularUniversities = async (req, res, next) => {
  try {
    const universities = await dbOps.findUniversities({ isActive: true }, {
      select: 'name country city logo rankings averageRating viewCount applicationCount',
      sort: '-viewCount -applicationCount',
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: universities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured universities
// @route   GET /api/universities/featured
// @access  Public
exports.getFeaturedUniversities = async (req, res, next) => {
  try {
    const universities = await dbOps.findUniversities({
      isActive: true,
      isFeatured: true
    }, {
      select: 'name country city logo rankings averageRating',
      limit: 8
    });

    res.status(200).json({
      success: true,
      data: universities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment view count
// @route   POST /api/universities/:id/view
// @access  Public
exports.incrementViewCount = async (req, res, next) => {
  try {
    await dbOps.updateUniversity(req.params.id, { $inc: { viewCount: 1 } });

    res.status(200).json({
      success: true,
      message: 'View count updated'
    });
  } catch (error) {
    next(error);
  }
};

// Admin controllers

// @desc    Create university
// @route   POST /api/universities
// @access  Private/Admin
exports.createUniversity = async (req, res, next) => {
  try {
    const university = await dbOps.createUniversity(req.body);

    res.status(201).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update university
// @route   PUT /api/universities/:id
// @access  Private/Admin
exports.updateUniversity = async (req, res, next) => {
  try {
    const university = await dbOps.updateUniversity(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete university
// @route   DELETE /api/universities/:id
// @access  Private/Admin
exports.deleteUniversity = async (req, res, next) => {
  try {
    const university = await dbOps.deleteUniversity(req.params.id);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'University deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify university
// @route   PATCH /api/universities/:id/verify
// @access  Private/Admin
exports.verifyUniversity = async (req, res, next) => {
  try {
    const university = await dbOps.updateUniversity(req.params.id, { isVerified: true }, {
      new: true
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.status(200).json({
      success: true,
      data: university
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload university images
// @route   POST /api/universities/:id/images
// @access  Private/Admin
exports.uploadUniversityImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const imageUrls = req.files.map(file => `/uploads/universities/${file.filename}`);

    const university = await dbOps.updateUniversity(req.params.id, {
      $push: { images: { $each: imageUrls } }
    }, {
      new: true
    });

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { images: imageUrls }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import universities from CSV
// @route   POST /api/universities/import/csv
// @access  Private/Admin
exports.importFromCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let successCount = 0;
        let errorCount = 0;

        for (const row of results) {
          try {
            const universityData = {
              name: row.name,
              country: row.country,
              city: row.city,
              universityType: row.universityType,
              establishedYear: parseInt(row.establishedYear),
              logo: row.logo ? `/uploads/universities/${row.logo}` : null,
              coverImage: row.coverImage ? `/uploads/universities/${row.coverImage}` : null,
              images: row.images ? row.images.split(',').map(img => `/uploads/universities/${img.trim()}`) : [],
              website: row.website,
              overview: {
                description: row.description
              },
              rankings: {
                qsRanking: {
                  world: row.qsRankingWorld ? parseInt(row.qsRankingWorld) : null,
                  country: row.qsRankingCountry ? parseInt(row.qsRankingCountry) : null
                }
              },
              stats: {
                totalStudents: row.totalStudents ? parseInt(row.totalStudents) : null,
                internationalStudents: row.internationalStudents ? parseInt(row.internationalStudents) : null,
                acceptanceRate: row.acceptanceRate ? parseFloat(row.acceptanceRate) : null
              },
              tuitionFees: {
                undergraduate: {
                  international: {
                    amount: row.ugTuitionFee ? parseFloat(row.ugTuitionFee) : null,
                    currency: row.currency || 'USD'
                  }
                }
              },
              languageOfInstruction: row.languages ? row.languages.split(',').map(l => l.trim()) : [],
              intakePeriods: row.intakes ? row.intakes.split(',').map(i => i.trim()) : [],
              importedFrom: 'csv'
            };

            await dbOps.createUniversity(universityData);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              row: row.name,
              error: error.message
            });
          }
        }

        // Delete uploaded CSV file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
          success: true,
          message: `Import completed. Success: ${successCount}, Errors: ${errorCount}`,
          data: {
            successCount,
            errorCount,
            errors: errors.slice(0, 10) // Return first 10 errors
          }
        });
      });
  } catch (error) {
    next(error);
  }
};

// @desc    Export universities to CSV
// @route   GET /api/universities/export/csv
// @access  Private/Admin
exports.exportToCSV = async (req, res, next) => {
  try {
    const universities = await University.find({ isActive: true })
      .select('name country city universityType rankings stats tuitionFees')
      .lean();

    const fields = [
      'name',
      'country',
      'city',
      'universityType',
      'rankings.qsRanking.world',
      'stats.totalStudents',
      'stats.acceptanceRate',
      'tuitionFees.undergraduate.international.amount'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(universities);

    res.header('Content-Type', 'text/csv');
    res.attachment('universities.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};