import { useState } from 'react';
import { MessageCircle, Users, Plus, Search, X } from 'lucide-react';
import { Chat } from '@/types/chat';
import { Customer, CustomerGroup, CustomerSegment } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ChatListProps {
  chats: Chat[];
  customers: Customer[];
  customerGroups: CustomerGroup[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onStartIndividualChat: (customer: Customer) => void;
  onCreateGroupChat: (type: 'custom' | 'segment', groupId: string, name: string) => void;
  onClose: () => void;
}

const segmentLabels: Record<CustomerSegment, string> = {
  need: 'Need',
  risk: 'Risk',
  experience: 'Experience',
};

const segmentColors: Record<CustomerSegment, string> = {
  need: 'bg-need',
  risk: 'bg-risk',
  experience: 'bg-experience',
};

export function ChatList({
  chats,
  customers,
  customerGroups,
  selectedChatId,
  onSelectChat,
  onStartIndividualChat,
  onCreateGroupChat,
  onClose,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatTab, setNewChatTab] = useState<'individual' | 'group'>('individual');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery)
  );

  const formatLastMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    }
    if (isYesterday(date)) {
      return 'Hôm qua';
    }
    return format(date, 'dd/MM');
  };

  const segments: CustomerSegment[] = ['need', 'risk', 'experience'];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col h-full w-80 border-l border-border bg-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">Tin nhắn</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsNewChatOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
        </div>

        {/* Chat list */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Chưa có cuộc trò chuyện</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setIsNewChatOpen(true)}
                  className="mt-2"
                >
                  Bắt đầu chat mới
                </Button>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <motion.button
                  key={chat.id}
                  whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                    selectedChatId === chat.id ? 'bg-muted' : 'hover:bg-muted/50'
                  )}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className={cn(
                      'text-sm',
                      chat.type === 'group' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      {chat.type === 'group' ? <Users className="h-4 w-4" /> : chat.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{chat.name}</span>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-muted-foreground">
                          {formatLastMessageTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {chat.lastMessage?.content || 'Chưa có tin nhắn'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge className="h-5 min-w-[20px] px-1.5 text-[10px]">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </ScrollArea>
      </motion.div>

      {/* New Chat Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cuộc trò chuyện mới</DialogTitle>
            <DialogDescription>
              Bắt đầu chat 1-1 hoặc tạo nhóm chat
            </DialogDescription>
          </DialogHeader>

          <Tabs value={newChatTab} onValueChange={(v) => setNewChatTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Chat 1-1</TabsTrigger>
              <TabsTrigger value="group">Nhóm chat</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm khách hàng..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {filteredCustomers.slice(0, 20).map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          onStartIndividualChat(customer);
                          setIsNewChatOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-muted text-sm">
                            {customer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="group" className="mt-4">
              <ScrollArea className="h-72">
                <div className="space-y-4">
                  {/* Custom Groups */}
                  {customerGroups.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Nhóm tự tạo
                      </h4>
                      <div className="space-y-1">
                        {customerGroups.map((group) => (
                          <button
                            key={group.id}
                            onClick={() => {
                              onCreateGroupChat('custom', group.id, group.name);
                              setIsNewChatOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Users className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{group.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {group.customerCount} khách hàng
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* System Segments */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Phân khúc hệ thống
                    </h4>
                    <div className="space-y-1">
                      {segments.map((segment) => (
                        <button
                          key={segment}
                          onClick={() => {
                            onCreateGroupChat('segment', segment, `Nhóm ${segmentLabels[segment]}`);
                            setIsNewChatOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <div className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full text-white',
                            segmentColors[segment]
                          )}>
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Nhóm {segmentLabels[segment]}</p>
                            <p className="text-xs text-muted-foreground">
                              Tất cả KH trong phân khúc {segmentLabels[segment]}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
