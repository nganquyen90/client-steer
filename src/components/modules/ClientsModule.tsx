import { useState } from 'react';
import { Customer, CustomerProgram, Interaction } from '@/types';
import { LeftRail } from '@/components/layout/LeftRail';
import { MainStage } from '@/components/layout/MainStage';
import { CustomerList } from './CustomerList';
import { Customer360 } from './Customer360';

interface ClientsModuleProps {
  customerPrograms: CustomerProgram[];
  customers: Customer[];
  interactions: Interaction[];
}

export function ClientsModule({ customerPrograms, customers, interactions }: ClientsModuleProps) {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(customerPrograms[0]?.id || null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const selectedProgram = customerPrograms.find((p) => p.id === selectedProgramId);
  const filteredCustomers = selectedProgram
    ? customers.filter((c) => c.segment === selectedProgram.segment)
    : customers;
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerInteractions = selectedCustomer
    ? interactions.filter((i) => i.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="flex h-full">
      <LeftRail
        title="Khách hàng"
        customerPrograms={customerPrograms}
        selectedProgramId={selectedProgramId}
        onProgramSelect={setSelectedProgramId}
      />
      <MainStage>
        {selectedCustomer ? (
          <Customer360
            customer={selectedCustomer}
            interactions={customerInteractions}
            onBack={() => setSelectedCustomerId(null)}
          />
        ) : (
          <CustomerList
            customers={filteredCustomers}
            programName={selectedProgram?.name || 'Tất cả khách hàng'}
            programDescription={selectedProgram?.description}
            onCustomerSelect={setSelectedCustomerId}
          />
        )}
      </MainStage>
    </div>
  );
}
