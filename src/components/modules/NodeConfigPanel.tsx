import { useState } from 'react';
import { JourneyNode } from '@/types';
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
  X, 
  Mail, 
  MessageSquare, 
  Bell, 
  Phone, 
  Clock, 
  GitBranch,
  CircleDot,
  Square,
  Save,
  Trash2,
  Sparkles,
  Users,
  Calendar,
  FileText,
  Settings2,
  Zap,
  ShieldCheck,
  KeyRound,
  PenTool,
  ScanFace,
  CreditCard,
  Fingerprint,
  AlertTriangle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeConfigPanelProps {
  node: JourneyNode;
  onClose: () => void;
  onSave: (updatedNode: JourneyNode) => void;
  onDelete?: () => void;
}

const nodeTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  start: { icon: CircleDot, label: 'Bắt đầu', color: 'text-success' },
  touchpoint: { icon: Mail, label: 'Điểm chạm', color: 'text-primary' },
  wait: { icon: Clock, label: 'Chờ', color: 'text-warning' },
  decision: { icon: GitBranch, label: 'Điều kiện', color: 'text-accent' },
  end: { icon: Square, label: 'Kết thúc', color: 'text-muted-foreground' },
  kyc: { icon: ShieldCheck, label: 'Xác thực KYC', color: 'text-cyan-500' },
  authorization: { icon: KeyRound, label: 'Phân quyền', color: 'text-amber-500' },
  esign: { icon: PenTool, label: 'Ký điện tử', color: 'text-violet-500' },
};

const touchpointTypes = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'notification', label: 'Thông báo', icon: Bell },
  { value: 'call', label: 'Gọi điện', icon: Phone },
  { value: 'chat', label: 'Chat', icon: MessageSquare },
];

