import { IsIn, IsOptional, IsUUID } from "class-validator";

export class CreateInvoiceDto{

    @IsUUID()
    orderId: string;

    @IsOptional()
    @IsIn(['C', 'B'])
    invoiceType: 'C' | 'B'
    
}