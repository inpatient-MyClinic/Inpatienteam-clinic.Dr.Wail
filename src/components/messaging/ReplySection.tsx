
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Send, Reply, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReplySectionProps {
  showReply: boolean;
  setShowReply: (show: boolean) => void;
  replyMessage: string;
  setReplyMessage: (message: string) => void;
  replyAttachments: File[];
  setReplyAttachments: (attachments: File[]) => void;
  onSendReply: () => void;
}

const ReplySection = ({
  showReply,
  setShowReply,
  replyMessage,
  setReplyMessage,
  replyAttachments,
  setReplyAttachments,
  onSendReply,
}: ReplySectionProps) => {
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReplyAttachments([...replyAttachments, ...files]);
    toast({
      title: "Files Added",
      description: `${files.length} file(s) added to reply`,
    });
  };

  const removeAttachment = (index: number) => {
    const removedFile = replyAttachments[index];
    setReplyAttachments(replyAttachments.filter((_, i) => i !== index));
    toast({
      title: "File Removed",
      description: `${removedFile.name} removed from reply`,
    });
  };

  const handleCancel = () => {
    setShowReply(false);
    setReplyMessage("");
    setReplyAttachments([]);
  };

  if (!showReply) {
    return (
      <div className="sticky bottom-0 bg-white border-t pt-4">
        <Button onClick={() => setShowReply(true)} className="w-full" size="lg">
          <Reply className="w-4 h-4 mr-2" />
          Reply to this message
        </Button>
      </div>
    );
  }

  return (
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
        <Button variant="outline" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={onSendReply} 
          className="flex-1"
          disabled={!replyMessage.trim()}
        >
          <Send className="w-4 h-4 mr-2" />
          Send Reply
        </Button>
      </div>
    </div>
  );
};

export default ReplySection;
