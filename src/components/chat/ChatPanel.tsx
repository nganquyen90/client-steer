import { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, Smile, MoreVertical, Phone, Video, Users } from 'lucide-react';
import { Chat, ChatMessage } from '@/types/chat';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  chat: Chat;
  messages: ChatMessage[];
  onClose: () => void;
  onSendMessage: (chatId: string, content: string) => void;
  currentUserId?: string;
}

export function ChatPanel({ 
  chat, 
  messages, 
  onClose, 
  onSendMessage,
  currentUserId = 'current-user'
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(chat.id, inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full w-80 border-l border-border bg-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {chat.type === 'group' ? <Users className="h-4 w-4" /> : chat.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold">{chat.name}</h3>
            {chat.type === 'group' && (
              <p className="text-xs text-muted-foreground">
                {chat.participants.length} thành viên
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            const showAvatar = !isCurrentUser && 
              (index === 0 || messages[index - 1].senderId !== message.senderId);

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-2',
                  isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {!isCurrentUser && (
                  <div className="w-7">
                    {showAvatar && (
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {message.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                <div className={cn(
                  'max-w-[70%] space-y-1',
                  isCurrentUser ? 'items-end' : 'items-start'
                )}>
                  {showAvatar && chat.type === 'group' && (
                    <p className="text-xs text-muted-foreground ml-1">
                      {message.senderName}
                    </p>
                  )}
                  <div className={cn(
                    'rounded-2xl px-3 py-2 text-sm',
                    isCurrentUser 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}>
                    {message.content}
                  </div>
                  <p className={cn(
                    'text-[10px] text-muted-foreground px-1',
                    isCurrentUser ? 'text-right' : 'text-left'
                  )}>
                    {format(message.timestamp, 'HH:mm')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 h-9 text-sm"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <Smile className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            className="h-8 w-8 flex-shrink-0"
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
