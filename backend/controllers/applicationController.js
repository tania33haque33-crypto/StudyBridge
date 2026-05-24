const Application = require('../models/Application');
const University = require('../models/University');
const Scholarship = require('../models/Scholarship');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser } = require('../config/socket');
const dbOps = require('../utils/databaseOperations');

// @desc    Create application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res, next) => {
  try {
    const university = await dbOps.findUniversityById(req.body.universityId);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    // Find program
    const program = university.programs.id(req.body.programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    const application = await dbOps.createApplication({
      ...req.body,
      userId: req.user.id,
      programName: program.name,
      timeline: {
        started: Date.now(),
      },
    });

    // Increment university application count
    university.applicationCount += 1;
    await dbOps.updateUniversity({ _id: university._id }, { applicationCount: university.applicationCount });

    // Create notification
    await dbOps.createNotification({
      userId: req.user.id,
      type: 'application',
      title: 'Application Created',
      message: `Your application to ${university.name} has been created successfully`,
      relatedModel: 'Application',
      relatedId: application._id,
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
exports.getAllApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.isArchived !== undefined) {
      query.isArchived = req.query.isArchived === 'true';
    }

    const applications = await dbOps.findApplications(query, {
      populate: [{ path: 'universityId', select: 'name city country logo' }],
      skip,
      limit,
      sort: '-createdAt'
    });

    const total = await dbOps.countApplications(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await dbOps.findApplication({
      _id: req.params.id,
      userId: req.user.id,
    }, {
      populate: ['universityId']
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res, next) => {
  try {
    const application = await dbOps.findApplication({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const allowedFields = [
      'intake',
      'intakeYear',
      'testScores',
      'academicDetails',
      'personalStatement',
      'recommendationLetters',
      'financialInfo',
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        application[key] = req.body[key];
      }
    });

    const updatedApplication = await dbOps.updateApplication(
      { _id: req.params.id, userId: req.user.id },
      application.toObject(),
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await dbOps.deleteApplication({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await dbOps.findApplication({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const oldStatus = application.status;
    application.status = req.body.status;

    // Update timeline
    const now = Date.now();
    switch (req.body.status) {
      case 'Submitted':
        application.timeline.submitted = now;
        break;
      case 'Under Review':
        application.timeline.underReview = now;
        break;
      case 'Accepted':
      case 'Rejected':
      case 'Waitlisted':
        application.timeline.decision = now;
        if (req.body.decisionDetails) {
          application.decisionDetails = req.body.decisionDetails;
        }
        break;
    }

    // Add to status history
    application.statusHistory.push({
      status: req.body.status,
      changedAt: now,
      changedBy: 'User',
      notes: req.body.notes || '',
    });

    const updatedApplication = await dbOps.updateApplication(
      { _id: req.params.id, userId: req.user.id },
      application.toObject(),
      { new: true }
    );

    // Create notification
    await dbOps.createNotification({
      userId: req.user.id,
      type: 'application',
      title: 'Application Status Updated',
      message: `Your application status changed from ${oldStatus} to ${req.body.status}`,
      relatedModel: 'Application',
      relatedId: application._id,
    });

    // Emit real-time notification
    emitToUser(req.user.id, 'application_update', {
      applicationId: application._id,
      status: req.body.status,
    });

    res.status(200).json({
      success: true,
      data: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document
// @route   POST /api/applications/:id/documents
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const application = await dbOps.findApplication({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.documents.push({
      name: req.body.name || req.file.originalname,
      type: req.body.type,
      url: `/uploads/documents/${req.file.filename}`,
      uploadedAt: Date.now(),
      status: 'Uploaded',
    });

    const updatedApplication = await dbOps.updateApplication(
      { _id: req.params.id, userId: req.user.id },
      { documents: application.documents },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedApplication.documents[updatedApplication.documents.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/applications/:id/documents/:documentId
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const application = await dbOps.findApplication({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const document = application.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete file
    const { deleteFile } = require('../utils/helpers');
    await deleteFile(document.url);

    application.documents.pull(req.params.documentId);
    await dbOps.updateApplication(
      { _id: req.params.id, userId: req.user.id },
      { documents: application.documents }
    );

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note
// @route   POST /api/applications/:id/notes
// @access  Private
exports.addNote = async (req, res, next) => {
  try {
    const application = await dbOps.findApplication({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.notes.push({
      content: req.body.content,
      isPrivate: req.body.isPrivate !== false,
    });

    const updatedApplication = await dbOps.updateApplication(
      { _id: req.params.id, userId: req.user.id },
      { notes: application.notes },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedApplication.notes[updatedApplication.notes.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application timeline
// @route   GET /api/applications/:id/timeline
// @access  Private
exports.getApplicationTimeline = async (req, res, next) => {
  try {
    const application = await dbOps.findApplication({
      _id: req.params.id,
      userId: req.user.id,
    }, {
      select: 'timeline statusHistory'
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        timeline: application.timeline,
        statusHistory: application.statusHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check eligibility
// @route   POST /api/applications/check-eligibility
// @access  Private
exports.checkEligibility = async (req, res, next) => {
  try {
    const { universityId, programId, userProfile } = req.body;

    const university = await dbOps.findUniversityById(universityId);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    const program = university.programs.id(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    const eligibilityChecks = {
      gpa: false,
      languageTest: false,
      standardizedTest: false,
      eligible: false,
      requirements: [],
    };

    // Check GPA
    if (program.entryRequirements?.minimumGPA) {
      eligibilityChecks.gpa =
        userProfile.gpa >= program.entryRequirements.minimumGPA;
      if (!eligibilityChecks.gpa) {
        eligibilityChecks.requirements.push(
          `Minimum GPA of ${program.entryRequirements.minimumGPA} required`
        );
      }
    }

    // Check language test
    if (program.entryRequirements?.languageTest) {
      const userLanguageScore = userProfile.languageTestScore || 0;
      eligibilityChecks.languageTest =
        userLanguageScore >= program.entryRequirements.languageTest.minimumScore;
      if (!eligibilityChecks.languageTest) {
        eligibilityChecks.requirements.push(
          `${program.entryRequirements.languageTest.type} score of ${program.entryRequirements.languageTest.minimumScore} required`
        );
      }
    }

    eligibilityChecks.eligible =
      eligibilityChecks.gpa && eligibilityChecks.languageTest;

    res.status(200).json({
      success: true,
      data: eligibilityChecks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate document checklist
// @route   POST /api/applications/document-checklist
// @access  Private
exports.generateDocumentChecklist = async (req, res, next) => {
  try {
    const { universityId, programId } = req.body;

    const university = await dbOps.findUniversityById(universityId);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    const checklist = [
      { name: 'Academic Transcripts', required: true, uploaded: false },
      { name: 'Statement of Purpose (SOP)', required: true, uploaded: false },
      { name: 'Letters of Recommendation (LOR)', required: true, uploaded: false },
      { name: 'Resume/CV', required: true, uploaded: false },
      { name: 'Passport Copy', required: true, uploaded: false },
      { name: 'Language Test Score', required: true, uploaded: false },
      { name: 'Financial Documents', required: true, uploaded: false },
    ];

    // Add university-specific documents
    if (university.admissions?.requiredDocuments) {
      university.admissions.requiredDocuments.forEach((doc) => {
        if (!checklist.find((item) => item.name === doc)) {
          checklist.push({ name: doc, required: true, uploaded: false });
        }
      });
    }

    res.status(200).json({
      success: true,
      data: checklist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application stats
// @route   GET /api/applications/stats
// @access  Private
exports.getApplicationStats = async (req, res, next) => {
  try {
    const stats = {
      total: 0,
      byStatus: [],
      inProgress: 0,
      submitted: 0,
      accepted: 0,
      rejected: 0,
    };

    const applications = await dbOps.findApplications({ userId: req.user.id });

    stats.total = applications.length;

    // Group by status
    const statusGroups = {};
    applications.forEach((app) => {
      statusGroups[app.status] = (statusGroups[app.status] || 0) + 1;

      if (app.status === 'In Progress') stats.inProgress++;
      if (app.status === 'Submitted') stats.submitted++;
      if (app.status === 'Accepted') stats.accepted++;
      if (app.status === 'Rejected') stats.rejected++;
    });

    stats.byStatus = Object.entries(statusGroups).map(([status, count]) => ({
      status,
      count,
    }));

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming deadlines
// @route   GET /api/applications/upcoming-deadlines
// @access  Private
exports.getUpcomingDeadlines = async (req, res, next) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const applications = await dbOps.findApplications({
      userId: req.user.id,
      deadline: { $gte: today, $lte: thirtyDaysFromNow },
      status: { $in: ['Not Started', 'In Progress'] },
    }, {
      populate: [{ path: 'universityId', select: 'name logo' }],
      sort: 'deadline',
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto add applications based on user profile matching
// @route   POST /api/applications/auto-add
// @access  Private
exports.autoAddApplications = async (req, res, next) => {
  try {
    const user = await dbOps.findUser({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's profile data for matching
    const userProfile = {
      country: user.country,
      studyLevel: user.studyLevel || [],
      fieldOfStudy: user.fieldOfStudy || [],
      gpa: user.academicInfo?.gpa || 0,
      languageTestScore: user.testScores?.languageTest?.score || 0,
    };

    // Find matching scholarships based on user profile
    const scholarshipQuery = { isActive: true };

    if (userProfile.country) {
      scholarshipQuery.country = userProfile.country;
    }

    if (userProfile.studyLevel.length > 0) {
      scholarshipQuery.studyLevel = { $in: userProfile.studyLevel };
    }

    if (userProfile.fieldOfStudy.length > 0) {
      scholarshipQuery.fieldOfStudy = { $in: userProfile.fieldOfStudy };
    }

    const matchingScholarships = await dbOps.findScholarships(scholarshipQuery, {
      limit: 10,
      sort: '-amount.value'
    }, 5000);

    const createdApplications = [];
    const skippedApplications = [];

    // For each matching scholarship, find suitable universities and create applications
    for (const scholarship of matchingScholarships) {
      // Find universities that offer programs matching the scholarship
      const universities = await dbOps.findUniversities({
        country: scholarship.country,
        'programs.studyLevel': { $in: scholarship.studyLevel },
        'programs.fieldOfStudy': { $in: scholarship.fieldOfStudy },
        isActive: true
      }, {
        limit: 3 // Limit to 3 universities per scholarship
      }, 5000);

      for (const university of universities) {
        // Check if user already has an application for this university
        const existingApplication = await dbOps.findApplication({
          userId: req.user.id,
          universityId: university._id,
          scholarshipId: scholarship._id
        });

        if (existingApplication) {
          skippedApplications.push({
            university: university.name,
            scholarship: scholarship.name,
            reason: 'Application already exists'
          });
          continue;
        }

        // Find a suitable program
        const suitableProgram = university.programs.find(program =>
          scholarship.studyLevel.includes(program.studyLevel) &&
          scholarship.fieldOfStudy.some(field => program.fieldOfStudy.includes(field))
        );

        if (!suitableProgram) continue;

        // Check basic eligibility
        const isEligible = (
          (!suitableProgram.entryRequirements?.minimumGPA || userProfile.gpa >= suitableProgram.entryRequirements.minimumGPA) &&
          (!suitableProgram.entryRequirements?.languageTest?.minimumScore || userProfile.languageTestScore >= suitableProgram.entryRequirements.languageTest.minimumScore)
        );

        if (!isEligible) {
          skippedApplications.push({
            university: university.name,
            scholarship: scholarship.name,
            reason: 'Does not meet eligibility requirements'
          });
          continue;
        }

        // Create the application
        const application = await dbOps.createApplication({
          userId: req.user.id,
          universityId: university._id,
          scholarshipId: scholarship._id,
          programId: suitableProgram._id,
          programName: suitableProgram.name,
          scholarshipName: scholarship.name,
          status: 'Not Started',
          timeline: {
            started: Date.now(),
            autoCreated: true
          },
          autoCreated: true,
          source: 'auto_match'
        });

        // Increment university application count
        await dbOps.updateUniversity(
          { _id: university._id },
          { $inc: { applicationCount: 1 } }
        );

        // Create notification
        await dbOps.createNotification({
          userId: req.user.id,
          type: 'application',
          title: 'Application Auto-Created',
          message: `An application to ${university.name} for ${scholarship.name} scholarship has been automatically created based on your profile`,
          relatedModel: 'Application',
          relatedId: application._id,
        });

        createdApplications.push({
          id: application._id,
          university: university.name,
          scholarship: scholarship.name,
          program: suitableProgram.name
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Auto-created ${createdApplications.length} applications`,
      data: {
        created: createdApplications,
        skipped: skippedApplications,
        totalCreated: createdApplications.length,
        totalSkipped: skippedApplications.length
      },
    });
  } catch (error) {
    next(error);
  }
};