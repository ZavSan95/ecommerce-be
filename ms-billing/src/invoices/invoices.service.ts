import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AfipService } from '../afip/afip.service';
import { buildInvoiceHtml } from './invoice-html.builder';
import { generateAfipQr } from './qr/afip-qr';
import { InvoiceData } from './dto/invoice-data.interface';
import { PrismaService } from '../database/prisma.service';
import axios from 'axios';
import { WasabiService } from '../storage/wasabi.service';



@Injectable()
export class InvoicesService {
  constructor(
    private readonly afipService: AfipService,
    private readonly prisma: PrismaService,
    private readonly wasabi: WasabiService
  ) {}

  async createInvoiceFromOrder(order: {
    id: string;
    customerName: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    total: number;
  }) {
    try {
      /* =====================================================
       * 1️⃣ Emitir factura en AFIP
       * ===================================================== */
      const afipResult = await this.afipService.createFacturaC({
        total: order.total,
        items: order.items,
      });

      /* =====================================================
       * 2️⃣ Persistir factura (DB = respaldo legal)
       * ===================================================== */
      const invoiceRecord = await this.prisma.invoice.create({
        data: {
          orderId: order.id,

          invoiceType: 'C',
          pointOfSale: Number(process.env.BILLING_POINT_OF_SALE),
          voucherNumber: afipResult.voucherNumber,
          voucherDate: new Date(),

          cae: afipResult.cae,
          caeDueDate: new Date(afipResult.caeDueDate),

          currency: 'ARS',
          totalAmount: order.total,
          netAmount: order.total,
          taxAmount: 0,

          customerName: order.customerName,
          customerDocType: '99',
          customerDocNumber: '0',

          afipResponse: afipResult.afipResponse,

          items: {
            create: order.items.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: i.quantity * i.unitPrice,
            })),
          },
        },
      });

      /* =====================================================
       * 3️⃣ Construir InvoiceData (HTML / PDF)
       * ===================================================== */
      const invoice: InvoiceData = {
        emitter: {
          companyName: process.env.BILLING_COMPANY_NAME!,
          cuit: Number(process.env.BILLING_CUIT),
          address: process.env.BILLING_ADDRESS!,
          ivaCondition: process.env.BILLING_IVA_CONDITION!,
          iibb: process.env.BILLING_IIBB!,
          startDate: process.env.BILLING_START_DATE!,
          pointOfSale: Number(process.env.BILLING_POINT_OF_SALE),
        },
        customer: {
          documentType: 99,
          documentNumber: 0,
          name: order.customerName,
          ivaCondition: 'Consumidor Final',
        },
        items: order.items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit: 'Unidad',
          unitPrice: i.unitPrice,
          discountPercent: 0,
          discountAmount: 0,
          subtotal: i.quantity * i.unitPrice,
        })),
        totals: {
          subtotal: order.total,
          discount: 0,
          otherTaxes: 0,
          total: order.total,
        },
        afip: {
          voucherNumber: afipResult.voucherNumber,
          cae: afipResult.cae,
          caeDueDate: afipResult.caeDueDate,
          invoiceType: 'C',
          cbteType: 11,
        },
        metadata: {
          issueDate: new Date().toISOString().slice(0, 10),
          currency: 'PES',
        },
      };

      /* =====================================================
       * 4️⃣ Generar QR AFIP
       * ===================================================== */
      invoice.qrBase64 = await generateAfipQr({
        issueDate: invoice.metadata.issueDate,
        cuit: invoice.emitter.cuit,
        pointOfSale: invoice.emitter.pointOfSale,
        cbteType: invoice.afip.cbteType,
        voucherNumber: invoice.afip.voucherNumber,
        total: invoice.totals.total,
        cae: invoice.afip.cae,
      });

      /* =====================================================
       * 5️⃣ Generar PDF (representación)
       * ===================================================== */
      const html = buildInvoiceHtml(invoice);

      const pdf = await this.afipService.createPdfFromHtml(html, {
        fileName: `Factura_${invoice.afip.voucherNumber}`,
      });

      /* =====================================================
       * 6️⃣ (opcional) Guardar metadata PDF luego
       * ===================================================== */
      const pdfBuffer = Buffer.from(
        (await axios.get(pdf.file, { responseType: 'arraybuffer' })).data,
      );

      const fileKey = `invoices/${invoiceRecord.id}.pdf`;

      const pdfUrl = await this.wasabi.uploadPdf(fileKey, pdfBuffer);

      await this.prisma.invoiceFile.create({
        data: {
          invoiceId: invoiceRecord.id,
          type: 'PDF',
          storage: 'WASABI',
          path: fileKey,
          url: String(pdfUrl),
        },
      });
      

      return {
        invoiceId: invoiceRecord.id,
        orderId: order.id,
        voucherNumber: invoice.afip.voucherNumber,
        cae: invoice.afip.cae,
        caeDueDate: invoice.afip.caeDueDate,
        pdfUrl: pdfUrl,
      };
    } catch (error) {
      console.error('❌ Error creando factura:', error);
      throw new InternalServerErrorException(
        'No se pudo emitir la factura',
      );
    }
  }
}
