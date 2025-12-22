import { Search, Filter, MoreHorizontal, Mail, Phone, MapPin } from 'lucide-react';
import { Customer } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { maskSensitive } from '@/data/mockData';

interface CustomerListProps {
  customers: Customer[];
  programName: string;
  programDescription?: string;
  onCustomerSelect: (customerId: string) => void;
}

const statusStyles = {
  new: 'bg-info/10 text-info',
  active: 'bg-success/10 text-success',
  inactive: 'bg-warning/10 text-warning',
  churned: 'bg-danger/10 text-danger',
};

const statusLabels = {
  new: 'Mới',
  active: 'Đang hoạt động',
  inactive: 'Không hoạt động',
  churned: 'Đã rời bỏ',
};

export function CustomerList({ customers, programName, programDescription, onCustomerSelect }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{programName}</h1>
            {programDescription && <p className="text-sm text-muted-foreground mt-0.5">{programDescription}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 pl-9"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{filteredCustomers.length} khách hàng</span>
        </div>
      </div>

      {/* Customer grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <button
                onClick={() => onCustomerSelect(customer.id)}
                className="group w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                        {customer.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{customer.dId}</p>
                    </div>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{maskSensitive(customer.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{maskSensitive(customer.email)}</span>
                  </div>
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className={cn('text-xs', statusStyles[customer.status])}>
                    {statusLabels[customer.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(customer.lastInteraction, { addSuffix: true, locale: vi })}
                  </span>
                </div>

                {customer.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {customer.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {customer.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{customer.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
