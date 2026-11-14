import type {
  ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode,
  SelectHTMLAttributes, TdHTMLAttributes, TextareaHTMLAttributes, ThHTMLAttributes,
} from "react";

const cx = (...c: Array<string | undefined>): string => c.filter(Boolean).join(" ");
const field = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger";
}
export function Button({ variant = "primary", className, ...p }: ButtonProps) {
  const v = {
    primary: "bg-emerald-700 text-white hover:bg-emerald-800",
    outline: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  return (
    <button
      className={cx("inline-flex items-center rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50", v, className)}
      {...p}
    />
  );
}

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-lg border border-slate-200 bg-white p-5 shadow-sm", className)} {...p} />;
}

export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(field, className)} {...p} />;
}

export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(field, className)} rows={3} {...p} />;
}

export function Select({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(field, className)} {...p} />;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

export function Table({ className, ...p }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cx("w-full text-left text-sm", className)} {...p} />;
}
export function Th({ className, ...p }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cx("border-b border-slate-200 px-3 py-2 font-semibold text-slate-600", className)} {...p} />;
}
export function Td({ className, ...p }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cx("border-b border-slate-100 px-3 py-2", className)} {...p} />;
}

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}
