import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

const ALLOWED_IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Resolves the uploads root directory.
 * Uses UPLOAD_DIR env var if set (recommended for production — point it to a
 * persistent directory outside the project folder, e.g. /var/www/uploads).
 * Falls back to ./uploads relative to the process working directory for local dev.
 */
export function getUploadsRoot(): string {
  const dir = process.env.UPLOAD_DIR
    ? resolve(process.env.UPLOAD_DIR)
    : resolve(process.cwd(), 'uploads');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function createMulterStorage(subfolder: string) {
  return diskStorage({
    destination: (req, file, cb) => {
      const dest = `${getUploadsRoot()}/${subfolder}`;
      if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  });
}

export function imageFileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
    return cb(new BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
  }
  cb(null, true);
}

export const MAX_IMAGE_SIZE = MAX_FILE_SIZE_BYTES;
