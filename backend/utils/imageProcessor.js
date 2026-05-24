const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageProcessor {
  static async optimizeImage(inputPath, outputPath, options = {}) {
    const {
      width = 1200,
      height = null,
      quality = 85,
      format = 'jpeg',
    } = options;

    try {
      let pipeline = sharp(inputPath);

      // Resize
      if (height) {
        pipeline = pipeline.resize(width, height, {
          fit: 'cover',
          position: 'center',
        });
      } else {
        pipeline = pipeline.resize(width, null, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert and optimize
      switch (format) {
        case 'jpeg':
        case 'jpg':
          pipeline = pipeline.jpeg({ quality, progressive: true });
          break;
        case 'png':
          pipeline = pipeline.png({ quality, compressionLevel: 9 });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality });
          break;
        default:
          pipeline = pipeline.jpeg({ quality });
      }

      await pipeline.toFile(outputPath);

      return {
        success: true,
        path: outputPath,
      };
    } catch (error) {
      console.error('Image optimization error:', error);
      throw error;
    }
  }

  static async createThumbnail(inputPath, outputPath, size = 300) {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      return {
        success: true,
        path: outputPath,
      };
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw error;
    }
  }

  static async createMultipleSizes(inputPath, outputDir, filename) {
    const sizes = {
      small: 400,
      medium: 800,
      large: 1200,
      xlarge: 1920,
    };

    const results = {};

    for (const [sizeName, width] of Object.entries(sizes)) {
      const outputFilename = `${filename}_${sizeName}.jpg`;
      const outputPath = path.join(outputDir, outputFilename);

      try {
        await this.optimizeImage(inputPath, outputPath, { width });
        results[sizeName] = outputPath;
      } catch (error) {
        console.error(`Error creating ${sizeName} size:`, error);
      }
    }

    return results;
  }

  static async addWatermark(inputPath, outputPath, watermarkText) {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      const watermarkSvg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <style>
            .watermark { 
              fill: rgba(255, 255, 255, 0.5); 
              font-size: 48px; 
              font-weight: bold; 
              font-family: Arial;
            }
          </style>
          <text x="50%" y="95%" text-anchor="middle" class="watermark">
            ${watermarkText}
          </text>
        </svg>
      `;

      await image
        .composite([
          {
            input: Buffer.from(watermarkSvg),
            gravity: 'southeast',
          },
        ])
        .toFile(outputPath);

      return {
        success: true,
        path: outputPath,
      };
    } catch (error) {
      console.error('Watermark error:', error);
      throw error;
    }
  }

  static async getImageMetadata(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
      };
    } catch (error) {
      console.error('Metadata extraction error:', error);
      throw error;
    }
  }

  static async convertFormat(inputPath, outputPath, format) {
    try {
      const pipeline = sharp(inputPath);

      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          await pipeline.jpeg({ quality: 90 }).toFile(outputPath);
          break;
        case 'png':
          await pipeline.png().toFile(outputPath);
          break;
        case 'webp':
          await pipeline.webp({ quality: 90 }).toFile(outputPath);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return {
        success: true,
        path: outputPath,
      };
    } catch (error) {
      console.error('Format conversion error:', error);
      throw error;
    }
  }

  static async cropImage(inputPath, outputPath, cropOptions) {
    const { left = 0, top = 0, width, height } = cropOptions;

    try {
      await sharp(inputPath)
        .extract({ left, top, width, height })
        .toFile(outputPath);

      return {
        success: true,
        path: outputPath,
      };
    } catch (error) {
      console.error('Crop error:', error);
      throw error;
    }
  }

  static async deleteImage(imagePath) {
    try {
      await fs.unlink(imagePath);
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}

module.exports = ImageProcessor;