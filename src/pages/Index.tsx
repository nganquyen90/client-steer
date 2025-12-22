import { useState } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { MainStage } from '@/components/layout/MainStage';
import { ActivityFeed } from '@/components/modules/ActivityFeed';
import { ClientsModule } from '@/components/modules/ClientsModule';
import { CompassModule } from '@/components/modules/CompassModule';
import { TasksModule } from '@/components/modules/TasksModule';
import { ContentModule } from '@/components/modules/ContentModule';
import { 
  mockCustomers, 
  mockActivities, 
  mockCustomerPrograms, 
  mockTasks,
  mockInteractions,
  mockCustomerGroups,
  mockContentTemplates,
} from '@/data/mockData';
import { Activity, Task, CustomerGroup, ContentTemplate } from '@/types';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const [activeModule, setActiveModule] = useState('clients');
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>(mockCustomerGroups);
  const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>(mockContentTemplates);

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

  // Customer Group handlers
  const handleAddGroup = (group: Omit<CustomerGroup, 'id' | 'createdAt' | 'customerCount'>) => {
    const newGroup: CustomerGroup = {
      ...group,
      id: `g-${Date.now()}`,
      customerCount: 0,
      createdAt: new Date(),
    };
    setCustomerGroups((prev) => [...prev, newGroup]);
  };

  const handleEditGroup = (id: string, updates: Partial<CustomerGroup>) => {
    setCustomerGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const handleDeleteGroup = (id: string) => {
    setCustomerGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const handleImportCustomers = (groupId: string, customers: any[]) => {
    console.log('Import customers to group:', groupId, customers);
  };

  // Content Template handlers
  const handleAddTemplate = (template: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: ContentTemplate = {
      ...template,
      id: `ct-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setContentTemplates((prev) => [...prev, newTemplate]);
  };

  const handleEditTemplate = (id: string, updates: Partial<ContentTemplate>) => {
    setContentTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t))
    );
  };

  const handleDeleteTemplate = (id: string) => {
    setContentTemplates((prev) => prev.filter((t) => t.id !== id));
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
            customerGroups={customerGroups}
            onAddGroup={handleAddGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onImportCustomers={handleImportCustomers}
          />
        );
      case 'compass':
        return (
          <CompassModule 
            customerPrograms={mockCustomerPrograms}
            customerGroups={customerGroups}
            onAddGroup={handleAddGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onImportCustomers={handleImportCustomers}
          />
        );
      case 'tasks':
        return (
          <MainStage>
            <TasksModule tasks={tasks} onTaskUpdate={handleTaskUpdate} />
          </MainStage>
        );
      case 'content':
        return (
          <MainStage>
            <ContentModule
              templates={contentTemplates}
              onAddTemplate={handleAddTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
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
