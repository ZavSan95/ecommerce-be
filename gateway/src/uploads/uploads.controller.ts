import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';
import { UploadsService } from './uploads.service';
import {
  imageFileFilter,
  imageLimits,
} from './multer/multer.config';
import * as multer from 'multer';

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
  ) {}

  @Post('products')
  @Public()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: multer.memoryStorage(), // ✅ clave
      fileFilter: imageFileFilter,
      limits: imageLimits,
    }),
  )
  async uploadProductImages(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se enviaron imágenes');
    }

    const processed: { key: string; url: string }[] = [];

    // 🔐 PROCESO SECUENCIAL (Windows-safe)
    for (const file of files) {
      const result =
        await this.uploadsService.processProductImage(file);
      processed.push(result);
    }

    return {
      files: processed,
    };
  }

  @Delete('products/:filename')
  async deleteProductImage(
    @Param('filename') filename: string,
  ) {
    if (filename.includes('..')) {
      throw new BadRequestException(
        'Nombre de archivo inválido',
      );
    }

    await this.uploadsService.deleteProductImage(filename);

    return {
      message: 'Imagen eliminada correctamente',
    };
  }
}
