import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ErrorBox, Field, Input, Select } from "../components/ui";
import { bookingsApi, clientsApi, errorMessage, tripsApi } from "../services/api";
import type { BookingInput, BookingStatus, Client, Trip } from "../types";

const empty: BookingInput = { client_id: 0, trip_id: 0, travelers: 1, status: "pending" };

export default function BookingFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<BookingInput>(empty);
  const [clients, setClients] = useState<Client[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const [c, t] = await Promise.all([clientsApi.list(), tripsApi.list()]);
        setClients(c);
        setTrips(t);
        if (id) {
          const b = await bookingsApi.get(Number(id));
          setForm({
            client_id: b.client_id, trip_id: b.trip_id, travelers: b.travelers,
            status: b.status, total_amount: Number(b.total_amount),
          });
        }
      } catch (e: unknown) {
        setError(errorMessage(e));
      }
    };
    void load();
  }, [id]);

  const set = <K extends keyof BookingInput>(key: K, value: BookingInput[K]): void =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (id) await bookingsApi.update(Number(id), form);
      else await bookingsApi.create(form);
      navigate("/bookings");
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
  };

  return (
    <Card className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">{id ? "Edit booking" : "New booking"}</h1>
      <ErrorBox message={error} />
      <form onSubmit={(e) => void submit(e)} className="space-y-3">
        <Field label="Client">
          <Select required value={form.client_id} onChange={(e) => set("client_id", Number(e.target.value))}>
            <option value={0} disabled>Select a client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </Select>
        </Field>
        <Field label="Trip">
          <Select required value={form.trip_id} onChange={(e) => set("trip_id", Number(e.target.value))}>
            <option value={0} disabled>Select a trip</option>
            {trips.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.start_date})</option>)}
          </Select>
        </Field>
        <Field label="Travelers"><Input required type="number" min={1} value={form.travelers} onChange={(e) => set("travelers", Number(e.target.value))} /></Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as BookingStatus)}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
        <Field label="Total amount (optional, defaults to trip price x travelers)">
          <Input
            type="number" min={0} step="0.01" value={form.total_amount ?? ""}
            onChange={(e) => set("total_amount", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </Field>
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/bookings")}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
