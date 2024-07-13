const multer = require('multer');
// const path = require('path');
const cloudinary = require('./cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'productimages', // Optional: specify a folder in Cloudinary
    format: async (req, file) => 'jpg', // supports promises as well
    public_id: (req, file) => file.originalname,
  },
});

const upload = multer({ storage });

module.exports = upload;
