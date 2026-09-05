import { assetUrl } from "./assetUrl";

// بيفتح نافذة جديدة فيها فاتورة جاهزة للطباعة لعملية بيع أو شراء
export function printInvoice({ type, record, settings }) {
  const isSale = type === "sale";
  const title = isSale ? "فاتورة بيع" : "فاتورة شراء";
  const partyLabel = isSale ? "العميل" : "المورد";
  const partyName = isSale ? record.customerName : record.supplierName;
  const unitLabel = isSale ? "سعر البيع" : "سعر الشراء";
  const unitValue = isSale ? record.unitPrice : record.unitCost;

  const logoHtml = settings?.storeLogo
    ? `<img src="${assetUrl(settings.storeLogo)}" alt="logo" style="height:56px;width:56px;object-fit:cover;border-radius:10px;" />`
    : "";

  const html = `
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          body { font-family: Tahoma, Arial, sans-serif; padding: 32px; color: #16324F; }
          .header { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #2563EB; padding-bottom: 16px; margin-bottom: 20px; }
          .store-name { font-size: 22px; font-weight: bold; margin: 0; }
          .store-meta { font-size: 13px; color: #555; margin: 2px 0 0; }
          .invoice-title { text-align: left; font-size: 18px; font-weight: bold; color: #2563EB; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 14px; }
          th { background: #F3F7FD; }
          .total-row td { font-weight: bold; background: #DBEAFE; }
          .footer { border-top: 1px solid #ddd; margin-top: 40px; padding-top: 14px; font-size: 12px; color: #777; text-align: center; }
          .dev-credit { margin-top: 6px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoHtml}
          <div>
            <p class="store-name">${settings?.storeName || "المحل"}</p>
            ${settings?.storePhone ? `<p class="store-meta">${settings.storePhone}</p>` : ""}
            ${settings?.storeAddress ? `<p class="store-meta">${settings.storeAddress}</p>` : ""}
          </div>
        </div>

        <div class="invoice-title">${title} — ${new Date(record.date).toLocaleDateString("ar-EG")}</div>

        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>${unitLabel}</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${record.product?.name || ""}</td>
              <td>${record.quantity}</td>
              <td>${unitValue} ${settings?.currency || "ج.م"}</td>
              <td>${record.total.toLocaleString()} ${settings?.currency || "ج.م"}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3">الإجمالي</td>
              <td>${record.total.toLocaleString()} ${settings?.currency || "ج.م"}</td>
            </tr>
          </tbody>
        </table>

        ${partyName ? `<p>${partyLabel}: ${partyName}</p>` : ""}
        ${isSale && record.paymentMethod ? `<p>طريقة الدفع: ${record.paymentMethod}</p>` : ""}

        <div class="footer">
          <div>${settings?.storeName || "المحل"} — ${settings?.invoiceFooterNote || "شكراً لتعاملكم معنا"}</div>
          <div class="dev-credit">تم التصميم بواسطة عبدالرحمن فضل — 01021330018</div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const win = window.open("", "_blank", "width=700,height=800");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
