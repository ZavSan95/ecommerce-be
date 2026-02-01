import { PaginationDto } from "../../common/dto/pagination.dto";

export class GetFavoritesDto {
  userId: string;
  pagination?: PaginationDto;
}
