import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as archiver from 'archiver';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class ImagesService {
  async convertMultipleToWebPAndZip(files: MulterFile[]): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      for (const file of files) {
        const originalName = path.parse(file.originalname).name;
        const webpFileName = `${originalName}.webp`;
        const webpBuffer = await sharp(file.buffer)
          .webp({ quality: 75 })
          .toBuffer();
        archive.append(webpBuffer, {
          name: webpFileName,
          date: new Date(), // Для одинаковых временных меток
        });
      }

      archive.finalize();
    });
  }
}
