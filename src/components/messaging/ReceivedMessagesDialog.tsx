
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { Message, ReceivedMessagesDialogProps } from "./types";
import MessageList from "./MessageList";
import MessageDetails from "./MessageDetails";
import MessageFilters from "./MessageFilters";

const ReceivedMessagesDialog = ({ trigger, currentUserRole }: ReceivedMessagesDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  const [replyMessage, setReplyMessage] = React.useState("");
  const [replyAttachments, setReplyAttachments] = React.useState<File[]>([]);
  const [showReply, setShowReply] = React.useState(false);
  
  // Filter states
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
  const [selectedMonths, setSelectedMonths] = React.useState<string[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  
  const { toast } = useToast();

  // Generate role-specific messages with more variety
  const generateMessagesForRole = (role: string): Message[] => {
    const roleSpecificMessages = {
      nurse: [
        {
          id: "1",
          from: "Case Coordinator Sarah",
          to: role,
          subject: "Urgent: Patient Authorization Required - Ahmed Hassan",
          content: `Dear ${role},\n\nI hope this message finds you well. I am writing to request your urgent attention regarding patient Ahmed Hassan's cardiac surgery authorization.\n\nPatient Details:\n- Name: Ahmed Hassan\n- MRN: MRN-2025-001234\n- ID: 1234567890\n- Surgery Type: Cardiac Bypass Surgery\n- Scheduled Date: June 25, 2025\n- Hospital: King Abdulaziz Medical City\n\nThe authorization documents have been prepared and are attached to this message for your review. Please note that the insurance company requires your approval within 24 hours to proceed with the surgery.\n\nKey points for your consideration:\n1. Patient's medical history indicates previous cardiac events\n2. Current medications list is included in attachment 2\n3. Pre-operative tests show clearance for surgery\n4. Expected duration: 4-6 hours\n5. Post-operative care plan is outlined in attachment 3\n\nPlease review the attached documents and provide your authorization at your earliest convenience. If you have any questions or need additional information, please don't hesitate to contact me.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\nSarah Johnson, Case Coordinator\nMy Clinic - Cardiac Department\nPhone: +966-11-234567\nEmail: sarah.johnson@myclinic.sa`,
          timestamp: "2025-06-20 10:30 AM",
          date: new Date("2025-06-20"),
          attachments: ["patient_authorization_form.pdf", "medical_history_report.pdf", "pre_operative_tests.pdf", "post_care_plan.pdf"],
          isRead: false,
          hasReply: false,
          isNew: true,
          priority: 'urgent' as const,
        },
        {
          id: "2",
          from: "Dr. Mohammed Al-Saud",
          to: role,
          subject: "Patient Care Instructions - Room 205",
          content: `Dear Nurse Team,\n\nPlease note the following care instructions for the patient in Room 205:\n\n- Monitor vital signs every 2 hours\n- Administer medication as prescribed\n- Ensure patient comfort and hydration\n\nThank you for your excellent care.\n\nDr. Mohammed Al-Saud`,
          timestamp: "2025-06-19 2:15 PM",
          date: new Date("2025-06-19"),
          attachments: ["care_instructions.pdf"],
          isRead: true,
          hasReply: false,
          isNew: false,
          priority: 'high' as const,
        }
      ],
      doctor: [
        {
          id: "1",
          from: "Hospital Administration",
          to: role,
          subject: "Surgery Schedule Update - Tomorrow",
          content: `Dear Doctor,\n\nPlease note that your surgery scheduled for tomorrow has been moved from 8:00 AM to 10:30 AM due to emergency case prioritization.\n\nNew Schedule:\n- Time: 10:30 AM\n- Room: 205\n- Patient: Sara Al-Mahmoud\n- Procedure: Knee Replacement\n\nPlease confirm your availability.\n\nBest regards,\nHospital Administration`,
          timestamp: "2025-06-19 11:20 AM",
          date: new Date("2025-06-19"),
          attachments: ["updated_schedule.pdf"],
          isRead: false,
          hasReply: false,
          isNew: true,
          priority: 'urgent' as const,
        }
      ],
      admin: [
        {
          id: "1",
          from: "System Administrator",
          to: role,
          subject: "System Maintenance Notice",
          content: `Dear Admin,\n\nScheduled system maintenance will occur this weekend from 2:00 AM to 6:00 AM on Saturday.\n\nSystems affected:\n- Patient records database\n- Appointment scheduling\n- Billing system\n\nPlease inform all staff accordingly.\n\nIT Department`,
          timestamp: "2025-06-19 9:00 AM",
          date: new Date("2025-06-19"),
          attachments: ["maintenance_schedule.pdf"],
          isRead: false,
          hasReply: false,
          isNew: true,
          priority: 'normal' as const,
        }
      ]
    };

    // Get role-specific messages or default messages
    const messages = roleSpecificMessages[role.toLowerCase() as keyof typeof roleSpecificMessages] || [
      {
        id: "1",
        from: "System Admin",
        to: role,
        subject: "Welcome to the messaging system",
        content: `Dear ${role},\n\nWelcome to our internal messaging system. You can use this to communicate with other team members and receive important updates.\n\nBest regards,\nSystem Administration`,
        timestamp: "2025-06-20 9:00 AM",
        date: new Date("2025-06-20"),
        attachments: [],
        isRead: false,
        hasReply: false,
        isNew: true,
        priority: 'normal' as const,
      }
    ];

    console.log(`Generated ${messages.length} messages for role: ${role}`);
    return messages;
  };

  const allMessages = generateMessagesForRole(currentUserRole);

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

  const markAsRead = (messageId: string) => {
    console.log("Marking message as read:", messageId);
    const message = allMessages.find(msg => msg.id === messageId);
    if (message) {
      message.isRead = true;
      message.isNew = false;
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

  const handleBackToList = () => {
    setSelectedMessage(null);
    setShowReply(false);
    setReplyMessage("");
    setReplyAttachments([]);
  };

  const hasActiveFilters = selectedDates.length > 0 || selectedMonths.length > 0;
  const newMessagesCount = filteredMessages.filter(msg => msg.isNew).length;
  const unreadMessagesCount = filteredMessages.filter(msg => !msg.isRead).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {selectedMessage ? (
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Message Details
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Messages for {currentUserRole}
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
                <MessageFilters
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  selectedDates={selectedDates}
                  setSelectedDates={setSelectedDates}
                  selectedMonths={selectedMonths}
                  setSelectedMonths={setSelectedMonths}
                  hasActiveFilters={hasActiveFilters}
                  clearFilters={clearFilters}
                />
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {selectedMessage ? 
              "View message details and send replies" : 
              "View and manage your received messages"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {!selectedMessage ? (
            <MessageList
              messages={filteredMessages}
              onSelectMessage={setSelectedMessage}
              onMarkAsRead={markAsRead}
            />
          ) : (
            <MessageDetails
              message={selectedMessage}
              onBack={handleBackToList}
              showReply={showReply}
              setShowReply={setShowReply}
              replyMessage={replyMessage}
              setReplyMessage={setReplyMessage}
              replyAttachments={replyAttachments}
              setReplyAttachments={setReplyAttachments}
              onSendReply={handleSendReply}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceivedMessagesDialog;
