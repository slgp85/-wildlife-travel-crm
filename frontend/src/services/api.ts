import axios, { isAxiosError } from "axios";
import type {
  Booking, BookingInput, Client, ClientInput, ClientStatus, Dashboard, Trip, TripInput,
} from "../types";

const baseUrl: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api = axios.create({ baseURL: baseUrl + "/api/v1" });

interface ApiErrorBody {
  detail?: string | Array<{ msg?: string }>;
}

export function errorMessage(err: unknown): string {
  if (isAxiosError<ApiErrorBody>(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg ?? "Invalid input").join("; ");
    return err.message;
  }
  return err instanceof Error ? err.message : "Unexpected error";
}

function crud<T, I>(path: string) {
  return {
    list: async (params?: Record<string, string>): Promise<T[]> =>
      (await api.get<T[]>(path, { params })).data,
    get: async (id: number): Promise<T> => (await api.get<T>(path + "/" + id)).data,
    create: async (data: I): Promise<T> => (await api.post<T>(path, data)).data,
    update: async (id: number, data: I): Promise<T> =>
      (await api.put<T>(path + "/" + id, data)).data,
    remove: async (id: number): Promise<void> => {
      await api.delete(path + "/" + id);
    },
  };
}

export const clientsApi = crud<Client, ClientInput>("/clients");
export const tripsApi = crud<Trip, TripInput>("/trips");
export const bookingsApi = crud<Booking, BookingInput>("/bookings");

export const listClients = (status?: ClientStatus | ""): Promise<Client[]> =>
  clientsApi.list(status ? { status_filter: status } : undefined);

export const getDashboard = async (): Promise<Dashboard> =>
  (await api.get<Dashboard>("/dashboard")).data;
