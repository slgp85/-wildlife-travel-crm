import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, ErrorBox, Select, Table, Td, Th } from "../components/ui";
import { clientsApi, errorMessage, listClients } from "../services/api";
import type { Client, ClientStatus } from "../types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [status, setStatus] = useState<ClientStatus | "">("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setClients(await listClients(status));
      setError(null);
    } catch (e: unknown) {
      setError(errorMessage(e));
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: number): Promise<void> => {
    if (!window.confirm("Delete this client?")) return;
    try {
      await clientsApi.remove(id);
      await load();
    } catch (e: unknown) {
      setError(errorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link to="/clients/new"><Button>New client</Button></Link>
      </div>
      <div className="w-48">
        <Select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus | "")}>
          <option value="">All statuses</option>
          <option value="lead">Lead</option>
          <option value="active">Active</option>
          <option value="past">Past</option>
        </Select>
      </div>
      <ErrorBox message={error} />
      <Card>
        <Table>
          <thead>
            <tr><Th>Name</Th><Th>Email</Th><Th>Country</Th><Th>Status</Th><Th /></tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <Td>{c.full_name}</Td><Td>{c.email}</Td><Td>{c.country}</Td><Td>{c.status}</Td>
                <Td className="space-x-2 text-right">
                  <Link to={"/clients/" + c.id}><Button variant="outline">Edit</Button></Link>
                  <Button variant="danger" onClick={() => void remove(c.id)}>Delete</Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
