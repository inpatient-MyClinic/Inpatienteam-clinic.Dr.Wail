import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// Riyadh timezone for consistent date handling
const RIYADH_TZ = 'Asia/Riyadh';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: Record<string, any>;
}

export interface AnalyticsData {
  id: string;
  request_date: string | Date;
  completed_at?: string | Date;
  status: string;
  hospital: string;
  specialty: string;
  patient_name: string;
  mrn: string;
  [key: string]: any;
}

// Normalize date to Riyadh timezone and return consistent format
export const normalizeDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  
  let date: Date;
  
  // Handle Excel serial numbers
  if (typeof dateValue === 'number' && dateValue > 25000) {
    date = new Date((dateValue - 25569) * 86400 * 1000);
  } else if (typeof dateValue === 'string' && !isNaN(Number(dateValue)) && Number(dateValue) > 25000) {
    date = new Date((Number(dateValue) - 25569) * 86400 * 1000);
  } else {
    date = new Date(dateValue);
  }
  
  if (isNaN(date.getTime())) return null;
  
  // Convert to Riyadh timezone to ensure consistency
  return toZonedTime(date, RIYADH_TZ);
};

// Normalize status for consistent counting
export const normalizeStatus = (status: any): string => {
  if (!status) return 'unknown';
  const s = String(status).trim().toLowerCase().replace(/\s+/g, '');
  
  if (s === 'done' || s === 'completed') return 'completed';
  if (s === 'scheduled') return 'scheduled';
  if (s === 'plannednvd' || s === 'planned_nvd') return 'planned_nvd';
  if (s === 'pending' || s === 'inprogress') return 'pending';
  if (s === 'cancelled' || s === 'canceled' || s === 'rejected') return 'cancelled';
  
  return s;
};

