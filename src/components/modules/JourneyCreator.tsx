import { useState } from 'react';
import { CustomerProgram, CustomerGroup, JourneyNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ArrowRight,
  Compass, 
  Users, 
  FolderOpen,
  Check,
  Mail,
  MessageSquare,
  Bell,
  Phone,
  Clock,
  GitBranch,
  CircleDot,
  Square,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NodeConfigPanel } from './NodeConfigPanel';

interface JourneyCreatorProps {
  customerPrograms: CustomerProgram[];
  customerGroups: CustomerGroup[];
  selectedProgramId: string | null;
  selectedGroupId: string | null;
  onBack: () => void;
  onCreate: (data: { name: string; targetType: 'program' | 'group'; targetId: string; nodes: JourneyNode[] }) => void;
}

const nodeTypeConfig = {
  start: { icon: CircleDot, label: 'Bắt đầu', color: 'bg-success text-success-foreground' },
  touchpoint: { icon: Mail, label: 'Điểm chạm', color: 'bg-primary text-primary-foreground' },
  wait: { icon: Clock, label: 'Chờ', color: 'bg-warning text-warning-foreground' },
  decision: { icon: GitBranch, label: 'Điều kiện', color: 'bg-accent text-accent-foreground' },
  end: { icon: Square, label: 'Kết thúc', color: 'bg-muted-foreground text-background' },
};

