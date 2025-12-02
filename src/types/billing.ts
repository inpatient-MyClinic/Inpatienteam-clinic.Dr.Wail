
export interface PriceComparison {
  id: string;
  serviceCode: string;
  serviceName: string;
  hospital: string;
  systemPrice: number;
  uploadedPrice: number;
  priceDifference: number;
  percentageDifference: number;
  quantity: number;
  grossAmount: number;
  discount: number;
  amountAfterDiscount: number;
  patientShare: number;
  insuranceShare: number;
  status: 'pending' | 'matched' | 'agreed' | 'not_agreed';
  acceptedAt?: string;
  uploadBatchId: string;
}

export interface UploadBatch {
  id: string;
  hospital: string;
  fileName: string;
  uploadedAt: string;
  month: string;
  year: number;
  itemCount: number;
  status: 'pending' | 'reviewed' | 'completed';
}

export interface HospitalBillingStatus {
  hospital: string;
  month: string;
  year: number;
  totalMatched: number;
  totalAgreed: number;
  totalNotAgreed: number;
  totalPending: number;
  totalAmount: number;
  vatAmount: number;
  isVatInvoiceIssued: boolean;
  vatInvoiceDate?: string;
  vatInvoiceNumber?: string;
}

export interface VATInvoiceLineItem {
  code: string;
  natureOfService: string;
  details: string;
  quantity: number;
  grossUnitPrice: number;
  grossAmount: number;
  discount: number;
  amountAfterDiscount: number;
  patientShare: number;
  insuranceShare: number;
  vatRate: number;
  vatAmount: number;
  itemSubtotal: number;
  vatCategoryCode: string;
}

export interface VATInvoice {
  id: string;
  invoiceNumber: string;
  hospital: string;
  hospitalAddress?: string;
  hospitalVatNumber?: string;
  month: string;
  year: number;
  batchType: string;
  batchName: string;
  batchDateFrom: string;
  batchDateTo: string;
  lineItems: VATInvoiceLineItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  issuedAt: string;
  status: 'issued' | 'sent' | 'paid' | 'cancelled';
  emailSentAt?: string;
}

export const VAT_RATE = 0.15; // 15%

export const PROVIDER_INFO = {
  name: 'My Clinic International Medical Company Limited',
  nameAr: 'شركة مجمع عيادتي الدولية الطبية المحدودة',
  address: '0044, 7764 Al Amir Sultan, Al Muhammadiyah Dist., Jeddah, Makkah, SA, 23617',
  addressAr: '0044، 7764 الأمير سلطان، حي المحمدية، جدة، مكة، SA، 23617',
  vatNumber: '301155866610003',
  crNumber: '4030265004',
  shareCapital: 'SAR 83,000,000.00'
};
