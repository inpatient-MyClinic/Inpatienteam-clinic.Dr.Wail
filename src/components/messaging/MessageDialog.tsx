import * as React from "react";
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
import { Upload, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserRole } from "@/utils/auth";
import UserSearchSelect from "./UserSearchSelect";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface MessageDialogProps {
  trigger: React.ReactNode;
  currentUserRole: string;
}

const MessageDialog = ({ trigger, currentUserRole }: MessageDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  // Get current user info for sending messages
  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (selectedUsers.length === 0 || !message.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please select recipients and enter a message",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to send messages",
          variant: "destructive",
        });
        return;
      }

      // Send message to each selected user
      const messagePromises = selectedUsers.map(async (recipient) => {
        const messageData = {
          sender_id: currentUser.id,
          recipient_id: recipient.id,
          subject: subject.trim() || 'No Subject',
          content: message.trim(),
          priority: 'normal',
          attachments: attachments.map(file => file.name),
          metadata: {
            recipient_name: recipient.full_name || recipient.email,
            recipient_role: recipient.role,
            sender_role: currentUserRole,
            attachments_count: attachments.length
          }
        };

        return supabase.from('messages').insert(messageData);
      });

      const results = await Promise.all(messagePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Some messages failed to send:', errors);
        toast({
          title: "Partial Success",
          description: `${selectedUsers.length - errors.length} of ${selectedUsers.length} messages sent successfully`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Messages Sent Successfully",
          description: `Message sent to ${selectedUsers.length} recipient${selectedUsers.length > 1 ? 's' : ''}`,
        });
      }

      // Reset form
      setSelectedUsers([]);
      setSubject("");
      setMessage("");
      setAttachments([]);
      setOpen(false);

    } catch (error) {
      console.error('Error sending messages:', error);
      toast({
        title: "Error",
        description: "Failed to send messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            <Label htmlFor="recipients">To</Label>
            <UserSearchSelect
              selectedUsers={selectedUsers}
              onUsersChange={setSelectedUsers}
              currentUserRole={currentUserRole}
            />
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
            <Button onClick={handleSend} disabled={isLoading} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
