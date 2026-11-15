import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, ErrorBox, Field, Input, Table, Td, Th } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { authApi, errorMessage } from "../services/api";
import type { User } from "../types";

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [currentPw, setCurrentPw] = useState<string>("");
  const [newPw, setNewPw] = useState<string>("");

  const load = useCallback(async (): Promise<void> => {
    try {
      setUsers(await authApi.listUsers());
    } catch (e: unknown) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addUser = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await authApi.createUser(email, password, fullName);
      setNotice(`User ${email} added. Share the password with them privately.`);
      setFullName("");
      setEmail("");
      setPassword("");
      await load();
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
  };

  const removeUser = async (u: User): Promise<void> => {
    if (!window.confirm(`Delete ${u.email}? They will no longer be able to log in.`)) return;
    setError(null);
    setNotice(null);
    try {
      await authApi.deleteUser(u.id);
      await load();
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
  };

  const changePassword = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await authApi.changePassword(currentPw, newPw);
      setNotice("Your password was changed.");
      setCurrentPw("");
      setNewPw("");
    } catch (err: unknown) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <ErrorBox message={error} />
      {notice && <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <Td>
                  {u.full_name}
                  {u.id === me?.id ? " (you)" : ""}
                </Td>
                <Td>{u.email}</Td>
                <Td>
                  {u.id !== me?.id && (
                    <Button type="button" variant="outline" onClick={() => void removeUser(u)}>
                      Delete
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="max-w-xl space-y-3">
        <h2 className="text-lg font-semibold">Add a user</h2>
        <form onSubmit={(e) => void addUser(e)} className="space-y-3">
          <Field label="Full name">
            <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Temporary password (min 8 characters)">
            <Input
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit">Add user</Button>
        </form>
      </Card>

      <Card className="max-w-xl space-y-3">
        <h2 className="text-lg font-semibold">Change my password</h2>
        <form onSubmit={(e) => void changePassword(e)} className="space-y-3">
          <Field label="Current password">
            <Input
              required
              type="password"
              autoComplete="current-password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </Field>
          <Field label="New password (min 8 characters)">
            <Input
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </Field>
          <Button type="submit">Change password</Button>
        </form>
      </Card>
    </div>
  );
}
