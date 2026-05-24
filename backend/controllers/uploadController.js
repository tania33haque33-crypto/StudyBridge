const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

// @desc    Upload image
// @route   POST /api/upload/image
// @access  Private
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image',
      });
    }

    // Optimize image
    const filename = `optimized-${Date.now()}.jpg`;
    const outputPath = path.join(__dirname, '../uploads/temp', filename);

    await sharp(req.file.path)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Delete original file
    await fs.unlink(req.file.path);

    res.status(200).json({
      success: true,
      data: {
        filename,
        url: `/uploads/temp/${filename}`,
        size: (await fs.stat(outputPath)).size,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document
// @route   POST /api/upload/document
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        url: `/uploads/documents/${req.file.filename}`,
        size: req.file.size,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file
// @route   DELETE /api/upload/:filename
// @access  Private
exports.deleteFile = async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/temp', filename);

    await fs.unlink(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }
    next(error);
  }
};

// @desc    Get file
// @route   GET /api/upload/:filename
// @access  Private
exports.getFile = async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};