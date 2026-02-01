import { IsNotEmpty, IsString } from "class-validator";

export class FavoriteDto{
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    sku: string;
}