// src/invoices/invoice-html.builder.ts

import { InvoiceData } from './dto/invoice-data.interface';

function formatMoney(n: number) {
  // AR style: 150,00
  return n.toFixed(2).replace('.', ',');
}

function formatDateAr(iso: string) {
  // iso: YYYY-MM-DD
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function pad(n: number, len: number) {
  return String(n).padStart(len, '0');
}

export function buildInvoiceHtml(invoice: InvoiceData) {
  const { emitter, customer, items, totals, afip, metadata } = invoice;

  const pv = pad(emitter.pointOfSale, 4);
  const cbte = pad(afip.voucherNumber, 9);

  const rows = items
    .map((it) => {
      const qty = formatMoney(it.quantity);
      const unitPrice = formatMoney(it.unitPrice);
      const discPct = formatMoney(it.discountPercent);
      const discAmt = formatMoney(it.discountAmount);
      const subtotal = formatMoney(it.subtotal);

      return `
        <tr>
          <td>${it.code ?? '-'}</td>
          <td>${it.description}</td>
          <td>${qty}</td>
          <td>${it.unit}</td>
          <td>${unitPrice}</td>
          <td>${discPct}</td>
          <td>${discAmt}</td>
          <td>${subtotal}</td>
        </tr>
      `;
    })
    .join('');

  // CAE due date: si lo guardás como YYYYMMDD, lo convertimos
  const caeDue =
    afip.caeDueDate.includes('-')
      ? formatDateAr(afip.caeDueDate)
      : `${afip.caeDueDate.slice(6, 8)}/${afip.caeDueDate.slice(
          4,
          6,
        )}/${afip.caeDueDate.slice(0, 4)}`;

  const issueDate = formatDateAr(metadata.issueDate);

  // Si todavía no generamos el QR, dejamos uno vacío
  const qrImg = invoice.qrBase64
    ? `<img id="qrcode" src="${invoice.qrBase64}">`
    : `<div style="width:50%;height:180px;border:1px dashed #999;display:flex;align-items:center;justify-content:center;font-size:12px;color:#666;">
         QR pendiente
       </div>`;

  // Template basado en el HTML de AFIP SDK, con datos dinámicos
  return `<!DOCTYPE html>
<html>
<head>
  <title>Factura</title>
  <style type="text/css">
    *{
      box-sizing: border-box;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    .bill-container{
      width: 750px;
      position: absolute;
      left:0;
      right: 0;
      margin: auto;
      border-collapse: collapse;
      font-family: sans-serif;
      font-size: 13px;
    }
    .bill-emitter-row td{
      width: 50%;
      border-bottom: 1px solid;
      padding-top: 10px;
      padding-left: 10px;
      vertical-align: top;
    }
    .bill-emitter-row{ position: relative; }
    .bill-emitter-row td:nth-child(2){ padding-left: 60px; }
    .bill-emitter-row td:nth-child(1){ padding-right: 60px; }

    .bill-type{
      border: 1px solid;
      border-top: 1px solid;
      border-bottom: 1px solid;
      margin-right: -30px;
      background: white;
      width: 60px;
      height: 50px;
      position: absolute;
      left: 0;
      right: 0;
      top: -1px;
      margin: auto;
      text-align: center;
      font-size: 40px;
      font-weight: 600;
    }
    .text-lg{ font-size: 30px; }
    .text-center{ text-align: center; }

    .col-2{ width: 16.66666667%; float: left; }
    .col-3{ width: 25%; float: left; }
    .col-4{ width: 33.3333333%; float: left; }
    .col-5{ width: 41.66666667%; float: left; }
    .col-6{ width: 50%; float: left; }
    .col-8{ width: 66.66666667%; float: left; }
    .col-10{ width: 83.33333333%; float: left; }
    .row{ overflow: hidden; }

    .margin-b-0{ margin-bottom: 0px; }

    .bill-row td{ padding-top: 5px }
    .bill-row td > div{
      border-top: 1px solid;
      border-bottom: 1px solid;
      margin: 0 -1px 0 -2px;
      padding: 0 10px 13px 10px;
    }

    .row-details table { border-collapse: collapse; width: 100%; }
    .row-details td > div, .row-qrcode td > div{
      border: 0;
      margin: 0 -1px 0 -2px;
      padding: 0;
    }
    .row-details table td{ padding: 5px; }
    .row-details table tr:nth-child(1){
      border-top: 1px solid;
      border-bottom: 1px solid;
      background: #c0c0c0;
      font-weight: bold;
      text-align: center;
    }
    .row-details table tr +  tr{
      border-top: 1px solid #c0c0c0;
    }

    .text-right{ text-align: right; }
    .margin-b-10 { margin-bottom: 10px; }

    .total-row td > div{ border-width: 2px; }

    .row-qrcode td{ padding: 10px; }
    #qrcode { width: 50% }
  </style>
</head>
<body>
  <table class="bill-container">
    <tr class="bill-emitter-row">
      <td>
        <div class="bill-type">${afip.invoiceType}</div>
        <div class="text-lg text-center">${emitter.companyName}</div>
        <p><strong>Razón social:</strong> ${emitter.companyName}</p>
        <p><strong>Domicilio Comercial:</strong> ${emitter.address}</p>
        <p><strong>Condición Frente al IVA:</strong> ${emitter.ivaCondition}</p>
      </td>

      <td>
        <div>
          <div class="text-lg">Factura</div>
          <div class="row">
            <p class="col-6 margin-b-0">
              <strong>Punto de Venta: ${pv}</strong>
            </p>
            <p class="col-6 margin-b-0">
              <strong>Comp. Nro: ${cbte}</strong>
            </p>
          </div>
          <p><strong>Fecha de Emisión:</strong> ${issueDate}</p>
          <p><strong>CUIT:</strong> ${emitter.cuit}</p>
          <p><strong>Ingresos Brutos:</strong> ${emitter.iibb}</p>
          <p><strong>Fecha de Inicio de Actividades:</strong> ${formatDateAr(
            emitter.startDate,
          )}</p>
        </div>
      </td>
    </tr>

    <tr class="bill-row">
      <td colspan="2">
        <div class="row">
          <p class="col-4 margin-b-0">
            <strong>Período Facturado Desde: </strong>${issueDate}
          </p>
          <p class="col-3 margin-b-0">
            <strong>Hasta: </strong>${issueDate}
          </p>
          <p class="col-5 margin-b-0">
            <strong>Fecha de Vto. para el pago: </strong>${
              metadata.paymentDueDate
                ? formatDateAr(metadata.paymentDueDate)
                : issueDate
            }
          </p>
        </div>
      </td>
    </tr>

    <tr class="bill-row">
      <td colspan="2">
        <div>
          <div class="row">
            <p class="col-4 margin-b-0">
              <strong>CUIL/CUIT: </strong>${customer.documentType === 99 ? '-' : customer.documentNumber}
            </p>
            <p class="col-8 margin-b-0">
              <strong>Apellido y Nombre / Razón social: </strong>${customer.name}
            </p>
          </div>
          <div class="row">
            <p class="col-6 margin-b-0">
              <strong>Condición Frente al IVA: </strong>${customer.ivaCondition}
            </p>
            <p class="col-6 margin-b-0">
              <strong>Domicilio: </strong>${customer.address ?? '-'}
            </p>
          </div>
          <p><strong>Condicion de venta: </strong>Efectivo</p>
        </div>
      </td>
    </tr>

    <tr class="bill-row row-details">
      <td colspan="2">
        <div>
          <table>
            <tr>
              <td>Código</td>
              <td>Producto / Servicio</td>
              <td>Cantidad</td>
              <td>U. Medida</td>
              <td>Precio Unit.</td>
              <td>% Bonif.</td>
              <td>Imp. Bonif.</td>
              <td>Subtotal</td>
            </tr>
            ${rows}
          </table>
        </div>
      </td>
    </tr>

    <tr class="bill-row total-row">
      <td colspan="2">
        <div>
          <div class="row text-right">
            <p class="col-10 margin-b-0"><strong>Subtotal: $</strong></p>
            <p class="col-2 margin-b-0"><strong>${formatMoney(
              totals.subtotal,
            )}</strong></p>
          </div>

          <div class="row text-right">
            <p class="col-10 margin-b-0"><strong>Importe Otros Tributos: $</strong></p>
            <p class="col-2 margin-b-0"><strong>${formatMoney(
              totals.otherTaxes,
            )}</strong></p>
          </div>

          <div class="row text-right">
            <p class="col-10 margin-b-0"><strong>Importe total: $</strong></p>
            <p class="col-2 margin-b-0"><strong>${formatMoney(
              totals.total,
            )}</strong></p>
          </div>
        </div>
      </td>
    </tr>

    <tr class="bill-row row-details">
      <td>
        <div>${qrImg}</div>
      </td>
      <td>
        <div>
          <div class="row text-right margin-b-10">
            <strong>CAE Nº:&nbsp;</strong> ${afip.cae}
          </div>
          <div class="row text-right">
            <strong>Fecha de Vto. de CAE:&nbsp;</strong> ${caeDue}
          </div>
        </div>
      </td>
    </tr>

    <tr class="bill-row row-details">
      <td colspan="2">
        <div>
          <div class="row text-center margin-b-10">
            <span>Generado por billing-service</span>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
