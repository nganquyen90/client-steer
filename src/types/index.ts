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

// ===== JOURNEY NODE - 3-PART ARCHITECTURE =====

export type JourneyNodeType = 'interact' | 'authen' | 'author';

// A. INFO NODE - Metadata & Routing
export interface NodeInfo {
  label: string;
  description?: string;
  // Routing: define next nodes based on execution result
  routing?: {
    successNodeId?: string;
    failureNodeId?: string;
    branches?: Array<{
      condition: string;
      targetNodeId: string;
      label: string;
    }>;
  };
}

// B. RULE - Conditions & Triggers
export interface NodeRule {
  // Audience: segment or property filter
  audience?: {
    type: 'segment' | 'property' | 'all';
    segmentId?: string;
    propertyFilter?: string;
    description?: string;
  };
  // Timing: when to trigger
  timing?: {
    type: 'immediate' | 'delay' | 'scheduled' | 'event';
    delayValue?: number;
    delayUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
    scheduledDate?: string;
    scheduledTime?: string;
  };
  // Event Trigger: customer action or system event
  eventTrigger?: {
    type: 'customer_action' | 'system_event' | 'none';
    event?: string; // e.g. 'click_link', 'open_app', 'deposit', 'status_change'
    description?: string;
  };
}

// C. EXECUTION - Actions
export interface NodeExecution {
  // Task execution: single actions
  tasks?: Array<{
    id: string;
    type: 'email' | 'sms' | 'notification' | 'zalo' | 'call' | 'create_task';
    config?: Record<string, any>;
    label?: string;
  }>;
  // Call Flow: sub-flow / flow-in-flow
  callFlow?: {
    enabled: boolean;
    flowId?: string;
    flowName?: string;
  };
  // API/Webhook: 3rd party integration
  apiWebhook?: {
    enabled: boolean;
    url?: string;
    method?: 'GET' | 'POST' | 'PUT';
    headers?: Record<string, string>;
    description?: string;
  };
  // Type-specific configs
  kycConfig?: KycConfig;
  authorizationConfig?: AuthorizationConfig;
  esignConfig?: EsignConfig;
}

export interface KycConfig {
  method: 'cccd' | 'passport' | 'driver_license';
  steps: ('id_front' | 'id_back' | 'face_matching' | 'ocr_verify' | 'db_check')[];
  maxRetries: number;
  manualReviewOnFail: boolean;
  failAction?: 'notify_sms' | 'notify_email' | 'create_task' | 'block';
}

export interface AuthorizationConfig {
  checkType: 'credit_score' | 'transaction_history' | 'asset_check' | 'manual_review';
  rules: AuthorizationRule[];
  defaultTier: string;
}

export interface AuthorizationRule {
  id: string;
  condition: string;
  tier: string;
  permissions: string[];
  creditLimit?: number;
}

export interface EsignConfig {
  method: 'otp' | 'biometric' | 'digital_signature' | 'face_id';
  documentType: 'contract' | 'agreement' | 'consent' | 'power_of_attorney';
  requireWitness: boolean;
  expiryHours: number;
  fallbackMethod?: 'otp' | 'manual';
}

// The unified JourneyNode with 3-part structure
export interface JourneyNode {
  id: string;
  type: JourneyNodeType;
  position: { x: number; y: number };
  info: NodeInfo;
  rule: NodeRule;
  execution: NodeExecution;
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
