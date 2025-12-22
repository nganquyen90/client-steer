import { useState } from 'react';
import { Search, Plus, Mail, Share2, FileText, Edit, Trash2, MoreHorizontal, Eye, Copy, Filter } from 'lucide-react';
import { ContentTemplate } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentModuleProps {
  templates: ContentTemplate[];
  onAddTemplate: (template: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditTemplate: (id: string, template: Partial<ContentTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
}

const typeConfig = {
  email: { icon: Mail, label: 'Email Templates', color: 'bg-info/10 text-info' },
  social: { icon: Share2, label: 'Social Media', color: 'bg-success/10 text-success' },
  sales_doc: { icon: FileText, label: 'Tài liệu bán hàng', color: 'bg-warning/10 text-warning' },
};

export function ContentModule({ templates, onAddTemplate, onEditTemplate, onDeleteTemplate }: ContentModuleProps) {
  const [activeTab, setActiveTab] = useState<ContentTemplate['type']>('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: '',
    type: 'email' as ContentTemplate['type'],
  });

  const filteredTemplates = templates.filter(
    (t) =>
      t.type === activeTab &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = () => {
    onAddTemplate({
      type: formData.type,
      name: formData.name,
      description: formData.description,
      content: formData.content,
      category: formData.category,
    });
    setFormData({ name: '', description: '', content: '', category: '', type: 'email' });
    setIsCreateOpen(false);
  };

  const handleEdit = () => {
    if (selectedTemplate) {
      onEditTemplate(selectedTemplate.id, {
        name: formData.name,
        description: formData.description,
        content: formData.content,
        category: formData.category,
      });
      setIsEditOpen(false);
      setSelectedTemplate(null);
    }
  };

  const openEditDialog = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      content: template.content,
      category: template.category,
      type: template.type,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Quản lý nội dung</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Thư viện templates và tài liệu bán hàng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 pl-9"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
            <Button size="sm" className="h-9" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentTemplate['type'])} className="flex-1 flex flex-col">
        <div className="border-b border-border px-6">
          <TabsList className="h-12 bg-transparent border-b-0 p-0 gap-6">
            {Object.entries(typeConfig).map(([type, config]) => {
              const Icon = config.icon;
              const count = templates.filter((t) => t.type === type).length;
              return (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="h-12 px-0 pb-3 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Content grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          <TabsContent value={activeTab} className="mt-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template, index) => {
                const config = typeConfig[template.type];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-card-foreground truncate">
                              {template.name}
                            </h3>
                            <Badge variant="outline" className="text-xs mt-1">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem trước
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(template)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Nhân bản
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-danger"
                              onClick={() => onDeleteTemplate(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {template.description && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Cập nhật: {format(template.updatedAt, 'dd/MM/yyyy', { locale: vi })}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Add new card */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: filteredTemplates.length * 0.03 }}
                onClick={() => {
                  setFormData({ ...formData, type: activeTab });
                  setIsCreateOpen(true);
                }}
                className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-primary"
              >
                <Plus className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Thêm {typeConfig[activeTab].label}</span>
              </motion.button>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm nội dung mới</DialogTitle>
            <DialogDescription>
              Tạo template hoặc tài liệu mới cho thư viện
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Loại nội dung</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ContentTemplate['type'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Template</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="sales_doc">Tài liệu bán hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tên</Label>
              <Input
                placeholder="Nhập tên template..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Input
                placeholder="VD: Chào mừng, Khuyến mãi..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                placeholder="Mô tả ngắn về nội dung..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Nội dung</Label>
              <Textarea
                placeholder="Nhập nội dung template..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.category}>
              Tạo mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nội dung</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên</Label>
              <Input
                placeholder="Nhập tên template..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Input
                placeholder="VD: Chào mừng, Khuyến mãi..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                placeholder="Mô tả ngắn về nội dung..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Nội dung</Label>
              <Textarea
                placeholder="Nhập nội dung template..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name || !formData.category}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
