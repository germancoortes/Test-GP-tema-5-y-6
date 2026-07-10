import { supabase } from './supabase';
import type {
  Booking,
  BookingInsert,
  SwimSession,
  SwimSessionWithCount,
} from '../types/database';

export class ApiError extends Error {}

function mapError(error: { message: string; code?: string }): never {
  if (error.message.includes('completa')) {
    throw new ApiError(
      'Esta sesión ya está completa. Elige otra fecha disponible.',
    );
  }
  if (
    error.code === '23505' ||
    error.message.toLowerCase().includes('duplicate')
  ) {
    throw new ApiError(
      'Ya existe una reserva con este teléfono o email para esta sesión.',
    );
  }
  throw new ApiError(error.message);
}

// ---------------------------------------------------------------------------
// Público
// ---------------------------------------------------------------------------

export async function fetchUpcomingSessions(): Promise<
  SwimSessionWithCount[]
> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('session_availability')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) mapError(error);
  return (data ?? []) as SwimSessionWithCount[];
}

export async function fetchSessionById(
  id: string,
): Promise<SwimSessionWithCount | null> {
  const { data, error } = await supabase
    .from('session_availability')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) mapError(error);
  return data as SwimSessionWithCount | null;
}

export async function createBooking(
  payload: BookingInsert,
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      session_id: payload.session_id,
      child_name: payload.child_name.trim(),
      child_age: payload.child_age,
      guardian_name: payload.guardian_name.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() || null,
    })
    .select()
    .single();

  if (error) mapError(error);
  return data as Booking;
}

export interface BookingWithSession extends Booking {
  session_id: string;
  session_date: string;
  session_start_time: string;
  session_end_time: string;
}

export async function getBookingByToken(
  token: string,
): Promise<BookingWithSession | null> {
  const { data, error } = await supabase
    .rpc('get_booking_by_token', { p_token: token })
    .maybeSingle();

  if (error) mapError(error);
  return data as BookingWithSession | null;
}

export async function cancelBookingByToken(token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('cancel_booking', {
    p_token: token,
  });

  if (error) mapError(error);
  return Boolean(data);
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function fetchAllSessions(): Promise<SwimSessionWithCount[]> {
  const { data, error } = await supabase
    .from('session_availability')
    .select('*')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) mapError(error);
  return (data ?? []) as SwimSessionWithCount[];
}

export async function createSession(payload: {
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
}): Promise<SwimSession> {
  const { data, error } = await supabase
    .from('sessions')
    .insert(payload)
    .select()
    .single();

  if (error) mapError(error);
  return data as SwimSession;
}

export async function updateSession(
  id: string,
  payload: Partial<{
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
  }>,
): Promise<SwimSession> {
  const { data, error } = await supabase
    .from('sessions')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) mapError(error);
  return data as SwimSession;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) mapError(error);
}

export async function fetchBookingsForSession(
  sessionId: string,
): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) mapError(error);
  return (data ?? []) as Booking[];
}

export async function fetchAllBookings(): Promise<
  (Booking & { session: SwimSession | null })[]
> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, session:sessions(*)')
    .order('created_at', { ascending: false });

  if (error) mapError(error);
  return (data ?? []) as unknown as (Booking & {
    session: SwimSession | null;
  })[];
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) mapError(error);
}
