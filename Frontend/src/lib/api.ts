import { supabase } from './supabase';

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(options.headers);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (session) headers.set('Authorization', `Bearer ${session.access_token}`);
  const response = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}${path}`, {
    ...options, headers, cache: 'no-store', signal: options.signal ?? AbortSignal.timeout(30_000),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(body?.error || 'No se pudo conectar con la tienda. Inténtalo nuevamente.', response.status);
  return body as T;
}

export interface CommerceStatus {
  checkoutEnabled: boolean;
  blockers: string[];
  shippingAmountCents: number | null;
  currency: string;
}
