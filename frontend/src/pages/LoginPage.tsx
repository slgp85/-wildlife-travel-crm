import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Card, ErrorBox, Field, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { authApi, errorMessage } from "../services/api";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [registrationOpen, setRegistrationOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    authApi
      .status()
      .then((s) => {
        setRegistrationOpen(s.registration_open);
        if (s.registration_open) setMode("register");
      })
      .catch((e: unknown) => setError(errorMessage(e)));
  }, []);

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "register") await register(email, password, fullName);
      else await login(email, password);
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Wildlife Travel CRM</h1>
        <p className="text-sm text-slate-600">
          {mode === "register" ? "Create your account" : "Sign in to continue"}
        </p>
        <ErrorBox message={error} />
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          {mode === "register" && (
            <Field label="Full name">
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
          )}
          <Field label="Email">
            <Input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={mode === "register" ? "Password (min 8 characters)" : "Password"}>
            <Input
              required
              type="password"
              minLength={mode === "register" ? 8 : undefined}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={busy}>
            {mode === "register" ? "Create account" : "Sign in"}
          </Button>
        </form>
        {registrationOpen && (
          <button
            type="button"
            className="text-sm text-emerald-800 underline"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create an account" : "I already have an account"}
          </button>
        )}
      </Card>
    </div>
  );
}
