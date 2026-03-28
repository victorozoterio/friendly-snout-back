import { BadRequestException, PipeTransform } from '@nestjs/common';

export class RequiredFileValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/avif', 'image/webp', 'application/pdf'];

  transform(file: Express.Multer.File | undefined): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('File is required. Please provide a file in the "file" field.');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      const allowedLabels = this.allowedMimeTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ');
      throw new BadRequestException(`Invalid file type. Allowed: ${allowedLabels}`);
    }

    return file;
  }
}
