import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { productImageStorage } from '../common/upload/multer.config';
import { Public } from '../auth/decorators/public.decorator';

@Controller('uploads')
export class UploadsController {

  @Public()
  @Post('products')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: productImageStorage,
    }),
  )
  uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    return {
      files: files.map(file => ({
        key: `products/${file.filename}`,
        url: `http://localhost:3000/uploads/products/${file.filename}`,
      })),
    };
  }
}
