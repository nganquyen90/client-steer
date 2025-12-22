import { useState } from 'react';
import { CustomerProgram, CustomerGroup } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Compass, Users, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JourneyCreatorProps {
  customerPrograms: CustomerProgram[];
  customerGroups: CustomerGroup[];
  selectedProgramId: string | null;
  selectedGroupId: string | null;
  onBack: () => void;
  onCreate: (data: { name: string; targetType: 'program' | 'group'; targetId: string }) => void;
}

export function JourneyCreator({
  customerPrograms,
  customerGroups,
  selectedProgramId,
  selectedGroupId,
  onBack,
  onCreate,
}: JourneyCreatorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<'program' | 'group'>(
    selectedGroupId ? 'group' : 'program'
  );
  const [targetId, setTargetId] = useState(selectedGroupId || selectedProgramId || '');

  const handleCreate = () => {
    if (!name.trim() || !targetId) return;
    onCreate({ name, targetType, targetId });
  };

  const templates = [
    {
      id: 'welcome',
      name: 'Chào mừng khách hàng mới',
      description: 'Chuỗi email và SMS chào mừng khách hàng mới đăng ký',
      steps: 5,
    },
    {
      id: 'winback',
      name: 'Win-back khách hàng',
      description: 'Chiến dịch giành lại khách hàng không hoạt động',
      steps: 7,
    },
    {
      id: 'upsell',
      name: 'Upsell sản phẩm',
      description: 'Đề xuất sản phẩm/dịch vụ nâng cao cho khách hàng hiện hữu',
      steps: 4,
    },
    {
      id: 'survey',
      name: 'Khảo sát NPS',
      description: 'Thu thập ý kiến và đánh giá từ khách hàng',
      steps: 3,
    },
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6"
          >
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
          </motion.div>

          {/* Target Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Đối tượng áp dụng</h2>
            
            {/* Target Type Selection */}
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

            {/* Target Dropdown */}
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
          </motion.div>

          {/* Templates */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-2">Bắt đầu từ template</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Hoặc bạn có thể tạo hành trình trống và tự thiết kế
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template, index) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="group rounded-lg border border-border p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
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
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button variant="outline" onClick={onBack}>
              Hủy
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!name.trim() || !targetId || targetId === 'no-groups'}
            >
              <Compass className="mr-2 h-4 w-4" />
              Tạo hành trình
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
