
export interface Message {
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
  priority?: 'normal' | 'high' | 'urgent';
}

export interface ReceivedMessagesDialogProps {
  trigger: React.ReactNode;
  currentUserRole: string;
}
