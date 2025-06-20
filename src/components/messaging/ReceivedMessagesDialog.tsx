
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Send, Download, ArrowLeft, Calendar as CalendarIcon, Filter, Mail, Reply } from "lucide-react";
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

  // Mock messages data with enhanced properties
  const allMessages: Message[] = [
    {
      id: "1",
      from: "Case Coordinator",
      to: currentUserRole,
      subject: "Urgent: Patient Authorization Required",
      content: "Please review and approve the authorization for patient Ahmed Hassan's cardiac surgery. The documents are attached for your review.",
      timestamp: "2025-06-20 10:30 AM",
      date: new Date("2025-06-20"),
      attachments: ["authorization_form.pdf", "medical_report.pdf"],
      isRead: false,
      hasReply: false,
      isNew: true,
    },
    {
      id: "2",
      from: "Finance Team",
      to: currentUserRole,
      subject: "Payment Status Update",
      content: "The payment for request #REQ-2025-001 has been processed successfully. Please update the status accordingly.",
      timestamp: "2025-06-19 3:45 PM",
      date: new Date("2025-06-19"),
      attachments: ["payment_receipt.pdf"],
      isRead: true,
      hasReply: true,
      isNew: false,
    },
    {
      id: "3",
      from: "Hospital Administration",
      to: currentUserRole,
      subject: "Schedule Update",
      content: "There has been a change in the surgery schedule for tomorrow. Please check the updated schedule and confirm your availability.",
      timestamp: "2025-06-19 11:20 AM",
      date: new Date("2025-06-19"),
      attachments: [],
      isRead: true,
      hasReply: false,
      isNew: false,
    },
    {
      id: "4",
      from: "Medical Records",
      to: currentUserRole,
      subject: "Patient History Update",
      content: "Updated medical history for patient Sarah Johnson has been uploaded to the system.",
      timestamp: "2025-06-18 2:15 PM",
      date: new Date("2025-06-18"),
      attachments: ["medical_history.pdf"],
      isRead: false,
      hasReply: false,
      isNew: true,
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
  };

  const removeAttachment = (index: number) => {
    setReplyAttachments(prev => prev.filter((_, i) => i !== index));
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

    toast({
      title: "Reply Sent",
      description: `Reply sent to ${selectedMessage?.from}`,
    });

    setReplyMessage("");
    setReplyAttachments([]);
    setShowReply(false);
  };

  const downloadAttachment = (filename: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${filename}`,
    });
  };

  const markAsRead = (messageId: string) => {
    console.log("Marking message as read:", messageId);
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
  };

  const hasActiveFilters = selectedDates.length > 0 || selectedMonths.length > 0;
  const newMessagesCount = filteredMessages.filter(msg => msg.isNew).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {selectedMessage ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                Message Details
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Received Messages
                  {newMessagesCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {newMessagesCount} New
                    </Badge>
                  )}
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
        
        <div className="flex flex-col h-full">
          {!selectedMessage && showFilters && (
            <div className="border rounded-lg p-4 mb-4 space-y-4">
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
            <div className="flex-1">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        !message.isRead ? "bg-blue-50 border-blue-200" : ""
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        markAsRead(message.id);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{message.from}</span>
                          <div className="flex gap-1">
                            {message.isNew && (
                              <Badge variant="destructive" className="text-xs px-1 py-0">
                                New
                              </Badge>
                            )}
                            {!message.isRead && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                Unread
                              </Badge>
                            )}
                            {message.hasReply && (
                              <Badge variant="outline" className="text-xs px-1 py-0 flex items-center gap-1">
                                <Reply className="w-3 h-3" />
                                Replied
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{message.timestamp}</span>
                      </div>
                      <div className="font-medium mb-1">{message.subject}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {message.content}
                      </div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          📎 {message.attachments.length} attachment(s)
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredMessages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No messages found matching the selected filters.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            // Single message view
            <div className="w-full flex flex-col">
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-lg">{selectedMessage.subject}</div>
                      <div className="text-sm text-gray-600">
                        From: {selectedMessage.from} • {selectedMessage.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Attachments:</Label>
                      <div className="mt-1 space-y-1">
                        {selectedMessage.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm">{attachment}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadAttachment(attachment)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
                </div>
                
                {!showReply ? (
                  <Button onClick={() => setShowReply(true)} className="w-full">
                    Reply
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Reply Message</Label>
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label>Attachments</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="reply-file-upload"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="reply-file-upload"
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-sm text-gray-600">Add files</span>
                        </label>
                      </div>
                      
                      {replyAttachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {replyAttachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm text-gray-700 truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowReply(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleSendReply} className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceivedMessagesDialog;
