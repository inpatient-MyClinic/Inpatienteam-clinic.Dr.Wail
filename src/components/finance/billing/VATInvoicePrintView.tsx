
import React from 'react';
import { VATInvoice, PROVIDER_INFO } from '@/types/billing';
import { format } from 'date-fns';
import { getLogoUrl } from '@/utils/logoUtils';

interface VATInvoicePrintViewProps {
  invoice: VATInvoice;
}

export default function VATInvoicePrintView({ invoice }: VATInvoicePrintViewProps) {
  const logoUrl = getLogoUrl();
  return (
    <div className="bg-white p-8 max-w-5xl mx-auto text-sm print:p-4" dir="ltr">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-primary pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
            <img src={logoUrl} alt="My Clinic" className="w-20 h-20 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{PROVIDER_INFO.name}</h1>
            <p className="text-muted-foreground text-xs">{PROVIDER_INFO.nameAr}</p>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Tax Invoice</h2>
          <p className="text-lg">فاتورة ضريبية</p>
          <div className="mt-2 w-24 h-24 bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">QR Code</span>
          </div>
        </div>
      </div>

      {/* Provider & Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-xs">
        {/* Provider */}
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Provider's Name:</span>
            <span>{PROVIDER_INFO.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Address:</span>
            <span>{PROVIDER_INFO.address}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">VAT Number:</span>
            <span className="font-mono">{PROVIDER_INFO.vatNumber}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">CR No:</span>
            <span className="font-mono">{PROVIDER_INFO.crNumber}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Share Capital:</span>
            <span>{PROVIDER_INFO.shareCapital}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Date of Supply:</span>
            <span>{invoice.batchDateFrom}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">End Date of Supply:</span>
            <span>{invoice.batchDateTo}</span>
          </div>
        </div>

        {/* Customer */}
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Customer Name:</span>
            <span>{invoice.hospital}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Address:</span>
            <span>{invoice.hospitalAddress || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">VAT Number:</span>
            <span className="font-mono">{invoice.hospitalVatNumber || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Invoice Number:</span>
            <span className="font-mono font-bold">{invoice.invoiceNumber}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Invoice Issue Date:</span>
            <span>{format(new Date(invoice.issuedAt), 'yyyy-MM-dd HH:mm:ss')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Batch Type:</span>
            <span>{invoice.batchType}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Batch Name:</span>
            <span>{invoice.batchName}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Batch Date:</span>
            <span>{invoice.batchDateFrom} to {invoice.batchDateTo}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="border p-2 text-left">Code<br/>الرمز</th>
              <th className="border p-2 text-left">Nature of Service<br/>تفاصيل الخدمات</th>
              <th className="border p-2 text-right">Qty<br/>الكمية</th>
              <th className="border p-2 text-right">Gross Unit Price<br/>سعر الوحدة (SAR)</th>
              <th className="border p-2 text-right">Gross Amount<br/>المبلغ الإجمالي (SAR)</th>
              <th className="border p-2 text-right">Discount<br/>تخفيض (SAR)</th>
              <th className="border p-2 text-right">Amount After Discount<br/>المبلغ بعد الخصم (SAR)</th>
              <th className="border p-2 text-right">Patient Share<br/>حصة المريض (SAR)</th>
              <th className="border p-2 text-right">Insurance Share<br/>حصة التأمين (SAR)</th>
              <th className="border p-2 text-right">VAT Rate<br/>نسبة الضريبة (%)</th>
              <th className="border p-2 text-right">VAT Amount<br/>قيمة الضريبة (SAR)</th>
              <th className="border p-2 text-right">Item Subtotal<br/>المجموع (SAR)</th>
              <th className="border p-2 text-center">VAT Cat<br/>رمز فئة</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/50">
                <td className="border p-2 font-mono">{item.code}</td>
                <td className="border p-2">{item.natureOfService}<br/><span className="text-muted-foreground">{item.details}</span></td>
                <td className="border p-2 text-right">{item.quantity.toFixed(2)}</td>
                <td className="border p-2 text-right">{item.grossUnitPrice.toLocaleString()}</td>
                <td className="border p-2 text-right">{item.grossAmount.toLocaleString()}</td>
                <td className="border p-2 text-right">{item.discount.toLocaleString()}</td>
                <td className="border p-2 text-right">{item.amountAfterDiscount.toLocaleString()}</td>
                <td className="border p-2 text-right">{item.patientShare.toLocaleString()}</td>
                <td className="border p-2 text-right">{item.insuranceShare.toLocaleString()}</td>
                <td className="border p-2 text-right">{item.vatRate.toFixed(2)}</td>
                <td className="border p-2 text-right">{item.vatAmount.toLocaleString()}</td>
                <td className="border p-2 text-right font-medium">{item.itemSubtotal.toLocaleString()}</td>
                <td className="border p-2 text-center">{item.vatCategoryCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-96 bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between py-1 border-b">
            <span>Total Excluding VAT (SAR):</span>
            <span className="font-medium">{invoice.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span>Total VAT (SAR):</span>
            <span className="font-medium">{invoice.vatAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold">
            <span>Total Amount Including VAT (SAR):</span>
            <span>{invoice.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-t">
            <span>Total Amount Due (SAR):</span>
            <span className="font-bold">{invoice.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 text-xs text-muted-foreground">
            <span>VAT Category Code:</span>
            <span>Standard rate(S) / المعدل الأساسي(S)</span>
          </div>
        </div>
      </div>

      {/* Arabic Totals Labels */}
      <div className="flex justify-end mt-2 text-xs text-muted-foreground">
        <div className="w-96 text-right" dir="rtl">
          <p>الإجمالي باستثناء ضريبة القيمة المضافة (SAR)</p>
          <p>إجمالي ضريبة القيمة المضافة (SAR)</p>
          <p>المبلغ الإجمالي شاملاً ضريبة القيمة المضافة (SAR)</p>
          <p>إجمالي المبلغ المستحق (SAR)</p>
        </div>
      </div>
    </div>
  );
}
