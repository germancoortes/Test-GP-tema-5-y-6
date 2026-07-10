export type SwimSession = {
  id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  capacity: number;
  created_at: string;
};

export type SwimSessionWithCount = SwimSession & {
  booked_count: number;
};

export type Booking = {
  id: string;
  session_id: string;
  child_name: string;
  child_age: number;
  guardian_name: string;
  phone: string;
  email: string | null;
  cancel_token: string;
  created_at: string;
};

export type BookingInsert = {
  session_id: string;
  child_name: string;
  child_age: number;
  guardian_name: string;
  phone: string;
  email?: string | null;
};

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: SwimSession;
        Insert: Omit<SwimSession, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SwimSession, 'id' | 'created_at'>>;
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'cancel_token'> & {
          id?: string;
          created_at?: string;
          cancel_token?: string;
        };
        Update: Partial<Omit<Booking, 'id' | 'created_at' | 'session_id'>>;
        Relationships: [
          {
            foreignKeyName: 'bookings_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      session_availability: {
        Row: SwimSessionWithCount;
        Relationships: [];
      };
    };
    Functions: {
      get_booking_by_token: {
        Args: { p_token: string };
        Returns: {
          id: string;
          child_name: string;
          child_age: number;
          guardian_name: string;
          phone: string;
          email: string | null;
          cancel_token: string;
          created_at: string;
          session_id: string;
          session_date: string;
          session_start_time: string;
          session_end_time: string;
        }[];
      };
      cancel_booking: {
        Args: { p_token: string };
        Returns: boolean;
      };
    };
  };
}
