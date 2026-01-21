import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';

export const productImageStorage = diskStorage({
  destination: './uploads/products',
  filename: (_req, file, cb) => {
    const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
