import { useState } from 'react';
import { CustomerProgram, Journey, CustomerGroup, JourneyNode } from '@/types';
import { LeftRail } from '@/components/layout/LeftRail';
import { MainStage } from '@/components/layout/MainStage';
import { JourneyBuilder } from './JourneyBuilder';
import { JourneyCreator } from './JourneyCreator';
import { Button } from '@/components/ui/button';
import { Plus, Compass, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CompassModuleProps {
  customerPrograms: CustomerProgram[];
  customerGroups?: CustomerGroup[];
  onAddGroup?: (group: Omit<CustomerGroup, 'id' | 'createdAt' | 'customerCount'>) => void;
  onEditGroup?: (id: string, group: Partial<CustomerGroup>) => void;
  onDeleteGroup?: (id: string) => void;
  onImportCustomers?: (groupId: string, customers: any[]) => void;
}

// Helper to create nodes with new 3-part structure
const n = (id: string, type: JourneyNode['type'], label: string, opts?: { description?: string; tasks?: JourneyNode['execution']['tasks']; kycConfig?: JourneyNode['execution']['kycConfig']; authorizationConfig?: JourneyNode['execution']['authorizationConfig']; esignConfig?: JourneyNode['execution']['esignConfig']; timing?: JourneyNode['rule']['timing'] }): JourneyNode => ({
  id, type, position: { x: 0, y: 0 },
  info: { label, description: opts?.description },
  rule: { timing: opts?.timing },
  execution: { tasks: opts?.tasks, kycConfig: opts?.kycConfig, authorizationConfig: opts?.authorizationConfig, esignConfig: opts?.esignConfig },
});

const mockJourneys: Journey[] = [
  {
    id: 'j-1',
    name: 'Chăm sóc khách hàng mới',
    customerProgramId: 'cp-1',
    status: 'active',
    createdAt: new Date('2024-12-01'),
    nodes: [
      n('n-1', 'interact', 'Bắt đầu - Email chào mừng', { tasks: [{ id: 't1', type: 'email', label: 'Email chào mừng' }] }),
      n('n-2', 'interact', 'Chờ 3 ngày + SMS', { timing: { type: 'delay', delayValue: 3, delayUnit: 'days' }, tasks: [{ id: 't2', type: 'sms', label: 'SMS cảm ơn' }] }),
      n('n-3', 'interact', 'Gọi điện tư vấn', { tasks: [{ id: 't3', type: 'call', label: 'Gọi điện tư vấn' }] }),
    ],
    edges: [
      { id: 'e-1', source: 'n-1', target: 'n-2' },
      { id: 'e-2', source: 'n-2', target: 'n-3' },
    ],
  },
  {
    id: 'j-2',
    name: 'Win-back khách hàng Risk',
    customerProgramId: 'cp-3',
    status: 'draft',
    createdAt: new Date('2024-12-10'),
    nodes: [],
    edges: [],
  },
  {
    id: 'j-3',
    name: 'Cấp phát hạn mức Margin',
    customerProgramId: 'cp-1',
    status: 'active',
    createdAt: new Date('2025-03-01'),
    nodes: [
      n('n-1', 'interact', 'KH đăng ký mới', { description: 'Khách hàng mới đăng ký (Tên, SĐT)', tasks: [{ id: 't1', type: 'email', label: 'Email chào mừng + link App' }] }),
      n('n-2', 'authen', 'Xác thực KYC (CCCD + Face)', { description: 'Chụp CCCD, quét khuôn mặt, OCR, đối chiếu CSDL', kycConfig: { method: 'cccd', steps: ['id_front', 'id_back', 'face_matching', 'ocr_verify', 'db_check'], maxRetries: 3, manualReviewOnFail: true, failAction: 'create_task' } }),
      n('n-3', 'author', 'Phân quyền & Định mức Margin', { description: 'Kiểm tra CIC, cấp hạn mức phù hợp', authorizationConfig: { checkType: 'credit_score', rules: [], defaultTier: 'standard' }, esignConfig: { method: 'otp', documentType: 'contract', requireWitness: false, expiryHours: 24 } }),
      n('n-4', 'interact', 'Thông báo & Hướng dẫn', { timing: { type: 'delay', delayValue: 2, delayUnit: 'hours' }, tasks: [{ id: 't4', type: 'notification', label: 'Chúc mừng cấp hạn mức' }, { id: 't5', type: 'email', label: 'Hướng dẫn sử dụng App' }] }),
    ],
    edges: [],
  },
];

type ViewMode = 'list' | 'builder' | 'creator';

export function CompassModule({ 
  customerPrograms,
  customerGroups = [],
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onImportCustomers,
}: CompassModuleProps) {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(customerPrograms[0]?.id || null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>(mockJourneys);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId);
  
  const filteredJourneys = selectedGroupId
    ? journeys.filter((j) => j.customerProgramId === selectedGroupId)
    : selectedProgramId
    ? journeys.filter((j) => j.customerProgramId === selectedProgramId)
    : journeys;

  const handleProgramSelect = (programId: string) => {
    setSelectedProgramId(programId);
    setSelectedGroupId(null);
    setSelectedJourneyId(null);
    setViewMode('list');
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedProgramId(null);
    setSelectedJourneyId(null);
    setViewMode('list');
  };

  const handleCreateJourney = (journeyData: { name: string; targetType: 'program' | 'group'; targetId: string; nodes?: JourneyNode[] }) => {
    const newJourney: Journey = {
      id: `j-${Date.now()}`,
      name: journeyData.name,
      customerProgramId: journeyData.targetId,
      status: 'draft',
      createdAt: new Date(),
      nodes: journeyData.nodes || [],
      edges: [],
    };
    setJourneys((prev) => [...prev, newJourney]);
    setSelectedJourneyId(newJourney.id);
    setViewMode('builder');
  };

  const nodeTypeColors: Record<string, string> = {
    interact: 'bg-primary',
    authen: 'bg-cyan-500',
    author: 'bg-amber-500',
  };

  const renderContent = () => {
    if (viewMode === 'builder' && selectedJourney) {
      return (
        <JourneyBuilder
          journey={selectedJourney}
          onBack={() => { setSelectedJourneyId(null); setViewMode('list'); }}
        />
      );
    }

    if (viewMode === 'creator') {
      return (
        <JourneyCreator
          customerPrograms={customerPrograms}
          customerGroups={customerGroups}
          selectedProgramId={selectedProgramId}
          selectedGroupId={selectedGroupId}
          onBack={() => setViewMode('list')}
          onCreate={handleCreateJourney}
        />
      );
    }

    return (
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <Compass className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Hành trình khách hàng</h1>
          </div>
          <Button size="sm" onClick={() => setViewMode('creator')}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo hành trình
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJourneys.map((journey, index) => {
              const program = customerPrograms.find((p) => p.id === journey.customerProgramId);
              const group = customerGroups.find((g) => g.id === journey.customerProgramId);
              const targetName = program?.name || group?.name;
              
              return (
                <motion.div key={journey.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <button
                    onClick={() => { setSelectedJourneyId(journey.id); setViewMode('builder'); }}
                    className="group w-full rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          journey.status === 'active' ? 'bg-success/10 text-success' :
                          journey.status === 'paused' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        )}>
                          <Compass className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium group-hover:text-primary transition-colors">{journey.name}</h3>
                          {targetName && <p className="text-xs text-muted-foreground">{targetName}</p>}
                        </div>
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="outline" className={cn(
                        journey.status === 'active' && 'bg-success/10 text-success border-success/20',
                        journey.status === 'paused' && 'bg-warning/10 text-warning border-warning/20',
                        journey.status === 'draft' && 'bg-muted text-muted-foreground'
                      )}>
                        {journey.status === 'active' ? 'Đang chạy' : journey.status === 'paused' ? 'Tạm dừng' : 'Nháp'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{journey.nodes.length} bước</span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {journey.nodes.slice(0, 5).map((node) => (
                        <div key={node.id} className={cn('h-2 w-2 rounded-full', nodeTypeColors[node.type] || 'bg-muted-foreground')} />
                      ))}
                      {journey.nodes.length > 5 && (
                        <span className="text-xs text-muted-foreground">+{journey.nodes.length - 5}</span>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}

            <button
              onClick={() => setViewMode('creator')}
              className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Tạo hành trình mới</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      <LeftRail
        title="La bàn hành trình"
        customerPrograms={customerPrograms}
        selectedProgramId={selectedProgramId}
        onProgramSelect={handleProgramSelect}
        customerGroups={customerGroups}
        onAddGroup={onAddGroup}
        onEditGroup={onEditGroup}
        onDeleteGroup={onDeleteGroup}
        onImportCustomers={onImportCustomers}
        selectedGroupId={selectedGroupId}
        onSelectGroup={handleGroupSelect}
      />
      <MainStage>
        {renderContent()}
      </MainStage>
    </div>
  );
}
