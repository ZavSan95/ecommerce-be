import { IsMongoId } from 'class-validator';

export class DeleteCategoryDto {
  @IsMongoId()
  id: string;
}
