import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ErrorBox, Field, Input, Textarea } from "../components/ui";
import { errorMessage, tripsApi } from "../services/api";
import type { TripInput } from "../types";

const empty: TripInput = {
  name: "", destination: "", start_date: "", end_date: "", price: 0, capacity: 1, description: "",
};

export default function TripFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<TripInput>(empty);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    tripsApi.get(Number(id)).then((t) => setForm({
      name: t.name, destination: t.destination, start_date: t.start_date, end_date: t.end_date,
      price: Number(t.price), capacity: t.capacity, description: t.description ?? "",
    })).catch((e: unknown) => setError(errorMessage(e)));
  }, [id]);

  const set = <K extends keyof TripInput>(key: K, value: TripInput[K]): void =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (form.end_date < form.start_date) {
      setError("End date must be on or after start date");
      return;
    }
    try {
      if (id) await tripsApi.update(Number(id), form);
      else await tripsApi.create(form);
      navigate("/trips");
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
  };

  return (
    <Card className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">{id ? "Edit trip" : "New trip"}</h1>
      <ErrorBox message={error} />
      <form onSubmit={(e) => void submit(e)} className="space-y-3">
        <Field label="Name"><Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Destination"><Input required value={form.destination} onChange={(e) => set("destination", e.target.value)} /></Field>
        <Field label="Start date"><Input required type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} /></Field>
        <Field label="End date"><Input required type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} /></Field>
        <Field label="Price"><Input required type="number" min={0} step="0.01" value={form.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
        <Field label="Capacity"><Input required type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", Number(e.target.value))} /></Field>
        <Field label="Description"><Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/trips")}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
