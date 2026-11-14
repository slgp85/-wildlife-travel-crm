import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, ErrorBox, Table, Td, Th } from "../components/ui";
import { errorMessage, tripsApi } from "../services/api";
import type { Trip } from "../types";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTrips(await tripsApi.list());
      setError(null);
    } catch (e: unknown) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: number): Promise<void> => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await tripsApi.remove(id);
      await load();
    } catch (e: unknown) {
      setError(errorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trips</h1>
        <Link to="/trips/new"><Button>New trip</Button></Link>
      </div>
      <ErrorBox message={error} />
      <Card>
        <Table>
          <thead>
            <tr><Th>Name</Th><Th>Destination</Th><Th>Dates</Th><Th>Price</Th><Th>Capacity</Th><Th /></tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id}>
                <Td>{t.name}</Td><Td>{t.destination}</Td>
                <Td>{t.start_date} to {t.end_date}</Td><Td>{t.price}</Td><Td>{t.capacity}</Td>
                <Td className="space-x-2 text-right">
                  <Link to={"/trips/" + t.id}><Button variant="outline">Edit</Button></Link>
                  <Button variant="danger" onClick={() => void remove(t.id)}>Delete</Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
