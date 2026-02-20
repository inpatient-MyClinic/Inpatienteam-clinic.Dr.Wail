
// Centralized provider and hospital info for VAT invoices
// Stored in localStorage so it can be configured from SystemSettings

export interface ProviderInfo {
  name: string;
  nameAr: string;
  address: string;
  addressAr: string;
  vatNumber: string;
  crNumber: string;
  shareCapital: string;
}

export interface HospitalInfo {
  name: string;
  address: string;
  vatNumber: string;
}

const DEFAULT_PROVIDER: ProviderInfo = {
  name: 'My Clinic International Medical Company Limited',
  nameAr: 'شركة مجمع عيادتي الدولية الطبية المحدودة',
  address: '0044, 7764 Al Amir Sultan, Al Muhammadiyah Dist., Jeddah, Makkah, SA, 23617',
  addressAr: '0044، 7764 الأمير سلطان، حي المحمدية، جدة، مكة، SA، 23617',
  vatNumber: '301155866610003',
  crNumber: '4030265004',
  shareCapital: 'SAR 83,000,000.00'
};

export function getProviderInfo(): ProviderInfo {
  const saved = localStorage.getItem('providerInfo');
  if (saved) {
    try { return { ...DEFAULT_PROVIDER, ...JSON.parse(saved) }; } catch { /* fallback */ }
  }
  return DEFAULT_PROVIDER;
}

export function saveProviderInfo(info: ProviderInfo): void {
  localStorage.setItem('providerInfo', JSON.stringify(info));
}

export function getHospitalDirectory(): Record<string, HospitalInfo> {
  const saved = localStorage.getItem('hospitalDirectory');
  if (saved) {
    try { return JSON.parse(saved); } catch { /* fallback */ }
  }
  return {};
}

export function saveHospitalDirectory(directory: Record<string, HospitalInfo>): void {
  localStorage.setItem('hospitalDirectory', JSON.stringify(directory));
}

export function getHospitalInfo(hospitalName: string): HospitalInfo {
  const directory = getHospitalDirectory();
  return directory[hospitalName] || { name: hospitalName, address: 'N/A', vatNumber: 'N/A' };
}

export function saveHospitalInfo(hospitalName: string, info: HospitalInfo): void {
  const directory = getHospitalDirectory();
  directory[hospitalName] = info;
  saveHospitalDirectory(directory);
}

export function generateInvoiceNumber(existingCount: number): string {
  return `NC01-${String(existingCount + 1).padStart(7, '0')}`;
}

export function generateBatchName(hospitalName: string, month: string, year: number): string {
  return `${hospitalName} - ${month} ${year}`;
}
