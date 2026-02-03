import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const productImageStorage = diskStorage({
  destination: join(process.cwd(), 'uploads/tmp'),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${randomUUID()}.${ext}`);
  },
});

export const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: Function,
) => {
  const allowed = /\/(jpg|jpeg|png|webp)$/;
  if (!allowed.test(file.mimetype)) {
    return cb(
      new BadRequestException('Formato de imagen no permitido'),
      false,
    );
  }
  cb(null, true);
};

export const imageLimits = {
  fileSize: 3 * 1024 * 1024, // 3 MB
};
