import Afip from '@afipsdk/afip.js';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface FacturaCInput {
  total: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

@Injectable()
export class AfipService {
  private afip: Afip;

  constructor() {
    const cert = process.env.AFIP_CERT;
    const key = process.env.AFIP_KEY;
    const cuitEnv = process.env.CUIT;

    if (!cert || !key || !cuitEnv) {
      throw new Error(
        'Faltan variables de entorno AFIP (CERT, KEY o CUIT)',
      );
    }

    this.afip = new Afip({
      CUIT: Number(cuitEnv),
      cert, // 👈 contenido directo
      key,  // 👈 contenido directo
      production: process.env.AFIP_PRODUCTION === 'true',
      access_token: process.env.AFIP_ACCESS_TOKEN,
    });
  }

  async createFacturaC(data: FacturaCInput) {
    try {
      const puntoVenta = 3;
      const tipoFacturaC = 11;

      const lastVoucher =
        await this.afip.ElectronicBilling.getLastVoucher(
          puntoVenta,
          tipoFacturaC
        );

      const voucherNumber = lastVoucher + 1;

      const today = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');

      const result =
        await this.afip.ElectronicBilling.createVoucher({
          CantReg: 1,
          PtoVta: puntoVenta,
          CbteTipo: tipoFacturaC,
          Concepto: 1,
          DocTipo: 99,
          DocNro: 0,
          CbteDesde: voucherNumber,
          CbteHasta: voucherNumber,
          CbteFch: Number(today),

          ImpTotal: data.total,
          ImpTotConc: 0,
          ImpNeto: data.total,
          ImpOpEx: 0,
          ImpIVA: 0,
          ImpTrib: 0,

          MonId: 'PES',
          MonCotiz: 1,
        });

      return {
        voucherNumber,
        cae: result.CAE,
        caeDueDate: result.CAEFchVto,
        afipResponse: result,
      };
    } catch (error) {
      console.error('❌ AFIP ERROR:', error);
      throw new InternalServerErrorException(
        'Error al emitir la factura en AFIP'
      );
    }
  }

  async createFacturaCPdf(data: {
    html: string;
    fileName: string;
  }){

    const options = {
      width: 8,
      marginLeft: 0.4,
      marginRight: 0.4,
      marginTop: 0.4,
      marginBottom: 0.4,
    };

    const res = await this.afip.ElectronicBilling.createPDF({
      html: data.html,
      file_name: data.fileName, options
    });

    return res.file;
  }

  async createPdfFromHtml(
    html: string,
      opts: { fileName: string },
      ) {
      return this.afip.ElectronicBilling.createPDF({
          html,
          file_name: opts.fileName,
          options: {
          width: 8,
          marginLeft: 0.4,
          marginRight: 0.4,
          marginTop: 0.4,
          marginBottom: 0.4,
          },
      });
  }
}
