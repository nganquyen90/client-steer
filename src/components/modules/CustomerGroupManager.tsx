import { useState } from 'react';
import { Plus, Upload, Users, MoreHorizontal, Edit, Trash2, FileSpreadsheet, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import { CustomerGroup } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface CustomerGroupManagerProps {
  groups: CustomerGroup[];
  onAddGroup: (group: Omit<CustomerGroup, 'id' | 'createdAt' | 'customerCount'>) => void;
  onEditGroup: (id: string, group: Partial<CustomerGroup>) => void;
  onDeleteGroup: (id: string) => void;
  onImportCustomers: (groupId: string, customers: any[]) => void;
  onSelectGroup: (groupId: string) => void;
  selectedGroupId: string | null;
  onOpenGroupChat?: (groupId: string, groupName: string) => void;
}

const DEFAULT_VISIBLE_COUNT = 2;

export function CustomerGroupManager({
  groups,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onImportCustomers,
  onSelectGroup,
  selectedGroupId,
  onOpenGroupChat,
}: CustomerGroupManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    onAddGroup({ name: formData.name, description: formData.description });
    setFormData({ name: '', description: '' });
    setIsCreateOpen(false);
    toast.success('Đã tạo nhóm khách hàng mới');
  };

  const handleEdit = () => {
    if (selectedGroup) {
      onEditGroup(selectedGroup.id, { name: formData.name, description: formData.description });
      setIsEditOpen(false);
      setSelectedGroup(null);
      toast.success('Đã cập nhật nhóm khách hàng');
    }
  };

  const openEditDialog = (group: CustomerGroup) => {
    setSelectedGroup(group);
    setFormData({ name: group.name, description: group.description || '' });
    setIsEditOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, groupId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate parsing CSV/Excel file
    const reader = new FileReader();
    reader.onload = () => {
      // In a real app, you'd parse the file content here
      toast.success(`Đã import file ${file.name}`);
      setIsImportOpen(false);
    };
    reader.readAsText(file);
  };

  // Show only first 2 groups when collapsed, all when expanded
  const visibleGroups = isExpanded ? groups : groups.slice(0, DEFAULT_VISIBLE_COUNT);
  const hiddenCount = groups.length - DEFAULT_VISIBLE_COUNT;
  const hasMoreGroups = groups.length > DEFAULT_VISIBLE_COUNT;

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => hasMoreGroups && setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left hover:bg-left-rail-hover rounded-md px-2 py-1 -ml-2 transition-colors"
          >
            {hasMoreGroups ? (
              isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )
            ) : (
              <span className="w-3.5" />
            )}
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nhóm tự tạo</h3>
            <span className="text-xs text-muted-foreground">{groups.length}</span>
          </button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <AnimatePresence>
          <div className="space-y-1">
            {visibleGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={`group flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors ml-3 ${
                    selectedGroupId === group.id
                      ? 'bg-left-rail-active text-primary'
                      : 'hover:bg-left-rail-hover text-left-rail-foreground'
                  }`}
                  onClick={() => onSelectGroup(group.id)}
                >
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{group.name}</span>
                    <span className="text-xs text-muted-foreground">{group.customerCount} khách hàng</span>
                  </div>
                  {onOpenGroupChat && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenGroupChat(group.id, group.name);
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedGroup(group);
                        setIsImportOpen(true);
                      }}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import leads
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(group)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-danger"
                        onClick={() => {
                          onDeleteGroup(group.id);
                          toast.success('Đã xóa nhóm khách hàng');
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
            
            {/* Show expand button when collapsed and has more groups */}
            {!isExpanded && hasMoreGroups && (
              <button
                onClick={() => setIsExpanded(true)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 ml-3 text-left text-xs text-muted-foreground hover:text-primary hover:bg-left-rail-hover transition-colors"
              >
                <ChevronDown className="h-3 w-3" />
                <span>Xem thêm {hiddenCount} nhóm</span>
              </button>
            )}
            
            {groups.length === 0 && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-left border-2 border-dashed border-border hover:border-primary/50 transition-colors text-muted-foreground hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Tạo nhóm đầu tiên</span>
              </button>
            )}
          </div>
        </AnimatePresence>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo nhóm khách hàng mới</DialogTitle>
            <DialogDescription>
              Tạo nhóm để quản lý danh sách leads của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên nhóm</Label>
              <Input
                placeholder="VD: Leads tháng 1, Hot leads..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả (tùy chọn)</Label>
              <Textarea
                placeholder="Mô tả ngắn về nhóm khách hàng..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name.trim()}>
              Tạo nhóm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhóm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên nhóm</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name.trim()}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import danh sách leads</DialogTitle>
            <DialogDescription>
              Upload file Excel hoặc CSV chứa danh sách khách hàng
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Click để upload</span> hoặc kéo thả
                </p>
                <p className="text-xs text-muted-foreground">Excel (.xlsx, .xls) hoặc CSV</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => selectedGroup && handleFileUpload(e, selectedGroup.id)}
              />
            </label>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Định dạng file:</strong> Cần có các cột: Họ tên, Số điện thoại, Email, Địa chỉ
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
