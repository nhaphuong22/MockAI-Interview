import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Helper to safely get upload directory across local and Serverless environments
const getUploadDir = (subFolder = '') => {
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const baseDir = isServerless ? os.tmpdir() : process.cwd();
  const targetDir = path.join(baseDir, 'uploads', subFolder);
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (err) {
    console.warn(`[UploadMiddleware] Directory creation warning for ${targetDir}:`, err.message);
  }
  return targetDir;
};

// 1. Audio Upload Directory
const audioDir = getUploadDir('audio');
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir('audio'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

const audioFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/webm',
    'audio/wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/x-wav',
    'audio/webm;codecs=opus',
    'application/octet-stream'
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.fieldname === 'audio') {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

export const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 2. Avatar Upload Directory
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir('avatars'));
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

// 3. Verification Documents Directory (JPG, PNG, WEBP, PDF)
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir('docs'));
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
