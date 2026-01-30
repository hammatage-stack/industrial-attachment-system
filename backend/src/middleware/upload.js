const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.memoryStorage();

// File filter - Allow PDF and DOCX only
const fileFilter = (req, file, cb) => {
  // Allowed file types for resume/documents
  const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = /pdf|docx/;
  
  // Check extension
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  // Check mime type
  const mimetype = allowedMimes.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
