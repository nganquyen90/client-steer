import { useState } from 'react';
import { JourneyNode, NodeInfo, NodeRule, NodeExecution, KycConfig, AuthorizationConfig, EsignConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  X, Mail, MessageSquare, Bell, Phone, Clock, 
  Save, Trash2, Sparkles, Users, Calendar, FileText, 
  Settings2, Zap, ShieldCheck, KeyRound, PenTool,
  ScanFace, CreditCard, Fingerprint, AlertTriangle, 
  CheckCircle2, Plus, Info, BookOpen, Play,
  Globe, Link, ArrowRightLeft, Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeConfigPanelProps {
  node: JourneyNode;
  onClose: () => void;
  onSave: (updatedNode: JourneyNode) => void;
  onDelete?: () => void;
}

const nodeTypeConfig: Record<string, { icon: any; label: string; color: string; description: string }> = {
  interact: { icon: Mail, label: 'Tương tác', color: 'text-primary', description: 'Gửi thông điệp đa kênh (Omnichannel)' },
  authen: { icon: ShieldCheck, label: 'Xác thực (KYC)', color: 'text-cyan-500', description: 'Xác thực danh tính khách hàng' },
  author: { icon: KeyRound, label: 'Phân quyền', color: 'text-amber-500', description: 'Kiểm tra & cấp quyền hạn mức' },
};

export function NodeConfigPanel({ node, onClose, onSave, onDelete }: NodeConfigPanelProps) {
  const [editedNode, setEditedNode] = useState<JourneyNode>({ ...node });
  const config = nodeTypeConfig[node.type];
  const Icon = config.icon;

  const updateInfo = (updates: Partial<NodeInfo>) => {
    setEditedNode(prev => ({ ...prev, info: { ...prev.info, ...updates } }));
  };

  const updateRule = (updates: Partial<NodeRule>) => {
    setEditedNode(prev => ({ ...prev, rule: { ...prev.rule, ...updates } }));
  };

  const updateExecution = (updates: Partial<NodeExecution>) => {
    setEditedNode(prev => ({ ...prev, execution: { ...prev.execution, ...updates } }));
  };

  const handleSave = () => {
    onSave(editedNode);
    onClose();
  };

  // ===== A. INFO TAB =====
  const renderInfoTab = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tên Node</Label>
        <Input 
          value={editedNode.info.label} 
          onChange={(e) => updateInfo({ label: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Mô tả mục đích</Label>
        <Textarea 
          value={editedNode.info.description || ''} 
          onChange={(e) => updateInfo({ description: e.target.value })}
          placeholder="Mô tả mục đích của bước này..."
          rows={3}
        />
      </div>

      {/* Node Type Badge */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", config.color)} />
          <span className="text-sm font-medium">{config.label}</span>
        </div>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>

      {/* Routing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          <Label>Điều hướng (Routing)</Label>
        </div>
        
        <div className="rounded-lg border border-success/50 bg-success/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="text-sm font-medium">Nhánh Thành công</span>
          </div>
          <Input 
            placeholder="Node tiếp theo khi thành công" 
            value={editedNode.info.routing?.successNodeId || ''}
            onChange={(e) => updateInfo({ routing: { ...editedNode.info.routing, successNodeId: e.target.value } })}
            className="h-8 text-sm"
          />
        </div>

        <div className="rounded-lg border border-danger/50 bg-danger/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2.5 w-2.5 rounded-full bg-danger" />
            <span className="text-sm font-medium">Nhánh Thất bại</span>
          </div>
          <Input 
            placeholder="Node tiếp theo khi thất bại" 
            value={editedNode.info.routing?.failureNodeId || ''}
            onChange={(e) => updateInfo({ routing: { ...editedNode.info.routing, failureNodeId: e.target.value } })}
            className="h-8 text-sm"
          />
        </div>

        <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Thêm nhánh tùy chỉnh
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">ID Node:</span> {editedNode.id}
        </p>
      </div>
    </div>
  );

  // ===== B. RULE TAB =====
  const renderRuleTab = () => (
    <div className="space-y-5">
      {/* Audience */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <Label className="font-semibold">Đối tượng (Audience)</Label>
        </div>
        <Select 
          value={editedNode.rule.audience?.type || 'all'}
          onValueChange={(value) => updateRule({ audience: { ...editedNode.rule.audience, type: value as any } })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khách hàng trong hành trình</SelectItem>
            <SelectItem value="segment">Theo phân khúc (Segment)</SelectItem>
            <SelectItem value="property">Theo thuộc tính (Property)</SelectItem>
          </SelectContent>
        </Select>

        {editedNode.rule.audience?.type === 'segment' && (
          <Input 
            placeholder="ID hoặc tên phân khúc..."
            value={editedNode.rule.audience?.segmentId || ''}
            onChange={(e) => updateRule({ audience: { ...editedNode.rule.audience!, segmentId: e.target.value } })}
            className="h-8 text-sm"
          />
        )}
        {editedNode.rule.audience?.type === 'property' && (
          <Input 
            placeholder="VD: age >= 18 AND status == 'active'"
            value={editedNode.rule.audience?.propertyFilter || ''}
            onChange={(e) => updateRule({ audience: { ...editedNode.rule.audience!, propertyFilter: e.target.value } })}
            className="h-8 text-sm"
          />
        )}
      </div>

      {/* Timing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-warning" />
          <Label className="font-semibold">Thời gian (Timing)</Label>
        </div>
        <Select 
          value={editedNode.rule.timing?.type || 'immediate'}
          onValueChange={(value) => updateRule({ timing: { ...editedNode.rule.timing, type: value as any } })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Ngay lập tức</SelectItem>
            <SelectItem value="delay">Trễ X giờ/ngày</SelectItem>
            <SelectItem value="scheduled">Theo lịch cố định</SelectItem>
            <SelectItem value="event">Khi có sự kiện</SelectItem>
          </SelectContent>
        </Select>

        {editedNode.rule.timing?.type === 'delay' && (
          <div className="flex gap-2">
            <Input 
              type="number" 
              value={editedNode.rule.timing?.delayValue || 1}
              onChange={(e) => updateRule({ timing: { ...editedNode.rule.timing!, delayValue: parseInt(e.target.value) || 1 } })}
              min={1} className="flex-1 h-8"
            />
            <Select 
              value={editedNode.rule.timing?.delayUnit || 'hours'}
              onValueChange={(value) => updateRule({ timing: { ...editedNode.rule.timing!, delayUnit: value as any } })}
            >
              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Phút</SelectItem>
                <SelectItem value="hours">Giờ</SelectItem>
                <SelectItem value="days">Ngày</SelectItem>
                <SelectItem value="weeks">Tuần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {editedNode.rule.timing?.type === 'scheduled' && (
          <div className="flex gap-2">
            <Input 
              type="date"
              value={editedNode.rule.timing?.scheduledDate || ''}
              onChange={(e) => updateRule({ timing: { ...editedNode.rule.timing!, scheduledDate: e.target.value } })}
              className="flex-1 h-8"
            />
            <Input 
              type="time"
              value={editedNode.rule.timing?.scheduledTime || ''}
              onChange={(e) => updateRule({ timing: { ...editedNode.rule.timing!, scheduledTime: e.target.value } })}
              className="w-28 h-8"
            />
          </div>
        )}
      </div>

      {/* Event Trigger */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          <Label className="font-semibold">Hành vi kích hoạt (Event)</Label>
        </div>
        <Select 
          value={editedNode.rule.eventTrigger?.type || 'none'}
          onValueChange={(value) => updateRule({ eventTrigger: { ...editedNode.rule.eventTrigger, type: value as any } })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Không có (tự động)</SelectItem>
            <SelectItem value="customer_action">Hành động khách hàng</SelectItem>
            <SelectItem value="system_event">Sự kiện hệ thống</SelectItem>
          </SelectContent>
        </Select>

        {editedNode.rule.eventTrigger?.type === 'customer_action' && (
          <Select 
            value={editedNode.rule.eventTrigger?.event || ''}
            onValueChange={(value) => updateRule({ eventTrigger: { ...editedNode.rule.eventTrigger!, event: value } })}
          >
            <SelectTrigger><SelectValue placeholder="Chọn hành động..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="click_link">Click link trong email/SMS</SelectItem>
              <SelectItem value="open_app">Mở App</SelectItem>
              <SelectItem value="deposit">Nạp tiền</SelectItem>
              <SelectItem value="register">Đăng ký dịch vụ mới</SelectItem>
              <SelectItem value="complete_kyc">Hoàn thành KYC</SelectItem>
              <SelectItem value="sign_contract">Ký hợp đồng</SelectItem>
            </SelectContent>
          </Select>
        )}

        {editedNode.rule.eventTrigger?.type === 'system_event' && (
          <Select 
            value={editedNode.rule.eventTrigger?.event || ''}
            onValueChange={(value) => updateRule({ eventTrigger: { ...editedNode.rule.eventTrigger!, event: value } })}
          >
            <SelectTrigger><SelectValue placeholder="Chọn sự kiện..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="status_change">Thay đổi trạng thái</SelectItem>
              <SelectItem value="score_update">Cập nhật điểm tín dụng</SelectItem>
              <SelectItem value="tier_change">Thay đổi hạng mức</SelectItem>
              <SelectItem value="contract_expired">Hợp đồng hết hạn</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );

  // ===== C. EXECUTION TAB =====
  const renderExecutionTab = () => {
    if (node.type === 'interact') return renderInteractExecution();
    if (node.type === 'authen') return renderAuthenExecution();
    if (node.type === 'author') return renderAuthorExecution();
    return null;
  };

  // --- Interact Execution ---
  const renderInteractExecution = () => (
    <div className="space-y-5">
      {/* Task Execution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            <Label className="font-semibold">Task thực thi</Label>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => {
            const tasks = editedNode.execution.tasks || [];
            updateExecution({ tasks: [...tasks, { id: `t-${Date.now()}`, type: 'email', label: 'Gửi Email mới' }] });
          }}>
            <Plus className="h-3 w-3" />
            Thêm
          </Button>
        </div>

        {(editedNode.execution.tasks || []).map((task, idx) => {
          const taskIcons: Record<string, any> = { email: Mail, sms: MessageSquare, notification: Bell, zalo: MessageSquare, call: Phone, create_task: FileText };
          const TaskIcon = taskIcons[task.type] || Mail;
          return (
            <div key={task.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TaskIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Task {idx + 1}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-danger"
                  onClick={() => {
                    const tasks = (editedNode.execution.tasks || []).filter(t => t.id !== task.id);
                    updateExecution({ tasks });
                  }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Select value={task.type} onValueChange={(value) => {
                const tasks = (editedNode.execution.tasks || []).map(t => t.id === task.id ? { ...t, type: value as any } : t);
                updateExecution({ tasks });
              }}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Gửi Email</SelectItem>
                  <SelectItem value="sms">Gửi SMS</SelectItem>
                  <SelectItem value="notification">Push Notification</SelectItem>
                  <SelectItem value="zalo">Gửi Zalo</SelectItem>
                  <SelectItem value="call">Gọi điện</SelectItem>
                  <SelectItem value="create_task">Tạo Task cho Sales</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Mô tả nội dung..."
                value={task.label || ''}
                onChange={(e) => {
                  const tasks = (editedNode.execution.tasks || []).map(t => t.id === task.id ? { ...t, label: e.target.value } : t);
                  updateExecution({ tasks });
                }}
                className="h-8 text-sm"
              />
            </div>
          );
        })}

        {(!editedNode.execution.tasks || editedNode.execution.tasks.length === 0) && (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-muted-foreground">
            <Mail className="h-6 w-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">Chưa có task nào. Nhấn "Thêm" để tạo.</p>
          </div>
        )}
      </div>

      {/* Call Flow */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-violet-500" />
          <Label className="font-semibold">Call Flow (Sub-flow)</Label>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Gọi luồng con</p>
            <p className="text-xs text-muted-foreground">Tái sử dụng quy trình chuẩn</p>
          </div>
          <Switch 
            checked={editedNode.execution.callFlow?.enabled ?? false}
            onCheckedChange={(checked) => updateExecution({ callFlow: { ...editedNode.execution.callFlow, enabled: checked } })}
          />
        </div>
        {editedNode.execution.callFlow?.enabled && (
          <Select value={editedNode.execution.callFlow?.flowId || ''} onValueChange={(value) => updateExecution({ callFlow: { ...editedNode.execution.callFlow!, flowId: value, flowName: value } })}>
            <SelectTrigger className="h-8"><SelectValue placeholder="Chọn luồng con..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="flow-kyc">Luồng KYC chuẩn</SelectItem>
              <SelectItem value="flow-onboarding">Luồng Onboarding</SelectItem>
              <SelectItem value="flow-card-opening">Luồng mở thẻ</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* API/Webhook */}
      {renderApiWebhookSection()}
    </div>
  );

  // --- Authen (KYC) Execution ---
  const renderAuthenExecution = () => {
    const kycConfig = editedNode.execution.kycConfig || {
      method: 'cccd' as const, steps: ['id_front' as const, 'id_back' as const, 'face_matching' as const, 'ocr_verify' as const, 'db_check' as const],
      maxRetries: 3, manualReviewOnFail: true, failAction: 'create_task' as const
    };

    return (
      <div className="space-y-5">
        {/* KYC Steps */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-500" />
            <Label className="font-semibold">Các bước KYC</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Loại giấy tờ</Label>
            <Select value={kycConfig.method} onValueChange={(value) => updateExecution({ kycConfig: { ...kycConfig, method: value as any } })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cccd">CCCD / CMND</SelectItem>
                <SelectItem value="passport">Hộ chiếu</SelectItem>
                <SelectItem value="driver_license">Giấy phép lái xe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {[
            { id: 'id_front' as const, label: 'Chụp mặt trước giấy tờ', icon: CreditCard },
            { id: 'id_back' as const, label: 'Chụp mặt sau giấy tờ', icon: CreditCard },
            { id: 'face_matching' as const, label: 'Quét khuôn mặt (Face Matching)', icon: ScanFace },
            { id: 'ocr_verify' as const, label: 'Kiểm tra OCR tự động', icon: FileText },
            { id: 'db_check' as const, label: 'Đối chiếu CSDL quốc gia', icon: ShieldCheck },
          ].map((step) => {
            const StepIcon = step.icon;
            const isChecked = kycConfig.steps?.includes(step.id) ?? true;
            return (
              <div key={step.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <Checkbox 
                  id={step.id} checked={isChecked}
                  onCheckedChange={(checked) => {
                    const newSteps = checked 
                      ? [...(kycConfig.steps || []), step.id]
                      : (kycConfig.steps || []).filter(s => s !== step.id);
                    updateExecution({ kycConfig: { ...kycConfig, steps: newSteps } });
                  }}
                />
                <StepIcon className="h-4 w-4 text-cyan-500" />
                <label htmlFor={step.id} className="text-sm cursor-pointer flex-1">{step.label}</label>
              </div>
            );
          })}
        </div>

        {/* KYC Rules */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Quy tắc xử lý</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Số lần thử lại tối đa</Label>
              <Input type="number" value={kycConfig.maxRetries} onChange={(e) => updateExecution({ kycConfig: { ...kycConfig, maxRetries: parseInt(e.target.value) || 3 } })} min={1} max={10} className="w-20 h-7 text-xs" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
              <span className="text-sm">Duyệt thủ công khi thất bại</span>
              <Switch checked={kycConfig.manualReviewOnFail} onCheckedChange={(checked) => updateExecution({ kycConfig: { ...kycConfig, manualReviewOnFail: checked } })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Hành động khi thất bại</Label>
            <Select value={kycConfig.failAction || 'create_task'} onValueChange={(value) => updateExecution({ kycConfig: { ...kycConfig, failAction: value as any } })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="notify_sms">Gửi SMS thông báo lỗi</SelectItem>
                <SelectItem value="notify_email">Gửi Email hướng dẫn</SelectItem>
                <SelectItem value="create_task">Tạo Task cho Sales Team</SelectItem>
                <SelectItem value="block">Chặn & yêu cầu liên hệ CSKH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Call Flow & API */}
        {renderCallFlowSection()}
        {renderApiWebhookSection()}
      </div>
    );
  };

  // --- Author (Authorization) Execution ---
  const renderAuthorExecution = () => {
    const authConfig = editedNode.execution.authorizationConfig || {
      checkType: 'credit_score' as const, rules: [], defaultTier: 'standard'
    };
    const esignConfig = editedNode.execution.esignConfig;

    return (
      <div className="space-y-5">
        {/* Check Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-500" />
            <Label className="font-semibold">Kiểm tra & Phân quyền</Label>
          </div>

          <Select value={authConfig.checkType} onValueChange={(value) => updateExecution({ authorizationConfig: { ...authConfig, checkType: value as any } })}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_score">Điểm tín dụng (CIC)</SelectItem>
              <SelectItem value="transaction_history">Lịch sử giao dịch</SelectItem>
              <SelectItem value="asset_check">Kiểm tra tài sản</SelectItem>
              <SelectItem value="manual_review">Duyệt thủ công</SelectItem>
            </SelectContent>
          </Select>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <span className="text-xs font-medium">Nguồn dữ liệu</span>
            {[
              { label: 'Trung tâm thông tin tín dụng (CIC)', checked: true },
              { label: 'Lịch sử giao dịch nội bộ', checked: true },
              { label: 'Dữ liệu tài sản đảm bảo', checked: false },
            ].map((src, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <Checkbox id={`src-${i}`} defaultChecked={src.checked} />
                <label htmlFor={`src-${i}`} className="text-xs cursor-pointer">{src.label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Các hạng mức cấp phát</Label>
          {[
            { tier: 'Standard', limit: '20 triệu', condition: 'CIC >= 600', color: 'border-blue-500/50 bg-blue-500/5' },
            { tier: 'Gold', limit: '50 triệu', condition: 'CIC >= 700', color: 'border-amber-500/50 bg-amber-500/5' },
            { tier: 'VIP', limit: '200 triệu', condition: 'CIC >= 800', color: 'border-violet-500/50 bg-violet-500/5' },
          ].map((rule, i) => (
            <div key={i} className={cn('rounded-lg border p-2.5 space-y-1', rule.color)}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{rule.tier}</span>
                <Badge variant="outline" className="text-[10px] h-5">{rule.limit}</Badge>
              </div>
              <Input defaultValue={rule.condition} className="text-xs h-7" />
            </div>
          ))}
        </div>

        {/* eSign sub-section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-violet-500" />
            <Label className="font-semibold">Ký điện tử (eSign)</Label>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <span className="text-sm">Bật ký điện tử</span>
            <Switch 
              checked={!!esignConfig}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateExecution({ esignConfig: { method: 'otp', documentType: 'contract', requireWitness: false, expiryHours: 24 } });
                } else {
                  updateExecution({ esignConfig: undefined });
                }
              }}
            />
          </div>

          {esignConfig && (
            <>
              <Select value={esignConfig.method} onValueChange={(value) => updateExecution({ esignConfig: { ...esignConfig, method: value as any } })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="otp">OTP qua SMS/Email</SelectItem>
                  <SelectItem value="biometric">Sinh trắc học</SelectItem>
                  <SelectItem value="digital_signature">Chữ ký số</SelectItem>
                  <SelectItem value="face_id">Face ID</SelectItem>
                </SelectContent>
              </Select>
              <Select value={esignConfig.documentType} onValueChange={(value) => updateExecution({ esignConfig: { ...esignConfig, documentType: value as any } })}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Hợp đồng</SelectItem>
                  <SelectItem value="agreement">Thỏa thuận dịch vụ</SelectItem>
                  <SelectItem value="consent">Đồng ý điều khoản</SelectItem>
                  <SelectItem value="power_of_attorney">Giấy ủy quyền</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Call Flow & API */}
        {renderCallFlowSection()}
        {renderApiWebhookSection()}
      </div>
    );
  };

  // Shared: Call Flow section
  const renderCallFlowSection = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Workflow className="h-4 w-4 text-violet-500" />
        <Label className="font-semibold">Call Flow (Sub-flow)</Label>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
        <div>
          <p className="text-sm">Gọi luồng con</p>
          <p className="text-xs text-muted-foreground">Tái sử dụng quy trình chuẩn</p>
        </div>
        <Switch 
          checked={editedNode.execution.callFlow?.enabled ?? false}
          onCheckedChange={(checked) => updateExecution({ callFlow: { ...editedNode.execution.callFlow, enabled: checked } })}
        />
      </div>
      {editedNode.execution.callFlow?.enabled && (
        <Select value={editedNode.execution.callFlow?.flowId || ''} onValueChange={(value) => updateExecution({ callFlow: { ...editedNode.execution.callFlow!, flowId: value, flowName: value } })}>
          <SelectTrigger className="h-8"><SelectValue placeholder="Chọn luồng..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="flow-kyc">Luồng KYC chuẩn</SelectItem>
            <SelectItem value="flow-onboarding">Luồng Onboarding</SelectItem>
            <SelectItem value="flow-card-opening">Luồng mở thẻ</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );

  // Shared: API/Webhook section
  const renderApiWebhookSection = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-emerald-500" />
        <Label className="font-semibold">API / Webhook</Label>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
        <div>
          <p className="text-sm">Kết nối hệ thống bên thứ 3</p>
          <p className="text-xs text-muted-foreground">Gọi API hoặc nhận webhook</p>
        </div>
        <Switch 
          checked={editedNode.execution.apiWebhook?.enabled ?? false}
          onCheckedChange={(checked) => updateExecution({ apiWebhook: { ...editedNode.execution.apiWebhook, enabled: checked } })}
        />
      </div>
      {editedNode.execution.apiWebhook?.enabled && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select value={editedNode.execution.apiWebhook?.method || 'POST'} onValueChange={(value) => updateExecution({ apiWebhook: { ...editedNode.execution.apiWebhook!, method: value as any } })}>
              <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="https://api.example.com/..."
              value={editedNode.execution.apiWebhook?.url || ''}
              onChange={(e) => updateExecution({ apiWebhook: { ...editedNode.execution.apiWebhook!, url: e.target.value } })}
              className="flex-1 h-8 text-xs"
            />
          </div>
          <Input 
            placeholder="Mô tả mục đích API..."
            value={editedNode.execution.apiWebhook?.description || ''}
            onChange={(e) => updateExecution({ apiWebhook: { ...editedNode.execution.apiWebhook!, description: e.target.value } })}
            className="h-8 text-xs"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="w-[360px] border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg bg-muted')}>
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
          <div>
            <h3 className="font-medium text-sm">{config.label}</h3>
            <p className="text-xs text-muted-foreground">Cấu hình 3 phần</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 3-Part Tabs: INFO | RULE | EXECUTION */}
      <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full grid grid-cols-3 mx-4 mt-3" style={{ width: 'calc(100% - 2rem)' }}>
          <TabsTrigger value="info" className="gap-1 text-xs">
            <Info className="h-3 w-3" />
            Info
          </TabsTrigger>
          <TabsTrigger value="rule" className="gap-1 text-xs">
            <BookOpen className="h-3 w-3" />
            Rule
          </TabsTrigger>
          <TabsTrigger value="execution" className="gap-1 text-xs">
            <Play className="h-3 w-3" />
            Thực thi
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="info" className="mt-0">{renderInfoTab()}</TabsContent>
          <TabsContent value="rule" className="mt-0">{renderRuleTab()}</TabsContent>
          <TabsContent value="execution" className="mt-0">{renderExecutionTab()}</TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-2">
        <Button className="w-full" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Lưu thay đổi
        </Button>
        {onDelete && (
          <Button variant="outline" className="w-full text-danger hover:text-danger" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa Node
          </Button>
        )}
      </div>
    </div>
  );
}
