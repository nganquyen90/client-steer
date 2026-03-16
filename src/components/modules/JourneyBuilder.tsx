import { useState } from 'react';
import { Journey, JourneyNode } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Play, Pause, Save, Plus, Mail, Phone, 
  MessageSquare, Bell, Clock, ShieldCheck, KeyRound, 
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeConfigPanel } from './NodeConfigPanel';

interface JourneyBuilderProps {
  journey: Journey;
  onBack: () => void;
}

const nodeTypeConfig: Record<string, { icon: any; label: string; color: string; borderColor: string }> = {
  interact: { icon: Mail, label: 'Tương tác', color: 'bg-primary text-primary-foreground', borderColor: 'border-primary' },
  authen: { icon: ShieldCheck, label: 'Xác thực', color: 'bg-cyan-600 text-white', borderColor: 'border-cyan-600' },
  author: { icon: KeyRound, label: 'Phân quyền', color: 'bg-amber-600 text-white', borderColor: 'border-amber-600' },
};

const toolboxItems = [
  { type: 'interact' as const, icon: Mail, label: 'Tương tác' },
  { type: 'authen' as const, icon: ShieldCheck, label: 'Xác thực (KYC)' },
  { type: 'author' as const, icon: KeyRound, label: 'Phân quyền' },
];

export function JourneyBuilder({ journey, onBack }: JourneyBuilderProps) {
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null);
  const [journeyNodes, setJourneyNodes] = useState<JourneyNode[]>(journey.nodes);

  const handleNodeClick = (node: JourneyNode) => setSelectedNode(node);

  const handleNodeSave = (updatedNode: JourneyNode) => {
    setJourneyNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
    setSelectedNode(null);
  };

  const handleNodeDelete = (nodeId: string) => {
    setJourneyNodes(prev => prev.filter(n => n.id !== nodeId));
    setSelectedNode(null);
  };

  const handleAddNode = (type: JourneyNode['type']) => {
    const newNode: JourneyNode = {
      id: `n-${Date.now()}`,
      type,
      position: { x: 0, y: 0 },
      info: { label: nodeTypeConfig[type].label + ' mới' },
      rule: {},
      execution: {},
    };
    setJourneyNodes(prev => [...prev, newNode]);
  };

  // Determine display icon based on execution tasks
  const getNodeIcon = (node: JourneyNode) => {
    const config = nodeTypeConfig[node.type];
    if (node.type === 'interact' && node.execution.tasks?.length) {
      const firstType = node.execution.tasks[0].type;
      const icons: Record<string, any> = { email: Mail, sms: MessageSquare, notification: Bell, call: Phone };
      return icons[firstType] || config.icon;
    }
    return config.icon;
  };

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
            <Badge variant="outline" className={cn(
              'text-xs mt-0.5',
              journey.status === 'active' && 'bg-success/10 text-success border-success/20',
              journey.status === 'paused' && 'bg-warning/10 text-warning border-warning/20',
              journey.status === 'draft' && 'bg-muted text-muted-foreground'
            )}>
              {journey.status === 'active' ? 'Đang chạy' : journey.status === 'paused' ? 'Tạm dừng' : 'Nháp'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {journey.status === 'active' ? (
            <Button variant="outline" size="sm"><Pause className="mr-2 h-4 w-4" />Tạm dừng</Button>
          ) : (
            <Button variant="outline" size="sm"><Play className="mr-2 h-4 w-4" />Kích hoạt</Button>
          )}
          <Button size="sm"><Save className="mr-2 h-4 w-4" />Lưu</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbox */}
        <div className="w-56 border-r border-border bg-left-rail p-4 flex-shrink-0 overflow-y-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Thêm Node</h3>
          <div className="space-y-2">
            {toolboxItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => handleAddNode(item.type)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', nodeTypeConfig[item.type].color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium">{item.label}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {item.type === 'interact' && 'Email, SMS, Noti, Zalo'}
                      {item.type === 'authen' && 'KYC, Face, OCR'}
                      {item.type === 'author' && 'CIC, Hạn mức, eSign'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Thống kê</h3>
            <div className="space-y-2">
              <div className="rounded-lg bg-card p-2.5 border border-border">
                <p className="text-xl font-bold text-primary">{journeyNodes.length}</p>
                <p className="text-xs text-muted-foreground">Tổng số Node</p>
              </div>
              <div className="rounded-lg bg-card p-2.5 border border-border">
                <p className="text-xl font-bold text-success">156</p>
                <p className="text-xs text-muted-foreground">Khách hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30">
          <div className="flex flex-col items-center py-6 px-4 min-h-full">
            {journeyNodes.map((node, index) => {
              const config = nodeTypeConfig[node.type];
              const Icon = getNodeIcon(node);
              const isSelected = selectedNode?.id === node.id;
              const edge = journey.edges.find(e => e.source === node.id);

              return (
                <div key={node.id} className="flex flex-col items-center">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <div className="group relative">
                      <button
                        onClick={() => handleNodeClick(node)}
                        className={cn(
                          'flex h-16 w-56 items-center gap-3 rounded-lg border-2 bg-card px-3 shadow-sm transition-all hover:shadow-md cursor-pointer text-left',
                          config.borderColor,
                          isSelected && 'ring-2 ring-primary ring-offset-2'
                        )}
                      >
                        <div className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg', config.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{node.info.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {node.type === 'interact' && `${node.execution.tasks?.length || 0} task`}
                            {node.type === 'authen' && (node.execution.kycConfig?.method || 'KYC')}
                            {node.type === 'author' && (node.execution.authorizationConfig?.checkType || 'Author')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 flex-shrink-0">
                          {config.label}
                        </Badge>
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); handleNodeDelete(node.id); }}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-danger-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>

                  {index < journeyNodes.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      <div className="w-0.5 h-6 bg-border" />
                      {edge?.label && (
                        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border my-1">{edge.label}</span>
                      )}
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-border" />
                    </div>
                  )}
                </div>
              );
            })}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: journeyNodes.length * 0.05 }}
              className="mt-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-card/50 px-4 py-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
              onClick={() => handleAddNode('interact')}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Thêm Node</span>
            </motion.button>
          </div>
        </div>

        {/* Node Config Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <NodeConfigPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onSave={handleNodeSave}
                onDelete={() => handleNodeDelete(selectedNode.id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
