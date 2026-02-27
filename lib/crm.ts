// SOURCE: shared/lib/crm.ts — update both client copies if changing
// Local copies: clients/seabird/lib/crm.ts, clients/1504/lib/crm.ts

import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase credentials not configured');
  return createClient(url, key);
}

/**
 * Upsert a customer by phone + client_slug.
 * Increments visit_count and updates last_seen if exists.
 * Logs a type='reservation' touchpoint.
 * Returns the full customer row or null on failure.
 */
export async function upsertCustomer(
  clientSlug: string,
  { name, phone, email }: { name: string; phone: string; email?: string }
) {
  try {
    const supabase = getClient();

    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('client_slug', clientSlug)
      .eq('phone', phone)
      .single();

    let customer;

    if (existing) {
      const { data: updated } = await supabase
        .from('customers')
        .update({
          name,
          ...(email ? { email } : {}),
          last_seen: new Date().toISOString(),
          visit_count: (existing.visit_count ?? 0) + 1,
        })
        .eq('id', existing.id)
        .select()
        .single();
      customer = updated;
    } else {
      const { data: inserted } = await supabase
        .from('customers')
        .insert({
          client_slug: clientSlug,
          name,
          phone,
          email,
          visit_count: 1,
          last_seen: new Date().toISOString(),
        })
        .select()
        .single();
      customer = inserted;
    }

    // Log reservation touchpoint
    if (customer?.id) {
      await supabase
        .from('customer_touchpoints')
        .insert({
          customer_id: customer.id,
          client_slug: clientSlug,
          type: 'reservation',
          message: name,
        });
    }

    return customer ?? null;
  } catch {
    return null;
  }
}

/**
 * List all customers for a client, newest first.
 * Includes nested customer_notes.
 */
export async function getCustomers(clientSlug: string) {
  const supabase = getClient();
  const { data } = await supabase
    .from('customers')
    .select('*, customer_notes(*)')
    .eq('client_slug', clientSlug)
    .order('last_seen', { ascending: false });
  return data ?? [];
}

/**
 * Add a staff note to a customer record.
 */
export async function addCustomerNote(
  customerId: string,
  clientSlug: string,
  note: string
): Promise<boolean> {
  try {
    const supabase = getClient();
    const { error } = await supabase
      .from('customer_notes')
      .insert({ customer_id: customerId, client_slug: clientSlug, note });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Get all notes for a customer, newest first.
 */
export async function getCustomerNotes(customerId: string) {
  const supabase = getClient();
  const { data } = await supabase
    .from('customer_notes')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

/**
 * Get all touchpoints for a customer, newest first.
 */
export async function getCustomerTouchpoints(customerId: string) {
  const supabase = getClient();
  const { data } = await supabase
    .from('customer_touchpoints')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
