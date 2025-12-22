// Core types for Dlink Platform

export type CustomerSegment = 'need' | 'risk' | 'experience';

export interface Customer {
  id: string;
  dId: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  segment: CustomerSegment;
  status: 'new' | 'active' | 'inactive' | 'churned';
  lastInteraction: Date;
  createdAt: Date;
  avatar?: string;
  tags: string[];
  groupId?: string;
}

export interface Activity {
  id: string;
  type: 'alert' | 'task' | 'campaign' | 'customer' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  customerId?: string;
  link?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CustomerProgram {
  id: string;
  name: string;
  segment: CustomerSegment;
  description: string;
  customerCount: number;
  rules: string[];
  createdAt: Date;
  isCustom?: boolean;
}

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  customerCount: number;
  createdAt: Date;
}

export interface ContentTemplate {
  id: string;
  type: 'email' | 'social' | 'sales_doc';
  name: string;
  description?: string;
  content: string;
  thumbnail?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'approved' | 'running' | 'completed';
  customerProgramId: string;
  touchpoints: TouchPoint[];
  startDate: Date;
  endDate?: Date;
  metrics?: CampaignMetrics;
}

export interface TouchPoint {
  id: string;
  type: 'email' | 'sms' | 'notification' | 'call' | 'chat';
  name: string;
  content?: string;
  templateId?: string;
  scheduledAt?: Date;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
}

export interface CampaignMetrics {
  reached: number;
  opened: number;
  clicked: number;
  converted: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  customerId?: string;
  customerName?: string;
  dueDate: Date;
  assignee?: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'other';
  createdAt: Date;
  completedAt?: Date;
}

export interface JourneyNode {
  id: string;
  type: 'start' | 'touchpoint' | 'decision' | 'wait' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    condition?: string;
    waitDays?: number;
    touchpointType?: TouchPoint['type'];
  };
}

export interface JourneyEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Journey {
  id: string;
  name: string;
  customerProgramId: string;
  nodes: JourneyNode[];
  edges: JourneyEdge[];
  status: 'draft' | 'active' | 'paused';
  createdAt: Date;
}

export interface Interaction {
  id: string;
  customerId: string;
  type: 'email' | 'call' | 'sms' | 'notification' | 'meeting';
  direction: 'inbound' | 'outbound';
  subject: string;
  content?: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  duration?: number;
  outcome?: string;
}
