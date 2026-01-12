import { IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateCategoryDto } from './update-category.dto';

export class UpdateCategoryPayloadDto {
  @IsMongoId()
  id: string;

  @ValidateNested()
  @Type(() => UpdateCategoryDto)
  data: UpdateCategoryDto;
}
