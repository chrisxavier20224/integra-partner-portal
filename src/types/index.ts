/**
 * Integra Partner Portal — Type Definitions
 */

// ── Agent (logged-in Elevate user) ──────────────────────────────
export interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company: string;
  is_active: boolean;
  created_at: string;
}

// ── Site (repeatable section in the form) ───────────────────────
export interface Site {
  id: string; // client-side UUID for keying
  site_name: string;
  site_address: string;
  site_coordinates: string;
  building_type: BuildingType;
  buildings_to_connect: number;
}

export type BuildingType =
  | 'office'
  | 'industrial_warehouse'
  | 'retail'
  | 'high_rise'
  | 'residential'
  | 'temporary_portacabin'
  | 'other';

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  office: 'Office',
  industrial_warehouse: 'Industrial / Warehouse',
  retail: 'Retail',
  high_rise: 'High-Rise',
  residential: 'Residential',
  temporary_portacabin: 'Temporary / Portacabin',
  other: 'Other',
};

// ── Requirements ────────────────────────────────────────────────
export type SolutionType = 'permanent' | 'temporary';
export type ConnectivityNeed =
  | 'primary'
  | 'backup'
  | 'both'
  | 'other';
export type YesNoNotSure = 'yes' | 'no' | 'not_sure';
export type UrgencyLevel = 'standard' | 'priority' | 'emergency';

export const CONNECTIVITY_NEED_LABELS: Record<ConnectivityNeed, string> = {
  primary: 'Primary connection',
  backup: 'Backup / Failover',
  both: 'Both (primary + backup)',
  other: 'Other',
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  standard: 'Standard',
  priority: 'Priority',
  emergency: 'Emergency',
};

export const URGENCY_SLA: Record<UrgencyLevel, string> = {
  standard: 'Survey within 48 hrs · Install within 10–15 working days of order',
  priority: 'Survey within 2 working days · Install within 5–7 working days of order',
  emergency: 'Survey within 24 hrs · Install best-effort within 48–72 hrs (subject to availability)',
};

export const YES_NO_LABELS: Record<YesNoNotSure, string> = {
  yes: 'Yes',
  no: 'No',
  not_sure: 'Not sure',
};

export interface Requirements {
  solution_type: SolutionType;
  temp_duration: string;
  users_at_location: string;
  connectivity_need: ConnectivityNeed;
  static_ip_required: YesNoNotSure;
  existing_connectivity: string;
  wifi_needed: YesNoNotSure;
  other_requirements: string;
}

// ── Full Submission Form Data ───────────────────────────────────
export interface SubmissionFormData {
  // Section 1: Agent (auto-populated)
  agent_name: string;
  agent_email: string;

  // Section 2: Company
  company_name: string;
  account_ref: string;

  // Section 3: Sites (repeatable)
  sites: Site[];

  // Section 4: Requirements
  requirements: Requirements;

  // Section 5: Urgency & Notes
  urgency: UrgencyLevel;
  additional_notes: string;
}

// ── Submission Record (stored in Supabase) ──────────────────────
export type SubmissionStatus = 'submitted' | 'failed' | 'pending_retry';

export interface Submission {
  id: string;
  agent_id: string;
  elevate_ref: string;
  company_name: string;
  account_ref?: string;
  sites: Site[];
  requirements: Requirements;
  urgency: UrgencyLevel;
  notes?: string;
  hubspot_deal_id: string;
  status: SubmissionStatus;
  created_at: string;
}

// ── Helpers ─────────────────────────────────────────────────────
function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (http://)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ── Default / Initial Values ────────────────────────────────────
export function createEmptySite(): Site {
  return {
    id: uuid(),
    site_name: '',
    site_address: '',
    site_coordinates: '',
    building_type: 'office',
    buildings_to_connect: 1,
  };
}

export function createEmptyRequirements(): Requirements {
  return {
    solution_type: 'permanent',
    temp_duration: '',
    users_at_location: '',
    connectivity_need: 'primary',
    static_ip_required: 'not_sure',
    existing_connectivity: '',
    wifi_needed: 'not_sure',
    other_requirements: '',
  };
}

export function createEmptyFormData(agent: Agent): SubmissionFormData {
  return {
    agent_name: agent.full_name,
    agent_email: agent.email,
    company_name: '',
    account_ref: '',
    sites: [createEmptySite()],
    requirements: createEmptyRequirements(),
    urgency: 'standard',
    additional_notes: '',
  };
}
