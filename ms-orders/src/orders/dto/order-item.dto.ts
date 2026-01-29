import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateOrderItemDto{

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    sku: string;       

    @IsInt()
    @IsPositive()
    quantity: number;
}