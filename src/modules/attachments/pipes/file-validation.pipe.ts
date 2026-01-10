import { BadRequestException, PipeTransform } from '@nestjs/common';

export class FileValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File | undefined): Express.Multer.File {
    if (!value) {
      throw new BadRequestException('File is required. Please provide a file in the "file" field.');
    }

    return value;
  }
}
