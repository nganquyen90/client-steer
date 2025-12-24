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
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeConfigPanelProps {
  node: JourneyNode;
  onClose: () => void;
  onSave: (updatedNode: JourneyNode) => void;
  onDelete?: () => void;
}

const nodeTypeConfig = {
  start: { icon: CircleDot, label: 'Bắt đầu', color: 'text-success' },
  touchpoint: { icon: Mail, label: 'Điểm chạm', color: 'text-primary' },
  wait: { icon: Clock, label: 'Chờ', color: 'text-warning' },
  decision: { icon: GitBranch, label: 'Điều kiện', color: 'text-accent' },
  end: { icon: Square, label: 'Kết thúc', color: 'text-muted-foreground' },
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
              <Textarea 
                placeholder="Nội dung email..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Mẫu email</Label>
              <Select defaultValue="welcome">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mẫu" />
                </SelectTrigger>
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
            <Textarea 
              placeholder="Nội dung tin nhắn SMS..."
              rows={4}
              maxLength={160}
            />
          </div>
        )}

        {editedNode.data.touchpointType === 'call' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Script cuộc gọi</Label>
              <Textarea 
                placeholder="Kịch bản cuộc gọi..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Phân công nhân viên</Label>
              <Select defaultValue="auto">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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

  const renderWaitConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Loại chờ</Label>
        <Select defaultValue="days">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
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
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
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

  const renderDecisionConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Loại điều kiện</Label>
        <Select defaultValue="response">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="response">Phản hồi từ khách hàng</SelectItem>
            <SelectItem value="behavior">Hành vi khách hàng</SelectItem>
            <SelectItem value="attribute">Thuộc tính khách hàng</SelectItem>
            <SelectItem value="time">Thời gian</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Điều kiện</Label>
        <Textarea 
          value={editedNode.data.condition || ''} 
          onChange={(e) => updateData({ condition: e.target.value })}
          placeholder="Ví dụ: Đã mở email trước đó"
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
          <Input placeholder="Mô tả hành động khi thỏa điều kiện" defaultValue="Đã mở email" />
        </div>

        <div className="rounded-lg border border-danger/50 bg-danger/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-3 rounded-full bg-danger" />
            <span className="text-sm font-medium">Nhánh Không (No)</span>
          </div>
          <Input placeholder="Mô tả hành động khi không thỏa điều kiện" defaultValue="Chưa mở email" />
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

  const renderEndConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Loại kết thúc</Label>
        <Select defaultValue="complete">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
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
      case 'start':
        return renderStartConfig();
      case 'touchpoint':
        return renderTouchpointConfig();
      case 'wait':
        return renderWaitConfig();
      case 'decision':
        return renderDecisionConfig();
      case 'end':
        return renderEndConfig();
      default:
        return null;
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
