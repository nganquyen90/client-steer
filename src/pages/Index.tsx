import { useState } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { MainStage } from '@/components/layout/MainStage';
import { ActivityFeed } from '@/components/modules/ActivityFeed';
import { ClientsModule } from '@/components/modules/ClientsModule';
import { CompassModule } from '@/components/modules/CompassModule';
import { TasksModule } from '@/components/modules/TasksModule';
import { 
  mockCustomers, 
  mockActivities, 
  mockCustomerPrograms, 
  mockTasks,
  mockInteractions 
} from '@/data/mockData';
import { Activity, Task } from '@/types';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const [activeModule, setActiveModule] = useState('activity');
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const unreadCount = activities.filter((a) => !a.read).length;

  const handleActivityClick = (activity: Activity) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === activity.id ? { ...a, read: true } : a))
    );
  };

  const handleMarkAllRead = () => {
    setActivities((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleTaskUpdate = (taskId: string, status: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'activity':
        return (
          <MainStage>
            <ActivityFeed
              activities={activities}
              onActivityClick={handleActivityClick}
              onMarkAllRead={handleMarkAllRead}
            />
          </MainStage>
        );
      case 'clients':
        return (
          <ClientsModule
            customerPrograms={mockCustomerPrograms}
            customers={mockCustomers}
            interactions={mockInteractions}
          />
        );
      case 'compass':
        return <CompassModule customerPrograms={mockCustomerPrograms} />;
      case 'tasks':
        return (
          <MainStage>
            <TasksModule tasks={tasks} onTaskUpdate={handleTaskUpdate} />
          </MainStage>
        );
      default:
        return (
          <MainStage>
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-muted-foreground">
                  {activeModule === 'settings' ? 'Cài đặt' : 'Trợ giúp'}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tính năng đang được phát triển
                </p>
              </div>
            </div>
          </MainStage>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Dlink Platform - Quản lý khách hàng thông minh</title>
        <meta name="description" content="Dlink Platform - Nền tảng quản lý khách hàng và điều phối hành trình thông minh cho đội ngũ kinh doanh" />
      </Helmet>
      
      <div className="flex h-screen w-full overflow-hidden">
        <AppBar
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          unreadCount={unreadCount}
        />
        {renderModule()}
      </div>
    </>
  );
};

export default Index;
