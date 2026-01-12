// src/invoices/dto/invoice-data.interface.ts

export interface InvoiceEmitter {
  companyName: string;
  cuit: number;
  address: string;
  ivaCondition: string;
  iibb: string;
  startDate: string; // YYYY-MM-DD
  pointOfSale: number;
}

export interface InvoiceCustomer {
  documentType: number; // 99 consumidor final
  documentNumber: number; // 0
  name: string;
  ivaCondition: string;
  address?: string;
}

export interface InvoiceItem {
  code?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotal: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  otherTaxes: number;
  total: number;
}

export interface InvoiceAFIPData {
  voucherNumber: number;
  cae: string;
  caeDueDate: string; // YYYY-MM-DD o YYYYMMDD según lo guardes
  invoiceType: 'C';
  cbteType: number; // 11
}

export interface InvoiceMetadata {
  issueDate: string; // YYYY-MM-DD
  paymentDueDate?: string; // YYYY-MM-DD
  currency: string; // PES
}

export interface InvoiceData {
  emitter: InvoiceEmitter;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  afip: InvoiceAFIPData;
  metadata: InvoiceMetadata;

  // para el QR, lo generamos después y lo inyectamos acá
  qrBase64?: string; // data:image/png;base64,...
}
