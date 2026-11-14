export type ClientStatus = "lead" | "active" | "past";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Client {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  status: ClientStatus;
  interests: string | null;
  notes: string | null;
  created_at: string;
}
export type ClientInput = Omit<Client, "id" | "created_at">;

export interface Trip {
  id: number;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  price: number;
  capacity: number;
  description: string | null;
}
export type TripInput = Omit<Trip, "id">;

export interface Booking {
  id: number;
  client_id: number;
  trip_id: number;
  travelers: number;
  status: BookingStatus;
  total_amount: number;
  created_at: string;
}
export type BookingInput = Omit<Booking, "id" | "created_at" | "total_amount"> & {
  total_amount?: number;
};

export interface Dashboard {
  clients_total: number;
  clients_by_status: Record<string, number>;
  bookings_by_status: Partial<Record<BookingStatus, number>>;
  upcoming_trips: Trip[];
}
