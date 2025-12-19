import { ReactNode } from 'react';

interface MainStageProps {
  children: ReactNode;
}

export function MainStage({ children }: MainStageProps) {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      {children}
    </div>
  );
}
