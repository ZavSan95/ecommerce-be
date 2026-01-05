import { IsArray, IsInt, IsPositive, IsString } from 'class-validator';

export class ValidateCheckoutItemDto {
  @IsString()
  productId: string;

  @IsString()
  sku: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class ValidateCheckoutDto {
  @IsArray()
  items: ValidateCheckoutItemDto[];
}
