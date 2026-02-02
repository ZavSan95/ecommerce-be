import { IsNotEmpty, IsString } from "class-validator";

export class FavoriteDto{
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    sku: string;
}