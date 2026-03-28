import { BadRequestException, PipeTransform } from '@nestjs/common';

export class OptionalImageValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  transform(file?: Express.Multer.File): Express.Multer.File | undefined {
    if (!file) return undefined;

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WEBP.');
    }

    return file;
  }
}
