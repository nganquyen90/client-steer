import { Journey, JourneyNode } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Save, 
  Plus, 
  Mail, 
  Phone, 
  MessageSquare, 
  Bell, 
  Clock, 
  GitBranch,
  CircleDot,
  Square,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface JourneyBuilderProps {
  journey: Journey;
  onBack: () => void;
}

const nodeTypeConfig = {
  start: { icon: CircleDot, label: 'Bắt đầu', color: 'bg-success text-success-foreground' },
  touchpoint: { icon: Mail, label: 'Điểm chạm', color: 'bg-primary text-primary-foreground' },
  wait: { icon: Clock, label: 'Chờ', color: 'bg-warning text-warning-foreground' },
  decision: { icon: GitBranch, label: 'Điều kiện', color: 'bg-accent text-accent-foreground' },
  end: { icon: Square, label: 'Kết thúc', color: 'bg-muted-foreground text-background' },
};

const touchpointIcons = {
  email: Mail,
  sms: MessageSquare,
  notification: Bell,
  call: Phone,
  chat: MessageSquare,
};

const toolboxItems = [
  { type: 'touchpoint', subtype: 'email', icon: Mail, label: 'Email' },
  { type: 'touchpoint', subtype: 'sms', icon: MessageSquare, label: 'SMS' },
  { type: 'touchpoint', subtype: 'notification', icon: Bell, label: 'Notification' },
  { type: 'touchpoint', subtype: 'call', icon: Phone, label: 'Gọi điện' },
  { type: 'wait', icon: Clock, label: 'Chờ' },
  { type: 'decision', icon: GitBranch, label: 'Điều kiện' },
];

export function JourneyBuilder({ journey, onBack }: JourneyBuilderProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-6 bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold">{journey.name}</h1>
            <Badge
              variant="outline"
              className={cn(
                'text-xs mt-0.5',
                journey.status === 'active' && 'bg-success/10 text-success border-success/20',
                journey.status === 'paused' && 'bg-warning/10 text-warning border-warning/20',
                journey.status === 'draft' && 'bg-muted text-muted-foreground'
              )}
            >
              {journey.status === 'active' ? 'Đang chạy' :
               journey.status === 'paused' ? 'Tạm dừng' : 'Nháp'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {journey.status === 'active' ? (
            <Button variant="outline" size="sm">
              <Pause className="mr-2 h-4 w-4" />
              Tạm dừng
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Kích hoạt
            </Button>
          )}
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Lưu
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbox - Sidebar */}
        <div className="w-56 border-r border-border bg-left-rail p-4 flex-shrink-0 overflow-y-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Công cụ</h3>
          <div className="grid grid-cols-2 gap-2">
            {toolboxItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-2 transition-all hover:border-primary/50 hover:shadow-sm"
                  draggable
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Thống kê</h3>
            <div className="space-y-2">
              <div className="rounded-lg bg-card p-2.5 border border-border">
                <p className="text-xl font-bold text-primary">{journey.nodes.length}</p>
                <p className="text-xs text-muted-foreground">Tổng số bước</p>
              </div>
              <div className="rounded-lg bg-card p-2.5 border border-border">
                <p className="text-xl font-bold text-success">156</p>
                <p className="text-xs text-muted-foreground">Khách hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas - Vertical Layout */}
        <div className="flex-1 overflow-auto bg-muted/30">
          <div className="flex flex-col items-center py-6 px-4 min-h-full">
            {/* Draw nodes vertically */}
            {journey.nodes.map((node, index) => {
              const config = nodeTypeConfig[node.type];
              const Icon = node.type === 'touchpoint' && node.data.touchpointType
                ? touchpointIcons[node.data.touchpointType]
                : config.icon;
              
              const nextNode = journey.nodes[index + 1];
              const hasConnection = nextNode && journey.edges.some(
                e => e.source === node.id && e.target === nextNode.id
              );
              const edge = journey.edges.find(e => e.source === node.id);

              return (
                <div key={node.id} className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="group relative">
                      <div className={cn(
                        'flex h-14 w-52 items-center gap-3 rounded-lg border-2 bg-card px-3 shadow-sm transition-all hover:shadow-md cursor-move',
                        node.type === 'start' && 'border-success',
                        node.type === 'end' && 'border-muted-foreground',
                        node.type === 'touchpoint' && 'border-primary',
                        node.type === 'wait' && 'border-warning',
                        node.type === 'decision' && 'border-accent'
                      )}>
                        <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', config.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{node.data.label}</p>
                          {node.data.waitDays && (
                            <p className="text-xs text-muted-foreground">{node.data.waitDays} ngày</p>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      {node.type !== 'start' && node.type !== 'end' && (
                        <button className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-danger-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>

                  {/* Connector line */}
                  {index < journey.nodes.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      <div className="w-0.5 h-6 bg-border" />
                      {edge?.label && (
                        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border my-1">
                          {edge.label}
                        </span>
                      )}
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-border" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add node button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: journey.nodes.length * 0.05 }}
              className="mt-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-card/50 px-4 py-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Thêm bước</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
