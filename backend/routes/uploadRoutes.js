const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadDocument,
  deleteFile,
  getFile
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(uploadLimiter);

router.post('/image', uploadSingle('image'), uploadImage);
router.post('/document', uploadSingle('document'), uploadDocument);
router.delete('/:filename', deleteFile);
router.get('/:filename', getFile);

module.exports = router;