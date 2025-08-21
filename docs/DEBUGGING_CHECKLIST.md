# System Debugging Checklist

## Quick Diagnosis Steps

### 1. Data Not Showing
- [ ] Check RLS policies in Supabase
- [ ] Verify user authentication status
- [ ] Check console for JavaScript errors
- [ ] Validate API responses in Network tab
- [ ] Confirm data exists in database

### 2. Upload Failures
- [ ] Verify file format (Excel .xlsx/.xls)
- [ ] Check required columns exist
- [ ] Validate date formats
- [ ] Check file size limits
- [ ] Review upload batch status

### 3. Performance Issues
- [ ] Check data query efficiency
- [ ] Monitor browser memory usage
- [ ] Verify proper pagination
- [ ] Check cache effectiveness
- [ ] Review database indexes

### 4. Authentication Problems
- [ ] Verify Supabase connection
- [ ] Check user session validity
- [ ] Validate JWT tokens
- [ ] Review role assignments
- [ ] Check password policies

### 5. Analytics Discrepancies
- [ ] Verify data source consistency
- [ ] Check filter logic
- [ ] Validate calculation formulas
- [ ] Review date range handling
- [ ] Confirm status mapping

## Common Error Patterns

### Database Errors
```sql
-- Check RLS policy effectiveness
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verify user role
SELECT role FROM profiles WHERE id = auth.uid();

-- Check data access
SELECT can_access_patient_data('uuid-here', 'view');
```

### Frontend Debugging
```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Check data sync status
console.log('Local data:', localStorage.getItem('medical_requests'));
console.log('Supabase connection:', supabase.supabaseUrl);

// Monitor API calls
supabase.from('medical_requests').select('*').then(console.log);
```