// Check if counts equal sum of filtered table rows
export const validateCountsMatchFiltered = (
  allData: AnalyticsData[],
  filteredData: AnalyticsData[],
  countsToCheck: Record<string, number>
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: Record<string, any> = {};
  
  // Calculate actual counts from filtered data
  const actualCounts = {
    total: filteredData.length,
    completed: filteredData.filter(item => normalizeStatus(item.status) === 'completed').length,
    pending: filteredData.filter(item => normalizeStatus(item.status) === 'pending').length,
    scheduled: filteredData.filter(item => normalizeStatus(item.status) === 'scheduled').length,
    cancelled: filteredData.filter(item => normalizeStatus(item.status) === 'cancelled').length,
    planned_nvd: filteredData.filter(item => normalizeStatus(item.status) === 'planned_nvd').length,
  };
  
  details.actualCounts = actualCounts;
  details.providedCounts = countsToCheck;
  
  // Compare provided counts with actual counts
  Object.keys(countsToCheck).forEach(key => {
    if (actualCounts[key as keyof typeof actualCounts] !== countsToCheck[key]) {
      errors.push(`Count mismatch for ${key}: expected ${actualCounts[key as keyof typeof actualCounts]}, got ${countsToCheck[key]}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details
  };
};

// Check if month filter matches visible table rows
export const validateMonthFilterAccuracy = (
  allData: AnalyticsData[],
  selectedMonths: string[],
  filteredData: AnalyticsData[],
  useCompletedDate = false
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: Record<string, any> = {};
  
  if (selectedMonths.length === 0) {
    return { isValid: true, errors: [], warnings: ['No month filter applied'], details: {} };
  }
  
  // Parse selected months to indices
  const monthMap: Record<string, number> = {
    'january': 0, 'february': 1, 'march': 2, 'april': 3,
    'may': 4, 'june': 5, 'july': 6, 'august': 7,
    'september': 8, 'october': 9, 'november': 10, 'december': 11
  };
  
  const selectedMonthIndices = selectedMonths
    .map(month => monthMap[month.toLowerCase()])
    .filter(index => index !== undefined);
  
  details.selectedMonthIndices = selectedMonthIndices;
  
  // Manually filter data based on selected months
  const expectedFilteredData = allData.filter(item => {
    const dateField = useCompletedDate ? item.completed_at : item.request_date;
    const date = normalizeDate(dateField);
    
    if (!date) return false;
    return selectedMonthIndices.includes(date.getMonth());
  });
  
  details.expectedCount = expectedFilteredData.length;
  details.actualCount = filteredData.length;
  details.useCompletedDate = useCompletedDate;
  
  // Check if counts match
  if (expectedFilteredData.length !== filteredData.length) {
    errors.push(`Month filter mismatch: expected ${expectedFilteredData.length} records, got ${filteredData.length}`);
  }
  
  // Check if the same records are included (by ID)
  const expectedIds = new Set(expectedFilteredData.map(item => item.id));
  const actualIds = new Set(filteredData.map(item => item.id));
  
  const missingIds = [...expectedIds].filter(id => !actualIds.has(id));
  const extraIds = [...actualIds].filter(id => !expectedIds.has(id));
  
  if (missingIds.length > 0) {
    warnings.push(`Missing ${missingIds.length} expected records: ${missingIds.slice(0, 5).join(', ')}${missingIds.length > 5 ? '...' : ''}`);
  }
  
  if (extraIds.length > 0) {
    warnings.push(`Found ${extraIds.length} unexpected records: ${extraIds.slice(0, 5).join(', ')}${extraIds.length > 5 ? '...' : ''}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details
  };
};

// Check for duplicate imports (idempotent upsert)
export const validateNoDuplicateImports = (
  beforeImportData: AnalyticsData[],
  afterImportData: AnalyticsData[],
  importedData: AnalyticsData[]
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: Record<string, any> = {};
  
  // Create deduplication key function
  const getDedupeKey = (item: AnalyticsData) => {
    const date = normalizeDate(item.request_date);
    const dateStr = date ? formatInTimeZone(date, RIYADH_TZ, 'yyyy-MM-dd') : 'unknown';
    return `${item.mrn}_${item.hospital}_${dateStr}_${item.specialty}`.toLowerCase();
  };
  
  // Track duplicates in import data itself
  const importKeys = new Map<string, number>();
  importedData.forEach(item => {
    const key = getDedupeKey(item);
    importKeys.set(key, (importKeys.get(key) || 0) + 1);
  });
  
  const duplicatesInImport = [...importKeys.entries()].filter(([, count]) => count > 1);
  if (duplicatesInImport.length > 0) {
    warnings.push(`Found ${duplicatesInImport.length} duplicate keys in import data`);
    details.duplicatesInImport = duplicatesInImport;
  }
  
  // Check if re-import creates duplicates
  const beforeKeys = new Set(beforeImportData.map(getDedupeKey));
  const afterKeys = afterImportData.map(getDedupeKey);
  const afterKeyCount = new Map<string, number>();
  
  afterKeys.forEach(key => {
    afterKeyCount.set(key, (afterKeyCount.get(key) || 0) + 1);
  });
  
  const duplicatesAfterImport = [...afterKeyCount.entries()].filter(([, count]) => count > 1);
  if (duplicatesAfterImport.length > 0) {
    errors.push(`Import created ${duplicatesAfterImport.length} duplicate records`);
    details.duplicatesAfterImport = duplicatesAfterImport;
  }
  
  // Expected count calculation
  const uniqueImportKeys = new Set(importedData.map(getDedupeKey));
  const newRecords = [...uniqueImportKeys].filter(key => !beforeKeys.has(key)).length;
  const updatedRecords = [...uniqueImportKeys].filter(key => beforeKeys.has(key)).length;
  const expectedAfterCount = beforeImportData.length + newRecords;
  
  details.beforeCount = beforeImportData.length;
  details.afterCount = afterImportData.length;
  details.expectedAfterCount = expectedAfterCount;
  details.newRecords = newRecords;
  details.updatedRecords = updatedRecords;
  
  if (afterImportData.length !== expectedAfterCount) {
    errors.push(`Expected ${expectedAfterCount} records after import, got ${afterImportData.length}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details
  };
};

// Check timezone consistency (no off-by-one-day errors)
export const validateTimezoneConsistency = (
  data: AnalyticsData[]
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: Record<string, any> = {};
  
  const dateFields = ['request_date', 'completed_at', 'created_at', 'updated_at'];
  const timezoneIssues: any[] = [];
  
  data.slice(0, 100).forEach((item, index) => { // Sample first 100 items for performance
    dateFields.forEach(field => {
      if (item[field]) {
        const originalValue = item[field];
        const normalizedDate = normalizeDate(originalValue);
        
        if (normalizedDate) {
          // Check if date makes sense in Riyadh timezone
          const riyadhDate = toZonedTime(normalizedDate, RIYADH_TZ);
          const utcDate = new Date(originalValue);
          
          // Check for potential timezone issues (dates differing by more than 24 hours)
          const timeDiff = Math.abs(riyadhDate.getTime() - utcDate.getTime());
          const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
          
          if (daysDiff > 1) {
            timezoneIssues.push({
              recordIndex: index,
              field,
              originalValue,
              riyadhDate: formatInTimeZone(riyadhDate, RIYADH_TZ, 'yyyy-MM-dd HH:mm:ss'),
              utcDate: utcDate.toISOString(),
              daysDifference: daysDiff
            });
          }
        }
      }
    });
  });
  
  if (timezoneIssues.length > 0) {
    warnings.push(`Found ${timezoneIssues.length} potential timezone inconsistencies`);
    details.timezoneIssues = timezoneIssues.slice(0, 10); // Show first 10
  }
  
  // Check for date format consistency
  const dateFormats = new Set<string>();
  data.slice(0, 100).forEach(item => {
    if (item.request_date && typeof item.request_date === 'string') {
      // Detect format pattern
      const dateStr = String(item.request_date);
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) dateFormats.add('ISO');
      else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}/)) dateFormats.add('MM/DD/YYYY');
      else if (dateStr.match(/^\d{2}-\d{2}-\d{4}/)) dateFormats.add('DD-MM-YYYY');
      else if (!isNaN(Number(dateStr))) dateFormats.add('Excel Serial');
      else dateFormats.add('Other');
    }
  });
  
  details.detectedDateFormats = [...dateFormats];
  
  if (dateFormats.size > 2) {
    warnings.push(`Multiple date formats detected: ${[...dateFormats].join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details
  };
};

// Comprehensive analytics validation
export const runAnalyticsValidation = (
  allData: AnalyticsData[],
  filteredData: AnalyticsData[],
  selectedMonths: string[],
  countsToCheck: Record<string, number>,
  beforeImportData?: AnalyticsData[],
  importedData?: AnalyticsData[],
  useCompletedDate = false
): ValidationResult => {
  const results: ValidationResult[] = [];
  
  // Run all validation checks
  results.push(validateCountsMatchFiltered(allData, filteredData, countsToCheck));
  results.push(validateMonthFilterAccuracy(allData, selectedMonths, filteredData, useCompletedDate));
  results.push(validateTimezoneConsistency(allData));
  
  if (beforeImportData && importedData) {
    results.push(validateNoDuplicateImports(beforeImportData, allData, importedData));
  }
  
  // Combine results
  const allErrors = results.flatMap(r => r.errors);
  const allWarnings = results.flatMap(r => r.warnings);
  const combinedDetails = results.reduce((acc, r) => ({ ...acc, ...r.details }), {});
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    details: {
      ...combinedDetails,
      validationSummary: {
        totalChecks: results.length,
        passedChecks: results.filter(r => r.isValid).length,
        failedChecks: results.filter(r => !r.isValid).length
      }
    }
  };
};

// Seed data for testing
export const generateSeedData = (count = 100): AnalyticsData[] => {
  const hospitals = ['MCJ1 - (MC Al Muhammadiyah)', 'MCJ2 - (MC Al Malaz)', 'MCJ3 - (MC Sulaymaniyah)'];
  const specialties = ['Cardiology', 'Orthopedics', 'Neurology', 'General Surgery', 'Pediatrics'];
  const statuses = ['completed', 'pending', 'scheduled', 'cancelled', 'planned_nvd'];
  
  return Array.from({ length: count }, (_, i) => {
    const requestDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const completedDate = Math.random() > 0.3 ? 
      new Date(requestDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : 
      undefined;
    
    return {
      id: `TEST-${i + 1}`,
      request_date: requestDate,
      completed_at: completedDate,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      hospital: hospitals[Math.floor(Math.random() * hospitals.length)],
      specialty: specialties[Math.floor(Math.random() * specialties.length)],
      patient_name: `Patient ${i + 1}`,
      mrn: `MRN${String(i + 1).padStart(4, '0')}`,
    };
  });
};