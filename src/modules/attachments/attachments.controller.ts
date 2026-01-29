import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { AttachmentsService } from './attachments.service';
import { PaginatedAttachmentDto } from './dto/paginated-medicine.dto';
import { FileValidationPipe } from './pipes/file-validation.pipe';

const TEN_MEGABYTES = 10 * 1024 * 1024;

@ApiTags('Attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('animal/:animalUuid')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: TEN_MEGABYTES } }))
  @ApiOperation({ summary: 'Uploads a new file for a specific animal to Google Drive and returns the file URL.' })
  @ApiResponse({ status: 201, description: 'The URL of the uploaded file.' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async create(
    @Param('animalUuid', new ParseUUIDPipe()) animalUuid: string,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    return await this.attachmentsService.create(animalUuid, file);
  }

  @Get('by-animal/:animalUuid')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: PaginatedAttachmentDto })
  @ApiOperation({ summary: 'Retrieves a paginated list of attachments for a specific animal.' })
  async findAllByAnimal(
    @Param('animalUuid', new ParseUUIDPipe()) animalUuid: string,
    @Paginate() query: PaginateQuery,
  ) {
    return await this.attachmentsService.findAllByAnimal(animalUuid, query);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletes an attachment from the system.' })
  async remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return await this.attachmentsService.remove(uuid);
  }
}
