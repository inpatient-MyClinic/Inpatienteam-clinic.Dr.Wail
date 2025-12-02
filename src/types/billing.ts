
export interface PriceComparison {
  id: string;
  serviceCode: string;
  serviceName: string;
  hospital: string;
  systemPrice: number;
  uploadedPrice: number;
  priceDifference: number;
  percentageDifference: number;
  isMatched: boolean;
  acceptedAt?: string;
}

export interface HospitalBillingStatus {
  hospital: string;
  month: string;
  year: number;
  totalMatched: number;
  totalUnmatched: number;
  totalAmount: number;
  vatAmount: number;
  isVatInvoiceIssued: boolean;
  vatInvoiceDate?: string;
  vatInvoiceNumber?: string;
}

export interface VATInvoice {
  id: string;
  invoiceNumber: string;
  hospital: string;
  month: string;
  year: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  issuedAt: string;
  status: 'issued' | 'paid' | 'cancelled';
}

export const VAT_RATE = 0.15; // 15%
