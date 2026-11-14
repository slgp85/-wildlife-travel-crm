import { useEffect, useState } from "react";
import { Card, ErrorBox, Table, Td, Th } from "../components/ui";
import { errorMessage, getDashboard } from "../services/api";
import type { Dashboard } from "../types";

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard().then(setData).catch((e: unknown) => setError(errorMessage(e)));
  }, []);

  const by = data?.bookings_by_status ?? {};
  const stats: Array<[string, number]> = [
    ["Clients", data?.clients_total ?? 0],
    ["Upcoming trips", data?.upcoming_trips?.length ?? 0],
    ["Pending bookings", by.pending ?? 0],
    ["Confirmed bookings", by.confirmed ?? 0],
    ["Cancelled bookings", by.cancelled ?? 0],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <ErrorBox message={error} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="text-3xl font-bold">{value}</div>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Upcoming trips</h2>
        <Table>
          <thead>
            <tr><Th>Name</Th><Th>Destination</Th><Th>Start</Th><Th>Capacity</Th></tr>
          </thead>
          <tbody>
            {(data?.upcoming_trips ?? []).map((t) => (
              <tr key={t.id}>
                <Td>{t.name}</Td><Td>{t.destination}</Td><Td>{t.start_date}</Td><Td>{t.capacity}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