const touchpointIcons: Record<string, typeof Mail> = {
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

type TouchpointType = 'email' | 'sms' | 'notification' | 'call' | 'chat';

const templates: Array<{
  id: string;
  name: string;
  description: string;
  steps: number;
  nodes: JourneyNode[];
}> = [
  {
    id: 'welcome',
    name: 'Chào mừng khách hàng mới',
    description: 'Chuỗi email và SMS chào mừng khách hàng mới đăng ký',
    steps: 5,
    nodes: [
      { id: 'n-1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Bắt đầu' } },
      { id: 'n-2', type: 'touchpoint', position: { x: 0, y: 0 }, data: { label: 'Email chào mừng', touchpointType: 'email' as TouchpointType } },
      { id: 'n-3', type: 'wait', position: { x: 0, y: 0 }, data: { label: 'Chờ 2 ngày', waitDays: 2 } },
      { id: 'n-4', type: 'touchpoint', position: { x: 0, y: 0 }, data: { label: 'SMS ưu đãi', touchpointType: 'sms' as TouchpointType } },
      { id: 'n-5', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Kết thúc' } },
    ],
  },
  {
    id: 'winback',
    name: 'Win-back khách hàng',
    description: 'Chiến dịch giành lại khách hàng không hoạt động',
    steps: 7,
    nodes: [
      { id: 'n-1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Bắt đầu' } },
      { id: 'n-2', type: 'touchpoint', position: { x: 0, y: 0 }, data: { label: 'Email nhắc nhở', touchpointType: 'email' as TouchpointType } },
      { id: 'n-3', type: 'wait', position: { x: 0, y: 0 }, data: { label: 'Chờ 3 ngày', waitDays: 3 } },
      { id: 'n-4', type: 'decision', position: { x: 0, y: 0 }, data: { label: 'Đã phản hồi?', condition: 'has_response' } },
      { id: 'n-5', type: 'touchpoint', position: { x: 0, y: 0 }, data: { label: 'Gọi điện', touchpointType: 'call' as TouchpointType } },
      { id: 'n-6', type: 'touchpoint', position: { x: 0, y: 0 }, data: { label: 'SMS ưu đãi đặc biệt', touchpointType: 'sms' as TouchpointType } },
      { id: 'n-7', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Kết thúc' } },
    ],
  },
  {
    id: 'upsell',
    name: 'Upsell sản phẩm',
    description: 'Đề xuất sản phẩm/dịch vụ nâng cao cho khách hàng hiện hữu',
    steps: 4,
    nodes: [
      { id: 'n-1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Bắt đầu' } },
      { id: 'n-2', type: 'touchpoint', position: { x: 0, y: 0 }, data: { label: 'Email đề xuất', touchpointType: 'email' as TouchpointType } },
      { id: 'n-3', type: 'wait', position: { x: 0, y: 0 }, data: { label: 'Chờ 1 ngày', waitDays: 1 } },
      { id: 'n-4', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Kết thúc' } },
    ],
  },
  {
    id: 'survey',
    name: 'Khảo sát NPS',
    description: 'Thu thập ý kiến và đánh giá từ khách hàng',
    steps: 3,
    nodes: [
      { id: 'n-1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Bắt đầu' } },
      { id: 'n-2', type: 'touchpoint', position: { x: 0, y: 0 }, data: { label: 'Email khảo sát', touchpointType: 'email' as TouchpointType } },
      { id: 'n-3', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Kết thúc' } },
    ],
  },
];

export function JourneyCreator({
  customerPrograms,
  customerGroups,
  selectedProgramId,
  selectedGroupId,
  onBack,
  onCreate,
}: JourneyCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<'program' | 'group'>(
    selectedGroupId ? 'group' : 'program'
  );
  const [targetId, setTargetId] = useState(selectedGroupId || selectedProgramId || '');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Journey builder state
  const [journeyNodes, setJourneyNodes] = useState<JourneyNode[]>([
    { id: 'n-start', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Bắt đầu' } },
    { id: 'n-end', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Kết thúc' } },
  ]);
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null);

  const handleCreate = () => {
    if (!name.trim() || !targetId) return;
    onCreate({ name, targetType, targetId, nodes: journeyNodes });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setJourneyNodes(template.nodes);
    }
  };

  const handleAddNode = (type: string, subtype?: string) => {
    const newNodeId = `n-${Date.now()}`;
    const endNodeIndex = journeyNodes.findIndex(n => n.type === 'end');
    
    const newNode: JourneyNode = {
      id: newNodeId,
      type: type as JourneyNode['type'],
      position: { x: 0, y: 0 },
      data: {
        label: type === 'touchpoint' 
          ? `${subtype === 'email' ? 'Email' : subtype === 'sms' ? 'SMS' : subtype === 'call' ? 'Gọi điện' : subtype === 'notification' ? 'Notification' : 'Điểm chạm'} mới`
          : type === 'wait' ? 'Chờ 1 ngày' : 'Điều kiện mới',
        ...(type === 'touchpoint' && { touchpointType: subtype as TouchpointType }),
        ...(type === 'wait' && { waitDays: 1 }),
      },
    };

    const newNodes = [...journeyNodes];
    newNodes.splice(endNodeIndex, 0, newNode);
    setJourneyNodes(newNodes);
  };

  const handleNodeSave = (updatedNode: JourneyNode) => {
    setJourneyNodes(prev => 
      prev.map(n => n.id === updatedNode.id ? updatedNode : n)
    );
    setSelectedNode(null);
  };

  const handleNodeDelete = (nodeId: string) => {
    setJourneyNodes(prev => prev.filter(n => n.id !== nodeId));
    setSelectedNode(null);
  };

  const canProceedStep1 = name.trim() && targetId && targetId !== 'no-groups';
  const canProceedStep2 = true;
  const canCreate = canProceedStep1 && journeyNodes.length >= 2;

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

      {/* Progress Steps */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => {
                  if (step.number < currentStep) setCurrentStep(step.number);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  currentStep === step.number
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step.number
                    ? 'bg-success/10 text-success cursor-pointer hover:bg-success/20'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.number ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-xs">
                    {step.number}
                  </span>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-8 h-0.5 mx-2',
                  currentStep > step.number ? 'bg-success' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info & Target */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto scrollbar-thin p-6"
            >
              <div className="mx-auto max-w-2xl space-y-6">
                {/* Basic Info */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Thông tin cơ bản</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tên hành trình *</Label>
                      <Input
                        placeholder="VD: Chăm sóc khách hàng mới Q1 2025"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mô tả (tùy chọn)</Label>
                      <Textarea
                        placeholder="Mô tả mục tiêu và nội dung của hành trình..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Target Selection */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Đối tượng áp dụng</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      onClick={() => {
                        setTargetType('program');
                        setTargetId(customerPrograms[0]?.id || '');
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-2 p-4 transition-all',
                        targetType === 'program'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        targetType === 'program' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Phân khúc hệ thống</p>
                        <p className="text-xs text-muted-foreground">Need, Risk, Experience</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setTargetType('group');
                        setTargetId(customerGroups[0]?.id || '');
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-2 p-4 transition-all',
                        targetType === 'group'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        targetType === 'group' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đối tượng..." />
                      </SelectTrigger>
                      <SelectContent>
                        {targetType === 'program' ? (
                          customerPrograms.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.name} ({program.customerCount} khách hàng)
                            </SelectItem>
                          ))
                        ) : (
                          customerGroups.length > 0 ? (
                            customerGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name} ({group.customerCount} khách hàng)
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-groups" disabled>
                              Chưa có nhóm nào
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Tiếp theo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto scrollbar-thin p-6"
            >
              <div className="mx-auto max-w-3xl space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-2">Chọn template</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bắt đầu từ template có sẵn hoặc tạo hành trình trống
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Empty template option */}
                    <button
                      onClick={() => {
                        setSelectedTemplate(null);
                        setJourneyNodes([
                          { id: 'n-start', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Bắt đầu' } },
                          { id: 'n-end', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Kết thúc' } },
                        ]);
                      }}
                      className={cn(
                        'group rounded-lg border-2 p-4 text-left transition-all',
                        selectedTemplate === null
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          Tạo mới từ đầu
                        </h3>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Bắt đầu với hành trình trống và tự thiết kế
                      </p>
                    </button>

                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={cn(
                          'group rounded-lg border-2 p-4 text-left transition-all',
                          selectedTemplate === template.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium group-hover:text-primary transition-colors">
                            {template.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {template.steps} bước
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Tiếp theo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Journey Builder */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex h-full"
            >
              {/* Toolbox */}
              <div className="w-56 border-r border-border bg-left-rail p-4 flex-shrink-0 overflow-y-auto">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Thêm bước mới</h3>
                <div className="grid grid-cols-2 gap-2">
                  {toolboxItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleAddNode(item.type, item.subtype)}
                        className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-2 transition-all hover:border-primary/50 hover:shadow-sm"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Thống kê</h3>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-card p-2.5 border border-border">
                      <p className="text-xl font-bold text-primary">{journeyNodes.length}</p>
                      <p className="text-xs text-muted-foreground">Tổng số bước</p>
                    </div>
                  </div>
                </div>

                {/* Back & Create Buttons */}
                <div className="mt-6 space-y-2">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={!canCreate}
                    className="w-full"
                  >
                    <Compass className="mr-2 h-4 w-4" />
                    Tạo hành trình
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-auto bg-muted/30">
                <div className="flex flex-col items-center py-6 px-4 min-h-full">
                  {journeyNodes.map((node, index) => {
                    const config = nodeTypeConfig[node.type];
                    const Icon = node.type === 'touchpoint' && node.data.touchpointType
                      ? touchpointIcons[node.data.touchpointType] || Mail
                      : config.icon;
                    
                    const isSelected = selectedNode?.id === node.id;

                    return (
                      <div key={node.id} className="flex flex-col items-center">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="group relative">
                            <button
                              onClick={() => setSelectedNode(node)}
                              className={cn(
                                'flex h-14 w-52 items-center gap-3 rounded-lg border-2 bg-card px-3 shadow-sm transition-all hover:shadow-md cursor-pointer text-left',
                                node.type === 'start' && 'border-success',
                                node.type === 'end' && 'border-muted-foreground',
                                node.type === 'touchpoint' && 'border-primary',
                                node.type === 'wait' && 'border-warning',
                                node.type === 'decision' && 'border-accent',
                                isSelected && 'ring-2 ring-primary ring-offset-2'
                              )}
                            >
                              <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', config.color)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{node.data.label}</p>
                                {node.data.waitDays && (
                                  <p className="text-xs text-muted-foreground">{node.data.waitDays} ngày</p>
                                )}
                              </div>
                            </button>

                            {/* Delete button */}
                            {node.type !== 'start' && node.type !== 'end' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNodeDelete(node.id);
                                }}
                                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-danger-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </motion.div>

                        {/* Connector line */}
                        {index < journeyNodes.length - 1 && (
                          <div className="flex flex-col items-center py-1">
                            <div className="w-0.5 h-6 bg-border" />
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-border" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add node button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleAddNode('touchpoint', 'email')}
                    className="mt-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-card/50 px-4 py-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Thêm bước</span>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
