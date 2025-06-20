
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageDialogProps {
  trigger: React.ReactNode;
  currentUserRole: string;
}

const MessageDialog = ({ trigger, currentUserRole }: MessageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();

  const getRecipientOptions = () => {
    switch (currentUserRole) {
      case "case-coordinator":
        return [
          { value: "all", label: "All Users" },
          { value: "doctors", label: "All Doctors" },
          { value: "nurses", label: "All Nurses" },
          { value: "hospitals", label: "All Hospitals" },
          { value: "finance", label: "Finance Team" },
          { value: "customer-care", label: "Customer Care" },
        ];
      case "hospital":
        return [
          { value: "case-coordinators", label: "Case Coordinators" },
          { value: "finance", label: "Finance Team" },
          { value: "customer-care", label: "Customer Care" },
        ];
      case "nurse":
        return [
          { value: "nurse-sara", label: "Nurse Sara" },
          { value: "nurse-ahmad", label: "Nurse Ahmad" },
          { value: "case-coordinators", label: "Case Coordinators" },
          { value: "finance", label: "Finance Team" },
          { value: "customer-care", label: "Customer Care" },
        ];
      case "finance":
        return [
          { value: "all", label: "All Users" },
          { value: "case-coordinators", label: "Case Coordinators" },
          { value: "hospitals", label: "Hospitals" },
          { value: "doctors", label: "Doctors" },
          { value: "nurses", label: "Nurses" },
          { value: "customer-care", label: "Customer Care" },
        ];
      case "doctor":
        return [
          { value: "case-coordinators", label: "Case Coordinators" },
          { value: "nurses", label: "Nurses" },
          { value: "hospitals", label: "Hospitals" },
          { value: "finance", label: "Finance Team" },
          { value: "customer-care", label: "Customer Care" },
        ];
      case "customer-care":
        return [
          { value: "all", label: "All Users" },
          { value: "case-coordinators", label: "Case Coordinators" },
          { value: "hospitals", label: "Hospitals" },
          { value: "doctors", label: "Doctors" },
          { value: "nurses", label: "Nurses" },
          { value: "finance", label: "Finance Team" },
        ];
      default:
        return [
          { value: "case-coordinators", label: "Case Coordinators" },
          { value: "finance", label: "Finance Team" },
          { value: "customer-care", label: "Customer Care" },
        ];
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!recipient || !message.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please select a recipient and enter a message",
        variant: "destructive",
      });
      return;
    }

    // Simulate sending message
    toast({
      title: "Message Sent",
      description: `Message sent to ${recipient}`,
    });

    // Reset form
    setRecipient("");
    setSubject("");
    setMessage("");
    setAttachments([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient">To</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {getRecipientOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
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
                id="message-file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="message-file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-sm text-gray-600">Add files</span>
              </label>
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
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

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSend} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
