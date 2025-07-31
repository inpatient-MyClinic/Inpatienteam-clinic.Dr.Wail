
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
import { supabase } from "@/integrations/supabase/client";

const ReceivedMessagesDialog = ({ trigger, currentUserRole }: ReceivedMessagesDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  const [replyMessage, setReplyMessage] = React.useState("");
  const [replyAttachments, setReplyAttachments] = React.useState<File[]>([]);
  const [showReply, setShowReply] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Filter states
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
  const [selectedMonths, setSelectedMonths] = React.useState<string[]>([]);
  const [showFilters, setShowFilters] = React.useState(false);
  
  const { toast } = useToast();

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user');
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(full_name, email, role)
        `)
        .or(`recipient_id.eq.${user.id},recipient_role.eq.${currentUserRole}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Transform to match Message interface
      const transformedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        from: (msg.sender as any)?.full_name || (msg.sender as any)?.email || 'Unknown',
        to: currentUserRole,
        subject: msg.subject,
        content: msg.content,
        timestamp: format(new Date(msg.created_at), 'yyyy-MM-dd h:mm a'),
        date: new Date(msg.created_at),
        attachments: Array.isArray(msg.attachments) ? msg.attachments as string[] : [],
        isRead: msg.is_read,
        hasReply: false, // You might want to track this separately
        isNew: !msg.is_read,
        priority: msg.priority as 'normal' | 'high' | 'urgent',
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open, currentUserRole]);

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
  const filteredMessages = messages.filter(message => {
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

  const markAsRead = async (messageId: string) => {
    console.log("Marking message as read:", messageId);
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        return;
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isRead: true, isNew: false }
          : msg
      ));
    } catch (error) {
      console.error('Error:', error);
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
