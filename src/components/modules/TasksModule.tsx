import { useState } from 'react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  Calendar, 
  UserCheck, 
  MoreHorizontal, 
  Plus, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TasksModuleProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, status: Task['status']) => void;
}

type ViewMode = 'kanban' | 'calendar';

const taskTypeIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  follow_up: UserCheck,
  other: MoreHorizontal,
};

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-danger/10 text-danger',
};

const priorityLabels = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
};

const columns: { id: Task['status']; title: string; icon: typeof Clock }[] = [
  { id: 'todo', title: 'Cần làm', icon: Clock },
  { id: 'in_progress', title: 'Đang làm', icon: AlertCircle },
  { id: 'done', title: 'Hoàn thành', icon: CheckCircle2 },
];

const statusColors = {
  todo: 'bg-muted-foreground',
  in_progress: 'bg-warning',
  done: 'bg-success',
};

export function TasksModule({ tasks, onTaskUpdate }: TasksModuleProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (draggedTask) {
      onTaskUpdate(draggedTask, status);
      setDraggedTask(null);
    }
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), day));
  };

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-6">
        <h1 className="text-lg font-semibold">Nhiệm vụ</h1>
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="kanban" className="h-7 px-3 text-xs gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="calendar" className="h-7 px-3 text-xs gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Lịch
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhiệm vụ
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        /* Kanban board */
        <div className="flex-1 overflow-x-auto scrollbar-thin p-6">
          <div className="flex gap-6 h-full min-w-max">
            {columns.map((column) => {
              const Icon = column.icon;
              const columnTasks = tasks.filter((t) => t.status === column.id);

              return (
                <div
                  key={column.id}
                  className="flex w-80 flex-col rounded-lg bg-muted/30"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column header */}
                  <div className="flex items-center gap-2 p-4 border-b border-border">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{column.title}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {columnTasks.length}
                    </Badge>
                  </div>

                  {/* Tasks */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
                    {columnTasks.map((task, index) => {
                      const TaskIcon = taskTypeIcons[task.type];
                      const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                          className={cn(
                            'group cursor-grab rounded-lg border bg-card p-4 transition-all hover:shadow-md active:cursor-grabbing',
                            draggedTask === task.id && 'opacity-50',
                            isOverdue && 'border-danger/50'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', priorityStyles[task.priority])}>
                                <TaskIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm line-clamp-1">{task.title}</h4>
                                {task.customerName && (
                                  <p className="text-xs text-muted-foreground">{task.customerName}</p>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>

                          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{task.description}</p>

                          <div className="mt-3 flex items-center justify-between">
                            <Badge variant="outline" className={cn('text-xs', priorityStyles[task.priority])}>
                              {priorityLabels[task.priority]}
                            </Badge>
                            <span className={cn('text-xs', isOverdue ? 'text-danger font-medium' : 'text-muted-foreground')}>
                              {format(task.dueDate, 'dd/MM', { locale: vi })}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Add task button */}
                  <div className="p-3 border-t border-border">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm nhiệm vụ
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Calendar view */
        <div className="flex-1 overflow-auto p-6">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy', { locale: vi })}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentMonth(new Date())}
              >
                Hôm nay
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="rounded-lg border border-border overflow-hidden">
            {/* Week days header */}
            <div className="grid grid-cols-7 bg-muted/50">
              {weekDays.map((day) => (
                <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground border-b border-border">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={index}
                    className={cn(
                      'min-h-[120px] border-b border-r border-border p-2 transition-colors',
                      !isCurrentMonth && 'bg-muted/30',
                      isToday && 'bg-primary/5'
                    )}
                  >
                    <div className={cn(
                      'text-sm font-medium mb-1',
                      !isCurrentMonth && 'text-muted-foreground',
                      isToday && 'text-primary'
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => {
                        const TaskIcon = taskTypeIcons[task.type];
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              'flex items-center gap-1.5 rounded px-1.5 py-1 text-xs cursor-pointer transition-colors hover:opacity-80',
                              task.status === 'done' ? 'bg-success/10 text-success' : 
                              task.status === 'in_progress' ? 'bg-warning/10 text-warning' : 
                              'bg-muted text-foreground'
                            )}
                          >
                            <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', statusColors[task.status])} />
                            <TaskIcon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{task.title}</span>
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-1">
                          +{dayTasks.length - 3} nhiệm vụ khác
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}