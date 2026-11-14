import axios, { isAxiosError } from "axios";
import type {
  AuthStatus, Booking, BookingInput, Client, ClientInput, ClientStatus, Dashboard,
  TokenResponse, Trip, TripInput, User,
} from "../types";

const baseUrl: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api = axios.create({ baseURL: baseUrl + "/api/v1" });

const TOKEN_KEY = "wtcrm_token";
export const LOGOUT_EVENT = "auth:logout";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable: the session just won't persist across reloads.
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      // A wrong password on the login form is not an expired session.
      if (!url.startsWith("/auth/login")) {
        setToken(null);
        window.dispatchEvent(new Event(LOGOUT_EVENT));
      }
    }
    return Promise.reject(error);
  },
);

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

export const authApi = {
  status: async (): Promise<AuthStatus> => (await api.get<AuthStatus>("/auth/status")).data,
  login: async (email: string, password: string): Promise<TokenResponse> =>
    (await api.post<TokenResponse>("/auth/login", { email, password })).data,
  register: async (email: string, password: string, full_name: string): Promise<TokenResponse> =>
    (await api.post<TokenResponse>("/auth/register", { email, password, full_name })).data,
  me: async (): Promise<User> => (await api.get<User>("/auth/me")).data,
};

export const clientsApi =crud<Client, ClientInput>("/clients");
export const tripsApi = crud<Trip, TripInput>("/trips");
export const bookingsApi = crud<Booking, BookingInput>("/bookings");

export const listClients = (status?: ClientStatus | ""): Promise<Client[]> =>
  clientsApi.list(status ? { status_filter: status } : undefined);

export const getDashboard = async (): Promise<Dashboard> =>
  (await api.get<Dashboard>("/dashboard")).data;
