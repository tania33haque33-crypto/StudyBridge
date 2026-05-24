const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads/profiles',
    'uploads/documents',
    'uploads/universities',
    'uploads/reviews',
    'uploads/csv',
    'uploads/temp'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/temp';

    if (req.baseUrl.includes('/users')) {
      uploadPath = 'uploads/profiles';
    } else if (req.baseUrl.includes('/applications')) {
      uploadPath = 'uploads/documents';
    } else if (req.baseUrl.includes('/universities')) {
      uploadPath = 'uploads/universities';
    } else if (req.baseUrl.includes('/reviews')) {
      uploadPath = 'uploads/reviews';
    } else if (file.fieldname === 'csv') {
      uploadPath = 'uploads/csv';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    image: /jpeg|jpg|png|gif|webp/,
    document: /pdf|doc|docx|txt/,
    csv: /csv/
  };

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname === 'csv') {
    if (allowedTypes.csv.test(extname) && mimetype === 'text/csv') {
      return cb(null, true);
    }
  } else if (file.fieldname.includes('image') || file.fieldname.includes('photo') || file.fieldname.includes('picture')) {
    if (allowedTypes.image.test(extname) && mimetype.startsWith('image/')) {
      return cb(null, true);
    }
  } else {
    if (allowedTypes.document.test(extname) || allowedTypes.image.test(extname)) {
      return cb(null, true);
    }
  }

  cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter
});

// Multiple file upload configurations
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};