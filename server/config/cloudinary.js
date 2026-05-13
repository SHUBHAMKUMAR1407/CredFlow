const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'credflow_avatars',
      format: 'jpg', // force jpg
      public_id: `avatar_${req.user._id}_${Date.now()}`,
      transformation: [{ width: 500, height: 500, crop: 'fill' }]
    };
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
