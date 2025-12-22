const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const config = require('../config/environment');

// Configure Cloudinary before using it
console.log('=== CLOUDINARY CONFIG DEBUG ===');
console.log('Cloud name:', config.CLOUDINARY_CLOUD_NAME);
console.log('API key:', config.CLOUDINARY_API_KEY);
console.log('API secret:', config.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');
console.log('===============================');

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure Cloudinary storage for general uploads (documents + images)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'canadajobs',
    resource_type: 'auto',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp'],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/jpg',
      'image/avif',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error('File rejected - MIME type not allowed:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        allowed: allowedMimes,
      });
      cb(new Error('Invalid file type'), false);
    }
  },
});

module.exports = upload;
