import { useState, useRef, useCallback } from 'react';
import { Customer, CustomerProgram, Interaction, CustomerGroup } from '@/types';
import { LeftRail } from '@/components/layout/LeftRail';
import { MainStage } from '@/components/layout/MainStage';
import { CustomerList } from './CustomerList';
import { Customer360 } from './Customer360';
import { ChatContainer, ChatContainerRef } from '@/components/chat/ChatContainer';

interface ClientsModuleProps {
  customerPrograms: CustomerProgram[];
  customers: Customer[];
  interactions: Interaction[];
  customerGroups?: CustomerGroup[];
  onAddGroup?: (group: Omit<CustomerGroup, 'id' | 'createdAt' | 'customerCount'>) => void;
  onEditGroup?: (id: string, group: Partial<CustomerGroup>) => void;
  onDeleteGroup?: (id: string) => void;
  onImportCustomers?: (groupId: string, customers: any[]) => void;
}

export function ClientsModule({ 
  customerPrograms, 
  customers, 
  interactions,
  customerGroups = [],
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onImportCustomers,
}: ClientsModuleProps) {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(customerPrograms[0]?.id || null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  const chatContainerRef = useRef<ChatContainerRef>(null);

  const selectedProgram = customerPrograms.find((p) => p.id === selectedProgramId);
  const selectedGroup = customerGroups.find((g) => g.id === selectedGroupId);
  
  // Filter customers based on selected program or group
  const filteredCustomers = selectedGroupId
    ? customers.filter((c) => c.groupId === selectedGroupId)
    : selectedProgram
    ? customers.filter((c) => c.segment === selectedProgram.segment)
    : customers;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerInteractions = selectedCustomer
    ? interactions.filter((i) => i.customerId === selectedCustomer.id)
    : [];

  const handleProgramSelect = (programId: string) => {
    setSelectedProgramId(programId);
    setSelectedGroupId(null);
    setSelectedCustomerId(null);
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedProgramId(null);
    setSelectedCustomerId(null);
  };

  const handleOpenGroupChat = useCallback((type: 'custom' | 'segment', groupId: string, groupName: string) => {
    chatContainerRef.current?.openGroupChat(type, groupId, groupName);
  }, []);

  const handleOpenCustomerChat = useCallback((customer: Customer) => {
    chatContainerRef.current?.openIndividualChat(customer);
  }, []);

  return (
    <div className="flex h-full">
      <LeftRail
        title="Khách hàng"
        customerPrograms={customerPrograms}
        selectedProgramId={selectedProgramId}
        onProgramSelect={handleProgramSelect}
        customerGroups={customerGroups}
        onAddGroup={onAddGroup}
        onEditGroup={onEditGroup}
        onDeleteGroup={onDeleteGroup}
        onImportCustomers={onImportCustomers}
        selectedGroupId={selectedGroupId}
        onSelectGroup={handleGroupSelect}
        onOpenGroupChat={handleOpenGroupChat}
      />
      <MainStage>
        {selectedCustomer ? (
          <Customer360
            customer={selectedCustomer}
            interactions={customerInteractions}
            onBack={() => setSelectedCustomerId(null)}
            onOpenChat={() => handleOpenCustomerChat(selectedCustomer)}
          />
        ) : (
          <CustomerList
            customers={filteredCustomers}
            programName={selectedGroup?.name || selectedProgram?.name || 'Tất cả khách hàng'}
            programDescription={selectedGroup?.description || selectedProgram?.description}
            onCustomerSelect={setSelectedCustomerId}
          />
        )}
      </MainStage>

      {/* Chat functionality */}
      <ChatContainer 
        ref={chatContainerRef}
        customers={customers} 
        customerGroups={customerGroups} 
      />
    </div>
  );
}
