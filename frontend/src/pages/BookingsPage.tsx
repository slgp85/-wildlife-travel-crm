import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, ErrorBox, Table, Td, Th } from "../components/ui";
import { bookingsApi, clientsApi, errorMessage, tripsApi } from "../services/api";
import type { Booking, Client, Trip } from "../types";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [b, c, t] = await Promise.all([bookingsApi.list(), clientsApi.list(), tripsApi.list()]);
      setBookings(b);
      setClients(c);
      setTrips(t);
      setError(null);
    } catch (e: unknown) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: number): Promise<void> => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await bookingsApi.remove(id);
      await load();
    } catch (e: unknown) {
      setError(errorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <Link to="/bookings/new"><Button>New booking</Button></Link>
      </div>
      <ErrorBox message={error} />
      <Card>
        <Table>
          <thead>
            <tr><Th>Client</Th><Th>Trip</Th><Th>Travelers</Th><Th>Status</Th><Th>Total</Th><Th /></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <Td>{clients.find((c) => c.id === b.client_id)?.full_name ?? b.client_id}</Td>
                <Td>{trips.find((t) => t.id === b.trip_id)?.name ?? b.trip_id}</Td>
                <Td>{b.travelers}</Td><Td>{b.status}</Td><Td>{b.total_amount}</Td>
                <Td className="space-x-2 text-right">
                  <Link to={"/bookings/" + b.id}><Button variant="outline">Edit</Button></Link>
                  <Button variant="danger" onClick={() => void remove(b.id)}>Delete</Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
