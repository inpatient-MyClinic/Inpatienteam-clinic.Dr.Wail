
// Central logo utility - all reports/PDFs/invoices should use this
// When the logo changes in SystemSettings, it updates localStorage
// and all generated reports will use the latest logo automatically.

export function getLogoUrl(): string {
  const customLogo = localStorage.getItem('clinicLogo');
  if (customLogo) return customLogo;
  // Fall back to generated report logo (public asset)
  return window.location.origin + '/logo-report.png';
}

export function getLogoHtml(width = 120): string {
  const logoUrl = getLogoUrl();
  return `<img src="${logoUrl}" alt="My Clinic" style="height:${width}px;width:auto;" />`;
}

export function getPrintHeaderHtml(subtitle?: string): string {
  return `
    <div style="text-align:center;border-bottom:3px solid #1e40af;padding-bottom:15px;margin-bottom:25px;">
      ${getLogoHtml(80)}
      <h1 style="color:#1e40af;margin:8px 0 0;font-size:24px;">My Clinic</h1>
      ${subtitle ? `<p style="color:#666;margin:4px 0;font-size:14px;">${subtitle}</p>` : ''}
    </div>
  `;
}
