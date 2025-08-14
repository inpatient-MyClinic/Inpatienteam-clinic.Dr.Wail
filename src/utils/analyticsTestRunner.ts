import {
  runAnalyticsValidation,
  generateSeedData,
  normalizeDate,
  normalizeStatus,
  type AnalyticsData
} from './analyticsValidation';

// Test runner for analytics validation
export class AnalyticsTestRunner {
  private testResults: Array<{ name: string; passed: boolean; details: any }> = [];

  // Test 1: Counts equal sum of filtered table rows
  async testCountsMatchFiltered(): Promise<void> {
    console.log('🧪 Testing: Counts equal sum of filtered table rows');
    
    const seedData = generateSeedData(100);
    const filteredData = seedData.filter(item => item.specialty === 'Cardiology');
    
    const actualCounts = {
      total: filteredData.length,
      completed: filteredData.filter(item => normalizeStatus(item.status) === 'completed').length,
      pending: filteredData.filter(item => normalizeStatus(item.status) === 'pending').length,
      scheduled: filteredData.filter(item => normalizeStatus(item.status) === 'scheduled').length,
      cancelled: filteredData.filter(item => normalizeStatus(item.status) === 'cancelled').length,
      planned_nvd: filteredData.filter(item => normalizeStatus(item.status) === 'planned_nvd').length,
    };
    
    const result = runAnalyticsValidation(
      seedData,
      filteredData,
      [],
      actualCounts
    );
    
    this.testResults.push({
      name: 'Count Accuracy',
      passed: result.isValid,
      details: result.details
    });
    
    console.log(result.isValid ? '✅' : '❌', 'Count accuracy test:', result.isValid ? 'PASSED' : 'FAILED');
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }
  }

  // Test 2: Month filter matches visible table rows
  async testMonthFilterAccuracy(): Promise<void> {
    console.log('🧪 Testing: Month filter matches visible table rows');
    
    const seedData = generateSeedData(100);
    const selectedMonths = ['January', 'February', 'March'];
    
    // Manually filter for January, February, March
    const expectedFiltered = seedData.filter(item => {
      const date = normalizeDate(item.request_date);
      return date && [0, 1, 2].includes(date.getMonth());
    });
    
    const result = runAnalyticsValidation(
      seedData,
      expectedFiltered,
      selectedMonths,
      { total: expectedFiltered.length }
    );
    
    this.testResults.push({
      name: 'Month Filter Accuracy',
      passed: result.isValid,
      details: result.details
    });
    
    console.log(result.isValid ? '✅' : '❌', 'Month filter test:', result.isValid ? 'PASSED' : 'FAILED');
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }
  }

  // Test 3: Excel re-import doesn't double-count (idempotent upsert)
  async testIdempotentUpsert(): Promise<void> {
    console.log('🧪 Testing: Excel re-import idempotent upsert');
    
    const originalData = generateSeedData(50);
    
    // Simulate first import
    const firstImportData = originalData.slice(0, 30);
    
    // Simulate second import with overlapping data
    const secondImportData = [
      ...originalData.slice(20, 40), // 10 overlapping records
      ...generateSeedData(10).map((item, i) => ({ ...item, id: `NEW-${i}` })) // 10 new records
    ];
    
    // After second import, we should have: 30 (original) - 10 (overlap) + 20 (from second) = 40 unique records
    const afterSecondImport = [
      ...firstImportData.slice(0, 20), // First 20 from original
      ...secondImportData // All from second import (overlaps should replace, new ones added)
    ];
    
    const result = runAnalyticsValidation(
      afterSecondImport,
      afterSecondImport,
      [],
      { total: afterSecondImport.length },
      firstImportData,
      secondImportData
    );
    
    this.testResults.push({
      name: 'Idempotent Upsert',
      passed: result.isValid,
      details: result.details
    });
    
    console.log(result.isValid ? '✅' : '❌', 'Idempotent upsert test:', result.isValid ? 'PASSED' : 'FAILED');
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }
  }

  // Test 4: Timezone consistency (no off-by-one-day errors)
  async testTimezoneConsistency(): Promise<void> {
    console.log('🧪 Testing: Timezone consistency');
    
    const seedData = generateSeedData(50);
    
    // Add some problematic dates to test timezone handling
    const testData = [
      ...seedData,
      {
        id: 'TZ-TEST-1',
        request_date: '2024-01-01T00:00:00Z', // UTC midnight
        completed_at: '2024-01-01T23:59:59Z',
        status: 'completed',
        hospital: 'Test Hospital',
        specialty: 'Test Specialty',
        patient_name: 'Test Patient',
        mrn: 'TZ001'
      },
      {
        id: 'TZ-TEST-2',
        request_date: '2024-06-15T12:00:00+03:00', // Riyadh noon
        completed_at: '2024-06-15T15:00:00+03:00',
        status: 'completed',
        hospital: 'Test Hospital',
        specialty: 'Test Specialty',
        patient_name: 'Test Patient',
        mrn: 'TZ002'
      }
    ];
    
    const result = runAnalyticsValidation(
      testData,
      testData,
      [],
      { total: testData.length }
    );
    
    this.testResults.push({
      name: 'Timezone Consistency',
      passed: result.isValid,
      details: result.details
    });
    
    console.log(result.isValid ? '✅' : '❌', 'Timezone consistency test:', result.isValid ? 'PASSED' : 'FAILED');
    if (result.warnings.length > 0) {
      console.log('Warnings:', result.warnings);
    }
  }

  // Test 5: Excel date format handling
  async testExcelDateHandling(): Promise<void> {
    console.log('🧪 Testing: Excel date format handling');
    
    const testData: AnalyticsData[] = [
      {
        id: 'EXCEL-1',
        request_date: 45292 as any, // Excel serial number for 2024-01-01
        status: 'completed',
        hospital: 'Test Hospital',
        specialty: 'Cardiology',
        patient_name: 'Patient 1',
        mrn: 'E001'
      },
      {
        id: 'EXCEL-2',
        request_date: '45293', // Excel serial as string
        status: 'pending',
        hospital: 'Test Hospital',
        specialty: 'Neurology',
        patient_name: 'Patient 2',
        mrn: 'E002'
      },
      {
        id: 'EXCEL-3',
        request_date: '2024-01-03', // ISO format
        status: 'scheduled',
        hospital: 'Test Hospital',
        specialty: 'Orthopedics',
        patient_name: 'Patient 3',
        mrn: 'E003'
      }
    ];
    
    // Test date normalization
    const normalizedDates = testData.map(item => ({
      id: item.id,
      original: item.request_date,
      normalized: normalizeDate(item.request_date)
    }));
    
    const allDatesValid = normalizedDates.every(item => item.normalized !== null);
    
    this.testResults.push({
      name: 'Excel Date Handling',
      passed: allDatesValid,
      details: { normalizedDates, testDataCount: testData.length }
    });
    
    console.log(allDatesValid ? '✅' : '❌', 'Excel date handling test:', allDatesValid ? 'PASSED' : 'FAILED');
    console.log('Normalized dates:', normalizedDates);
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Analytics Validation Test Suite');
    console.log('================================================');
    
    await this.testCountsMatchFiltered();
    await this.testMonthFilterAccuracy();
    await this.testIdempotentUpsert();
    await this.testTimezoneConsistency();
    await this.testExcelDateHandling();
    
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`- ${test.name}`);
          console.log(`  Details:`, test.details);
        });
    }
    
    console.log('\n✅ All analytics validation tests completed!');
  }

  // Get test results for UI display
  getTestResults() {
    return this.testResults;
  }
}

// Export singleton instance for easy use
export const analyticsTestRunner = new AnalyticsTestRunner();