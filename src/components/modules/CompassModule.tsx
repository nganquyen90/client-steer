import { useState } from 'react';
import { CustomerProgram, Journey } from '@/types';
import { LeftRail } from '@/components/layout/LeftRail';
import { MainStage } from '@/components/layout/MainStage';
import { JourneyBuilder } from './JourneyBuilder';
import { Button } from '@/components/ui/button';
import { Plus, Play, Pause, MoreHorizontal, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CompassModuleProps {
  customerPrograms: CustomerProgram[];
}

const mockJourneys: Journey[] = [
  {
    id: 'j-1',
    name: 'Chăm sóc khách hàng mới',
    customerProgramId: 'cp-1',
    status: 'active',
    createdAt: new Date('2024-12-01'),
    nodes: [
      { id: 'n-1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Bắt đầu' } },
      { id: 'n-2', type: 'touchpoint', position: { x: 300, y: 200 }, data: { label: 'Email chào mừng', touchpointType: 'email' } },
      { id: 'n-3', type: 'wait', position: { x: 500, y: 200 }, data: { label: 'Chờ 3 ngày', waitDays: 3 } },
      { id: 'n-4', type: 'decision', position: { x: 700, y: 200 }, data: { label: 'Đã dùng dịch vụ?', condition: 'has_transaction' } },
      { id: 'n-5', type: 'touchpoint', position: { x: 900, y: 100 }, data: { label: 'SMS cảm ơn', touchpointType: 'sms' } },
      { id: 'n-6', type: 'touchpoint', position: { x: 900, y: 300 }, data: { label: 'Gọi điện tư vấn', touchpointType: 'call' } },
      { id: 'n-7', type: 'end', position: { x: 1100, y: 200 }, data: { label: 'Kết thúc' } },
    ],
    edges: [
      { id: 'e-1', source: 'n-1', target: 'n-2' },
      { id: 'e-2', source: 'n-2', target: 'n-3' },
      { id: 'e-3', source: 'n-3', target: 'n-4' },
      { id: 'e-4', source: 'n-4', target: 'n-5', label: 'Có' },
      { id: 'e-5', source: 'n-4', target: 'n-6', label: 'Không' },
      { id: 'e-6', source: 'n-5', target: 'n-7' },
      { id: 'e-7', source: 'n-6', target: 'n-7' },
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
];

export function CompassModule({ customerPrograms }: CompassModuleProps) {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(customerPrograms[0]?.id || null);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [journeys] = useState<Journey[]>(mockJourneys);

  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId);
  const programJourneys = selectedProgramId
    ? journeys.filter((j) => j.customerProgramId === selectedProgramId)
    : journeys;

  return (
    <div className="flex h-full">
      <LeftRail
        title="La bàn hành trình"
        customerPrograms={customerPrograms}
        selectedProgramId={selectedProgramId}
        onProgramSelect={(id) => {
          setSelectedProgramId(id);
          setSelectedJourneyId(null);
        }}
      />
      <MainStage>
        {selectedJourney ? (
          <JourneyBuilder
            journey={selectedJourney}
            onBack={() => setSelectedJourneyId(null)}
          />
        ) : (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-3">
                <Compass className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">Hành trình khách hàng</h1>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tạo hành trình
              </Button>
            </div>

            {/* Journey list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {programJourneys.map((journey, index) => {
                  const program = customerPrograms.find((p) => p.id === journey.customerProgramId);
                  return (
                    <motion.div
                      key={journey.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => setSelectedJourneyId(journey.id)}
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
                              <h3 className="font-medium group-hover:text-primary transition-colors">
                                {journey.name}
                              </h3>
                              {program && (
                                <p className="text-xs text-muted-foreground">{program.name}</p>
                              )}
                            </div>
                          </div>
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={cn(
                              journey.status === 'active' && 'bg-success/10 text-success border-success/20',
                              journey.status === 'paused' && 'bg-warning/10 text-warning border-warning/20',
                              journey.status === 'draft' && 'bg-muted text-muted-foreground'
                            )}
                          >
                            {journey.status === 'active' ? 'Đang chạy' :
                             journey.status === 'paused' ? 'Tạm dừng' : 'Nháp'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {journey.nodes.length} bước
                          </span>
                        </div>

                        {/* Mini preview */}
                        <div className="mt-4 flex items-center gap-2">
                          {journey.nodes.slice(0, 5).map((node, i) => (
                            <div
                              key={node.id}
                              className={cn(
                                'h-2 w-2 rounded-full',
                                node.type === 'start' && 'bg-success',
                                node.type === 'touchpoint' && 'bg-primary',
                                node.type === 'wait' && 'bg-warning',
                                node.type === 'decision' && 'bg-accent',
                                node.type === 'end' && 'bg-muted-foreground'
                              )}
                            />
                          ))}
                          {journey.nodes.length > 5 && (
                            <span className="text-xs text-muted-foreground">+{journey.nodes.length - 5}</span>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}

                {/* Empty state / Add new */}
                <button
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
        )}
      </MainStage>
    </div>
  );
}
