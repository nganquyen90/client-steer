import { Activity, Users, Compass, CheckSquare, Settings, HelpCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AppBarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  unreadCount: number;
}

const modules = [
  { id: 'activity', icon: Activity, label: 'Hoạt động', shortcut: 'A' },
  { id: 'clients', icon: Users, label: 'Khách hàng', shortcut: 'K' },
  { id: 'compass', icon: Compass, label: 'La bàn', shortcut: 'L' },
  { id: 'tasks', icon: CheckSquare, label: 'Nhiệm vụ', shortcut: 'N' },
];

const bottomModules = [
  { id: 'settings', icon: Settings, label: 'Cài đặt' },
  { id: 'help', icon: HelpCircle, label: 'Trợ giúp' },
];

export function AppBar({ activeModule, onModuleChange, unreadCount }: AppBarProps) {
  return (
    <div className="flex h-full w-16 flex-col bg-app-bar">
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b border-app-bar-hover">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
          D
        </div>
      </div>

      {/* Main modules */}
      <nav className="flex flex-1 flex-col items-center gap-1 py-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => onModuleChange(module.id)}
              className={cn(
                'group relative flex h-11 w-11 flex-col items-center justify-center rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-app-bar-hover text-app-bar-active'
                  : 'text-app-bar-foreground/70 hover:bg-app-bar-hover hover:text-app-bar-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-app-bar-active"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              
              <Icon className="h-5 w-5" />
              
              {module.id === 'activity' && unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-danger-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs text-background group-hover:block whitespace-nowrap z-50">
                {module.label}
                <span className="ml-2 text-muted-foreground">({module.shortcut})</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom modules */}
      <div className="flex flex-col items-center gap-1 border-t border-app-bar-hover py-3">
        {bottomModules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => onModuleChange(module.id)}
              className={cn(
                'group relative flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-app-bar-hover text-app-bar-active'
                  : 'text-app-bar-foreground/70 hover:bg-app-bar-hover hover:text-app-bar-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs text-background group-hover:block whitespace-nowrap z-50">
                {module.label}
              </div>
            </button>
          );
        })}
        
        {/* User avatar */}
        <button className="mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground ring-2 ring-transparent transition-all hover:ring-app-bar-active">
          NV
        </button>
      </div>
    </div>
  );
}
