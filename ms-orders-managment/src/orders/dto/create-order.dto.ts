import { IsArray, IsEmail, IsEnum, isNotEmpty, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { CreateOrderItemDto } from "./order-item.dto";
import { Type } from "class-transformer";
import { CreateOrderAddressDto } from "./order-adress.dto";
import { PaymentProvider } from "../enum/payment-provider.enum";

export class CreateOrderDto{

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto [];

    @IsEmail()
    customerEmail: string;

    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsString()
    customerName: string;

    @ValidateNested()
    @Type(() => CreateOrderAddressDto)
    billingAddress: CreateOrderAddressDto;

    @ValidateNested()
    @Type(() => CreateOrderAddressDto)
    shippingAddress: CreateOrderAddressDto;

    @IsEnum(PaymentProvider)
    paymentProvider: PaymentProvider;



}