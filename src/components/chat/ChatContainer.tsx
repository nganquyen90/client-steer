import { useState, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { Chat, ChatMessage } from '@/types/chat';
import { Customer, CustomerGroup } from '@/types';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatList } from './ChatList';
import { ChatPanel } from './ChatPanel';

interface ChatContainerProps {
  customers: Customer[];
  customerGroups: CustomerGroup[];
}

// Mock initial chats
const mockChats: Chat[] = [];

const mockMessages: Record<string, ChatMessage[]> = {};

export function ChatContainer({ customers, customerGroups }: ChatContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(mockMessages);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'chat'>('list');

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const selectedChatMessages = selectedChatId ? messages[selectedChatId] || [] : [];
  
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const handleStartIndividualChat = useCallback((customer: Customer) => {
    // Check if chat already exists
    const existingChat = chats.find(
      c => c.type === 'individual' && c.participants.some(p => p.id === customer.id)
    );

    if (existingChat) {
      setSelectedChatId(existingChat.id);
      setViewMode('chat');
      return;
    }

    // Create new chat
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      type: 'individual',
      name: customer.name,
      participants: [
        { id: customer.id, name: customer.name, role: 'member', joinedAt: new Date() },
        { id: 'current-user', name: 'Bạn', role: 'admin', joinedAt: new Date() },
      ],
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({ ...prev, [newChat.id]: [] }));
    setSelectedChatId(newChat.id);
    setViewMode('chat');
  }, [chats]);

  const handleCreateGroupChat = useCallback((
    type: 'custom' | 'segment',
    groupId: string,
    name: string
  ) => {
    // Check if group chat already exists
    const existingChat = chats.find(
      c => c.type === 'group' && c.groupType === type && c.groupId === groupId
    );

    if (existingChat) {
      setSelectedChatId(existingChat.id);
      setViewMode('chat');
      return;
    }

    // Get participants based on group type
    let participants: Chat['participants'] = [];
    
    if (type === 'custom') {
      const group = customerGroups.find(g => g.id === groupId);
      const groupCustomers = customers.filter(c => c.groupId === groupId);
      participants = groupCustomers.map(c => ({
        id: c.id,
        name: c.name,
        role: 'member' as const,
        joinedAt: new Date(),
      }));
    } else {
      // Segment type
      const segmentCustomers = customers.filter(c => c.segment === groupId);
      participants = segmentCustomers.map(c => ({
        id: c.id,
        name: c.name,
        role: 'member' as const,
        joinedAt: new Date(),
      }));
    }

    participants.push({
      id: 'current-user',
      name: 'Bạn',
      role: 'admin',
      joinedAt: new Date(),
    });

    const newChat: Chat = {
      id: `chat-group-${Date.now()}`,
      type: 'group',
      name: name,
      participants,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      groupType: type,
      groupId: groupId,
    };

    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({ ...prev, [newChat.id]: [] }));
    setSelectedChatId(newChat.id);
    setViewMode('chat');
  }, [chats, customers, customerGroups]);

  const handleSelectChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
    setViewMode('chat');
    
    // Mark as read
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));
  }, []);

  const handleSendMessage = useCallback((chatId: string, content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: 'current-user',
      senderName: 'Bạn',
      content,
      timestamp: new Date(),
      type: 'text',
      status: 'sent',
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));

    // Update last message
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
        : chat
    ));
  }, []);

  const handleCloseChat = useCallback(() => {
    setViewMode('list');
    setSelectedChatId(null);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setViewMode('list');
    setSelectedChatId(null);
  }, []);

  return (
    <>
      {/* Floating chat button */}
      <AnimatePresence>
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
            {totalUnread > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 text-[10px]"
              >
                {totalUnread}
              </Badge>
            )}
          </Button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-6 right-6 h-[600px] z-50 rounded-lg overflow-hidden shadow-2xl border border-border">
            {viewMode === 'list' ? (
              <ChatList
                chats={chats}
                customers={customers}
                customerGroups={customerGroups}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
                onStartIndividualChat={handleStartIndividualChat}
                onCreateGroupChat={handleCreateGroupChat}
                onClose={handleClose}
              />
            ) : selectedChat ? (
              <ChatPanel
                chat={selectedChat}
                messages={selectedChatMessages}
                onClose={handleCloseChat}
                onSendMessage={handleSendMessage}
              />
            ) : null}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
