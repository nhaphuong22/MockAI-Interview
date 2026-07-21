import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name: timestamp-random-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

// File filter to allow only audio files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/webm',
    'audio/wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/x-wav',
    'audio/webm;codecs=opus',
    'application/octet-stream' // fallback for some browser blob uploads
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.fieldname === 'audio') {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

// Configure Multer limits (10MB max size)
export const uploadAudio = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Avatar upload directory
const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Verification Documents directory (allows images + PDF)
const docDir = path.join(process.cwd(), 'uploads', 'docs');
if (!fs.existsSync(docDir)) {
  fs.mkdirSync(docDir, { recursive: true });
}

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const docFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file định dạng ảnh (JPG, PNG, WEBP) hoặc tài liệu PDF!'), false);
  }
};

export const uploadDoc = multer({
  storage: docStorage,
  fileFilter: docFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

