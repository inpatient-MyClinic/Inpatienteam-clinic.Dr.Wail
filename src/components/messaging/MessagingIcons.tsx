
import React from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";
import MessageDialog from "./MessageDialog";
import ReceivedMessagesDialog from "./ReceivedMessagesDialog";
import { Badge } from "@/components/ui/badge";

interface MessagingIconsProps {
  currentUserRole: string;
  unreadCount?: number;
}

const MessagingIcons = ({ currentUserRole, unreadCount = 3 }: MessagingIconsProps) => {
  return (
    <div className="flex gap-2">
      <MessageDialog
        currentUserRole={currentUserRole}
        trigger={
          <Button variant="outline" size="sm">
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        }
      />
      
      <ReceivedMessagesDialog
        currentUserRole={currentUserRole}
        trigger={
          <Button variant="outline" size="sm" className="relative">
            <MessageCircle className="w-4 h-4 mr-2" />
            Messages
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
    </div>
  );
};

export default MessagingIcons;
