import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import * as sharp from 'sharp';
import { existsSync, promises as fs } from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {

  async processProductImage(
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {

    const outputFilename = `${randomUUID()}.webp`;

    const outputPath = join(
      process.cwd(),
      'uploads',
      'products',
      outputFilename,
    );

    // 🔥 Sharp desde buffer (NO file.path)
    const buffer = await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'cover',
        position: 'center',
      })
      .toFormat('webp', { quality: 80 })
      .toBuffer();

    // ✍️ Guardás SOLO el archivo final
    await fs.writeFile(outputPath, buffer);

    return {
      key: `products/${outputFilename}`,
      url: `http://localhost:3000/uploads/products/${outputFilename}`,
    };
  }


  async deleteProductImage(filename: string) {
    const filePath = join(
      process.cwd(),
      'uploads',
      'products',
      filename,
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Archivo no encontrado');
    }

    await fs.unlink(filePath);
  }
}
