import { Bell, AlertTriangle, Megaphone, CheckCircle, Settings, MoreHorizontal } from 'lucide-react';
import { Activity } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  onMarkAllRead: () => void;
}

const activityIcons = {
  alert: AlertTriangle,
  task: CheckCircle,
  campaign: Megaphone,
  customer: Bell,
  system: Settings,
};

const activityColors = {
  alert: 'text-danger bg-danger/10',
  task: 'text-info bg-info/10',
  campaign: 'text-success bg-success/10',
  customer: 'text-primary bg-primary/10',
  system: 'text-muted-foreground bg-muted',
};

export function ActivityFeed({ activities, onActivityClick, onMarkAllRead }: ActivityFeedProps) {
  const unreadCount = activities.filter((a) => !a.read).length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Hoạt động</h1>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {unreadCount} mới
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onMarkAllRead} className="text-sm">
            Đánh dấu đã đọc
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="divide-y divide-border">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onActivityClick(activity)}
                className={cn(
                  'flex w-full gap-4 p-4 text-left transition-colors hover:bg-card-hover',
                  !activity.read && 'bg-primary/5'
                )}
              >
                <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full', colorClass)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn('font-medium text-sm', !activity.read && 'text-foreground')}>
                      {activity.title}
                    </span>
                    {!activity.read && <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary mt-1.5" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: vi })}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
