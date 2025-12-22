// Chat types for messaging functionality

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  name: string;
  avatar?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  // For group chats
  groupType?: 'custom' | 'segment';
  groupId?: string; // Reference to CustomerGroup or segment
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}
