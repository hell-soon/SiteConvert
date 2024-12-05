import { Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
  private readonly uploadDir = 'uploads';

  constructor() {
    fs.mkdir(this.uploadDir, { recursive: true }).catch(console.error);
  }

  async convertToWebP(file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(this.uploadDir, filename);

    try {
      await sharp(file.buffer).webp({ quality: 75 }).toFile(filepath);

      return {
        id: filename,
        message: 'Image successfully converted to WebP',
      };
    } catch (error) {
      throw new BadRequestException(error, 'Error processing image');
    }
  }

  async getImage(id: string) {
    try {
      const filepath = path.join(this.uploadDir, id);
      return await fs.readFile(filepath);
    } catch (error) {
      throw new BadRequestException(error, 'Image not found');
    }
  }
}
