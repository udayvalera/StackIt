const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// --- 1. Cloudinary Configuration ---
// It's crucial to configure Cloudinary with your credentials.
// These are loaded from the .env file for security.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 2. Multer Configuration ---
// Multer is the middleware that handles multipart/form-data, primarily used for file uploads.
// We configure it to use memory storage, which stores the file as a buffer in memory.
// This is efficient for passing the file directly to Cloudinary without saving it to disk first.
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit
    },
    fileFilter: (req, file, cb) => {
        // Filter to allow only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image file.'), false);
        }
    }
});


//================================================================
// CONTROLLER LOGIC
// Path: backend/controllers/media/questionMediaController.js
//================================================================

/**
 * @description Uploads an image file to Cloudinary and returns the secure URL.
 * @route POST /api/upload/image
 * @access Private (should be protected by authentication middleware)
 */
const uploadQuestionImage = (req, res) => {
    // Check if a file was provided in the request
    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided.' });
    }

    // Function to upload the stream to Cloudinary
    let uploadStream = (fileBuffer) => {
        return new Promise((resolve, reject) => {
            // Create a Cloudinary upload stream
            // We specify a folder to keep our uploads organized
            let stream = cloudinary.uploader.upload_stream(
                { folder: 'stackit_questions' },
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );

            // Use streamifier to pipe the buffer to the Cloudinary stream
            streamifier.createReadStream(fileBuffer).pipe(stream);
        });
    };

    // Async function to handle the upload and send the response
    async function handleUpload() {
        try {
            const result = await uploadStream(req.file.buffer);
            console.log('Cloudinary upload successful:', result);

            // Send the secure URL back to the frontend
            res.status(200).json({
                message: 'Image uploaded successfully!',
                url: result.secure_url,
            });
        } catch (err) {
            console.error('Cloudinary upload failed:', err);
            res.status(500).json({ message: 'Failed to upload image.', error: err.message });
        }
    }

    handleUpload();
};


module.exports = {
    uploadQuestionImage,
    upload
};
