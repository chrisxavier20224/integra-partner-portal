/**
 * Supabase Client — Partner Portal
 * Handles authentication, agent profiles, and submission persistence
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Agent, Submission, Site, Requirements, UrgencyLevel } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not configured — running in demo mode');
}

export const supabase: SupabaseClient = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null as any;

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// ── Auth ─────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  if (!supabase) throw new SupabaseError('Supabase not configured');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new SupabaseError(`Sign in failed: ${error.message}`, error.code);
  if (!data.user) throw new SupabaseError('No user data returned');

  return {
    id: data.user.id,
    email: data.user.email || '',
    user_metadata: data.user.user_metadata,
  };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new SupabaseError(`Sign out failed: ${error.message}`, error.code);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email || '',
    user_metadata: user.user_metadata,
  };
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void): (() => void) | undefined {
  if (!supabase) return undefined;

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
        user_metadata: session.user.user_metadata,
      });
    } else {
      callback(null);
    }
  });

  return () => subscription?.unsubscribe();
}

// ── Agent Profiles ──────────────────────────────────────────────

export async function getAgentProfile(userId: string): Promise<Agent | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new SupabaseError(`Failed to get agent profile: ${error.message}`, error.code);
  }

  return data as Agent;
}

export async function updateAgentProfile(
  userId: string,
  updates: Partial<Pick<Agent, 'full_name' | 'phone'>>,
): Promise<Agent> {
  if (!supabase) throw new SupabaseError('Supabase not configured');

  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new SupabaseError(`Failed to update profile: ${error.message}`, error.code);
  return data as Agent;
}

// ── ELEV-ID Generator ───────────────────────────────────────────

/**
 * Generates the next ELEV-ID reference (ELEV-ID00001, ELEV-ID00002, etc.)
 * Uses a Supabase RPC function for atomic increment.
 * Falls back to timestamp-based ID if Supabase unavailable.
 */
export async function generateElevateRef(): Promise<string> {
  if (!supabase) {
    // Demo mode — use timestamp-based ID
    const ts = Date.now().toString(36).toUpperCase().slice(-5);
    return `ELEV-ID${ts}`;
  }

  try {
    const { data, error } = await supabase.rpc('next_elevate_ref');

    if (error) throw error;

    // data is the integer sequence number
    const seq = String(data).padStart(5, '0');
    return `ELEV-ID${seq}`;
  } catch (err) {
    // Fallback: count existing submissions + 1
    console.warn('RPC fallback for ELEV-ID:', err);

    const { count, error: countErr } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    if (countErr || count === null) {
      const ts = Date.now().toString(36).toUpperCase().slice(-5);
      return `ELEV-ID${ts}`;
    }

    const seq = String(count + 1).padStart(5, '0');
    return `ELEV-ID${seq}`;
  }
}

// ── Submissions ─────────────────────────────────────────────────

export async function saveSubmission(
  agentId: string,
  elevateRef: string,
  companyName: string,
  accountRef: string,
  sites: Site[],
  requirements: Requirements,
  urgency: UrgencyLevel,
  notes: string,
  hubspotDealId: string,
  status: 'submitted' | 'failed' | 'pending_retry',
): Promise<Submission> {
  if (!supabase) throw new SupabaseError('Supabase not configured');

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      agent_id: agentId,
      elevate_ref: elevateRef,
      company_name: companyName,
      account_ref: accountRef || null,
      sites,
      requirements,
      urgency,
      notes: notes || null,
      hubspot_deal_id: hubspotDealId,
      status,
    })
    .select()
    .single();

  if (error) throw new SupabaseError(`Failed to save submission: ${error.message}`, error.code);
  return data as Submission;
}

export async function getSubmissions(agentId: string): Promise<Submission[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) throw new SupabaseError(`Failed to get submissions: ${error.message}`, error.code);
  return (data || []) as Submission[];
}

// ── Draft Persistence ───────────────────────────────────────────

export async function saveDraft(
  agentId: string,
  formData: Record<string, any>,
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('form_drafts')
    .upsert(
      {
        agent_id: agentId,
        form_data: formData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'agent_id' },
    );

  if (error) console.warn('Failed to save draft:', error.message);
}

export async function loadDraft(agentId: string): Promise<Record<string, any> | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('form_drafts')
    .select('form_data')
    .eq('agent_id', agentId)
    .single();

  if (error) return null;
  return data?.form_data || null;
}

export async function deleteDraft(agentId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('form_drafts').delete().eq('agent_id', agentId);
}
