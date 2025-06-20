
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Reply, ArrowLeft, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "./types";
import ReplySection from "./ReplySection";

interface MessageDetailsProps {
  message: Message;
  onBack: () => void;
  showReply: boolean;
  setShowReply: (show: boolean) => void;
  replyMessage: string;
  setReplyMessage: (message: string) => void;
  replyAttachments: File[];
  setReplyAttachments: (attachments: File[]) => void;
  onSendReply: () => void;
}

const MessageDetails = ({
  message,
  onBack,
  showReply,
  setShowReply,
  replyMessage,
  setReplyMessage,
  replyAttachments,
  setReplyAttachments,
  onSendReply,
}: MessageDetailsProps) => {
  const { toast } = useToast();

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'high': return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>;
      default: return null;
    }
  };

  const downloadAttachment = (filename: string) => {
    console.log("Downloading attachment:", filename);
    toast({
      title: "Download Started",
      description: `Downloading ${filename}`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-bold text-xl text-gray-900">{message.subject}</h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-1 space-y-6">
            {/* Message Header */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>From:</strong> {message.from}</div>
                    <div><strong>To:</strong> {message.to}</div>
                    <div><strong>Date:</strong> {message.timestamp}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(message.priority || 'normal')}
                  {message.hasReply && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Reply className="w-3 h-3" />
                      Replied
                    </Badge>
                  )}
                </div>
              </div>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="border-t pt-3">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Attachments ({message.attachments.length}):
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {message.attachments.map((attachment, index) => (
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
            
            <Separator />
            
            {/* Message Content */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{message.content}</div>
            </div>
            
            {/* Reply Section */}
            <ReplySection
              showReply={showReply}
              setShowReply={setShowReply}
              replyMessage={replyMessage}
              setReplyMessage={setReplyMessage}
              replyAttachments={replyAttachments}
              setReplyAttachments={setReplyAttachments}
              onSendReply={onSendReply}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MessageDetails;
