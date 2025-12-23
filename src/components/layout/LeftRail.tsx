import { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomerProgram, CustomerGroup } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomerGroupManager } from '@/components/modules/CustomerGroupManager';
import { Separator } from '@/components/ui/separator';

interface LeftRailProps {
  title: string;
  customerPrograms: CustomerProgram[];
  selectedProgramId: string | null;
  onProgramSelect: (programId: string) => void;
  customerGroups?: CustomerGroup[];
  onAddGroup?: (group: Omit<CustomerGroup, 'id' | 'createdAt' | 'customerCount'>) => void;
  onEditGroup?: (id: string, group: Partial<CustomerGroup>) => void;
  onDeleteGroup?: (id: string) => void;
  onImportCustomers?: (groupId: string, customers: any[]) => void;
  selectedGroupId?: string | null;
  onSelectGroup?: (groupId: string) => void;
  onOpenGroupChat?: (type: 'custom' | 'segment', groupId: string, groupName: string) => void;
}

export function LeftRail({ 
  title, 
  customerPrograms, 
  selectedProgramId, 
  onProgramSelect,
  customerGroups = [],
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onImportCustomers,
  selectedGroupId,
  onSelectGroup,
  onOpenGroupChat,
}: LeftRailProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrograms = customerPrograms.filter((program) =>
    program.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-72 flex-col border-r border-border bg-left-rail">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <h2 className="text-base font-semibold text-left-rail-foreground">{title}</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 bg-background pl-9 text-sm"
          />
        </div>
      </div>

      {/* Program list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {/* Custom Groups Section */}
        {onAddGroup && onEditGroup && onDeleteGroup && onImportCustomers && onSelectGroup && (
          <>
            <CustomerGroupManager
              groups={customerGroups}
              onAddGroup={onAddGroup}
              onEditGroup={onEditGroup}
              onDeleteGroup={onDeleteGroup}
              onImportCustomers={onImportCustomers}
              onSelectGroup={onSelectGroup}
              selectedGroupId={selectedGroupId || null}
              onOpenGroupChat={onOpenGroupChat ? (groupId, groupName) => onOpenGroupChat('custom', groupId, groupName) : undefined}
            />
            <Separator className="my-3" />
          </>
        )}

        {/* Segment Programs - Flat list */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">
            Phân khúc hệ thống
          </h3>
        </div>
        
        {filteredPrograms.map((program) => (
          <div
            key={program.id}
            className={cn(
              'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors',
              selectedProgramId === program.id
                ? 'bg-left-rail-active text-primary'
                : 'hover:bg-left-rail-hover text-left-rail-foreground'
            )}
          >
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full flex-shrink-0',
                program.segment === 'need' && 'bg-need',
                program.segment === 'risk' && 'bg-risk',
                program.segment === 'experience' && 'bg-experience'
              )}
            />
            <button
              onClick={() => onProgramSelect(program.id)}
              className="flex flex-1 flex-col min-w-0"
            >
              <span className="truncate text-sm font-medium">{program.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {program.customerCount} khách hàng
              </span>
            </button>
            {onOpenGroupChat && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGroupChat('segment', program.segment, program.name);
                }}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
            <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
