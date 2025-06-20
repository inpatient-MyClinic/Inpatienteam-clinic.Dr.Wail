
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mail, Reply, Paperclip } from "lucide-react";
import { Message } from "./types";

interface MessageListProps {
  messages: Message[];
  onSelectMessage: (message: Message) => void;
  onMarkAsRead: (messageId: string) => void;
}

const MessageList = ({ messages, onSelectMessage, onMarkAsRead }: MessageListProps) => {
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

  const handleMessageClick = (message: Message) => {
    onSelectMessage(message);
    onMarkAsRead(message.id);
  };

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="space-y-3 p-1">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                !message.isRead ? getPriorityColor(message.priority || 'normal') : "hover:bg-gray-50"
              }`}
              onClick={() => handleMessageClick(message)}
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
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No messages found</p>
              <p className="text-sm">No messages match the selected filters.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
