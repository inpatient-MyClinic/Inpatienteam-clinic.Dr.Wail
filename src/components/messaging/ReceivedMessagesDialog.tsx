import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Send, Download, ArrowLeft, Calendar as CalendarIcon, Filter, Mail, Reply, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  date: Date;
  attachments?: string[];
  isRead: boolean;
  hasReply?: boolean;
  isNew?: boolean;
  priority?: 'normal' | 'high' | 'urgent';
}

interface ReceivedMessagesDialogProps {
  trigger: React.ReactNode;
  currentUserRole: string;
}

const ReceivedMessagesDialog = ({ trigger, currentUserRole }: ReceivedMessagesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [showReply, setShowReply] = useState(false);
  
  // Filter states
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();

  // Enhanced mock messages data with more realistic content
  const allMessages: Message[] = [
    {
      id: "1",
      from: "Case Coordinator Sarah",
      to: currentUserRole,
      subject: "Urgent: Patient Authorization Required - Ahmed Hassan",
      content: `Dear ${currentUserRole},

I hope this message finds you well. I am writing to request your urgent attention regarding patient Ahmed Hassan's cardiac surgery authorization.

Patient Details:
- Name: Ahmed Hassan
- MRN: MRN-2025-001234
- ID: 1234567890
- Surgery Type: Cardiac Bypass Surgery
- Scheduled Date: June 25, 2025
- Hospital: King Abdulaziz Medical City

The authorization documents have been prepared and are attached to this message for your review. Please note that the insurance company requires your approval within 24 hours to proceed with the surgery.

Key points for your consideration:
1. Patient's medical history indicates previous cardiac events
2. Current medications list is included in attachment 2
3. Pre-operative tests show clearance for surgery
4. Expected duration: 4-6 hours
5. Post-operative care plan is outlined in attachment 3

Please review the attached documents and provide your authorization at your earliest convenience. If you have any questions or need additional information, please don't hesitate to contact me.

Thank you for your prompt attention to this matter.

Best regards,
Sarah Johnson, Case Coordinator
My Clinic - Cardiac Department
Phone: +966-11-234567
Email: sarah.johnson@myclinic.sa`,
      timestamp: "2025-06-20 10:30 AM",
      date: new Date("2025-06-20"),
      attachments: ["patient_authorization_form.pdf", "medical_history_report.pdf", "pre_operative_tests.pdf", "post_care_plan.pdf"],
      isRead: false,
      hasReply: false,
      isNew: true,
      priority: 'urgent',
    },
    {
      id: "2",
      from: "Finance Team - Fatima Al-Zahra",
      to: currentUserRole,
      subject: "Payment Confirmation - Request #REQ-2025-001",
      content: `Dear ${currentUserRole},

I am pleased to inform you that the payment for request #REQ-2025-001 has been successfully processed.

Payment Details:
- Request ID: REQ-2025-001
- Patient: Omar Al-Rashid
- Amount: SAR 15,750.00
- Payment Method: Insurance Coverage (80%) + Patient Copay (20%)
- Transaction ID: TXN-20250619-001
- Processing Date: June 19, 2025
- Status: Completed

Insurance Information:
- Insurance Company: Bupa Arabia
- Policy Number: BP-789456123
- Coverage: 80% of approved amount
- Copay: SAR 3,150.00 (paid by patient)

The payment receipt and insurance claim documentation are attached for your records. Please update the patient's status to "Payment Confirmed" in the system.

If you need any clarification or additional documentation, please contact the finance department.

Best regards,
Fatima Al-Zahra
Finance Manager
My Clinic Finance Department
Extension: 2156`,
      timestamp: "2025-06-19 3:45 PM",
      date: new Date("2025-06-19"),
      attachments: ["payment_receipt.pdf", "insurance_claim.pdf"],
      isRead: true,
      hasReply: true,
      isNew: false,
      priority: 'normal',
    },
    {
      id: "3",
      from: "Hospital Administration - Dr. Mohammed Al-Saud",
      to: currentUserRole,
      subject: "Schedule Update - Surgery Calendar Changes",
      content: `Dear Colleague,

I hope you are doing well. I am writing to inform you about important changes to tomorrow's surgery schedule that require your immediate attention.

Schedule Changes:
- Original Time: 08:00 AM - Room 203
- New Time: 10:30 AM - Room 205
- Reason: Emergency case prioritization
- Patient: Sara Al-Mahmoud
- Procedure: Orthopedic Surgery (Knee Replacement)

Updated Schedule Details:
1. Pre-operative preparation: 09:30 AM
2. Patient arrival: 10:00 AM
3. Surgery start: 10:30 AM
4. Expected duration: 2-3 hours
5. Post-operative monitoring: Recovery Room B

Required Actions:
- Please confirm your availability for the new time slot
- Review updated patient notes (attached)
- Coordinate with nursing staff for room preparation
- Update your personal schedule accordingly

Additional Notes:
- Anesthesia team has been notified
- OR equipment has been reserved for new time
- Patient and family have been informed
- Insurance pre-authorization remains valid

Please reply to confirm your availability. If you have any concerns or conflicts, please contact me immediately.

Thank you for your flexibility and understanding.

Best regards,
Dr. Mohammed Al-Saud
Chief of Surgery
King Faisal Hospital
Direct Line: +966-11-987654`,
      timestamp: "2025-06-19 11:20 AM",
      date: new Date("2025-06-19"),
      attachments: ["updated_schedule.pdf", "patient_notes.pdf"],
      isRead: true,
      hasReply: false,
      isNew: false,
      priority: 'high',
    },
    {
      id: "4",
      from: "Medical Records - Aisha Hassan",
      to: currentUserRole,
      subject: "Patient History Update - Sarah Johnson",
      content: `Dear ${currentUserRole},

I am writing to notify you that the medical history for patient Sarah Johnson has been updated in our system with new information received from her previous healthcare provider.

Patient Information:
- Name: Sarah Johnson
- MRN: MRN-2025-005678
- ID: 9876543210
- Date of Birth: March 15, 1985
- Phone: +966-50-123456

Updated Information Includes:
1. Complete surgical history from 2020-2024
2. Medication allergies and adverse reactions
3. Family medical history updates
4. Recent laboratory results
5. Imaging studies from previous treatments
6. Specialist consultation reports

Key Medical Updates:
- New allergy identified: Penicillin (mild reaction)
- Previous surgery: Appendectomy (2022)
- Current medications: Updated list with dosages
- Chronic conditions: Diabetes Type 2 (controlled)
- Recent test results: HbA1c 6.8%, Normal kidney function

The updated medical history document is attached to this message. Please review this information before your next consultation with the patient scheduled for June 22, 2025.

Important Notes:
- Please update patient's allergy information in your records
- Consider medication adjustments based on new history
- Previous imaging available upon request
- Patient has consented to information sharing

If you need access to any additional records or have questions about the updates, please contact the medical records department.

Best regards,
Aisha Hassan
Medical Records Supervisor
My Clinic Medical Records Department
Extension: 3001
Email: records@myclinic.sa`,
      timestamp: "2025-06-18 2:15 PM",
      date: new Date("2025-06-18"),
      attachments: ["updated_medical_history.pdf", "lab_results.pdf", "allergy_report.pdf"],
      isRead: false,
      hasReply: false,
      isNew: true,
      priority: 'normal',
    },
    {
      id: "5",
      from: "Pharmacy Department - Khalid Al-Otaibi",
      to: currentUserRole,
      subject: "Medication Stock Alert - Critical Shortage",
      content: `Dear ${currentUserRole},

I am writing to inform you about a critical shortage of essential medications that may affect your patients' treatment plans.

Affected Medications:
1. Insulin Glargine 100 units/ml - Out of Stock
2. Metformin 500mg - Low Stock (3 days remaining)
3. Atorvastatin 20mg - Critical Level
4. Lisinopril 10mg - Backordered
5. Warfarin 5mg - Limited Supply

Expected Restocking:
- Insulin Glargine: June 23, 2025
- Metformin: June 21, 2025
- Atorvastatin: June 24, 2025
- Lisinopril: June 26, 2025
- Warfarin: Available from alternative supplier

Recommended Actions:
- Review current patient prescriptions
- Consider alternative medications where appropriate
- Inform patients who may be affected
- Coordinate with pharmacy for alternative sourcing
- Monitor patient conditions closely during transition

Alternative Options:
- Insulin: Insulin Detemir available as substitute
- Metformin: Extended-release formulation in stock
- Atorvastatin: Simvastatin 40mg equivalent available
- Lisinopril: Enalapril 10mg as alternative
- Warfarin: Increased monitoring with current supply

Patient Communication:
We are proactively contacting affected patients to explain the situation and arrange for alternative medications. A patient notification letter template is attached.

Please contact the pharmacy department if you need assistance with medication substitutions or patient counseling.

Thank you for your understanding and cooperation.

Best regards,
Khalid Al-Otaibi, PharmD
Chief Pharmacist
My Clinic Pharmacy Department
Extension: 4500`,
      timestamp: "2025-06-17 9:00 AM",
      date: new Date("2025-06-17"),
      attachments: ["medication_shortage_list.pdf", "alternative_medications.pdf", "patient_notification_template.pdf"],
      isRead: false,
      hasReply: false,
      isNew: true,
      priority: 'high',
    },
  ];

  // Generate months for selection
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return {
      value: format(date, 'MMMM'),
      label: format(date, 'MMMM yyyy')
    };
  });

  // Filter messages based on selected dates and months
  const filteredMessages = allMessages.filter(message => {
    let matchesDateFilter = true;
    
    if (selectedDates.length > 0 || selectedMonths.length > 0) {
      matchesDateFilter = false;
      
      // Check selected days
      if (selectedDates.length > 0) {
        matchesDateFilter = selectedDates.some(day => 
          isWithinInterval(message.date, {
            start: startOfDay(day),
            end: endOfDay(day)
          })
        );
      }
      
      // Check selected months
      if (!matchesDateFilter && selectedMonths.length > 0) {
        matchesDateFilter = selectedMonths.some(monthName => {
          const monthDate = new Date();
          monthDate.setMonth(months.findIndex(m => m.value === monthName));
          return isWithinInterval(message.date, {
            start: startOfMonth(monthDate),
            end: endOfMonth(monthDate)
          });
        });
      }
    }
    
    return matchesDateFilter;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReplyAttachments(prev => [...prev, ...files]);
    toast({
      title: "Files Added",
      description: `${files.length} file(s) added to reply`,
    });
  };

  const removeAttachment = (index: number) => {
    const removedFile = replyAttachments[index];
    setReplyAttachments(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "File Removed",
      description: `${removedFile.name} removed from reply`,
    });
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast({
        title: "Missing Message",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }

    // Simulate sending reply
    console.log("Sending reply:", {
      originalMessageId: selectedMessage?.id,
      replyContent: replyMessage,
      attachments: replyAttachments.map(f => f.name),
      timestamp: new Date().toISOString()
    });

    toast({
      title: "Reply Sent Successfully",
      description: `Reply sent to ${selectedMessage?.from}`,
    });

    // Reset reply form
    setReplyMessage("");
    setReplyAttachments([]);
    setShowReply(false);
    
    // Mark original message as replied
    if (selectedMessage) {
      selectedMessage.hasReply = true;
    }
  };

  const downloadAttachment = (filename: string) => {
    // Simulate download
    console.log("Downloading attachment:", filename);
    toast({
      title: "Download Started",
      description: `Downloading ${filename}`,
    });
  };

  const markAsRead = (messageId: string) => {
    console.log("Marking message as read:", messageId);
    // Find and update message read status
    const message = allMessages.find(msg => msg.id === messageId);
    if (message) {
      message.isRead = true;
      message.isNew = false;
    }
  };

  const handleMonthSelect = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(prev => prev.filter(m => m !== month));
    } else {
      setSelectedMonths(prev => [...prev, month]);
    }
  };

  const clearFilters = () => {
    setSelectedDates([]);
    setSelectedMonths([]);
    toast({
      title: "Filters Cleared",
      description: "All date filters have been removed",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'high': return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>;
      default: return null;
    }
  };

  const hasActiveFilters = selectedDates.length > 0 || selectedMonths.length > 0;
  const newMessagesCount = filteredMessages.filter(msg => msg.isNew).length;
  const unreadMessagesCount = filteredMessages.filter(msg => !msg.isRead).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {selectedMessage ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedMessage(null);
                    setShowReply(false);
                    setReplyMessage("");
                    setReplyAttachments([]);
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Mail className="w-5 h-5" />
                Message Details
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Received Messages
                  <div className="flex gap-2">
                    {newMessagesCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {newMessagesCount} New
                      </Badge>
                    )}
                    {unreadMessagesCount > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {unreadMessagesCount} Unread
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedDates.length + selectedMonths.length}
                    </Badge>
                  )}
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full overflow-hidden">
          {!selectedMessage && showFilters && (
            <div className="border rounded-lg p-4 mb-4 space-y-4 bg-gray-50 flex-shrink-0">
              <div className="flex flex-wrap gap-4">
                {/* Date Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Select Days
                      {selectedDates.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {selectedDates.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={(dates) => setSelectedDates(dates || [])}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Month Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Select Months
                      {selectedMonths.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {selectedMonths.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4" align="start">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select Months</Label>
                      <div className="grid gap-1 max-h-60 overflow-y-auto">
                        {months.map((month) => {
                          const isSelected = selectedMonths.includes(month.value);
                          return (
                            <Button
                              key={month.value}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleMonthSelect(month.value)}
                              className="justify-start"
                            >
                              {month.label}
                              {isSelected && <span className="ml-2">✓</span>}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map((date, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {format(date, "MMM dd")}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setSelectedDates(prev => prev.filter((_, i) => i !== index))}
                      />
                    </Badge>
                  ))}
                  {selectedMonths.map((month) => (
                    <Badge key={month} variant="outline" className="flex items-center gap-1">
                      {month}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setSelectedMonths(prev => prev.filter(m => m !== month))}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedMessage ? (
            // Messages list view
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-3 p-1">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                        !message.isRead ? getPriorityColor(message.priority || 'normal') : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        markAsRead(message.id);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{message.from}</span>
                          <div className="flex gap-1 flex-wrap">
                            {message.isNew && (
                              <Badge variant="destructive" className="text-xs px-2 py-1">
                                New
                              </Badge>
                            )}
                            {!message.isRead && (
                              <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-800">
                                Unread
                              </Badge>
                            )}
                            {message.hasReply && (
                              <Badge variant="outline" className="text-xs px-2 py-1 flex items-center gap-1">
                                <Reply className="w-3 h-3" />
                                Replied
                              </Badge>
                            )}
                            {getPriorityBadge(message.priority || 'normal')}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-2">{message.timestamp}</span>
                      </div>
                      <div className="font-semibold mb-2 text-gray-900">{message.subject}</div>
                      <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {message.content}
                      </div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Paperclip className="w-3 h-3" />
                          {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredMessages.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No messages found</p>
                      <p className="text-sm">No messages match the selected filters.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            // Single message view with proper scrolling
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-1">
                  {/* Message Header */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h2 className="font-bold text-xl text-gray-900 mb-2">{selectedMessage.subject}</h2>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>From:</strong> {selectedMessage.from}</div>
                          <div><strong>To:</strong> {selectedMessage.to}</div>
                          <div><strong>Date:</strong> {selectedMessage.timestamp}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getPriorityBadge(selectedMessage.priority || 'normal')}
                        {selectedMessage.hasReply && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Reply className="w-3 h-3" />
                            Replied
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                      <div className="border-t pt-3">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Attachments ({selectedMessage.attachments.length}):
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedMessage.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 truncate">{attachment}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadAttachment(attachment)}
                                className="flex items-center gap-1"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Message Content */}
                  <div className="bg-white p-6 rounded-lg border mb-6">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{selectedMessage.content}</div>
                  </div>
                  
                  {/* Reply Section */}
                  {!showReply ? (
                    <div className="sticky bottom-0 bg-white border-t pt-4">
                      <Button onClick={() => setShowReply(true)} className="w-full" size="lg">
                        <Reply className="w-4 h-4 mr-2" />
                        Reply to this message
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Reply Message</Label>
                        <Textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply message here..."
                          className="min-h-[120px] bg-white"
                          rows={6}
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Reply Attachments</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            id="reply-file-upload"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                          />
                          <label
                            htmlFor="reply-file-upload"
                            className="flex flex-col items-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                          >
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Add attachments</span>
                            <span className="text-xs text-gray-500 mt-1">Click to browse files</span>
                          </label>
                        </div>
                        
                        {replyAttachments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <Label className="text-xs font-medium text-gray-600">Selected Files:</Label>
                            {replyAttachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div className="flex items-center gap-2">
                                  <Paperclip className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                  <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowReply(false);
                            setReplyMessage("");
                            setReplyAttachments([]);
                          }} 
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSendReply} 
                          className="flex-1"
                          disabled={!replyMessage.trim()}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceivedMessagesDialog;
