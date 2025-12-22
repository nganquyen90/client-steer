import { useState } from 'react';
import { ArrowLeft, Phone, Mail, Calendar, MapPin, MoreHorizontal, MessageCircle } from 'lucide-react';
import { Customer, Interaction } from '@/types';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { maskSensitive } from '@/data/mockData';

interface Customer360Props {
  customer: Customer;
  interactions: Interaction[];
  onBack: () => void;
  onOpenChat?: () => void;
}

const segmentLabels = {
  need: 'Need',
  risk: 'Risk',
  experience: 'Experience',
};

const segmentStyles = {
  need: 'bg-need text-need-foreground',
  risk: 'bg-risk text-risk-foreground',
  experience: 'bg-experience text-experience-foreground',
};

const statusLabels = {
  new: 'Mới',
  active: 'Đang hoạt động',
  inactive: 'Không hoạt động',
  churned: 'Đã rời bỏ',
};

const interactionTypeIcons = {
  email: Mail,
  call: Phone,
  sms: Mail,
  notification: Mail,
  meeting: Calendar,
};

const interactionTypeLabels = {
  email: 'Email',
  call: 'Cuộc gọi',
  sms: 'SMS',
  notification: 'Thông báo',
  meeting: 'Cuộc họp',
};

export function Customer360({ customer, interactions, onBack, onOpenChat }: Customer360Props) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-1 items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {customer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">{customer.name}</h1>
                <Badge className={cn(segmentStyles[customer.segment])}>{segmentLabels[customer.segment]}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>{customer.dId}</span>
                <span>•</span>
                <span>{statusLabels[customer.status]}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Phone className="mr-2 h-4 w-4" />
              Gọi điện
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenChat}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Gửi email
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="h-10 bg-transparent border-b-0 p-0 gap-6">
            <TabsTrigger
              value="profile"
              className="h-10 px-0 pb-3 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="h-10 px-0 pb-3 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="position"
              className="h-10 px-0 pb-3 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Position
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="profile" className="mt-0 animate-fade-in">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Contact info */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold mb-4">Thông tin liên hệ</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{maskSensitive(customer.phone)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{maskSensitive(customer.email)}</p>
                    </div>
                  </div>
                  {customer.address && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Địa chỉ</p>
                        <p className="font-medium">{customer.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold mb-4">Thống kê</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-2xl font-bold text-primary">{interactions.length}</p>
                    <p className="text-sm text-muted-foreground">Tương tác</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-2xl font-bold text-success">
                      {formatDistanceToNow(customer.createdAt, { locale: vi })}
                    </p>
                    <p className="text-sm text-muted-foreground">Thời gian là khách</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-2xl font-bold text-warning">
                      {format(customer.lastInteraction, 'dd/MM/yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">Tương tác cuối</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-2xl font-bold text-info">{customer.tags.length}</p>
                    <p className="text-sm text-muted-foreground">Nhãn</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
                <h3 className="font-semibold mb-4">Nhãn</h3>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-7">
                    + Thêm nhãn
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-0 animate-fade-in">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold mb-4">Lịch sử tương tác</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {interactions.map((interaction, index) => {
                    const Icon = interactionTypeIcons[interaction.type];
                    return (
                      <motion.div
                        key={interaction.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex gap-4 pl-10"
                      >
                        <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-card border-2 border-primary">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 rounded-lg border border-border bg-muted/30 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{interactionTypeLabels[interaction.type]}</Badge>
                              <span className="text-sm font-medium">{interaction.subject}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(interaction.timestamp, 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          {interaction.content && (
                            <p className="mt-2 text-sm text-muted-foreground">{interaction.content}</p>
                          )}
                          {interaction.outcome && (
                            <p className="mt-2 text-sm">
                              <span className="text-muted-foreground">Kết quả:</span> {interaction.outcome}
                            </p>
                          )}
                          {interaction.duration && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Thời lượng: {interaction.duration} phút
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="position" className="mt-0 animate-fade-in">
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-semibold mb-4">Vị trí trên La bàn</h3>
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  {/* Compass visualization */}
                  <div className="relative h-64 w-64 rounded-full border-4 border-border bg-muted/30">
                    <div className="absolute inset-4 rounded-full border-2 border-border/50" />
                    <div className="absolute inset-8 rounded-full border border-border/30" />
                    
                    {/* Segments */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-medium text-need">Need</div>
                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-sm font-medium text-experience">Experience</div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-risk">Risk</div>
                    
                    {/* Customer position */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.3 }}
                      className={cn(
                        'absolute h-6 w-6 rounded-full shadow-lg',
                        customer.segment === 'need' && 'bg-need top-8 left-1/2 -translate-x-1/2',
                        customer.segment === 'risk' && 'bg-risk bottom-12 left-1/2 -translate-x-1/2',
                        customer.segment === 'experience' && 'bg-experience right-12 top-1/2 -translate-y-1/2'
                      )}
                    >
                      <div className="absolute inset-0 animate-ping rounded-full bg-current opacity-30" />
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <Badge className={cn('text-sm', segmentStyles[customer.segment])}>
                  Nhóm: {segmentLabels[customer.segment]}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  Khách hàng đang ở giai đoạn {segmentLabels[customer.segment].toLowerCase()} trong hành trình
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
