import { useState } from 'react';
import { CustomerProgram, CustomerGroup, JourneyNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, ArrowRight, Compass, Users, FolderOpen, Check,
  Mail, MessageSquare, Bell, Phone, Plus, Trash2, 
  ShieldCheck, KeyRound
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NodeConfigPanel } from './NodeConfigPanel';
import { Badge } from '@/components/ui/badge';

interface JourneyCreatorProps {
  customerPrograms: CustomerProgram[];
  customerGroups: CustomerGroup[];
  selectedProgramId: string | null;
  selectedGroupId: string | null;
  onBack: () => void;
  onCreate: (data: { name: string; targetType: 'program' | 'group'; targetId: string; nodes: JourneyNode[] }) => void;
}

const nodeTypeConfig: Record<string, { icon: any; label: string; color: string; borderColor: string }> = {
  interact: { icon: Mail, label: 'Tương tác', color: 'bg-primary text-primary-foreground', borderColor: 'border-primary' },
  authen: { icon: ShieldCheck, label: 'Xác thực', color: 'bg-cyan-600 text-white', borderColor: 'border-cyan-600' },
  author: { icon: KeyRound, label: 'Phân quyền', color: 'bg-amber-600 text-white', borderColor: 'border-amber-600' },
};

const toolboxItems: Array<{ type: JourneyNode['type']; icon: any; label: string; desc: string }> = [
  { type: 'interact', icon: Mail, label: 'Tương tác', desc: 'Email, SMS, Noti, Zalo' },
  { type: 'authen', icon: ShieldCheck, label: 'Xác thực (KYC)', desc: 'CCCD, Face, OCR' },
  { type: 'author', icon: KeyRound, label: 'Phân quyền', desc: 'CIC, Hạn mức, eSign' },
];

// Helper
const makeNode = (type: JourneyNode['type'], label: string, opts?: Partial<Pick<JourneyNode, 'execution' | 'rule' | 'info'>>): JourneyNode => ({
  id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  type, position: { x: 0, y: 0 },
  info: { label, ...opts?.info },
  rule: { ...opts?.rule },
  execution: { ...opts?.execution },
});

const templates: Array<{ id: string; name: string; description: string; steps: number; nodes: JourneyNode[] }> = [
  {
    id: 'welcome', name: 'Chào mừng khách hàng mới',
    description: 'Chuỗi email và SMS chào mừng khách hàng mới đăng ký', steps: 3,
    nodes: [
      makeNode('interact', 'Email chào mừng', { execution: { tasks: [{ id: 't1', type: 'email', label: 'Email chào mừng' }] } }),
      makeNode('interact', 'Chờ 2 ngày + SMS ưu đãi', { rule: { timing: { type: 'delay', delayValue: 2, delayUnit: 'days' } }, execution: { tasks: [{ id: 't2', type: 'sms', label: 'SMS ưu đãi' }] } }),
      makeNode('interact', 'Notification nhắc', { execution: { tasks: [{ id: 't3', type: 'notification', label: 'Notification nhắc nhở' }] } }),
    ],
  },
  {
    id: 'winback', name: 'Win-back khách hàng',
    description: 'Chiến dịch giành lại khách hàng không hoạt động', steps: 3,
    nodes: [
      makeNode('interact', 'Email nhắc nhở', { execution: { tasks: [{ id: 't1', type: 'email', label: 'Email nhắc nhở' }] } }),
      makeNode('interact', 'Chờ 3 ngày + Gọi điện', { rule: { timing: { type: 'delay', delayValue: 3, delayUnit: 'days' } }, execution: { tasks: [{ id: 't2', type: 'call', label: 'Gọi điện tư vấn' }] } }),
      makeNode('interact', 'SMS ưu đãi đặc biệt', { execution: { tasks: [{ id: 't3', type: 'sms', label: 'SMS ưu đãi' }] } }),
    ],
  },
  {
    id: 'margin', name: 'Cấp phát hạn mức Margin',
    description: 'Hành trình đầy đủ từ KYC → Phân quyền → Ký HĐ cho KH mới', steps: 4,
    nodes: [
      makeNode('interact', 'KH đăng ký + Email chào mừng', { info: { label: 'KH đăng ký + Email chào mừng', description: 'Khách hàng đăng ký cơ bản' }, execution: { tasks: [{ id: 't1', type: 'email', label: 'Email chào mừng + link App' }] } }),
      makeNode('authen', 'Xác thực KYC (CCCD + Face)', { info: { label: 'Xác thực KYC (CCCD + Face)', description: 'Chụp CCCD, quét khuôn mặt, OCR, đối chiếu CSDL' }, execution: { kycConfig: { method: 'cccd', steps: ['id_front', 'id_back', 'face_matching', 'ocr_verify', 'db_check'], maxRetries: 3, manualReviewOnFail: true, failAction: 'create_task' } } }),
      makeNode('author', 'Phân quyền & Ký HĐ Margin', { info: { label: 'Phân quyền & Ký HĐ Margin', description: 'Kiểm tra CIC, cấp hạn mức, ký HĐ điện tử' }, execution: { authorizationConfig: { checkType: 'credit_score', rules: [], defaultTier: 'standard' }, esignConfig: { method: 'otp', documentType: 'contract', requireWitness: false, expiryHours: 24 } } }),
      makeNode('interact', 'Thông báo & Hướng dẫn', { rule: { timing: { type: 'delay', delayValue: 2, delayUnit: 'hours' } }, execution: { tasks: [{ id: 't4', type: 'notification', label: 'Chúc mừng cấp hạn mức' }, { id: 't5', type: 'email', label: 'Hướng dẫn sử dụng App' }] } }),
    ],
  },
];

