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
        {/* Toolbox */}
        <div className="w-64 border-r border-border bg-left-rail p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Công cụ</h3>
          <div className="grid grid-cols-2 gap-2">
            {toolboxItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm"
                  draggable
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Thống kê</h3>
            <div className="space-y-3">
              <div className="rounded-lg bg-card p-3 border border-border">
                <p className="text-2xl font-bold text-primary">{journey.nodes.length}</p>
                <p className="text-xs text-muted-foreground">Tổng số bước</p>
              </div>
              <div className="rounded-lg bg-card p-3 border border-border">
                <p className="text-2xl font-bold text-success">156</p>
                <p className="text-xs text-muted-foreground">Khách hàng trong hành trình</p>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="relative min-h-[500px] min-w-[1200px]">
            {/* Draw edges */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              {journey.edges.map((edge) => {
                const sourceNode = journey.nodes.find((n) => n.id === edge.source);
                const targetNode = journey.nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const startX = sourceNode.position.x + 80;
                const startY = sourceNode.position.y + 30;
                const endX = targetNode.position.x;
                const endY = targetNode.position.y + 30;
                const midX = (startX + endX) / 2;

                return (
                  <g key={edge.id}>
                    <path
                      d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                    />
                    {edge.label && (
                      <text
                        x={midX}
                        y={(startY + endY) / 2 - 8}
                        textAnchor="middle"
                        className="text-xs fill-muted-foreground"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Draw nodes */}
            {journey.nodes.map((node, index) => {
              const config = nodeTypeConfig[node.type];
              const Icon = node.type === 'touchpoint' && node.data.touchpointType
                ? touchpointIcons[node.data.touchpointType]
                : config.icon;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="absolute"
                  style={{ left: node.position.x, top: node.position.y }}
                >
                  <div className="group relative">
                    <div className={cn(
                      'flex h-[60px] w-40 items-center gap-3 rounded-lg border-2 bg-card px-3 shadow-sm transition-all hover:shadow-md cursor-move',
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
