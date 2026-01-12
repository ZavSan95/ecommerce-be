import QRCode from 'qrcode';

export async function generateAfipQr(params: {
  issueDate: string;        // YYYY-MM-DD
  cuit: number;
  pointOfSale: number;
  cbteType: number;         // 11 Factura C
  voucherNumber: number;
  total: number;
  cae: string;
}) {
  const payload = {
    ver: 1,
    fecha: params.issueDate,
    cuit: params.cuit,
    ptoVta: params.pointOfSale,
    tipoCmp: params.cbteType,
    nroCmp: params.voucherNumber,
    importe: params.total,
    moneda: 'PES',
    ctz: 1,
    tipoDocRec: 99,
    nroDocRec: 0,
    tipoCodAut: 'E',
    codAut: params.cae,
  };

  const url =
    'https://www.afip.gob.ar/fe/qr/?p=' +
    Buffer.from(JSON.stringify(payload)).toString('base64');

  return QRCode.toDataURL(url);
}
