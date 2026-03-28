import { BadRequestException, PipeTransform } from '@nestjs/common';

export class OptionalImageValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/avif', 'image/webp'];

  transform(file?: Express.Multer.File): Express.Multer.File | undefined {
    if (!file) return undefined;

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      const allowedLabels = this.allowedMimeTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ');
      throw new BadRequestException(`Invalid file type. Allowed: ${allowedLabels}`);
    }

    return file;
  }
}
