import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import ClientFormPage from "./pages/ClientFormPage";
import TripsPage from "./pages/TripsPage";
import TripFormPage from "./pages/TripFormPage";
import BookingsPage from "./pages/BookingsPage";
import BookingFormPage from "./pages/BookingFormPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";

const links: Array<[string, string]> = [
  ["/dashboard", "Dashboard"],
  ["/clients", "Clients"],
  ["/trips", "Trips"],
  ["/bookings", "Bookings"],
];

export default function App() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p className="p-6">Loading...</p>;
  if (user === null) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-emerald-900 text-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <span className="font-bold">Wildlife Travel CRM</span>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "font-semibold underline" : "opacity-80 hover:opacity-100")}
            >
              {label}
            </NavLink>
          ))}
          <span className="ml-auto text-sm opacity-80">{user.full_name}</span>
          <button type="button" onClick={logout} className="text-sm underline opacity-80 hover:opacity-100">
            Log out
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<ClientFormPage />} />
          <Route path="/clients/:id" element={<ClientFormPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/new" element={<TripFormPage />} />
          <Route path="/trips/:id" element={<TripFormPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/new" element={<BookingFormPage />} />
          <Route path="/bookings/:id" element={<BookingFormPage />} />
        </Routes>
      </main>
    </div>
  );
}
