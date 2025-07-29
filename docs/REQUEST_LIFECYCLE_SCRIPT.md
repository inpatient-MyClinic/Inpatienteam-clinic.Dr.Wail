# Medical Request Management System - Complete Lifecycle Script

## System Overview
A comprehensive medical request management system with 7 user roles and automated workflows.

## User Roles & Permissions
- **Admin**: Full system access, analytics, user management
- **Nurse**: Create requests, assign to doctors
- **Doctor**: Create/review requests, medical decisions
- **Case Coordinator**: Review, assign, submit to hospitals
- **Hospital**: Process requests, update status, submit to insurance
- **Customer Care**: Follow up on completed cases, surveys
- **Finance**: Payment tracking, financial reporting

## Complete Request Lifecycle Script

### 🔄 Phase 1: Request Creation
```
1. REQUEST INITIATION
   - Nurse/Doctor creates new medical request
   - System generates unique request ID
   - Request status: "Pending"
   - Timestamp recorded: dateCreated, timeCreated

2. NURSE WORKFLOW
   - Creates request with patient details
   - Selects responsible doctor from dropdown
   - Adds medical information, attachments
   - Submits to Case Coordinator queue
   - Status: "Pending" → "Submitted to Coordinator"

3. DOCTOR WORKFLOW
   - Can create direct requests OR
   - Review requests created by nurse under their name
   - Add medical justification/notes
   - Submit to Case Coordinator
   - Status: "Pending" → "Doctor Reviewed" → "Submitted to Coordinator"
```

### 🔄 Phase 2: Case Coordinator Processing
```
4. CASE COORDINATOR REVIEW
   - Receives all new requests in dashboard
   - Reviews completeness:
     ✅ Complete: Assigns under coordinator name → Submit to Hospital
     ❌ Incomplete: Return to Nurse/Doctor with feedback
   
5. AUTO-ESCALATION RULE
   - Timer starts: 4 hours from request creation
   - If not assigned within 4 hours:
     → Automatic submission to Hospital
     → Notification sent to admin
     → Status: "Auto-escalated to Hospital"

6. ASSIGNMENT FLOW
   - Coordinator assigns request to themselves
   - Status: "Assigned to Coordinator"
   - Submits complete requests to Hospital
   - Status: "Submitted to Hospital"
```

### 🔄 Phase 3: Hospital Processing
```
7. HOSPITAL RECEIVES REQUEST
   - Request appears in Hospital dashboard
   - Hospital reviews medical necessity
   - Opens patient file in system

8. HOSPITAL DECISION TREE
   ✅ APPROVED & COMPLETE:
     - Process case
     - Submit to Insurance (if required)
     - Schedule procedures
     - Status: "In Progress"
   
   ❌ NEEDS JUSTIFICATION:
     - Send notification to:
       * Case Coordinator
       * Assigned Doctor
       * Original Nurse (if applicable)
     - Status: "Pending Justification"
     - Request returns to Phase 2 for additional info

9. CASE COMPLETION
   - Hospital marks case as complete
   - Status: "Done"
   - Completion timestamp recorded
   - Case moves to Customer Care & Finance queues
```

### 🔄 Phase 4: Customer Care Follow-up
```
10. CUSTOMER CARE MONITORING
    - All "Done" cases appear in Customer Care dashboard
    - 2-day timer starts from completion date
    
11. AUTOMATED SURVEY SYSTEM
    - After 2 days: WhatsApp survey auto-sent to patient
    - Survey includes:
      * Service satisfaction rating
      * Care quality feedback
      * Improvement suggestions
    - Survey response tracked in system
    - Status: "Survey Sent"

12. COMPLAINT HANDLING
    - Customer Care can upload complaint files
    - Link complaints to specific requests
    - Track resolution status
```

### 🔄 Phase 5: Financial Processing
```
13. FINANCE INTEGRATION
    - "Done" cases automatically appear in Finance Table
    - Payment tracking initiated
    - Invoice generation (if applicable)
    
14. PAYMENT WORKFLOW
    - When payment received:
      * Update request: paymentStatus = "Paid"
      * Update Doctor Payment Table
      * Generate payment confirmation
    - Status: "Financially Closed"

15. DOCTOR PAYMENT TRACKING
    - All completed cases under doctor's name
    - Payment status per case
    - Monthly payment summaries
    - Commission calculations (if applicable)
```

## 🔧 System Automation Rules

### Time-Based Triggers
- **4 hours**: Auto-escalation to Hospital if not assigned
- **2 days**: Auto-send WhatsApp survey after completion
- **Weekly**: Backup data to external storage
- **Monthly**: Generate analytics reports

### Status Progression
```
Created → Pending → Assigned → In Progress → Done → Financially Closed
                ↓
            (if incomplete)
          ← Returned for Info ←
```

### Notification Matrix
| Event | Admin | Nurse | Doctor | Coordinator | Hospital | Customer Care | Finance |
|-------|-------|-------|--------|-------------|----------|---------------|---------|
| New Request | ✓ | ✓ | ✓ | ✓ | - | - | - |
| Auto-escalation | ✓ | ✓ | ✓ | ✓ | ✓ | - | - |
| Needs Justification | ✓ | ✓ | ✓ | ✓ | - | - | - |
| Case Completed | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Payment Received | ✓ | - | ✓ | - | - | - | ✓ |

## 📊 Analytics & Reporting

### Real-time Metrics
- Active requests by status
- Average processing time per phase
- Coordinator performance metrics
- Hospital response times
- Patient satisfaction scores
- Financial summaries

### Automated Reports
- Daily status summaries
- Weekly performance reports
- Monthly financial statements
- Quarterly satisfaction analysis
- Annual system usage reports

## 🔒 Access Control & Security
- Role-based field permissions
- Hospital-specific data access
- Audit trail for all actions
- Data encryption for sensitive information
- Automated backup and recovery

## 🌐 Integration Points
- Excel import/export capabilities
- WhatsApp API for surveys
- Insurance system integration
- Payment gateway connections
- External hospital system APIs

---
*This script represents the complete request lifecycle as implemented in the medical request management system.*