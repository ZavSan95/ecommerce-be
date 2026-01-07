import { BadRequestException, Injectable } from '@nestjs/common';
import { AfipService } from 'src/afip/afip.service';
import { CreateInvoiceDto } from 'src/dto/create-invoice.dto';


@Injectable()
export class InvoicesService {

    constructor(private readonly afipService: AfipService){}

    async createInvoice(dto: CreateInvoiceDto){

        const fakeOrder = {
            id: dto.orderId,
            status: 'paid',
            total: 100,
            items: [
                {
                description: 'Producto de prueba',
                quantity: 1,
                unitPrice: 100,
                },
            ],
        };

        if (fakeOrder.status !== 'paid') {
            throw new BadRequestException(
                'Solo se pueden facturar órdenes pagadas'
            );
        }

        const invoice = this.afipService.createFacturaC({
            total: fakeOrder.total,
            items: fakeOrder.items
        });

        return {
            message: 'Factura emitida correctamente',
            orderId: fakeOrder.id,
            invoiceType: 'C',
            voucherNumber: (await invoice).voucherNumber,
            cae: (await invoice).cae,
            caeDueDate: (await invoice).caeDueDate,
        };

    }
}