export function JourneyCreator({ customerPrograms, customerGroups, selectedProgramId, selectedGroupId, onBack, onCreate }: JourneyCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<'program' | 'group'>(selectedGroupId ? 'group' : 'program');
  const [targetId, setTargetId] = useState(selectedGroupId || selectedProgramId || '');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [journeyNodes, setJourneyNodes] = useState<JourneyNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null);

  const handleCreate = () => {
    if (!name.trim() || !targetId) return;
    onCreate({ name, targetType, targetId, nodes: journeyNodes });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) setJourneyNodes(template.nodes);
  };

  const handleAddNode = (type: JourneyNode['type']) => {
    const newNode = makeNode(type, nodeTypeConfig[type].label + ' mới');
    setJourneyNodes(prev => [...prev, newNode]);
  };

  const handleNodeSave = (updatedNode: JourneyNode) => {
    setJourneyNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
    setSelectedNode(null);
  };

  const handleNodeDelete = (nodeId: string) => {
    setJourneyNodes(prev => prev.filter(n => n.id !== nodeId));
    setSelectedNode(null);
  };

  const getNodeIcon = (node: JourneyNode) => {
    if (node.type === 'interact' && node.execution.tasks?.length) {
      const icons: Record<string, any> = { email: Mail, sms: MessageSquare, notification: Bell, call: Phone };
      return icons[node.execution.tasks[0].type] || Mail;
    }
    return nodeTypeConfig[node.type].icon;
  };

  const canProceedStep1 = name.trim() && targetId && targetId !== 'no-groups';
  const canCreate = canProceedStep1 && journeyNodes.length >= 1;

  const steps = [
    { number: 1, title: 'Thông tin cơ bản' },
    { number: 2, title: 'Chọn template' },
    { number: 3, title: 'Thiết kế chuỗi tương tác' },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center gap-4 border-b border-border px-6 bg-card">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Compass className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Tạo hành trình mới</h1>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => { if (step.number < currentStep) setCurrentStep(step.number); }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  currentStep === step.number ? 'bg-primary text-primary-foreground'
                    : currentStep > step.number ? 'bg-success/10 text-success cursor-pointer hover:bg-success/20'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.number ? <Check className="h-4 w-4" /> : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-xs">{step.number}</span>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {index < steps.length - 1 && <div className={cn('w-8 h-0.5 mx-2', currentStep > step.number ? 'bg-success' : 'bg-border')} />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 1 */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-y-auto scrollbar-thin p-6">
              <div className="mx-auto max-w-2xl space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tên hành trình *</Label>
                      <Input placeholder="VD: Chăm sóc khách hàng mới Q1 2025" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả (tùy chọn)</Label>
                      <Textarea placeholder="Mô tả mục tiêu..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Đối tượng áp dụng</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button onClick={() => { setTargetType('program'); setTargetId(customerPrograms[0]?.id || ''); }}
                      className={cn('flex items-center gap-3 rounded-lg border-2 p-4 transition-all', targetType === 'program' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', targetType === 'program' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Phân khúc hệ thống</p>
                        <p className="text-xs text-muted-foreground">Need, Risk, Experience</p>
                      </div>
                    </button>
                    <button onClick={() => { setTargetType('group'); setTargetId(customerGroups[0]?.id || ''); }}
                      className={cn('flex items-center gap-3 rounded-lg border-2 p-4 transition-all', targetType === 'group' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', targetType === 'group' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Nhóm tự tạo</p>
                        <p className="text-xs text-muted-foreground">Leads đã import</p>
                      </div>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label>{targetType === 'program' ? 'Chọn phân khúc' : 'Chọn nhóm'} *</Label>
                    <Select value={targetId} onValueChange={setTargetId}>
                      <SelectTrigger><SelectValue placeholder="Chọn đối tượng..." /></SelectTrigger>
                      <SelectContent>
                        {targetType === 'program' ? customerPrograms.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name} ({p.customerCount} KH)</SelectItem>
                        )) : customerGroups.length > 0 ? customerGroups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>{g.name} ({g.customerCount} KH)</SelectItem>
                        )) : <SelectItem value="no-groups" disabled>Chưa có nhóm</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(2)} disabled={!canProceedStep1}>
                    Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full overflow-y-auto scrollbar-thin p-6">
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-2">Chọn template</h2>
                  <p className="text-sm text-muted-foreground mb-4">Bắt đầu từ template có sẵn hoặc tạo hành trình trống</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setSelectedTemplate(null); setJourneyNodes([]); }}
                      className={cn('group rounded-lg border-2 p-4 text-left transition-all', selectedTemplate === null ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium group-hover:text-primary transition-colors">Tạo mới từ đầu</h3>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Bắt đầu với hành trình trống và tự thiết kế</p>
                    </button>
                    {templates.map((t) => (
                      <button key={t.id} onClick={() => handleTemplateSelect(t.id)}
                        className={cn('group rounded-lg border-2 p-4 text-left transition-all', selectedTemplate === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium group-hover:text-primary transition-colors">{t.name}</h3>
                          <span className="text-xs text-muted-foreground">{t.steps} node</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />Quay lại
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex h-full">
              {/* Toolbox */}
              <div className="w-56 border-r border-border bg-left-rail p-4 flex-shrink-0 overflow-y-auto">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Thêm Node mới</h3>
                <div className="space-y-2">
                  {toolboxItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.type} onClick={() => handleAddNode(item.type)}
                        className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm">
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', nodeTypeConfig[item.type].color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-medium">{item.label}</span>
                          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Thống kê</h3>
                  <div className="rounded-lg bg-card p-2.5 border border-border">
                    <p className="text-xl font-bold text-primary">{journeyNodes.length}</p>
                    <p className="text-xs text-muted-foreground">Tổng số Node</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />Quay lại
                  </Button>
                  <Button onClick={handleCreate} disabled={!canCreate} className="w-full">
                    <Compass className="mr-2 h-4 w-4" />Tạo hành trình
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-auto bg-muted/30">
                <div className="flex flex-col items-center py-6 px-4 min-h-full">
                  {journeyNodes.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                      <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Chưa có Node nào</p>
                      <p className="text-xs">Chọn Node từ thanh công cụ bên trái để bắt đầu</p>
                    </div>
                  )}

                  {journeyNodes.map((node, index) => {
                    const config = nodeTypeConfig[node.type];
                    const Icon = getNodeIcon(node);
                    const isSelected = selectedNode?.id === node.id;

                    return (
                      <div key={node.id} className="flex flex-col items-center">
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                          <div className="group relative">
                            <button onClick={() => setSelectedNode(node)}
                              className={cn(
                                'flex h-16 w-56 items-center gap-3 rounded-lg border-2 bg-card px-3 shadow-sm transition-all hover:shadow-md cursor-pointer text-left',
                                config.borderColor,
                                isSelected && 'ring-2 ring-primary ring-offset-2'
                              )}>
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
                              <Badge variant="outline" className="text-[9px] h-4 px-1.5 flex-shrink-0">{config.label}</Badge>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleNodeDelete(node.id); }}
                              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-danger-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </motion.div>

                        {index < journeyNodes.length - 1 && (
                          <div className="flex flex-col items-center py-1">
                            <div className="w-0.5 h-6 bg-border" />
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-border" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {journeyNodes.length > 0 && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onClick={() => handleAddNode('interact')}
                      className="mt-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-card/50 px-4 py-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Thêm Node</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Node Config Panel */}
              <AnimatePresence>
                {selectedNode && (
                  <motion.div initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
                    <NodeConfigPanel node={selectedNode} onClose={() => setSelectedNode(null)} onSave={handleNodeSave} onDelete={() => handleNodeDelete(selectedNode.id)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
