import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { Public } from '../auth/decorators/public.decorator';
import { Response } from 'express';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('products/presign')
  async presignProductImages(@Body() body: { count: number }) {
    if (!body.count || body.count < 1 || body.count > 10) {
      throw new BadRequestException('Cantidad inválida');
    }

    return {
      uploads: await this.uploadsService.createPresignedUploads(body.count),
    };
  }

  /**
   * Proxy público de imágenes
   * /api/uploads/products/uuid.webp
   */
  @Get('products/*path')
  @Public()
  async getProductImage(
    @Param('path') path: string,
    @Res() res: Response,
  ) {
    if (!path) {
      throw new BadRequestException('Path inválido');
    }

    // 🔥 path ya viene correcto: products/uuid.webp
    const stream =
      await this.uploadsService.getProductImageStream(
        `products/${path}`,
      );

    res.setHeader('Content-Type', 'image/webp');
    stream.pipe(res);
  }
}
