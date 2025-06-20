
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
import { Upload, X, Send, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  attachments?: string[];
  isRead: boolean;
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
  const { toast } = useToast();

  // Mock messages data
  const messages: Message[] = [
    {
      id: "1",
      from: "Case Coordinator",
      to: currentUserRole,
      subject: "Urgent: Patient Authorization Required",
      content: "Please review and approve the authorization for patient Ahmed Hassan's cardiac surgery. The documents are attached for your review.",
      timestamp: "2025-06-20 10:30 AM",
      attachments: ["authorization_form.pdf", "medical_report.pdf"],
      isRead: false,
    },
    {
      id: "2",
      from: "Finance Team",
      to: currentUserRole,
      subject: "Payment Status Update",
      content: "The payment for request #REQ-2025-001 has been processed successfully. Please update the status accordingly.",
      timestamp: "2025-06-19 3:45 PM",
      attachments: ["payment_receipt.pdf"],
      isRead: true,
    },
    {
      id: "3",
      from: "Hospital Administration",
      to: currentUserRole,
      subject: "Schedule Update",
      content: "There has been a change in the surgery schedule for tomorrow. Please check the updated schedule and confirm your availability.",
      timestamp: "2025-06-19 11:20 AM",
      attachments: [],
      isRead: true,
    },
  ];

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
    // In a real app, this would update the message status in the backend
    console.log("Marking message as read:", messageId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
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
              "Received Messages"
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full">
          {!selectedMessage ? (
            // Messages list view
            <div className="w-full">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {messages.map((message) => (
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
                          {!message.isRead && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              New
                            </span>
                          )}
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
