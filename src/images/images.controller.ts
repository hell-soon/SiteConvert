import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { Response } from 'express';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
    }),
  )
  async uploadImages(
    @UploadedFiles() files: MulterFile[],
    @Res() res: Response,
  ) {
    if (!files || files.length === 0) {
      return res.status(400).send('No files uploaded');
    }

    try {
      const zipBuffer =
        await this.imagesService.convertMultipleToWebPAndZip(files);

      res.header({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="converted_images.zip"',
      });

      res.end(zipBuffer);
    } catch (error) {
      console.error('Conversion error:', error);
      res.status(500).send('Conversion failed');
    }
  }
}
