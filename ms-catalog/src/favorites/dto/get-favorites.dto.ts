import { IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class GetFavoritesDto {
  @IsMongoId()
  userId: string;

  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}