export function NodeConfigPanel({ node, onClose, onSave, onDelete }: NodeConfigPanelProps) {
  const [editedNode, setEditedNode] = useState<JourneyNode>({ ...node });
  const config = nodeTypeConfig[node.type];
  const Icon = config.icon;

  const updateData = (updates: Partial<JourneyNode['data']>) => {
    setEditedNode(prev => ({
      ...prev,
      data: { ...prev.data, ...updates }
    }));
  };

  const handleSave = () => {
    onSave(editedNode);
    onClose();
  };

  // ===== START CONFIG =====
  const renderStartConfig = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Users className="h-4 w-4" />
          <span>Điều kiện kích hoạt</span>
        </div>
        <Select defaultValue="segment">
          <SelectTrigger>
            <SelectValue placeholder="Chọn điều kiện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="segment">Thuộc phân khúc khách hàng</SelectItem>
            <SelectItem value="event">Khi có sự kiện</SelectItem>
            <SelectItem value="registration">Khi đăng ký mới</SelectItem>
            <SelectItem value="manual">Thêm thủ công</SelectItem>
            <SelectItem value="import">Import từ file</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Mô tả</Label>
        <Textarea 
          value={editedNode.data.description || ''} 
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Mô tả điểm bắt đầu..."
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />
          <span className="text-sm">Tự động thêm khách hàng mới</span>
        </div>
        <Switch defaultChecked />
      </div>
    </div>
  );

  // ===== TOUCHPOINT CONFIG =====
  const renderTouchpointConfig = () => (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="content">Nội dung</TabsTrigger>
        <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        <TabsTrigger value="preview">Xem trước</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Loại điểm chạm</Label>
          <Select 
            value={editedNode.data.touchpointType || 'email'}
            onValueChange={(value) => updateData({ touchpointType: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {touchpointTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {(editedNode.data.touchpointType === 'email' || !editedNode.data.touchpointType) && (
          <>
            <div className="space-y-2">
              <Label>Tiêu đề email</Label>
              <Input 
                placeholder="Chào mừng bạn đến với chương trình..." 
                value={editedNode.data.label}
                onChange={(e) => updateData({ label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Nội dung email</Label>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI viết nội dung
                </Button>
              </div>
              <Textarea placeholder="Nội dung email..." rows={6} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Mẫu email</Label>
              <Select defaultValue="welcome">
                <SelectTrigger><SelectValue placeholder="Chọn mẫu" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Chào mừng khách hàng mới</SelectItem>
                  <SelectItem value="promo">Thông báo khuyến mãi</SelectItem>
                  <SelectItem value="reminder">Nhắc nhở thanh toán</SelectItem>
                  <SelectItem value="feedback">Khảo sát ý kiến</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {editedNode.data.touchpointType === 'sms' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Nội dung SMS</Label>
              <Badge variant="outline" className="text-xs">0/160 ký tự</Badge>
            </div>
            <Textarea placeholder="Nội dung tin nhắn SMS..." rows={4} maxLength={160} />
          </div>
        )}

        {editedNode.data.touchpointType === 'call' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Script cuộc gọi</Label>
              <Textarea placeholder="Kịch bản cuộc gọi..." rows={6} />
            </div>
            <div className="space-y-2">
              <Label>Phân công nhân viên</Label>
              <Select defaultValue="auto">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Tự động phân công</SelectItem>
                  <SelectItem value="sales">Phòng kinh doanh</SelectItem>
                  <SelectItem value="support">Phòng hỗ trợ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="settings" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Thời gian gửi</Label>
          <Select defaultValue="immediate">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Ngay lập tức</SelectItem>
              <SelectItem value="morning">Sáng (8:00 - 10:00)</SelectItem>
              <SelectItem value="afternoon">Chiều (14:00 - 16:00)</SelectItem>
              <SelectItem value="evening">Tối (18:00 - 20:00)</SelectItem>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Gửi lại nếu thất bại</p>
            <p className="text-xs text-muted-foreground">Tự động gửi lại sau 1 giờ</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Theo dõi mở/click</p>
            <p className="text-xs text-muted-foreground">Ghi nhận khi khách hàng tương tác</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="space-y-2">
          <Label>Giới hạn gửi/ngày</Label>
          <Input type="number" defaultValue={1000} min={1} />
        </div>
      </TabsContent>

      <TabsContent value="preview" className="mt-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Xem trước nội dung sẽ hiển thị ở đây</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  // ===== WAIT CONFIG =====
  const renderWaitConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Loại chờ</Label>
        <Select defaultValue="days">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="days">Số ngày</SelectItem>
            <SelectItem value="hours">Số giờ</SelectItem>
            <SelectItem value="until_date">Đến ngày cụ thể</SelectItem>
            <SelectItem value="until_event">Đến khi có sự kiện</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Thời gian chờ</Label>
        <div className="flex gap-2">
          <Input 
            type="number" 
            value={editedNode.data.waitDays || 1}
            onChange={(e) => updateData({ waitDays: parseInt(e.target.value) || 1 })}
            min={1}
            className="flex-1"
          />
          <Select defaultValue="days">
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Giờ</SelectItem>
              <SelectItem value="days">Ngày</SelectItem>
              <SelectItem value="weeks">Tuần</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-medium">Ví dụ thời gian</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Khách hàng vào lúc <span className="text-foreground font-medium">10:00 ngày 01/01</span> sẽ tiếp tục vào lúc{' '}
          <span className="text-foreground font-medium">10:00 ngày {String(1 + (editedNode.data.waitDays || 1)).padStart(2, '0')}/01</span>
        </p>
      </div>
      <div className="space-y-2">
        <Label>Mô tả</Label>
        <Textarea 
          value={editedNode.data.description || ''} 
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Mô tả bước chờ..."
          rows={2}
        />
      </div>
    </div>
  );

  // ===== DECISION CONFIG =====
  const renderDecisionConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Loại điều kiện</Label>
        <Select defaultValue="response">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="response">Phản hồi từ khách hàng</SelectItem>
            <SelectItem value="behavior">Hành vi khách hàng</SelectItem>
            <SelectItem value="attribute">Thuộc tính khách hàng</SelectItem>
            <SelectItem value="kyc_result">Kết quả KYC</SelectItem>
            <SelectItem value="auth_result">Kết quả phân quyền</SelectItem>
            <SelectItem value="time">Thời gian</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Điều kiện</Label>
        <Textarea 
          value={editedNode.data.condition || ''} 
          onChange={(e) => updateData({ condition: e.target.value })}
          placeholder="Ví dụ: KYC thành công, Điểm tín dụng >= 700..."
          rows={2}
        />
      </div>
      <div className="space-y-3">
        <Label>Các nhánh</Label>
        <div className="rounded-lg border border-success/50 bg-success/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm font-medium">Nhánh Có (Yes)</span>
          </div>
          <Input placeholder="Mô tả hành động khi thỏa điều kiện" defaultValue="Thành công" />
        </div>
        <div className="rounded-lg border border-danger/50 bg-danger/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-3 rounded-full bg-danger" />
            <span className="text-sm font-medium">Nhánh Không (No)</span>
          </div>
          <Input placeholder="Mô tả hành động khi không thỏa điều kiện" defaultValue="Thất bại" />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-medium">Chờ phản hồi</p>
          <p className="text-xs text-muted-foreground">Chờ tối đa 7 ngày trước khi chuyển nhánh Không</p>
        </div>
        <Switch defaultChecked />
      </div>
    </div>
  );

  // ===== KYC CONFIG =====
  const renderKycConfig = () => (
    <Tabs defaultValue="steps" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="steps">Các bước KYC</TabsTrigger>
        <TabsTrigger value="rules">Quy tắc</TabsTrigger>
        <TabsTrigger value="fallback">Xử lý lỗi</TabsTrigger>
      </TabsList>

      <TabsContent value="steps" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Loại giấy tờ</Label>
          <Select 
            value={editedNode.data.kycConfig?.method || 'cccd'}
            onValueChange={(value) => updateData({ 
              kycConfig: { ...editedNode.data.kycConfig!, method: value as any } 
            })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cccd">CCCD / CMND</SelectItem>
              <SelectItem value="passport">Hộ chiếu</SelectItem>
              <SelectItem value="driver_license">Giấy phép lái xe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Các bước xác thực</Label>
          {[
            { id: 'id_front', label: 'Chụp mặt trước giấy tờ', icon: CreditCard },
            { id: 'id_back', label: 'Chụp mặt sau giấy tờ', icon: CreditCard },
            { id: 'face_matching', label: 'Quét khuôn mặt (Face Matching)', icon: ScanFace },
            { id: 'ocr_verify', label: 'Kiểm tra OCR tự động', icon: FileText },
            { id: 'db_check', label: 'Đối chiếu CSDL quốc gia', icon: ShieldCheck },
          ].map((step) => {
            const StepIcon = step.icon;
            const isChecked = editedNode.data.kycConfig?.steps?.includes(step.id as any) ?? true;
            return (
              <div key={step.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Checkbox 
                  id={step.id} 
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const currentSteps = editedNode.data.kycConfig?.steps || ['id_front', 'id_back', 'face_matching', 'ocr_verify', 'db_check'];
                    const newSteps = checked 
                      ? [...currentSteps, step.id as any]
                      : currentSteps.filter(s => s !== step.id);
                    updateData({ 
                      kycConfig: { ...editedNode.data.kycConfig!, steps: newSteps } 
                    });
                  }}
                />
                <StepIcon className="h-4 w-4 text-cyan-500" />
                <label htmlFor={step.id} className="text-sm font-medium cursor-pointer flex-1">
                  {step.label}
                </label>
              </div>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="rules" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Số lần thử lại tối đa</Label>
          <Input 
            type="number" 
            value={editedNode.data.kycConfig?.maxRetries || 3} 
            onChange={(e) => updateData({ 
              kycConfig: { ...editedNode.data.kycConfig!, maxRetries: parseInt(e.target.value) || 3 } 
            })}
            min={1} max={10}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Duyệt thủ công khi thất bại</p>
            <p className="text-xs text-muted-foreground">Chuyển hồ sơ cho nhân viên xem xét</p>
          </div>
          <Switch 
            checked={editedNode.data.kycConfig?.manualReviewOnFail ?? true}
            onCheckedChange={(checked) => updateData({ 
              kycConfig: { ...editedNode.data.kycConfig!, manualReviewOnFail: checked } 
            })}
          />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm mb-2">
            <ShieldCheck className="h-4 w-4 text-cyan-500" />
            <span className="font-medium">Tiêu chuẩn bảo mật</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Dữ liệu được mã hóa end-to-end</p>
            <p>• Tuân thủ quy định bảo vệ dữ liệu cá nhân</p>
            <p>• Ảnh giấy tờ tự động xóa sau 24h xử lý</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="fallback" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Hành động khi KYC thất bại</Label>
          <Select 
            value={editedNode.data.kycConfig?.failAction || 'create_task'}
            onValueChange={(value) => updateData({ 
              kycConfig: { ...editedNode.data.kycConfig!, failAction: value as any } 
            })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="notify_sms">Gửi SMS thông báo lỗi</SelectItem>
              <SelectItem value="notify_email">Gửi Email hướng dẫn</SelectItem>
              <SelectItem value="create_task">Tạo nhiệm vụ cho Sales Team</SelectItem>
              <SelectItem value="block">Chặn & yêu cầu liên hệ CSKH</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Kịch bản xử lý thất bại</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-warning font-medium">1.</span>
              <span>Gửi SMS: "Xác thực chưa hoàn tất. Vui lòng thử lại hoặc liên hệ hotline."</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-warning font-medium">2.</span>
              <span>Tạo Task cho Sales Team gọi hỗ trợ khách hàng</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-warning font-medium">3.</span>
              <span>Chờ duyệt thủ công (nếu bật)</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mô tả</Label>
          <Textarea 
            value={editedNode.data.description || ''} 
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Ghi chú thêm cho bước KYC..."
            rows={2}
          />
        </div>
      </TabsContent>
    </Tabs>
  );

  // ===== AUTHORIZATION CONFIG =====
  const renderAuthorizationConfig = () => (
    <Tabs defaultValue="check" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="check">Kiểm tra</TabsTrigger>
        <TabsTrigger value="tiers">Phân hạng</TabsTrigger>
        <TabsTrigger value="action">Hành động</TabsTrigger>
      </TabsList>

      <TabsContent value="check" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Loại kiểm tra</Label>
          <Select 
            value={editedNode.data.authorizationConfig?.checkType || 'credit_score'}
            onValueChange={(value) => updateData({ 
              authorizationConfig: { ...editedNode.data.authorizationConfig!, checkType: value as any } 
            })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_score">Điểm tín dụng (CIC)</SelectItem>
              <SelectItem value="transaction_history">Lịch sử giao dịch</SelectItem>
              <SelectItem value="asset_check">Kiểm tra tài sản</SelectItem>
              <SelectItem value="manual_review">Duyệt thủ công</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <CreditCard className="h-4 w-4 text-amber-500" />
            <span className="font-medium">Nguồn dữ liệu kiểm tra</span>
          </div>
          {[
            { label: 'Trung tâm thông tin tín dụng (CIC)', checked: true },
            { label: 'Lịch sử giao dịch nội bộ', checked: true },
            { label: 'Dữ liệu tài sản đảm bảo', checked: false },
            { label: 'Thông tin thu nhập', checked: false },
          ].map((source, idx) => (
            <div key={idx} className="flex items-center gap-2 py-1.5">
              <Checkbox id={`src-${idx}`} defaultChecked={source.checked} />
              <label htmlFor={`src-${idx}`} className="text-sm cursor-pointer">{source.label}</label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Mô tả quy trình</Label>
          <Textarea 
            value={editedNode.data.description || ''} 
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Mô tả quy trình kiểm tra và phân quyền..."
            rows={3}
          />
        </div>
      </TabsContent>

      <TabsContent value="tiers" className="space-y-4 mt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Các hạng mức cấp phát</Label>
          </div>

          {[
            { tier: 'Gói Standard', limit: '20 triệu', condition: 'Điểm CIC >= 600', color: 'border-blue-500/50 bg-blue-500/5' },
            { tier: 'Gói Gold', limit: '50 triệu', condition: 'Điểm CIC >= 700', color: 'border-amber-500/50 bg-amber-500/5' },
            { tier: 'Gói VIP', limit: '200 triệu', condition: 'Điểm CIC >= 800', color: 'border-violet-500/50 bg-violet-500/5' },
          ].map((rule, idx) => (
            <div key={idx} className={cn('rounded-lg border p-3 space-y-2', rule.color)}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{rule.tier}</span>
                <Badge variant="outline" className="text-xs">{rule.limit}</Badge>
              </div>
              <Input defaultValue={rule.condition} className="text-sm h-8" />
            </div>
          ))}

          <Button variant="outline" size="sm" className="w-full gap-1">
            <Plus className="h-3 w-3" />
            Thêm hạng mức
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Hạng mức mặc định</Label>
          <Select defaultValue="standard">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Gói Standard (20 triệu)</SelectItem>
              <SelectItem value="gold">Gói Gold (50 triệu)</SelectItem>
              <SelectItem value="vip">Gói VIP (200 triệu)</SelectItem>
              <SelectItem value="none">Không cấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="action" className="space-y-4 mt-4">
        <div className="rounded-lg border border-success/50 bg-success/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">Khi phân quyền thành công</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="auth-noti" defaultChecked />
              <label htmlFor="auth-noti" className="text-sm cursor-pointer">Gửi Notification trên App</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="auth-email" defaultChecked />
              <label htmlFor="auth-email" className="text-sm cursor-pointer">Gửi Email thông báo hạn mức</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="auth-sms" />
              <label htmlFor="auth-sms" className="text-sm cursor-pointer">Gửi SMS xác nhận</label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-danger/50 bg-danger/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <span className="text-sm font-medium">Khi không đủ điều kiện</span>
          </div>
          <Select defaultValue="lower_tier">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lower_tier">Cấp hạng mức thấp hơn</SelectItem>
              <SelectItem value="pending">Chờ xem xét thủ công</SelectItem>
              <SelectItem value="reject">Từ chối & thông báo</SelectItem>
              <SelectItem value="task">Tạo Task cho nhân viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>
    </Tabs>
  );

  // ===== ESIGN CONFIG =====
  const renderEsignConfig = () => (
    <Tabs defaultValue="method" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="method">Phương thức</TabsTrigger>
        <TabsTrigger value="document">Tài liệu</TabsTrigger>
        <TabsTrigger value="settings">Cài đặt</TabsTrigger>
      </TabsList>

      <TabsContent value="method" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Phương thức xác thực ký</Label>
          <Select 
            value={editedNode.data.esignConfig?.method || 'otp'}
            onValueChange={(value) => updateData({ 
              esignConfig: { ...editedNode.data.esignConfig!, method: value as any } 
            })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="otp">OTP qua SMS/Email</SelectItem>
              <SelectItem value="biometric">Sinh trắc học (Vân tay/Khuôn mặt)</SelectItem>
              <SelectItem value="digital_signature">Chữ ký số (USB Token / HSM)</SelectItem>
              <SelectItem value="face_id">Face ID xác thực</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Các bước ký điện tử</Label>
          {[
            { icon: FileText, label: 'Hiển thị hợp đồng để đọc', desc: 'KH đọc và xem lại nội dung' },
            { icon: Fingerprint, label: 'Xác thực danh tính', desc: 'OTP / Sinh trắc / Chữ ký số' },
            { icon: PenTool, label: 'Ký xác nhận', desc: 'KH xác nhận đồng ý ký hợp đồng' },
            { icon: CheckCircle2, label: 'Lưu trữ & gửi bản sao', desc: 'Lưu hợp đồng đã ký' },
          ].map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                  <StepIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground font-medium">B{idx + 1}</span>
              </div>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="document" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Loại tài liệu</Label>
          <Select 
            value={editedNode.data.esignConfig?.documentType || 'contract'}
            onValueChange={(value) => updateData({ 
              esignConfig: { ...editedNode.data.esignConfig!, documentType: value as any } 
            })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="contract">Hợp đồng mở tài khoản</SelectItem>
              <SelectItem value="agreement">Thỏa thuận sử dụng dịch vụ</SelectItem>
              <SelectItem value="consent">Đồng ý điều khoản & điều kiện</SelectItem>
              <SelectItem value="power_of_attorney">Giấy ủy quyền</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Mẫu hợp đồng</Label>
          <Select defaultValue="margin_contract">
            <SelectTrigger><SelectValue placeholder="Chọn mẫu hợp đồng" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="margin_contract">HĐ cấp hạn mức Margin</SelectItem>
              <SelectItem value="account_opening">HĐ mở tài khoản giao dịch</SelectItem>
              <SelectItem value="vip_service">HĐ dịch vụ VIP</SelectItem>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Yêu cầu người làm chứng</p>
            <p className="text-xs text-muted-foreground">Cần nhân viên xác nhận</p>
          </div>
          <Switch 
            checked={editedNode.data.esignConfig?.requireWitness ?? false}
            onCheckedChange={(checked) => updateData({ 
              esignConfig: { ...editedNode.data.esignConfig!, requireWitness: checked } 
            })}
          />
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Thời hạn ký (giờ)</Label>
          <Input 
            type="number" 
            value={editedNode.data.esignConfig?.expiryHours || 24}
            onChange={(e) => updateData({ 
              esignConfig: { ...editedNode.data.esignConfig!, expiryHours: parseInt(e.target.value) || 24 } 
            })}
            min={1} max={168}
          />
          <p className="text-xs text-muted-foreground">Link ký sẽ hết hạn sau thời gian này</p>
        </div>

        <div className="space-y-2">
          <Label>Phương thức dự phòng</Label>
          <Select 
            value={editedNode.data.esignConfig?.fallbackMethod || 'otp'}
            onValueChange={(value) => updateData({ 
              esignConfig: { ...editedNode.data.esignConfig!, fallbackMethod: value as any } 
            })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="otp">Chuyển sang OTP</SelectItem>
              <SelectItem value="manual">Ký giấy tại quầy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Lưu trữ dài hạn</p>
            <p className="text-xs text-muted-foreground">Lưu hợp đồng trên hệ thống 10 năm</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Gửi bản sao cho KH</p>
            <p className="text-xs text-muted-foreground">Email bản PDF sau khi ký thành công</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm mb-2">
            <ShieldCheck className="h-4 w-4 text-violet-500" />
            <span className="font-medium">Ràng buộc pháp lý</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Chữ ký điện tử có giá trị pháp lý theo Luật Giao dịch điện tử</p>
            <p>• Xác thực danh tính trước khi ký đảm bảo tính hợp pháp</p>
            <p>• Dấu thời gian (timestamp) được ghi nhận tự động</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  // ===== END CONFIG =====
  const renderEndConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Loại kết thúc</Label>
        <Select defaultValue="complete">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="complete">Hoàn thành hành trình</SelectItem>
            <SelectItem value="convert">Chuyển đổi thành công</SelectItem>
            <SelectItem value="exit">Thoát hành trình</SelectItem>
            <SelectItem value="transfer">Chuyển sang hành trình khác</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Mô tả</Label>
        <Textarea 
          value={editedNode.data.description || ''} 
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Mô tả điểm kết thúc..."
          rows={2}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-medium">Ghi nhận hoàn thành</p>
          <p className="text-xs text-muted-foreground">Đánh dấu khách hàng đã hoàn thành hành trình</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-medium">Cho phép tham gia lại</p>
          <p className="text-xs text-muted-foreground">Khách hàng có thể tham gia lại sau 30 ngày</p>
        </div>
        <Switch />
      </div>
    </div>
  );

  const renderConfig = () => {
    switch (node.type) {
      case 'start': return renderStartConfig();
      case 'touchpoint': return renderTouchpointConfig();
      case 'wait': return renderWaitConfig();
      case 'decision': return renderDecisionConfig();
      case 'kyc': return renderKycConfig();
      case 'authorization': return renderAuthorizationConfig();
      case 'esign': return renderEsignConfig();
      case 'end': return renderEndConfig();
      default: return null;
    }
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg bg-muted', config.color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{config.label}</h3>
            <p className="text-xs text-muted-foreground">Cấu hình chi tiết</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tên bước</Label>
            <Input 
              value={editedNode.data.label} 
              onChange={(e) => updateData({ label: e.target.value })}
            />
          </div>
          {renderConfig()}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-2">
        <Button className="w-full" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Lưu thay đổi
        </Button>
        {onDelete && node.type !== 'start' && node.type !== 'end' && (
          <Button variant="outline" className="w-full text-danger hover:text-danger" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa bước này
          </Button>
        )}
      </div>
    </div>
  );
}
