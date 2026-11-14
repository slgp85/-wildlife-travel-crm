import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ErrorBox, Field, Input, Select, Textarea } from "../components/ui";
import { clientsApi, errorMessage } from "../services/api";
import type { ClientInput, ClientStatus } from "../types";

const empty: ClientInput = {
  full_name: "", email: "", phone: "", country: "", status: "lead", interests: "", notes: "",
};

export default function ClientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<ClientInput>(empty);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    clientsApi.get(Number(id)).then((c) => setForm({
      full_name: c.full_name, email: c.email, phone: c.phone ?? "", country: c.country ?? "",
      status: c.status, interests: c.interests ?? "", notes: c.notes ?? "",
    })).catch((e: unknown) => setError(errorMessage(e)));
  }, [id]);

  const set = <K extends keyof ClientInput>(key: K, value: ClientInput[K]): void =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (id) await clientsApi.update(Number(id), form);
      else await clientsApi.create(form);
      navigate("/clients");
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
  };

  return (
    <Card className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">{id ? "Edit client" : "New client"}</h1>
      <ErrorBox message={error} />
      <form onSubmit={(e) => void submit(e)} className="space-y-3">
        <Field label="Full name"><Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
        <Field label="Email"><Input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Country"><Input value={form.country ?? ""} onChange={(e) => set("country", e.target.value)} /></Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as ClientStatus)}>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="past">Past</option>
          </Select>
        </Field>
        <Field label="Interests"><Input value={form.interests ?? ""} onChange={(e) => set("interests", e.target.value)} /></Field>
        <Field label="Notes"><Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/clients")}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
