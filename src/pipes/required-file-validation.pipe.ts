import { BadRequestException, PipeTransform } from '@nestjs/common';

export class RequiredFileValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  transform(file: Express.Multer.File | undefined): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('File is required. Please provide a file in the "file" field.');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WEBP, PDF.');
    }

    return file;
  }
}
